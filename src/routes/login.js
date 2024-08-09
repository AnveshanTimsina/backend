const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pool = require("../../db/dbConfig");
const bcrypt = require("bcrypt");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/", async (req, res) => {
  try {
    const { username, password, type } = req.body;

    if (!username || !password) {
      res.json({
        success: false,
        message: "Empty username or password field.",
      });
      return;
    }

    const client = await pool.connect();

    const usernameQuery = `SELECT user_id, username, type FROM user_table WHERE username = $1 AND type = $2;`;
    const usernameResult = await client.query(usernameQuery, [username, type]);

    if (usernameResult.rows.length === 0) {
      res.json({
        success: false,
        message: "User doesn't exist.",
      });
      return;
    }

    const passwordHashQuery = `SELECT password_hash FROM user_table WHERE username = $1;`;
    const passwordHashResult = await client.query(passwordHashQuery, [
      username,
    ]);

    const isValid = await bcrypt.compare(
      password,
      passwordHashResult.rows[0].password_hash
    );

    if (!isValid) {
      res.json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    res.json({
      success: true,
      message: "Username and Password are valid",
      user: usernameResult.rows[0],
    });

    // type herera check garne, buyer cha bhane certain kam garne, seller cha bhane certain kam garne
    // say buyer.html kholne or sth like that. frontend maa euta checkAuth() bhanne function banaayera garne

    client.release();
  } catch (err) {
    console.error("Error logging in.", err);
  }
});

module.exports = router;
