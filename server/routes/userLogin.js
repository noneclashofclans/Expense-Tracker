const express = require ('express');
const router = express.Router();
const User = require('../models/Users.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// register
router.post('/register', async(req, res) => {
    try{
        const { name, email, password, phone } = req.body;


        if (!email || !name || !password || !phone){
            return res.status(400).json({message: 'Pls fill all the fields'});
        }

        const userExists = await User.findOne({email});
        if (userExists){
            return res.status(400).json({message: 'User with the given name/mail address has already registered'})
        }
        
        const salting = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salting);

        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
        });

        res.status(201).json({
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone
        });
    }catch(error){
        console.log(error.message);
        res.status(500).json({message: 'Error during registration'});
    }
});


// login 
router.post('/login', async(req, res) => {
    try{
        const { name, email, password } = req.body;

        const user = await User.findOne({email});

        if (!user) {
            return res.status(401).json({message: 'Invalid email/name or password'});
        }

        const hasMatched = await bcrypt.compare(password, user.password);

        if (!hasMatched){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const payload = { userEmail: user.email, userName: user.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Logged in successfully!',
            token,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone
            },
        });

    }catch(error){
        console.log(error.message);
        res.status(500).json({message: "Error during login"});
    }
});

module.exports = router;