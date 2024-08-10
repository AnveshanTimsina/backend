const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("../db/dbConfig");

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Default");
});

const loginRouter = require("./routes/login");
// app.use("/:uid/login", loginRouter);
app.use("/login", loginRouter);

const userRouter = require("./routes/user");
app.use("/user", userRouter);

const registerRouter = require("./routes/register");
// app.use("/:uid/register", registerRouter);
app.use("/register", registerRouter);

// const userRouter = require("./routes/user");
// app.use("/:uid/user", userRouter);
// app.use("/user", userRouter);

const productRouter = require("./routes/product");
app.use("/product", productRouter); //product maa uid haalera kun seller ko product ho tyo seller le login garesi dekhaaidina milcha

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
