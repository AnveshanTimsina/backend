const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pool = require("../../db/dbConfig");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/:uid/getFavorites", async (req, res) => {
  try {
    const uid = req.params.uid;
    const client = await pool.connect();
    const favoriteQuery = `SELECT f.favorite_id AS favorite_id, p.product_id AS product_id, p.product_name, p.product_description, p.unit_price
    FROM favorite_table AS f
    INNER JOIN product_table AS p ON f.product_id = p.product_id
    WHERE f.user_id = $1;`;
    const favoriteResult = await client.query(favoriteQuery, [uid]);
    res.json({
      success: true,
      message: "Displaying user's favorite products.",
      result: favoriteResult.rows,
    });
    client.release();
  } catch (err) {
    console.log("Error getting favorites.", err);
  }
});

router.post("/:uid/addToFavorites", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { product_id } = req.body;

    if (!product_id) {
      res.json({
        success: false,
        message: "Product ID is required.",
      });
      return;
      // product_id ta bhaihalcha ni hau. kina garnuparyo ra yo?
    }
    const client = await pool.connect();
    const checkFavoritesQuery = `SELECT favorite_id FROM favorite_table WHERE product_id = $1 AND user_id = $2;`;
    const checkFavoritesResult = await client.query(checkFavoritesQuery, [
      product_id,
      uid,
    ]);
    if (checkFavoritesResult.rows.length > 0) {
      const removeFromFavoritesQuery = `DELETE FROM favorite_table WHERE product_id = $1 AND user_id = $2;`;
      await client.query(removeFromFavoritesQuery, [product_id, uid]);
      res.json({
        success: true,
        message: "Removed the product from favorites.",
      });
      return;
    }
    const addToFavoritesQuery = `INSERT INTO favorite_table (user_id, product_id)
    VALUES ($1, $2);`;
    await client.query(addToFavoritesQuery, [uid, product_id]);
    res.json({
      success: true,
      message: "New product inserted into favorites.",
    });
    client.release();
  } catch (err) {
    console.log("Error in adding product to favorites.", err);
  }
});

router.delete("/:uid/deleteFromFavorites", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { product_id } = req.body;
    const client = await pool.connect();

    const removeFromFavoritesQuery = `DELETE FROM favorite_table WHERE product_id = $1 AND user_id = $2;`;
    await client.query(removeFromFavoritesQuery, [product_id, uid]);
    res.json({
      success: true,
      message: "Removed the product from favorites.",
    });

    // addtoFavorites maa pani deleteFromFavorites jastai kaam bhakocha
    // so delete wala banaayera code reuse garna paaye nice hunthyo

    client.release();
  } catch (err) {
    console.log("Error removing from favorites.", err);
  }
});

module.exports = router;
