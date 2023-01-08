import path from "path";
import http from "http";
import express from "express";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import mongoSanitize from "express-mongo-sanitize";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import localization from "./middleware/localization.js";
import adminRoutes from "./routes/admin.js";
import clientRoutes from "./routes/client.js";
import chat from "./webSocket/chat.js";
import helmet from "helmet";
import xss from "xss-clean";
import cookieParser from 'cookie-parser'
import { corsOptions } from "./config/corsOptions.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Express
const app = express();
const server = http.createServer(app);
const __dirname = path.resolve();

// Prevent XSS attacks
app.use(xss());
app.use(cors(corsOptions));

// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

//  Initialize Socket.io
const io = new Server(server, { cors: { origin: '*' } });
chat(io);

// Multil-language
app.use(localization);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser())

// Sanitize data
app.use(mongoSanitize());

// Rate limiting: IP
app.set("trust proxy", 1);

app.get('/', (req, res) => {
  return res.send('hello-world')
})

// Mount routers
app.use("/api/v1/admin", adminRoutes);
// seperat the call center endpoints from client routes
// app.use("/api/v1", (req, res, next) => { req.io = io; next() }, clientRoutes);
app.use("/api/v1", clientRoutes);

// Make static dir
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use("/locals", express.static(path.join(__dirname, "/locals")));

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || process.env.APP_PORT || 5000;

server.listen(PORT, () =>
  console.log(
    `Server is running on ${process.env.APP_ENV} modes, on port: ${PORT}`
  )
);
