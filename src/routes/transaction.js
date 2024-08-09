const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pool = require("../../db/dbConfig");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//aafnu product maa kati ota transactions bhayo, ra kasle kasle kinyo bhanera bhanera seller le hercha

//aafule kk transactions garey bhanera buyer le pani hercha

//transaction delete garne option nai nadine

//transaction update garne pani option nai nadine.
// amount update huney chhez bhayena, date update huney cheez bhayena, so just don't update it

// transaction add garnu is basically user le pay garey jasto hunu
// "Pay" lekheko button maa thichda transaction add hos, tara suru maa "are you sure?" sodos

// payment methods haru haalne, esewa and all ko api uthaayera tyo sab garne future enhancement

// ma seller ho
// maile aafnu transaction history herna lai euta page khole pachi, mero all products ko aaunu parcha
// ani maile euta product maa click gareypachi chai tyo product ko matra aaunu parcha

router.get("/:uid/sellerTransactionHistory", async (req, res) => {
  try {
    const { uid } = req.params;
    const client = await pool.connect();

    const getTransactionHistoryQuery = `SELECT
    t.transaction_id, t.transaction_amount, t.transaction_date, t.buyer_id,
    p.product_id, p.product_name, p.unit_price,
    u.username AS buyer_username
    FROM transaction_table AS t
    INNER JOIN product_table AS p
    ON t.product_id = p.product_id
    INNER JOIN user_table AS u
    ON t.buyer_id = u.user_id 
    WHERE t.seller_id = $1
    ORDER BY t.transaction_date DESC;`;

    const getTransactionHistoryResult = await client.query(
      getTransactionHistoryQuery,
      [uid]
    );

    if (getTransactionHistoryResult.rows.length === 0) {
      res.json({
        success: false,
        message: "You have sold zero products.",
      });
      return;
    }

    res.json({
      success: true,
      message: "Displaying transaction history of a seller.",
      result: getTransactionHistoryResult.rows,
    });

    client.release();
  } catch (err) {
    console.log("Error getting transaction history of a seller.", err);
  }
});

router.get("/:uid/sellerTransactionInfoForProduct", async (req, res) => {
  try {
    const { uid } = req.params;
    const { product_id } = req.body;
    const client = await pool.connect();

    const getTransactionInfoForProductQuery = `SELECT
    t.transaction_id, t.transaction_amount, t.transaction_date, t.no_of_products, t.buyer_id,
    p.product_id, p.product_name, p.unit_price, p.product_description,
    u.username AS buyer_username, u.first_name, u.last_name
    FROM transaction_table AS t
    INNER JOIN product_table AS p
    ON t.product_id = p.product_id
    INNER JOIN user_table AS u
    ON t.buyer_id = u.user_id
    WHERE t.seller_id = $1 AND p.product_id = $2
    ORDER BY t.transaction_date DESC;`;

    const getTransactionInfoForProductResult = await client.query(
      getTransactionInfoForProductQuery,
      [uid, product_id]
    );

    res.json({
      success: true,
      message: "Displaying transaction info for a product.",
      result: getTransactionInfoForProductResult.rows,
    });

    client.release();
  } catch (err) {
    console.log("Error getting transaction info for a product.", err);
  }
});

router.get("/:uid/buyerTransactionHistory", async (req, res) => {
  try {
    const { uid } = req.params;
    const client = await pool.connect();

    const getTransactionHistoryQuery = `SELECT
    t.transaction_id, t.transaction_amount, t.transaction_date, t.seller_id,
    p.product_id, p.product_name, p.unit_price,
    u.username AS seller_username
    FROM transaction_table AS t
    INNER JOIN product_table AS p
    ON t.product_id = p.product_id
    INNER JOIN user_table AS u
    ON t.seller_id = u.user_id 
    WHERE t.buyer_id = $1
    ORDER BY t.transaction_date DESC;`;

    const getTransactionHistoryResult = await client.query(
      getTransactionHistoryQuery,
      [uid]
    );
    if (getTransactionHistoryResult.rows.length === 0) {
      res.json({
        success: false,
        message: "You have bought zero products.",
      });
      return;
    }

    res.json({
      success: true,
      message: "Displaying transaction history of a buyer.",
      result: getTransactionHistoryResult.rows,
    });

    client.release();
  } catch (err) {
    console.log("Error getting transaction history of a buyer.", err);
  }
});

