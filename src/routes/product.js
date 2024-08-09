const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pool = require("../../db/dbConfig");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// user_id ko nam seller_id banaakocha table maa

router.post("/searchProducts", async (req, res) => {
  try {
    const { product_name } = req.body;
    const client = await pool.connect();

    const searchProductsQuery = `SELECT product_name FROM product_table WHERE product_name = $1;`;
    const searchProductsResult = await client.query(searchProductsQuery, [
      product_name,
    ]);
    res.json({
      success: true,
      message: "Search results returned.",
      result: searchProductsResult.rows,
    });
    client.release();
  } catch (err) {
    console.error("Error search.", err);
  }
});

router.post("/productInfo", async (req, res) => {
  try {
    const { product_name } = req.body;
    const client = await pool.connect();

    const productQuery = `SELECT 
    p.product_id, p.product_name, p.product_description, p.unit_price, p.stock_quantity,
    u.user_id, u.username, u.email, u.phone, u.first_name, u.last_name
    FROM product_table AS p
    INNER JOIN user_table AS u
    ON p.seller_id = u.user_id
    WHERE p.product_name = $1;`;
    const productResult = await client.query(productQuery, [product_name]);
    res.json({
      success: true,
      message: "The product info of the clicked product",
      result: productResult.rows,
    });
    client.release();
  } catch (err) {
    console.error(`Error displaying info about this product.`, err);
  }
});

// frontend bata maile /detailedProductInfo endpoint call garera pani ek duita matra info uthaauna sakchu?
// ki tesko lagi chuttai /basicProductInfo endpoint banaaunu parcha?
// pardaina hola, detailedProductInfo bata aliali data line milcha jsonRes = await res.json() garera jsonRes.object_attribute garera

router.get("/:uid/randomProducts", async (req, res) => {
  try {
    const { uid } = req.params;
    const client = await pool.connect();

    //favorite_table maa bhako product chai pathaaudai na pathaaos
    const detailedProductQuery = `SELECT p.product_id AS product_id, p.product_name AS product_name, 
    p.product_description AS product_description, p.unit_price AS unit_price, 
    p.stock_quantity AS stock_quantity, p.seller_id AS seller_id
    FROM product_table p
    LEFT JOIN favorite_table f ON p.product_id = f.product_id AND f.user_id = $1
    WHERE f.product_id IS NULL
    ORDER BY RANDOM();`;
    // const detailedProductQuery = `SELECT * FROM product_table ORDER BY RANDOM();`;
    const detailedProductResult = await client.query(detailedProductQuery, [
      uid,
    ]);
    res.json({
      success: true,
      message: "Displaying random products.",
      result: detailedProductResult.rows,
    });
    client.release();
  } catch (err) {
    console.error("Error displaying detailed values from product_table", err);
  }
});
// /random wala endpoint chai buyer le login garisakepachi usko homepage maa product recommendations dina lai use garne

// /:uid wala endpoint chai seller le login garisakepachi usko homepage maa usko aafnai products dekhaauna use garne

// estai /:uid wala concept use garera buyer le login garisakepachi usko homepage maa buyer le favorite gareko products dekhaidine
// suru maa favorite products dekhaaune, tesmuni arko section jasto maa recommended products dekhaaune

router.get("/:uid/yourProducts", async (req, res) => {
  try {
    const uid = req.params.uid;
    const client = await pool.connect();
    const detailedProductQuery = `SELECT * FROM product_table WHERE seller_id = $1;`;
    const detailedProductResult = await client.query(detailedProductQuery, [
      uid,
    ]);
    if (detailedProductResult.rows.length === 0) {
      res.json({
        success: false,
        message: "You have listed zero products.",
      });
      return;
    }
    res.json({
      success: true,
      message: "Displaying seller's products.",
      result: detailedProductResult.rows,
    });
    client.release();
  } catch (err) {
    console.error("Error displaying detailed values from product_table", err);
  }
});

router.patch("/:uid/increaseStockQuantity", async (req, res) => {
  try {
    const { uid } = req.params;
    const { product_id } = req.body;

    const client = await pool.connect();
    const updateStockQuantityQuery = `UPDATE product_table
      SET stock_quantity = stock_quantity + 1
      WHERE product_id = $1 AND  seller_id = $2
      RETURNING *;`;
    const updateStockQuantityResult = await client.query(
      updateStockQuantityQuery,
      [product_id, uid]
    );
    res.json({
      success: true,
      message: "Stock quantity of this product was increased by one",
      stock_quantity: updateStockQuantityResult.rows[0].stock_quantity,
    });
    client.release();
  } catch (err) {
    console.error("Error updating stock quantity.", err);
  }
});

