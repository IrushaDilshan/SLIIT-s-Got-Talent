/**
 * Database Seeding Script
 * Populates database with sample data for testing and demonstration
 * 
 * Usage:
 * - Seed all data: node seed_db.js --all
 * - Seed judges: node seed_db.js --judges
 * - Seed contestants: node seed_db.js --contestants
 * - Seed scores: node seed_db.js --scores
 * - Clear all: node seed_db.js --clear
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Contestant = require('./models/Contestant');
const JudgeScore = require('./models/JudgeScore');

dotenv.config();

const connectDB = require('./config/db');

// Sample data
const sampleJudges = [
  { email: 'judge1@sliit.lk', role: 'judge' },
  { email: 'judge2@sliit.lk', role: 'judge' },
  { email: 'judge3@sliit.lk', role: 'judge' },
  { email: 'judge4@sliit.lk', role: 'judge' },
  { email: 'judge5@sliit.lk', role: 'judge' },
];

const sampleContestants = [
  {
    name: 'Amandi Perera',
    universityId: 'IT19001',
    talentType: 'Singing',
    description: 'Classical and contemporary singer',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    videoUrl: 'https://example.com/video1',
    status: 'approved',
  },
  {
    name: 'Kasun Madushan',
    universityId: 'IT19002',
    talentType: 'Dancing',
    description: 'Hip-hop and contemporary dancer',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    videoUrl: 'https://example.com/video2',
    status: 'approved',
  },
  {
    name: 'Nethmi Silva',
    universityId: 'IT19003',
    talentType: 'Drama',
    description: 'Dramatic actress with theatre background',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    videoUrl: 'https://example.com/video3',
    status: 'approved',
  },
  {
    name: 'Ravindu Senanayake',
    universityId: 'IT19004',
    talentType: 'Beatboxing',
    description: 'Professional beatboxer',
    imageUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80',
    videoUrl: 'https://example.com/video4',
    status: 'approved',
  },
  {
    name: 'Sanjeewa Peiris',
    universityId: 'IT19005',
    talentType: 'Magic',
    description: 'Illusionist and magician',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    videoUrl: 'https://example.com/video5',
    status: 'approved',
  },
  {
    name: 'Priyanka Mendis',
    universityId: 'IT19006',
    talentType: 'Singing',
    description: 'Jazz and blues vocalist',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    videoUrl: 'https://example.com/video6',
    status: 'approved',
  },
  {
    name: 'Ravi Kumara',
    universityId: 'IT19007',
    talentType: 'Comedy',
    description: 'Stand-up comedian',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    videoUrl: 'https://example.com/video7',
    status: 'approved',
  },
  {
    name: 'Lasantha Fernando',
    universityId: 'IT19008',
    talentType: 'Dancing',
    description: 'Ballroom dancer',
    imageUrl: 'https://images.unsplash.com/photo-1519571500957-7e076e3e5a0d?auto=format&fit=crop&w=150&q=80',
    videoUrl: 'https://example.com/video8',
    status: 'approved',
  },
];

/**
 * Seed judges
 */
const seedJudges = async () => {
  try {
    console.log('📝 Seeding judges...');
    
    for (const judgeData of sampleJudges) {
      const existing = await User.findOne({ email: judgeData.email });
      if (!existing) {
        await User.create(judgeData);
        console.log(`   ✅ Created judge: ${judgeData.email}`);
      } else {
        console.log(`   ℹ️  Judge already exists: ${judgeData.email}`);
      }
    }
    
    console.log('✅ Judge seeding completed\n');
  } catch (error) {
    console.error('❌ Error seeding judges:', error);
  }
};

/**
 * Seed contestants
 */
const seedContestants = async () => {
  try {
    console.log('📝 Seeding contestants...');
    
    for (const contestantData of sampleContestants) {
      const existing = await Contestant.findOne({ universityId: contestantData.universityId });
      if (!existing) {
        await Contestant.create(contestantData);
        console.log(`   ✅ Created contestant: ${contestantData.name}`);
      } else {
        console.log(`   ℹ️  Contestant already exists: ${contestantData.name}`);
      }
    }
    
    console.log('✅ Contestant seeding completed\n');
  } catch (error) {
    console.error('❌ Error seeding contestants:', error);
  }
};

/**
 * Seed judge scores
 */
const seedScores = async () => {
  try {
    console.log('📝 Seeding judge scores...');
    
    const judges = await User.find({ role: 'judge' });
    const contestants = await Contestant.find({ status: 'approved' });

    if (judges.length === 0 || contestants.length === 0) {
      console.log('⚠️  No judges or contestants found. Please seed judges and contestants first.');
      return;
    }

    let scoreCount = 0;
    for (const judge of judges) {
      for (const contestant of contestants) {
        // Check if score already exists
        const existing = await JudgeScore.findOne({
          judgeId: judge._id,
          contestantId: contestant._id,
        });

        if (!existing) {
          // Generate random scores
          const creativity = Math.floor(Math.random() * (25 - 10 + 1)) + 10;
          const presentation = Math.floor(Math.random() * (25 - 10 + 1)) + 10;
          const skillLevel = Math.floor(Math.random() * (25 - 10 + 1)) + 10;
          const audienceImpact = Math.floor(Math.random() * (25 - 10 + 1)) + 10;
          const totalScore = creativity + presentation + skillLevel + audienceImpact;

          await JudgeScore.create({
            judgeId: judge._id,
            contestantId: contestant._id,
            criteria: {
              creativity,
              presentation,
              skillLevel,
              audienceImpact,
            },
            totalScore,
            round: 'semi-final',
            status: 'submitted',
            notes: `Scored by ${judge.email.split('@')[0]}`,
          });

          scoreCount++;
        }
      }
    }

    console.log(`   ✅ Created ${scoreCount} judge scores`);
    console.log('✅ Score seeding completed\n');
  } catch (error) {
    console.error('❌ Error seeding scores:', error);
  }
};

/**
 * Clear database
 */
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    await JudgeScore.deleteMany({});
    console.log('   ✅ Cleared JudgeScore collection');
    
    await User.deleteMany({ role: 'judge' });
    console.log('   ✅ Cleared judges');
    
    await Contestant.deleteMany({});
    console.log('   ✅ Cleared contestants');
    
    console.log('✅ Database cleared\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

/**
 * Main seeding function
 */
const main = async () => {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    const command = args[0] || '--all';

    console.log('\n🌱 SLIIT Got Talent - Database Seeding\n');

    if (command === '--all') {
      await seedJudges();
      await seedContestants();
      await seedScores();
    } else if (command === '--judges') {
      await seedJudges();
    } else if (command === '--contestants') {
      await seedContestants();
    } else if (command === '--scores') {
      await seedScores();
    } else if (command === '--clear') {
      await clearDatabase();
    } else {
      console.log('Usage:');
      console.log('  node seed_db.js --all         # Seed everything');
      console.log('  node seed_db.js --judges      # Seed judges only');
      console.log('  node seed_db.js --contestants # Seed contestants only');
      console.log('  node seed_db.js --scores      # Seed scores only');
      console.log('  node seed_db.js --clear       # Clear all data\n');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main();
