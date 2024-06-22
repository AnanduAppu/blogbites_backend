const mongoose = require("mongoose");


const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'userData',
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    topic:{
        type: String,
        required: true
    },
    
    image:Array,
    
    likes: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'userData', }],
        
    comments:[{type: mongoose.Schema.Types.ObjectId,
        ref: 'comments', }],
    visibility:Boolean
}, {
    timestamps: true,
});

module.exports = mongoose.model("Blog", blogSchema);
