import express from "express";
import cors from "cors";
import { config } from "dotenv";
import jsonParser from "./middlewares/jsonHandler.js";
import chatBotApi from "./routes/chatBotApi.js";

const app = express();
config();

// Configure CORS to allow all origins
const corsOptions = {
  origin: '*',
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(jsonParser);

app.get("/", (req, res) => {
    res.send({
        message: "InnoBot - INNOVISION AI Assistant Server 🤖",
        health: "ok",
        description: "Your dedicated assistant for INNOVISION, Eastern India's largest tech event! 🚀"
    });
});

app.use("/api/chat", chatBotApi);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🤖 InnoBot server listening at http://localhost:${port}`);
    console.log(`🚀 Ready to assist with INNOVISION queries!`);
});