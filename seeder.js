import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import admins from "./data/admins.js";
import packages from "./data/packages.js";
import clients from "./data/clients.js";
import Admin from "./models/Admin.js";
import Client from "./models/Client.js";
import Package from "./models/Package.js";
import connectDB from "./config/database.js";

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Admin.deleteMany();
    // await Client.deleteMany();
    // await Package.deleteMany();
    await Admin.insertMany(admins);
    // await Client.insertMany(clients);
    // await Package.insertMany(packages);

    console.log("Data Imported!".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // await Admin.deleteMany();
    // await Client.deleteMany();
    await Package.deleteMany();

    console.log("Data Destroyed!".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