router.patch("/:uid/decreaseStockQuantity", async (req, res) => {
  try {
    const { uid } = req.params;
    const { product_id } = req.body;

    const client = await pool.connect();
    const updateStockQuantityQuery = `UPDATE product_table
      SET stock_quantity = stock_quantity - 1
      WHERE product_id = $1 AND  seller_id = $2
      RETURNING *;`;
    const updateStockQuantityResult = await client.query(
      updateStockQuantityQuery,
      [product_id, uid]
    );
    // console.log(updateStockQuantityResult.rows[0]);
    if (updateStockQuantityResult.rows[0].stock_quantity === 0) {
      res.json({
        success: false,
        message: "The stock quantity has reached zero. You cannot decrease it.",
      });
      return;
    }
    res.json({
      success: true,
      message: "Stock quantity of this product was decreased by one",
      stock_quantity: updateStockQuantityResult.rows[0].stock_quantity,
    });
    client.release();
  } catch (err) {
    console.error("Error updating stock quantity.", err);
  }
});

router.post("/:uid/addNewProduct", async (req, res) => {
  try {
    const { uid } = req.params;
    const { product_name, product_description, unit_price, stock_quantity } =
      req.body;

    if (
      !product_name ||
      !product_description ||
      !unit_price ||
      !stock_quantity
    ) {
      res.json({
        success: false,
        message: "Empty field(s) detected. No field can be left empty.",
      });
      return;
    }
    const client = await pool.connect();

    const productNameQuery = `SELECT product_name FROM product_table 
    WHERE product_name = $1;`;
    const productNameResult = await client.query(productNameQuery, [
      product_name,
    ]);

    if (productNameResult.rows.length > 0) {
      res.json({
        success: false,
        message: "Product with the same name already exists.",
      });
      return;
    }

    const addProductQuery = `INSERT INTO product_table
    (product_name, product_description, unit_price, stock_quantity, seller_id)
    VALUES ($1,$2,$3,$4,$5);`;
    // might need to use RETURNING * to access what values are

    await client.query(addProductQuery, [
      product_name,
      product_description,
      unit_price,
      stock_quantity,
      uid,
    ]);

    res.json({
      success: true,
      message: "New product added.",
    });

    client.release();
  } catch (err) {
    console.error("Error adding new product.", err);
  }
});

router.patch("/:uid/updateProductDetails", async (req, res) => {
  try {
    const {
      product_id,
      product_name,
      product_description,
      unit_price,
      stock_quantity,
    } = req.body;

    if (
      !product_name ||
      !product_description ||
      !unit_price ||
      !stock_quantity
    ) {
      res.json({
        success: false,
        message: "Empty field(s) detected. No field can be left empty.",
      });
      return;
    }

    const client = await pool.connect();

    const productNameQuery = `SELECT product_name FROM product_table WHERE product_name = $1;`;
    const productNameResult = await client.query(productNameQuery, [
      product_name,
    ]);

    if (productNameResult.rows.length > 0) {
      res.json({
        success: false,
        message: "Product with the same name already exists.",
      });
      return;
    }

    const uid = req.params.uid;

    // maile user le haaleko naya product_name ko product_id khojera chai check garey, yo galti cha
    // pailai dekhi product ko nam j thiyo, tesko product_id herne, ani tei product_id bhako row lai edit/update garne chai right ho

    const updateProductQuery = `UPDATE product_table
    SET product_name = $1, product_description = $2, unit_price = $3, stock_quantity = $4 
    WHERE product_id = ${product_id} AND seller_id = ${uid} ;`;
    // const updateProductResult =

    // uid or product_id namileko product cha bhane failed blabla lekhne euta function pani banaaunu parcha
    await client.query(updateProductQuery, [
      product_name,
      product_description,
      unit_price,
      stock_quantity, //frontend bata aaunu paryo yo chai. seller le jun product ko info update garna khojiracha tesko id send hunuparyo backend lai
    ]);
    res.json({
      success: true,
      message: "Product with given id updated.",
    });
    client.release();
  } catch (err) {
    console.error("Error updating product details.", err);
  }
});

router.delete("/:uid/deleteProduct", async (req, res) => {
  try {
    const uid = req.params.uid;
    // const product_id = req.params.product_id;
    const { product_id } = req.body;
    // req.body le frontend bata post req pathauda aako data access garna sakcha
    // uta bata jun product delete garna khojdaicha, tyo product ko id pathaaidine backend lai
    // ani req.body garera tyo product_id access garera  tyo product_id bhako product delete gardine database bata
    const client = await pool.connect();
    const deleteProductQuery = `DELETE FROM product_table WHERE product_id = $1;`;
    await client.query(deleteProductQuery, [product_id]);
    res.json({
      success: true,
      message: "Product deleted.",
    });
    client.release();
  } catch (err) {
    console.log("Error deleting product.", err);
  }
});
module.exports = router;
