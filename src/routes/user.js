const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pool = require("../../db/dbConfig");
const bcrypt = require("bcrypt");
const { user } = require("pg/lib/defaults");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const client = await pool.connect();

    const userQuery = `SELECT * FROM user_table WHERE user_id = $1;`;
    const userResult = await client.query(userQuery, [uid]);
    res.json({
      success: true,
      message: "User info displayed.",
      result: userResult.rows[0],
    });
    client.release();
  } catch (err) {
    console.error("Error displaying user info.");
  }
});

module.exports = router;
