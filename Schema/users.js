const mongoose = require("mongoose");
const bycrypt = require("bcrypt");
const validate = require("validator");


const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please fill your name"],
        minlength: [4, "At least needed four letters"],
        maxlength: [20, "You reached the max character limit"],
        lowercase: true
    },
    username: {
        type: String,
        required: [true, "Please fill your name"],
        minlength: [4, "At least needed four letters"],
        maxlength: [20, "You reached the max character limit"],
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "Please fill the email"],
        unique: true,
        validate: [validate.isEmail, "Please provide a valid email"],
        lowercase: true
    },
    dob:{
        type: String,
    },
    profilePicture: {
        type:String,
    },
    backgroudWal: {
        type:String,
    },
    gender:{
        type:String,
        required:true
    },
    region:{
        type:String,
        required:true
    },
    interest:Array,
    likedBlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    }],
    your_blogs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    }],
    you_followed:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"userData"
}],
    followed:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"userData"
    }],
    
    saved_blogs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    }],
    password: {
        type: String,
        required: [true, "Please fill the password"],
        minlength: [4, "Password, at least needs 4 letters"],
        
    },
    
},{
    timestamps: true,
});


userSchema.pre("save",async function (next){

    if (!this.isModified("password")) {
        next()
    }

    this.password = await bycrypt.hash(this.password,10)

});

module.exports = mongoose.model("userData",userSchema)