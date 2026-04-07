const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

/**
 * Script to create judge accounts
 * Usage: node create_judge.js <email1> <email2> ...
 * Example: node create_judge.js judge1@sliit.lk judge2@sliit.lk
 */

const createJudges = async (emails) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const createdJudges = [];
    const failedJudges = [];

    for (const email of emails) {
      try {
        // Check if judge already exists
        const existing = await User.findOne({ email });
        if (existing) {
          console.log(`⚠️  Judge already exists: ${email}`);
          continue;
        }

        const judge = await User.create({
          email,
          role: 'judge',
        });

        createdJudges.push(email);
        console.log(`✅ Judge created: ${email} (ID: ${judge._id})`);
      } catch (error) {
        failedJudges.push({ email, error: error.message });
        console.error(`❌ Failed to create judge ${email}: ${error.message}`);
      }
    }

    // Summary
    console.log('\n=== Summary ===');
    console.log(`✅ Created: ${createdJudges.length}`);
    console.log(`❌ Failed: ${failedJudges.length}`);

    if (createdJudges.length > 0) {
      console.log('\nCreated Judges:');
      createdJudges.forEach(email => console.log(`  - ${email}`));
    }

    if (failedJudges.length > 0) {
      console.log('\nFailed Judges:');
      failedJudges.forEach(item => console.log(`  - ${item.email}: ${item.error}`));
    }

    process.exit(failedJudges.length > 0 && createdJudges.length === 0 ? 1 : 0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Get emails from command line arguments
const emails = process.argv.slice(2);

if (emails.length === 0) {
  console.log('Usage: node create_judge.js <email1> <email2> ...');
  console.log('Example: node create_judge.js judge1@sliit.lk judge2@sliit.lk');
  process.exit(1);
}

createJudges(emails);
