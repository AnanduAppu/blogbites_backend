const express = require("express");
const http = require("http"); // Add this line
const { Server } = require("socket.io"); // Correctly import socket.io

const app = express();

const cookies = require("cookie-parser");
const cors = require("cors");
const errorhandler = require("./middlewares/errorhandler");

app.use(express.json());
app.use(cookies());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// User area
const routeUser = require("./Routes/userRoutes");
app.use("/user", routeUser);

// Chat area
const routerChat = require("./Routes/chatRoutes");
app.use("/chat", routerChat); // Change path to avoid conflict

// Create HTTP server
const server = http.createServer(app);


app.use(errorhandler);




module.exports = app;
