import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import http from "http";
import { initSocket } from "./socket.js";
import messageRoutes from "./routes/message.route.js";
import chatRoutes from "./routes/chat.routes.js";

dotenv.config({});
const app = express();

const server = http.createServer(app);

// ✅ CAPTURE io INSTANCE
const io = initSocket(server);

// ✅ MAKE io AVAILABLE IN CONTROLLERS
app.set("io", io);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 5011;

// routes
app.use("/api/user", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);
app.use("/api/message", messageRoutes);
app.use("/api/chat", chatRoutes);
// dhfisfhsdhscha72e2hdiac

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
