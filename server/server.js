require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

connectToDB();

app.listen(4000, () => {
  console.log("Server is Running Successfully on Port 4000");
});

