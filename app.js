const express = require("express");
const app = express();
const cookies = require("cookie-parser");
const cors = require("cors");
const errorhandler = require("./middlewares/errorhandler");

app.use(express.json());
app.use(cookies());

const local="http://localhost:5173"
const livedom = "https://blogbites.vercel.app/";

app.use(
  cors({
    origin: livedom,
    credentials: true,
  })
);

// User area
const routeUser = require("./Routes/userRoutes");
app.use("/user", routeUser);


// User area
const routeActivity = require("./Routes/ActivityRouter");
app.use("/actvity", routeActivity);

// Chat area
const routerChat = require("./Routes/chatRoutes");
app.use("/chat", routerChat); 




app.use(errorhandler);




module.exports = app;
