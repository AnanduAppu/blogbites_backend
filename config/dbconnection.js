const mongoose = require('mongoose');

const dbConnection = () => {
    mongoose.connect(process.env.dburi, {UseNewUrlParser:true},{useUnifiedTopology:true})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Failed to connect to MongoDB', err));
};

module.exports = dbConnection;