const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'userData',
    },

   comment: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    likes: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'userData', }],
}, {
    timestamps: true,
});

module.exports = mongoose.model("comments", commentSchema);