router.get("/:uid/buyerTransactionInfoForProduct", async (req, res) => {
  try {
    const { uid } = req.params;
    const { product_id } = req.body;
    const client = await pool.connect();

    const getTransactionInfoForProductQuery = `SELECT
    t.transaction_id, t.transaction_amount, t.transaction_date, t.no_of_products, t.seller_id,
    p.product_id, p.product_name, p.unit_price, p.product_description,
    u.username AS seller_username, u.first_name, u.last_name
    FROM transaction_table AS t
    INNER JOIN product_table AS p
    ON t.product_id = p.product_id
    INNER JOIN user_table AS u
    ON t.seller_id = u.user_id
    WHERE t.buyer_id = $1 AND p.product_id = $2
    ORDER BY t.transaction_date DESC;`;

    const getTransactionInfoForProductResult = await client.query(
      getTransactionInfoForProductQuery,
      [uid, product_id]
    );
    res.json({
      success: true,
      message: "Displaying transaction info for a product.",
      result: getTransactionInfoForProductResult.rows[0],
    });

    client.release();
  } catch (err) {
    console.log("Error getting the transaction info for a buyer.", err);
  }
});

router.post("/:uid/addTransaction", async (req, res) => {
  // add transaction bhaneko buyer le buy garnu ho
  try {
    const { uid } = req.params;
    const { product_id, transaction_amount, no_of_products, seller_id } =
      req.body;
    const client = await pool.connect();

    // stock quantity 0 ta chaina ni bhanera check garnu paryo

    const checkStockQuantityQuery = `SELECT stock_quantity FROM product_table WHERE product_id = $1;`;
    const checkStockQuantityResult = await client.query(
      checkStockQuantityQuery,
      [product_id]
    );
    // console.log("START");
    // console.log(checkStockQuantityResult.rows[0].stock_quantity);
    // console.log("END");
    if (checkStockQuantityResult.rows[0].stock_quantity === 0) {
      res.json({
        success: false,
        message: "Out of stock. Cannot purchase.",
      });
      return;
    }

    const addTransactionQuery = `INSERT INTO transaction_table
    (transaction_amount, product_id, transaction_date, no_of_products, buyer_id, seller_id)
    VALUES($1,$2,NOW(),$3,$4,$5);`;
    await client.query(addTransactionQuery, [
      transaction_amount,
      product_id,
      no_of_products,
      uid,
      seller_id,
    ]);

    // this can be achieved through trigger

    const deleteFromCart = `DELETE FROM cart_table
    WHERE user_id = $1 AND product_id = $2;`;
    await client.query(deleteFromCart, [uid, product_id]);

    // console.log("initial: ", checkStockQuantityResult.rows[0].stock_quantity);

    const updateStockQuantityQuery = `UPDATE product_table
    SET stock_quantity = stock_quantity - 1
    WHERE product_id = $1
    RETURNING *;`;
    const updateStockQuantityResult = await client.query(
      updateStockQuantityQuery,
      [product_id]
    );
    // console.log("test");
    // console.log(
    //   `final_updateQuery: `,
    //   updateStockQuantityResult.rows[0].stock_quantity
    // );
    // console.log(
    //   `final_selectQuery: `,
    //   checkStockQuantityResult.rows[0].stock_quantity
    // );
    res.json({
      success: true,
      message: "Added to transaction table.",
    });

    client.release();
  } catch (err) {
    console.log("Error adding a transaction.", err);
  }
});

module.exports = router;
