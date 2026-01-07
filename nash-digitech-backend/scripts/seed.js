const mongoose = require('mongoose');
const Testimonial = require('../models/Testimonial');
const data = require('../data.json');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nash-digitech', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedDatabase = async () => {
    try {
        // Clear existing data
        await Testimonial.deleteMany({});
        
        // Insert initial testimonials
        await Testimonial.insertMany(data.testimonials);
        
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();