const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pool = require("../../db/dbConfig");
const bcrypt = require("bcrypt");
const { user } = require("pg/lib/defaults");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/", async (req, res) => {
  // console.log("1");
  try {
    const { first_name, last_name, type, email, phone, username, password } =
      req.body;
    const password_hash = await bcrypt.hash(password, 10);
    if (
      !first_name ||
      !last_name ||
      !email ||
      !phone ||
      !username ||
      !password
    ) {
      res.json({
        success: false,
        message: "Empty field(s) detected. No field can be left empty.",
      });
      return;
    }

    const client = await pool.connect();

    const usernameQuery = `SELECT username FROM user_table WHERE username = $1;`;
    const usernameResult = await client.query(usernameQuery, [username]);

    if (usernameResult.rows.length > 0) {
      res.json({
        success: false,
        message: "Username already exists. Choose a different username.",
      });
      return;
    }

    const emailQuery = `SELECT email FROM user_table WHERE email = $1;`;
    const emailResult = await client.query(emailQuery, [email]);

    if (emailResult.rows.length > 0) {
      res.json({
        success: false,
        message:
          "This email has previously been used for registration. Choose a different email address.",
      });
      return;
    }

    const insertUserQuery = `INSERT INTO user_table 
                        (username, email, password_hash, phone, first_name, last_name, type)
                        VALUES ($1,$2,$3,$4,$5,$6,$7)
                        RETURNING *;`;

    const insertUserResult = await client.query(insertUserQuery, [
      username,
      email,
      password_hash,
      phone,
      first_name,
      last_name,
      type,
    ]);
    // console.log(insertUserResult.rows[0]);
    res.json({
      success: true,
      message: "New user registered.",
      user: insertUserResult.rows[0],
      //open new user's homepage
    });
    client.release();
  } catch (err) {
    console.error("Error signing in.");
  }
});

module.exports = router;
