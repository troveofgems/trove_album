import dotenv from "dotenv";
import User from "../models/user.model.js";
import {User_Mocks} from "./mocks/user.mocks.js";
import Photo from "../models/photo.model.js";
import connectDB from "../db.config.js";
import {Photo_Mocks} from "./mocks/photos.mocks.js";

dotenv.config({ path: `./config/env/.env.development.keys` });
connectDB();

const importData = async() => {
    try {
        await User.deleteMany();
        await Photo.deleteMany();

        const createdUsers = await User.insertMany(User_Mocks);
        const dkgrecoAdminUser = createdUsers[0]._id;

        const samplePhotos = Photo_Mocks.map((photo) => {
           return {
               ...photo,
               user: dkgrecoAdminUser
           }
        });

        const createdPhotos = await Photo.insertMany(samplePhotos);

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