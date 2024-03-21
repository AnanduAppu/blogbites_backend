const mongoose = require("mongoose");


const dbConnection=()=>{

    mongoose.connect(process.env.dburi)
    .then(()=>console.log("successfully connected to mongodb")).catch((err)=>console.log(err))
};

module.exports = dbConnection