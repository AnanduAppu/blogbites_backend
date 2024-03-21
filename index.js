const app = require("./app")
const dotenv = require("dotenv");
const dbConnection = require("./config/dbconnection")


dotenv.config({path:"./config/config.env"});


dbConnection()

app.listen(process.env.PORT,()=>{
    console.log(`server is up on ${process.env.PORT}`);
})