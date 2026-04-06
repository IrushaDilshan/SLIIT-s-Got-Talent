/**
 * Database Seed Script
 * Populates MongoDB with sample judges and contestants for testing
 * 
 * Usage: npm run seed
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Contestant = require('./models/Contestant');

dotenv.config();

// Sample judges
const sampleJudges = [
  {
    name: 'John Smith',
    email: 'john.smith@judging.com',
    password: 'SecurePass123!',
    role: 'judge',
    panel: 'Panel A',
    photo: 'https://via.placeholder.com/150/0000FF/808080?text=John+Smith',
    isActive: true,
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@judging.com',
    password: 'SecurePass123!',
    role: 'judge',
    panel: 'Panel B',
    photo: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Sarah+Johnson',
    isActive: true,
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@judging.com',
    password: 'SecurePass123!',
    role: 'judge',
    panel: 'Panel A',
    photo: 'https://via.placeholder.com/150/00FF00/000000?text=Michael+Chen',
    isActive: true,
  },
];

// Sample contestants for Preliminary round
const sampleContestants = [
  {
    name: 'Emma Williams',
    category: 'Dance',
    round: 'Preliminary',
    performanceTitle: 'Contemporary Flow',
    photo: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Emma+Dance',
    status: 'pending',
    timeSlot: '09:00 AM',
    regNumber: 'SLIIT-001',
    contactNumber: '+94701234567',
  },
  {
    name: 'Rajesh Kumar',
    category: 'Singing',
    round: 'Preliminary',
    performanceTitle: 'Soul Melodies',
    photo: 'https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Rajesh+Singing',
    status: 'pending',
    timeSlot: '09:30 AM',
    regNumber: 'SLIIT-002',
    contactNumber: '+94702345678',
  },
  {
    name: 'Alex Thompson',
    category: 'Comedy',
    round: 'Preliminary',
    performanceTitle: 'Laugh Out Loud',
    photo: 'https://via.placeholder.com/300x400/FFE66D/000000?text=Alex+Comedy',
    status: 'pending',
    timeSlot: '10:00 AM',
    regNumber: 'SLIIT-003',
    contactNumber: '+94703456789',
  },
  {
    name: 'Priya Sharma',
    category: 'Magic',
    round: 'Preliminary',
    performanceTitle: 'Illusion Master',
    photo: 'https://via.placeholder.com/300x400/9B59B6/FFFFFF?text=Priya+Magic',
    status: 'pending',
    timeSlot: '10:30 AM',
    regNumber: 'SLIIT-004',
    contactNumber: '+94704567890',
  },
  {
    name: 'Chris Davis',
    category: 'Instrumental',
    round: 'Preliminary',
    performanceTitle: 'Guitar Virtuoso',
    photo: 'https://via.placeholder.com/300x400/E74C3C/FFFFFF?text=Chris+Guitar',
    status: 'pending',
    timeSlot: '11:00 AM',
    regNumber: 'SLIIT-005',
    contactNumber: '+94705678901',
  },
];

/**
 * Seed database
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/judge-scoring-db';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Contestant.deleteMany({});
    console.log('✓ Cleared existing data');

    // Insert sample judges
    const judges = await User.insertMany(sampleJudges);
    console.log(`✓ Created ${judges.length} sample judges`);
    console.log('  Judges:', judges.map((j) => `${j.name} (${j.email})`).join(', '));

    // Insert sample contestants
    const contestants = await Contestant.insertMany(sampleContestants);
    console.log(`✓ Created ${contestants.length} sample contestants`);
    console.log(
      '  Contestants:',
      contestants.map((c) => `${c.name} (${c.category})`).join(', ')
    );

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\n📝 SAMPLE LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sampleJudges.forEach((judge) => {
      console.log(`Email: ${judge.email}`);
      console.log(`Password: ${judge.password}`);
      console.log('───────────────────────────────────');
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\n✓ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
