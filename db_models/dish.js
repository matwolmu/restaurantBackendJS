const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dishSchema = new Schema({
    id: String,
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    availible: {
        type: Boolean,
        required: false
    },
    allergies: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Dish', dishSchema);