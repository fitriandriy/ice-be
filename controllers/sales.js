const { Op, QueryTypes } = require("sequelize");
const { sequelize } = require("../config/postgres")
const { drivers, bank_accounts, customers, products, sales, sales_items, costs, sale_payments } = require("../db/models")

const formatDate = (dateString) => {

  if (!dateString) return null;

  // FORMAT YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString);
  }

  // FORMAT DD/MM/YYYY
  if (dateString.includes("/")) {

    const bulanIndonesia = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      Mei: "05",
      Jun: "06",
      Jul: "07",
      Agu: "08",
      Sep: "09",
      Okt: "10",
      Nov: "11",
      Des: "12"
    };

    const parts = dateString.split("/");

    // HANDLE 01/Mei/26
    if (isNaN(parts[1])) {

      const day = parts[0];
      const month = bulanIndonesia[parts[1]];
      const year = `20${parts[2]}`;

      return new Date(`${year}-${month}-${day}`);
    }

    // HANDLE 20/05/2026
    const [day, month, year] = parts;

    return new Date(`${year}-${month}-${day}`);
  }

  // FORMAT DD-MM-YYYY
  if (dateString.includes("-")) {

    const [day, month, year] = dateString.split("-");

    return new Date(`${year}-${month}-${day}`);
  }

  return null;
};

const generateTransactionNumber = async (date) => {
  // date format: YYYY-MM-DD
  const [year, month, day] = date.split("-");

  // Convert YYYY-MM-DD to DDMMYY
  const dateCode = `${day}${month}${year.slice(-2)}`;
  const prefix = `N${dateCode}-`;

  // Get transaction numbers for this date
  const salesData = await sales.findAll({
    attributes: ["transaction_number"],
    where: {
      date,
      transaction_number: {
        [Op.like]: `${prefix}%`,
      },
    },
  });

  // Find the highest existing sequence number
  const lastNumber = salesData.reduce((max, sale) => {
    const sequence = Number(
      sale.transaction_number.slice(prefix.length)
    );

    return Number.isInteger(sequence) && sequence > max
      ? sequence
      : max;
  }, 0);

  // Increment the sequence
  const nextNumber = String(lastNumber + 1).padStart(3, "0");

  return `${prefix}${nextNumber}`;
};

