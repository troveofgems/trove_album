dotenv.config({ path: `./config/env/.env.${process.env.NODE_ENV}.keys` });
import dotenv from 'dotenv';
import express from 'express';
import connectDB from "./db/db.config.js";

connectDB();

const port = process.env.PORT || 3003;

const app = express();


app.get("/auth", (req, res, next) => {
    return res.send("Auth API Running");
});

app.get("/gallery", (req, res, next) => {
   return res.send("Gallery API Running");
});

app.listen(port, () => {
   console.log(`✨ Photo Album Up & Running on port: ${port} ✨`);
});
