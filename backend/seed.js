const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
    await connectDB();
    try {
        const existingAdmin = await User.findOne({ email: 'admin@reportit.com' });
        if(existingAdmin) {
            console.log('Admin already exists');
        } else {
            await User.create({
                name: 'System Admin',
                email: 'admin@reportit.com',
                password: 'adminpassword',
                role: 'admin'
            });
            console.log('Admin created successfully.');
        }
        process.exit();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

seedAdmin();
