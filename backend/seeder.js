const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load env vars
dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for seeding...');

        const usersToCreate = [
            {
                name: 'JM Creations Admin',
                email: 'contact@jmcreation.in',
                password: 'Admin@123',
                role: 'director'
            },
            {
                name: 'Abniya',
                email: 'abniya@jmcreeation@gmail.com',
                password: 'Windf@123',
                role: 'director'
            },
            {
                name: 'Saran',
                email: 'saran@jmcreation@gmail.com',
                password: 'Intern@123',
                role: 'intern'
            },
            {
                name: 'Manisha',
                email: 'manishajmcreations26@gmail.com',
                password: 'Intern@123',
                role: 'intern'
            },
            {
                name: 'Swedha',
                email: 'swedhajmcreations26@gmail.com',
                password: 'Intern@123',
                role: 'intern'
            },
            {
                name: 'Aashifa',
                email: 'aashifajmcreation26@gmail.com',
                password: 'Intern@123',
                role: 'intern'
            },
            {
                name: 'Nirmal',
                email: 'nirmaljmcreations@gmail.com',
                password: 'Intern@123',
                role: 'intern'
            }
        ];

        for (let u of usersToCreate) {
            // Check if user already exists so we don't create duplicates
            const existingUser = await User.findOne({ email: u.email });

            if (!existingUser) {
                // Hash the password
                const salt = await bcrypt.genSalt(10);
                u.password = await bcrypt.hash(u.password, salt);

                // Create user
                await User.create(u);
                console.log(`✅ Created ${u.role}: ${u.email} (Password: ${u.role === 'director' ? 'Admin@123' : 'Intern@123'})`);
            } else {
                console.log(`⏭️ User already exists: ${u.email}`);
            }
        }

        console.log('🎉 Seeding complete! You can now log in.');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedUsers();