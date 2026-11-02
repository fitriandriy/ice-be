const { sequelize } = require("../config/postgres")
const { Op, Sequelize } = require("sequelize");
const { purchasings, suppliers } = require("../db/models")

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

      // GET ALL SUPPLIERS
      const suppliersName = await suppliers.findAll({
        attributes: ["id", "name"],
        transaction: t
      });

      // SUPPLIER MAP
      const supplierMap = {};

      suppliersName.forEach(s => {
        supplierMap[String(s.name).toLowerCase().trim()] = s.id;
      });

      // GET ALL TRANSACTION IDS FROM EXCEL
      const transactionIds = data.map(row => row['NoTrans']);

      // CHECK EXISTING TRANSACTIONS
      const existingTransactions = await purchasings.findAll({
        where: {
          transaction_id: {
            [Op.in]: transactionIds
          }
        },
        attributes: ['transaction_id'],
        transaction: t
      });

      // CREATE SET FOR FAST LOOKUP
      const existingSet = new Set(
        existingTransactions.map(item => item.transaction_id)
      );

      // PREPARE INSERT DATA
      const insertData = [];

      for (const row of data) {

        // SKIP DUPLICATE DATA
        if (existingSet.has(row['NoTrans'])) {
          // console.log(`DUPLICATE SKIPPED: ${row['NoTrans']}`);
          continue;
        }

        // SUPPLIER NAME
        const supplierName = String(row['Nama Supplier'] || "")
          .toLowerCase()
          .trim();

        let supplier_id = supplierMap[supplierName];

        // AUTO CREATE SUPPLIER
        if (!supplier_id) {
          const newSupplier = await suppliers.create(
            {
              name: row['Nama Supplier']
            },
            {
              transaction: t
            }
          );

          supplier_id = newSupplier.id;
          supplierMap[supplierName] = supplier_id;
        }

        // FORMAT DATE
        const formattedDate = formatDate(row['TglBeli']);

        if (!formattedDate || formattedDate === "Invalid date") {
          console.log("INVALID DATE FOUND:", row['TglBeli']);
          continue;
        }

        // INSERT DATA
        insertData.push({
          transaction_id: row['NoTrans'],
          date: formattedDate,
          supplier_id,
          product_id: 1,
          quantity: row['TotTonase'],
          price: row['TotTonase']
            ? row['Total'] / row['TotTonase']
            : 0
        });
      }

      // BULK INSERT
      await purchasings.bulkCreate(insertData, {
        transaction: t
      });

      await t.commit();

      res.status(200).json({
        status: true,
        message: `Import success. ${existingSet.size} data skipped.`,
        inserted: insertData.length,
        skipped: existingSet.size
      });
    } catch (error) {

      await t.rollback();

      console.log(error);

      res.status(500).json({
        status: false,
        message: "Internal Server Error"
      });
    }
  },

  getAll : async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const whereClause = {};

      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const resp = await purchasings.findAll({
        where: whereClause,
        include: [
          {
            model: suppliers,
            as: 'supplier',
            attributes: ['name']
          }
        ],

        order: [["transaction_id", "ASC"]]
      });

      const totalTonase = await purchasings.findOne({
        where: {
          ...whereClause,
          transaction_id: {
            [Op.like]: 'B%'
          }
        },
        attributes: [
          [
            Sequelize.fn(
              'SUM',
              Sequelize.col('quantity')
            ),
            'total_quantity'
          ]
        ],

        raw: true
      });

      const totalPembelian = await purchasings.findOne({
        where: {
          ...whereClause,
          transaction_id: {
            [Op.like]: 'B%'
          }
        },

        attributes: [
          [
            Sequelize.fn(
              'SUM',
              Sequelize.literal('quantity * price')
            ),
            'total_pembelian'
          ]
        ],

        raw: true
      });

      const result = resp.map(item => ({
        id: item.id,
        transaction_id: item.transaction_id,
        date: item.date,
        supplier: item.supplier?.name || null,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      res.status(200).json({
        status: true,

        data: {
          total_quantity: totalTonase.total_quantity || 0,
          total_pembelians: totalPembelian.total_pembelian || 0,
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

  update : async (req, res) => {
    try {
      const { payload } = req.body

      await Promise.all(
        payload.map(item => {
          const { id, ...data } = item;

          return purchasings.update(data, {
            where: { id }
          });
        })
      );

      res.status(200).json({
        status: true,
        message: "success"
      })
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "server error"
      })
    }
  },

  del : async (req, res) => {
    try {
      const { id } = req.params

      const data = await purchasings.findOne({ where : {id} })

      if (!data) {
        return res.status(404).json({
          status: false,
          message: `Data with id ${id} not found.`
        })
      }

      const deleteData = await purchasings.destroy({where: {id}})

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
  }
}