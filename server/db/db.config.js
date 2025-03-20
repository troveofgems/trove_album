import mongoose from "mongoose";

const connectDB = async () => {
    console.log("=> Mongo DB");
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            auth: {
              authSource: process.env.MONGO_AUTH_SOURCE,
            },
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASS,
            ssl: true
        });
        console.log("Connected To Database!\n");
        return conn;
    } catch(err) {
        console.error("Unable To Connect...\n", err);
        process.exit(1);
    }
};

export default connectDB;