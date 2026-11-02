const { sequelize } = require("../config/postgres")
const { Op, Sequelize, QueryTypes } = require("sequelize");
const { costs, cost_types, bank_accounts, suppliers, customers, products, sales, sales_items } = require("../db/models")

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

module.exports = {
  add: async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      const { Op } = require("sequelize");
      const { data } = req.body;
      console.log(JSON.stringify(data[0]))

      // EXISTING TRANSACTIONS
      const transactionIds = [
        ...new Set(
          data.map(row => row["NoTrans"])
        )
      ];

      const existingTransactions = await costs.findAll({
        where: {
          transaction_number: {
            [Op.in]: transactionIds
          }
        },
        attributes: ["transaction_number"],
        transaction: t
      });

      const existingSet = new Set(
        existingTransactions.map(
          item => item.transaction_id
        )
      );

      // GROUP DATA BY NOTRANS
      const groupedData = {};

      for (const row of data) {

        const noTrans = row["NoTrans"];

        if (existingSet.has(noTrans)) {
          continue;
        }

        if (!groupedData[noTrans]) {
          groupedData[noTrans] = [];
        }

        groupedData[noTrans].push(row);
      }

      let insertedData = 0;

      // PROCESS PER INVOICE
      for (const noTrans in groupedData) {

        const rows = groupedData[noTrans];

        const firstRow = rows[0];

        // HEADER SALES
        const costsHeader =
          await costs.create(
            {
              transaction_number: noTrans,
              date: formatDate(
                firstRow["Tanggal"]
              ),
              description: firstRow["Keterangan"],
              debit: Number(firstRow["Debit"]),
              credit: Number(firstRow["Kredit"]),
              account_id: 
                firstRow["Kas"] == "KAS PABRIK" ? 3 :
                firstRow["Kas"] == "BCA 263 2005858" ? 4 :
                firstRow["Kas"] == "BCA 263 2368888" ? 1 :
                firstRow["Kas"] == "MDR 143-00-3657585-8" ? 2 : 5
            },
            {
              transaction: t
            }
          );

        insertedData++;
      }

      await t.commit();

      return res.status(200).json({
        status: true,
        message: "Import success",
        inserted_sales: insertedData,
        skipped: existingSet.size
      });

    } catch (error) {
      await t.rollback();

      console.log(error);
      console.log(error.parent);
      console.log(`INI ERROR ORIGINAL ${error.original}`);

      return res.status(500).json({
        status: false,
        message: error.message
      });
    }
  },

  getAll : async (req, res) => {
    try {
      const { startDate, endDate, bank_id } = req.query;
      const whereClause = {};
      if (bank_id) {
        whereClause.bank_account_id = bank_id;
      }
      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const resp = await costs.findAll({
        where: whereClause,
        include: [
          {
            model: bank_accounts,
            as: 'bank_account',
            attributes: ['name', 'account_number', 'bank']
          },
          {
            model: cost_types,
            as: 'cost_type',
            attributes: ['name']
          }
        ],

        order: [["transaction_number", "ASC"]]
      });

      const [summary] = await sequelize.query(
        `
        SELECT
          COALESCE(SUM(debit), 0) AS total_debit,
          COALESCE(SUM(credit), 0) AS total_credit
        FROM costs
        WHERE date <= :endDate AND bank_account_id = :bank_id
        `,
        {
          replacements: { endDate, bank_id },
          type: QueryTypes.SELECT
        }
      );

      const saldo = Number(summary.total_debit) - Number(summary.total_credit);

      const result = resp.map(item => ({
        id: item.id,
        date: item.date,
        transaction_id: item.transaction_number,
        description: item.description,
        debit: item.debit,
        credit: item.credit,
        bank_account_id: item.bank_account_id,
        cost_type_id: item.cost_type_id,
        cost_type: item.cost_type?.name || null
      }));

      const cost_type = await sequelize.query(
        `
        SELECT
            ct.id AS cost_type_id,
            ct.name,
            COALESCE(SUM(c.credit), 0) AS total
        FROM cost_types ct
        LEFT JOIN costs c
            ON c.cost_type_id = ct.id
            AND c.bank_account_id = :bank_id
            AND c.date <= :endDate
        GROUP BY ct.id, ct.name
        ORDER BY ct.id
        `,
        {
          replacements: {
            bank_id,
            endDate
          },
          type: QueryTypes.SELECT
        }
      );

      res.status(200).json({
        status: true,
        data: {
          saldo: saldo || null,
          cost_type: cost_type,
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

      const data = await costs.findOne({ where : {id} })

      if (!data) {
        return res.status(404).json({
          status: false,
          message: `Data with id ${id} not found.`
        })
      }

      const deleteData = await costs.destroy({where: {id}})

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
    try {
      const {data} = req.body

      const resp = await sales.create({
        date: data.date,
        transaction_id: data.transaction_id,
        customer_id: data.customer_id
      })

      data.items.forEach( async (row) => {
        await sales_items.create({
          transaction_id: resp.id,
          product_id: row.product_id,
          quantity: row.quantity,
          price: row.price
        })
      });

      res.status(200).json({
          status: true,
          message: "success"
        }
      )
      
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  edit: async (req, res) => {
    try {
      const {data} = req.body
      const rows = Object.entries(data).map(([id, value]) => ({
        id: Number(id),
        cost_types_id: Number(value.cost_types_id),
      }));

      console.log(JSON.stringify(rows))
      await Promise.all(
        rows.map((row) =>
          costs.update(
            { cost_types_id: row.cost_types_id },
            { where: { id: row.id } }
          )
        )
      );

      res.status(200).json({
        status: true,
        message: "Success"
      })
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  latestID: async (req, res) => {
    try {
      const {date} = req.params

      const resp = await sequelize.query(`
          select transaction_number from costs
          where date = :date
          order by transaction_number DESC limit 1
        `,
        {
          replacements: { date: date },
          type: QueryTypes.SELECT
        }
      )
      
      res.status(200).json({
        status: true,
        message: 'success',
        data: resp
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  inputData: async (req, res) => {
    try {
      const { date, noTrans, bankAccount, costType, description, nominal } = req.body
      console.log(date, noTrans, bankAccount, costType, description, nominal)
      const resp = await costs.create({
        date,
        transaction_number: noTrans,
        description,
        credit: nominal,
        bank_account_id: bankAccount,
        cost_types_id: costType
      })
      res.status(200).json({
        status: true,
        message: "success"
      })
    } catch (error) {
      res.status(500).json({
        status: false,
        message: `${error}`
      })
    }
  },

  inputCashIn: async (req, res) => {
    try {
      const { date, noTrans, bankAccount, costType, description, nominal } = req.body
      console.log(date, noTrans, bankAccount, costType, description, nominal)
      const resp = await costs.create({
        date,
        transaction_number: noTrans,
        description,
        debit: nominal,
        bank_account_id: bankAccount,
        cost_types_id: costType
      })
      res.status(200).json({
        status: true,
        message: "success"
      })
    } catch (error) {
      res.status(500).json({
        status: false,
        message: `${error}`
      })
    }
  }
}