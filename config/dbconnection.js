const mongoose = require('mongoose');

const dbConnection = () => {
    mongoose.connect(process.env.dburi)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Failed to connect to MongoDB', err));
};

module.exports = dbConnection;