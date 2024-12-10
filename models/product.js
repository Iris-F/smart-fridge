const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['fruit', 'vegetable', 'meat', 'seafood', 'bakery', 'beverages', 'dairy', 'frozen', 'other']
    },
    expirydate: {
        type: Date
    }
})

// Create a text index on the 'name' field
productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;