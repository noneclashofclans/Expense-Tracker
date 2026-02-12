const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');


router.post('/', async(req, res) => {

    try{
        const { title, amount, category, date, userPhone } = req.body;

    
        console.log("Received request body:", req.body);
        console.log("title:", title);
        console.log("amount:", amount);
        console.log("category:", category);
        console.log("userPhone:", userPhone);

        const missingFields = [];
        if (!title) missingFields.push('title');
        if (!amount) missingFields.push('amount');
        if (!category) missingFields.push('category');
        if (!userPhone) missingFields.push('userPhone');

        if (missingFields.length > 0) {
            console.log("Missing fields:", missingFields);
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}`,
                received: req.body
            });
        }

        const newExpense = await Expense.create({
            title,
            amount, 
            category, 
            date: date || new Date(), 
            userPhone
        });

        console.log("Expense created successfully:", newExpense);
        res.status(201).json(newExpense);
    }

    catch(error){
        console.error("Error creating expense:", error.message);
        console.error("Full error:", error);
        res.status(500).json({
            message: "Error creating an expense",
            error: error.message
        })
    }

})


router.get('/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const expenses = await Expense.find({ userPhone: phone }).sort({ date: -1 }); 
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching expenses' });
    }
});


router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 }); 
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error fetching expenses' });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error deleting expense' });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            { title, amount, category, date },
            { new: true, runValidators: true }
        );

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json(expense);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error updating expense' });
    }
});

module.exports = router;