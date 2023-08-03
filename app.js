const express = require("express");
const userRouters = require("./routers/userRouters");
const postRouters = require("./routers/postRouters");
const errorController = require("./controllers/errorController");

const app = express();

app.use(express.json());

app.use("/api/v1/users", userRouters);
app.use("/api/v1/posts", postRouters);
app.use(errorController);

module.exports = app;
