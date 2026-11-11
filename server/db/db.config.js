import mongoose from "mongoose";

const connectDB = async () => {
    console.log("=> Mongo DB");
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected To Database!\n");
        return conn;
    } catch(err) {
        console.error("Unable To Connect...\n", err);
        process.exit(1);
    }
};

export default connectDB;

//await mongoose.connect("mongodb+srv://dkgrecodev:<db_password>@troveofgems.i32az.mongodb.net/");