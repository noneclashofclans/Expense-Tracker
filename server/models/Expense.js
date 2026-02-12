const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a title']
    },
    userPhone: { 
        type: String, 
        required: true 
    },
    amount: {
        type: Number,
        required: [true, 'Please enter an amount']
    },
    category: {
        type: String,
        required: [true, 'Please enter a category']
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
