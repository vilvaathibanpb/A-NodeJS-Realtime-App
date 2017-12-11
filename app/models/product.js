const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema defines how the user's data will be stored in MongoDB
const ProductSchema = new mongoose.Schema({
    product_category: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    products: {
        rental: {
            type: Array,
        },
        power_of_attorney: {
            type: Array,
        },
        contract: {
            type: Array,
        }
    }
});

// Saves the user's password hashed (plain text password storage is not good)


module.exports = mongoose.model('Product', ProductSchema);
