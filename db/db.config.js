import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected To Database!");
    } catch(err) {
        console.error("Unable To Connect to MongoDB", err);
        process.exit(1);
    }
};

export default connectDB;