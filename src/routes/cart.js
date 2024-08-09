const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pool = require("../../db/dbConfig");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// async function isStockQuantityExceeded() {
//   const client = await pool.connect();

//   const checkCartQuery = `SELECT SUM(no_of_products) AS total_no_of_one_product_in_cart FROM cart_table
//     WHERE product_id = $1;`;
//   const checkCartResult = await client.query(checkCartQuery, [product_id]);

//   const checkStockQuantityQuery = `SELECT stock_quantity FROM product_table
//     WHERE product_id = $1;`;
//   const checkStockQuantityResult = await client.query(checkStockQuantityQuery, [
//     product_id,
//   ]);

//   if (
//     checkStockQuantityResult.rows[0].stock_quantity <=
//     checkCartResult.rows[0].total_no_of_one_product_in_cart
//   ) {
//     res.json({
//       success: false,
//       message:
//         "The number of cart items for a product has exceeded the number of product items in stock.",
//     });
//     return;
//   }
// }

router.get("/:uid/readCartItems", async (req, res) => {
  try {
    const uid = req.params.uid;
    const client = await pool.connect();
    const cartQuery = `SELECT c.cart_id AS cart_id, p.product_id AS product_id,
    p.product_name AS product_name, p.product_description AS product_description,
    p.unit_price AS unit_price, c.no_of_products AS no_of_products
    FROM cart_table AS c
    INNER JOIN product_table AS p ON c.product_id = p.product_id
    WHERE c.user_id = $1;`;
    const cartResult = await client.query(cartQuery, [uid]);
    res.json({
      success: true,
      message: "Displaying user's cart items.",
      result: cartResult.rows,
    });
    client.release();
  } catch (err) {
    console.log("Error reading cart values.", err);
  }
});

router.post("/:uid/addCartItems", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { product_id } = req.body;

    if (!product_id) {
      //product_id ta bhai nai halcha ni, so maybe this is redundant
      res.json({
        success: false,
        message: "Product ID is required.",
      });
      return;
    }
    const client = await pool.connect();

    // yo portion of code increaseCartItems maa pani cha, so function banaayera garda better huncha
    const checkCartQuery = `SELECT SUM(no_of_products) AS total_no_of_one_product_in_cart FROM cart_table
    WHERE product_id = $1;`;
    const checkCartResult = await client.query(checkCartQuery, [product_id]);

    const checkStockQuantityQuery = `SELECT stock_quantity FROM product_table
    WHERE product_id = $1;`;
    const checkStockQuantityResult = await client.query(
      checkStockQuantityQuery,
      [product_id]
    );

    if (
      checkStockQuantityResult.rows[0].stock_quantity <=
      checkCartResult.rows[0].total_no_of_one_product_in_cart
    ) {
      res.json({
        success: false,
        message:
          "The number of cart items for a product has exceeded the number of product items in stock.",
      });
      return;
    }

    const cartQuery = `SELECT cart_id FROM cart_table
    WHERE user_id = $1 AND product_id = $2;`;
    const cartResult = await client.query(cartQuery, [uid, product_id]);

    if (cartResult.rows.length > 0) {
      const updateCartQuery = `UPDATE cart_table 
        SET no_of_products = no_of_products + 1
        WHERE cart_id = $1;`;
      const updateCartResult = await client.query(updateCartQuery, [
        cartResult.rows[0].cart_id,
      ]);
      res.json({
        success: true,
        message: "The number of products in the cart was increased by one.",
      });
      return;
    }
    const addToCartQuery = `INSERT INTO cart_table (product_id, no_of_products, user_id)
    VALUES ($1, 1, $2);`;
    //might need to add RETURNING * to access what item was inserted
    await client.query(addToCartQuery, [product_id, uid]);
    res.json({
      success: true,
      message: "A new product added to the cart.",
    });
    client.release();
  } catch (err) {
    console.log("Error adding items to the cart.", err);
  }
});

router.delete("/:uid/deleteProductFromCart", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { product_id } = req.body;
    const client = await pool.connect();

    // cart maa gayera ta remove garne ho item, ani cart maa nabhako item yo webpage maa dekhaudai dekhaudaina
    // so i think check garnu if a product is in cart or not is redundant
    // const checkCartQuery = `SELECT cart_id FROM cart_table WHERE user_id = $1 AND product_id = $2;`;
    // const checkCartResult = await client.query(checkCartQuery, [
    //   uid,
    //   product_id,
    // ]);
    // if (checkCartResult.rows.length === 0) {
    //   res.json({
    //     success: false,
    //     message:
    //       "There is no item on the cart with this product_id and user_id.",
    //   });
    //   return;
    // }

    const deleteCartItemQuery = `DELETE FROM cart_table WHERE user_id = $1 AND product_id = $2;`;
    await client.query(deleteCartItemQuery, [uid, product_id]);
    res.json({
      success: true,
      message: "Cart item deleted.",
    });
    client.release();
  } catch (err) {
    console.log("Error deleting cart item.", err);
  }
});

router.patch("/:uid/increaseCartItems", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { product_id } = req.body;
    const client = await pool.connect();

    const checkCartQuery = `SELECT SUM(no_of_products) AS total_no_of_one_product_in_cart FROM cart_table
    WHERE product_id = $1;`;
    const checkCartResult = await client.query(checkCartQuery, [product_id]);

    const checkStockQuantityQuery = `SELECT stock_quantity FROM product_table
    WHERE product_id = $1;`;
    const checkStockQuantityResult = await client.query(
      checkStockQuantityQuery,
      [product_id]
    );

    if (
      checkStockQuantityResult.rows[0].stock_quantity <=
      checkCartResult.rows[0].total_no_of_one_product_in_cart
    ) {
      res.json({
        success: false,
        message:
          "The number of cart items for a product has exceeded the number of product items in stock.",
      });
      return;
    }
    const increaseCartItemQuery = `UPDATE cart_table
    SET no_of_products = no_of_products + 1
    WHERE user_id = $1 AND product_id = $2;`;

    await client.query(increaseCartItemQuery, [uid, product_id]);
    res.json({
      success: true,
      message: "Increased number of cart item by one.",
    });
    client.release();
  } catch (err) {
    console.log("Error increasing number of products in the cart.", err);
  }
});

router.patch("/:uid/decreaseCartItems", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { product_id } = req.body;
    const client = await pool.connect();

    const checkCartQuery = `SELECT no_of_products FROM cart_table
    WHERE user_id = $1 AND product_id = $2;`;
    const checkCartResult = await client.query(checkCartQuery, [
      uid,
      product_id,
    ]);

    if (checkCartResult.rows[0].no_of_products === 1) {
      const deleteCartItemQuery = `DELETE FROM cart_table WHERE user_id = $1 AND product_id = $2;`;
      await client.query(deleteCartItemQuery, [uid, product_id]);
      res.json({
        success: true,
        message:
          "Number of items of this product in the cart is now zero. The product is deleted from the cart.",
      });
      return;
    }
    const decreaseCartQuery = `UPDATE cart_table
    SET no_of_products = no_of_products - 1
    WHERE user_id = $1 AND product_id = $2;`;
    await client.query(decreaseCartQuery, [uid, product_id]);
    res.json({
      success: true,
      message: "Decreased number of cart item by one.",
    });
    client.release();
  } catch (err) {
    console.log("Error decreasing number of products in the cart.", err);
  }
});

module.exports = router;
