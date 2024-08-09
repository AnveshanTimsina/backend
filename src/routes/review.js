const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pool = require("../../db/dbConfig");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// a user must only be allowed to write a review if they have actually bought the product
// i.e their user_id must have a transaction record on the transaction_table

//euta function banaaune checkAuth() or sth bhanne jasle chai tyo user_id transaction_table maa cha ki chaina heros
//transaction table maa user_id bhako user le matra review lekhna paaos

router.get("/allReviewsForProduct", async (req, res) => {
  try {
    const { product_id } = req.body;
    const client = await pool.connect();
    // const allReviewsQuery = `SELECT * FROM review_table WHERE product_id = $1 ;`;
    const allReviewsQuery = `SELECT
    r.review_id AS review_id,
    r.product_id AS product_id,
    r.rating AS rating,
    r.comment AS comment
    r.review_time AS review_time,
    p.product_name AS product_name,
    u.user_id AS user_id,
    u.username AS username,
    u.first_name AS first_name,
    u.last_name AS last_name
    FROM review_table AS r
    INNER JOIN product_table AS p ON r.product_id = p.product_id
    INNER JOIN user_table AS u ON r.user_id = u.user_id
    WHERE p.product_id = $1
    ORDER BY rating DESC;`;

    const allReviewsResult = await client.query(allReviewsQuery, [product_id]);
    res.json({
      success: true,
      message:
        "Displaying all the reviews for this product, higher reviews first.",
      allReviews: allReviewsResult.rows[0],
    });
    client.release();
  } catch (err) {
    console.log("Error getting all reviews for a product.", err);
  }
});

router.get("/:uid/oneUserReviews", async (req, res) => {
  try {
    const { uid } = req.params;
    const client = await pool.connect();
    const oneUserReviewsQuery = `SELECT 
    r.review_id AS review_id,
    r.product_id AS product_id,
    r.rating AS rating,
    r.comment AS comment,
    r.review_time AS review_time,
    p.product_name AS product_name,
    u.user_id AS user_id,
    u.username AS username,
    u.first_name AS first_name,
    u.last_name AS last_name
    FROM review_table AS r 
    INNER JOIN product_table AS p ON r.product_id = p.product_id
    INNER JOIN user_table AS u ON r.user_id = u.user_id
    WHERE u.user_id = $1;`;
    const oneUserReviewsResult = await client.query(oneUserReviewsQuery, [uid]);
    res.json({
      success: true,
      message: "Displaying all reviews of this particular user.",
      oneUserReviews: oneUserReviewsResult.rows[0],
    });
    client.release();
  } catch (err) {
    console.log("Error getting reviews of this user.", err);
  }
});

router.post("/:uid/addReviewToAProduct", async (req, res) => {
  try {
    const { uid } = req.params;
    const { product_id, rating, comment } = req.body;
    const client = await pool.connect();

    if (!rating || !comment) {
      res.json({
        success: false,
        message: "Rating or comment fields can't be left empty.",
      });
      return;
    }
    // checking if transaction has been done or not
    const checkTransactionQuery = `SELECT transaction_id
    FROM transaction_table
    WHERE user_id = $1 AND product_id = $2;`;
    const checkTransactionResult = await client.query(checkTransactionQuery, [
      uid,
      product_id,
    ]);
    if (checkTransactionResult.rows.length === 0) {
      res.json({
        success: false,
        message:
          "The user has never bought this product, so they can't write a review.",
      });
      return;
    }
    const transaction_id = checkTransactionResult.rows[0].transaction_id;

    // rate limiting haalna khojeko

    //pailai yo user le yo product review gareko cha ki chaina tha paaune
    const checkReviewTimeQuery = `SELECT review_time FROM review_table
    WHERE user_id = $1 AND product_id = $2
    ORDER BY review_time DESC
    LIMIT 1;`;
    const checkReviewTimeResult = await client.query(checkReviewTimeQuery, [
      uid,
      product_id,
    ]);

    if (checkReviewTimeResult.rows.length === 0) {
      // yo user le yo product ko lagi first time review lekhiracha
      const addFirstReviewQuery = `INSERT INTO review_table 
      (product_id, rating, comment, user_id, transaction_id, review_time)
      VALUES($1, $2, $3, $4, $5, NOW())`;
      const addFirstReviewResult = await client.query(addFirstReviewQuery, [
        product_id,
        rating,
        comment,
        uid,
        transaction_id,
      ]);

      res.json({
        success: true,
        message: "This user's first review for this product added.",
      });
    } else {
      //yo user ko first review for this product haina, pailai review lekhisako at least euta
      const addReviewQuery = `WITH last_review AS (
          SELECT review_time FROM review_table
          WHERE user_id = $4 AND product_id = $1
          ORDER BY review_time DESC
          LIMIT 1
        )
        INSERT INTO review_table 
        (product_id, rating, comment, user_id, transaction_id, review_time)
        SELECT $1, $2, $3, $4, $5, NOW()
        WHERE NOT EXISTS (
          SELECT 1
          FROM last_review
          WHERE review_time >= NOW() - INTERVAL '6 hours'
        )
        RETURNING *;`;

      const addReviewQueryResult = await client.query(addReviewQuery, [
        product_id,
        rating,
        comment,
        uid,
        transaction_id,
      ]);

      if (addReviewQueryResult.rows.length === 0) {
        res.json({
          success: false,
          message:
            "Wait for some more time before adding another review for the same product.",
        });
        return;
      }
      res.json({
        success: true,
        message:
          "This user's review for this product, that is not their first review, was added.",
      });
    }
    client.release();
  } catch (err) {
    console.log("Error reviewing this product.", err);
  }
});

router.delete("/:uid/deleteAReview", async (req, res) => {
  try {
    const { uid } = req.params;
    const { review_id } = req.body;
    const client = await pool.connect();
    const deleteReviewQuery = `DELETE FROM review_table WHERE review_id = $1 AND user_id = $2;`;
    await client.query(deleteReviewQuery, [review_id, uid]);
    res.json({
      success: true,
      message: "Review deleted.",
    });

    client.release();
  } catch (err) {
    console.log("Error deleting a review.", err);
  }
});
// maybe try putting up an "undo delete" button of sorts

router.patch("/:uid/editAReview", async (req, res) => {
  try {
    const { uid } = req.params;
    const { product_id, review_id, rating, comment } = req.body;
    if (!rating || !comment) {
      res.json({
        success: false,
        message: "Empty field(s) detected. No field can be left empty.",
      });
      return;
    }
    const client = await pool.connect();
    const editReviewQuery = `UPDATE review_table
      SET rating = $1, comment = $2
      WHERE product_id = $3 AND review_id = $4 AND user_id = $5;`;
    await client.query(editReviewQuery, [
      rating,
      comment,
      product_id,
      review_id,
      uid,
    ]);
    res.json({
      success: true,
      message: "Review with given id updated.",
    });

    client.release();
  } catch (err) {
    console.log("Error editing/updating this review.", err);
  }
});

module.exports = router;
