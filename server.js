const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");
const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log(`Connecting to the database is successfully.`);
  } catch (e) {
    console.error(`Error connecting to the database: ${e}`);
  }
})();

app.listen(process.env.PORT, () =>
  console.log(`Server is running on PORT: ${process.env.PORT}`)
);
