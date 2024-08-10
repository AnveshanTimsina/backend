const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("../db/dbConfig");

const app = express();
const port = 8000;

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "https://backend-steel-three.vercel.app"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Default");
});

const loginRouter = require("./routes/login");
app.use("/login", loginRouter);

const userRouter = require("./routes/user");
app.use("/user", userRouter);

const registerRouter = require("./routes/register");
app.use("/register", registerRouter);

const productRouter = require("./routes/product");
app.use("/product", productRouter);

const cartRouter = require("./routes/cart");
app.use("/cart", cartRouter);

const favoriteRouter = require("./routes/favorite");
app.use("/favorite", favoriteRouter);

const reviewRouter = require("./routes/review");
app.use("/review", reviewRouter);

const transactionRouter = require("./routes/transaction");
app.use("/transaction", transactionRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
