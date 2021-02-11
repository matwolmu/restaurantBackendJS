const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const customerSchema = new Schema({
    id: String,
    phone: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
    },
    orders:{
        type: [String],
    }
});

module.exports = mongoose.model('Customer', customerSchema);