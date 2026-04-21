/**
 * Seed Contestants Script
 * Populates database with sample contestants for testing
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contestant = require('./models/Contestant');

dotenv.config();

const connectDB = require('./config/db');

const sampleContestants = [
  {
    name: 'Amandi Perera',
    category: 'Singing',
    round: 'Preliminary',
    performanceTitle: 'Classical Rhapsody',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    timeSlot: '09:00 AM',
    contestantId: 'C001',
    status: 'pending',
  },
  {
    name: 'Kasun Madushan',
    category: 'Dancing',
    round: 'Preliminary',
    performanceTitle: 'Hip Hop Battle',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    timeSlot: '09:30 AM',
    contestantId: 'C002',
    status: 'pending',
  },
  {
    name: 'Nethmi Silva',
    category: 'Drama',
    round: 'Preliminary',
    performanceTitle: 'Shakespeare Act',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    timeSlot: '10:00 AM',
    contestantId: 'C003',
    status: 'pending',
  },
  {
    name: 'Ravindu Senanayake',
    category: 'Beatboxing',
    round: 'Preliminary',
    performanceTitle: 'Electronic Beats',
    photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=300&q=80',
    timeSlot: '10:30 AM',
    contestantId: 'C004',
    status: 'pending',
  },
  {
    name: 'Sanjeewa Peiris',
    category: 'Magic',
    round: 'Preliminary',
    performanceTitle: 'Card Illusions',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    timeSlot: '11:00 AM',
    contestantId: 'C005',
    status: 'pending',
  },
  {
    name: 'Priyanka Mendis',
    category: 'Comedy',
    round: 'Preliminary',
    performanceTitle: 'Stand-up Comedy',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    timeSlot: '11:30 AM',
    contestantId: 'C006',
    status: 'pending',
  },
  {
    name: 'Tharaka Jayasuriya',
    category: 'Singing',
    round: 'Semi-Final',
    performanceTitle: 'Modern Pop Medley',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    timeSlot: '02:00 PM',
    contestantId: 'C007',
    status: 'performed',
  },
  {
    name: 'Lakshmi Gunawardena',
    category: 'Dancing',
    round: 'Semi-Final',
    performanceTitle: 'Contemporary Fusion',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    timeSlot: '02:30 PM',
    contestantId: 'C008',
    status: 'performed',
  },
  {
    name: 'Mahesh Wickramasinghe',
    category: 'Music',
    round: 'Semi-Final',
    performanceTitle: 'Guitar Virtuoso',
    photo: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?auto=format&fit=crop&w=300&q=80',
    timeSlot: '03:00 PM',
    contestantId: 'C009',
    status: 'performed',
  },
  {
    name: 'Chaminda Jayawarna',
    category: 'Singing',
    round: 'Final',
    performanceTitle: 'Emotional Ballad',
    photo: 'https://images.unsplash.com/photo-1500995617113-cf789b1305c0?auto=format&fit=crop&w=300&q=80',
    timeSlot: '06:00 PM',
    contestantId: 'C010',
    status: 'pending',
  },
];

async function seedContestants() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Drop the collection to clear all data and indexes
    try {
      await Contestant.collection.drop();
      console.log('🗑️  Dropped contestants collection');
    } catch (err) {
      console.log('ℹ️  Collection does not exist yet');
    }

    // Insert sample contestants
    const result = await Contestant.insertMany(sampleContestants);
    console.log(`\n✅ Seeded ${result.length} contestants successfully!\n`);

    // Display created contestants
    result.forEach((contestant, index) => {
      console.log(`${index + 1}. ${contestant.name} - ${contestant.category} (${contestant.round})`);
    });

    console.log('\n✨ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

// Run seeding
seedContestants();
