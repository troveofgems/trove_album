import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            auth: {
              authSource: process.env.MONGO_AUTH_SOURCE,
            },
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASS,
            ssl: true
        });

        console.log("Connected To Database!");
        return conn;
    } catch(err) {
        console.error("Unable To Connect to MongoDB", err);
        process.exit(1);
    }
};

export default connectDB;