module.exports = {
  getAll : async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const whereClause = {};

      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const resp = await sales.findAll({
        where: whereClause,
        include: [
          {
            model: customers,
            as: 'customer',
            attributes: ['name']
          },
          {
            model: drivers,
            as: 'driver',
            attributes: ['name', 'police_number']
          },
          {
            model: bank_accounts,
            as: 'bank_account',
            attributes: ['account_number', 'name', 'bank']
          },
          {
            model: sale_payments,
            as: 'sale_payment',
            attributes: ['date', 'amount', 'bank_account_id'],
            include: [
              {
                model: bank_accounts,
                as: 'bank_account',
                attributes: ['account_number', 'name', 'bank']
              }
            ]
          },
          {
            model: sales_items,
            as: 'sales_item',
            attributes: ['product_id', 'quantity', 'price'],
            include: [
              {
                model: products,
                as: 'product',
                attributes: ['name']
              }
            ]
          }
        ],

        order: [["transaction_number", "ASC"]]
      });

      const result = resp.map(item => ({
        id: item.id,
        transaction_number: item.transaction_number,
        date: item.date,
        customer: item.customer?.name || null,
        status: item.status,
        discount: item.discount,
        driver: {
          name: item.driver?.name || null,
          police_number: item.driver?.police_number || null
        },
        bank_account: {
          name: item.bank_account?.name || null,
          bank: item.bank_account?.bank || null,
          account_number: item.bank_account?.account_number || null
        },
        quantity: item.sales_item.reduce(
          (total, r) =>
            total +
            (r.product_id === 1
              ? Number(r.quantity) * 10
              : r.product_id === 2
                ? Number(r.quantity) * 5
                : 0),
          0
        ),
        total_price: item.sales_item.reduce(
          (total, r) => total + (Number(r.price) * Number(r.quantity)), 0
        ),
        detail_payment: item.sale_payment.map(r => ({
          date: r.date,
          amount: r.amount,
          bank_account: r.bank_account ? {
            account_number: r.bank_account.account_number,
            name: r.bank_account.name,
            bank: r.bank_account.bank
          } : null
        })),
        item: item.sales_item.map(r => ({
          product_id: r.product_id,
          product_name: r.product?.name,
          quantity: r.quantity,
          price: r.price
        }))
      }));

      res.status(200).json({
        status: true,

        data: {
          data: result
        }
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        status: false,
        message: "Internal Server Error"
      });
    }
  },

  del : async (req, res) => {
    try {
      const { id } = req.params

      const data = await sales.findOne({ where : {id} })

      if (!data) {
        return res.status(404).json({
          status: false,
          message: `Data with id ${id} not found.`
        })
      }

      const deleteData = await sales.destroy({where: {id}})
      const deleteItems = await sales_items.destroy({ where: {transaction_id : id}})
      const deletePayments = await sale_payments.destroy({ where: {sales_id : id}})
      const deleteCosts = await costs.destroy({ where: {transaction_number : data.transaction_number}})

      return res.status(200).json({
        status: true,
        message: 'success'
      })
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  input: async (req, res) => {
    const t = await sales.sequelize.transaction();

    try {
      const { data } = req.body;

      const transactionNumber = await generateTransactionNumber(
        data.date
      );

      const resp = await sales.create(
        {
          date: data.date,
          transaction_number: transactionNumber,
          customer_id: data.customer_id,
          status: data.status,
          discount: data.discount,
          driver_id: data.driver_id,
          bank_account_id: data.bank_account_id,
          tempo: data.tempo,
        },
        { transaction: t }
      );

      // Simpan semua item penjualan
      await Promise.all(
        data.items.map((row) =>
          sales_items.create(
            {
              transaction_id: resp.id,
              product_id: row.product_id,
              quantity: row.quantity,
              price: row.price,
            },
            { transaction: t }
          )
        )
      );

      // create no transaction
      const latest_id = await sequelize.query(`
          select transaction_number from costs
          where date = :date
          order by transaction_number DESC limit 1
        `,
        {
          replacements: { date: data.date },
          type: QueryTypes.SELECT,
          transaction: t
        }
      )

      // ON PROGRESS!!!!
      const d = new Date(data.date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);

      const prefix = `N${day}${month}${year}`;
      let noTrans = "";

      if (latest_id.length < 1) {
        noTrans = `${prefix}-001`;
      } else {
        const lastNumber = Number(latest_id[0].transaction_number.split("-")[1]);
        const nextNumber = String(lastNumber + 1).padStart(3, "0");
        noTrans = `${prefix}-${nextNumber}`;
      }

      // Jika transaksi lunas, catat pembayaran
      if (data.status === "lunas") {
        await costs.create(
          {
            date: data.date,
            transaction_number: noTrans,
            description: `PEMB. ${transactionNumber}`,
            debit: data.total,
            bank_account_id: data.bank_account_id,
          },
          { transaction: t }
        );

        await sale_payments.create({
          date: data.date,
          amount: data.total,
          sales_id: resp.id,
          bank_account_id: data.bank_account_id
        })
      }

      // Semua query berhasil, simpan perubahan
      await t.commit();

      return res.status(200).json({
        status: true,
        message: "success",
        transaction_number: transactionNumber,
      });
    } catch (error) {
      // Batalkan seluruh perubahan jika terjadi error
      await t.rollback();

      console.error("Error POST /sales/input:", error);

      return res.status(500).json({
        status: false,
        message: "server error",
      });
    }
  },

  editStatus: async (req, res) => {
    try {
      const { id, status } = req.params

      const resp = await sales.update({ status }, { where: { id } })

      res.status(200).json({
        status: true,
        message: "success"
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  inputSalePayment: async (req, res) => {
    try {
      const { date, amount, sales_id, bank_account_id, status, transaction_number } = req.body;

      if (status === "lunas") {
        await sales.update({ status: "lunas" }, { where: { id: sales_id } });
      }

      const resp = await sale_payments.create({
        date: date,
        amount: amount,
        sales_id: sales_id,
        bank_account_id: bank_account_id
      })

      await costs.create({
        date,
        transaction_number: await generateTransactionNumber(date),
        description: `PEMB. ${transaction_number}`,
        debit: amount,
        bank_account_id: bank_account_id
      })

      res.status(200).json({
        status: true,
        message: "success",
        data: resp
      })
    }
    catch (error) {
      console.log(error)
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  }
}