const express = require("express");
const app = express();

const cookies = require("cookie-parser")
const cors = require("cors")
const errorhandler = require("./middlewares/errorhandler")


app.use(express.json())

app.use(cookies());


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));




//user area 
const routeUser = require("./Routes/userRoutes");
app.use("/user",routeUser)


app.use(errorhandler)




module.exports = app;