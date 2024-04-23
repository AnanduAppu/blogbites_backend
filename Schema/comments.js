const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema({
    whichBlog: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Blog',
    },
    commentPerson: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'userData',
    },
   comment: {
        type: String,
        required: true
    },

    likes: [{type: mongoose.Schema.Types.ObjectId,
        ref: 'userData', }],
}, {
    timestamps: true,
});

module.exports = mongoose.model("comments", commentSchema);
