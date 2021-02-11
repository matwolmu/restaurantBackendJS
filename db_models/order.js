const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    id: String,
    dishes: {
        type: [String],
    },
    date: {
        type: Date,
    },
    delivery: {
        type: Boolean,
    },
    payment: {
        type: String,
    },
    sum: {
        type: Number,
    },
    date: { 
        min: Number,
        hour: Number,
        day: Number,
        month: Number,
        year: Number
    },
    orderedBy: {
        type: String,
    },
});

module.exports = mongoose.model('Order', orderSchema);