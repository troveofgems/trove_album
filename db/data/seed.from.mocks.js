import dotenv from "dotenv";
import User from "../models/user.model.js";
import {User_Mocks} from "./mocks/user.mocks.js";
import Photo from "../models/photo.model.js";
import connectDB from "../db.config.js";
dotenv.config({ path: `./config/env/.env.development` });
connectDB();

const importData = async() => {
    try {
        await User.deleteMany();
        await User.insertMany(User_Mocks);
        console.log("Data Imported!");
        process.exit();
    } catch(err) {
        console.error("Unable To Import Data", err);
        process.exit(1);
    }
}

const destroyData = async() => {
    try {
        await User.deleteMany();
        await Photo.deleteMany();

        console.log("Data Destroyed!");
        process.exit();
    } catch(err) {
        console.error("Unable To Import Data", err);
        process.exit(1);
    }
}

if(process.argv[2] === "-d") {
    destroyData();
} else {
    importData();
}