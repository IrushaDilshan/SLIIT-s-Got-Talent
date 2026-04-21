const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

/**
 * Script to create judge accounts
 * Usage: node create_judge.js <email1,name1,password1> <email2,name2,password2> ...
 * Example: node create_judge.js judge1@sliit.lk,Judge One,Password123 judge2@sliit.lk,Judge Two,Password456
 * 
 * Alternative - interactive mode:
 * node create_judge.js
 * Then enter emails one per line, format: email,name,password
 */

const createJudges = async (judgeData) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const createdJudges = [];
    const failedJudges = [];

    for (const data of judgeData) {
      try {
        const [email, name, password] = data.split(',').map(s => s.trim());
        
        // Validation
        if (!email || !name || !password) {
          failedJudges.push({ 
            data, 
            error: 'Format: email,name,password (all required)' 
          });
          console.error(`❌ Invalid format: ${data}`);
          continue;
        }

        if (password.length < 6) {
          failedJudges.push({ 
            data, 
            error: 'Password must be at least 6 characters' 
          });
          console.error(`❌ Password too short: ${email}`);
          continue;
        }

        // Check if judge already exists
        const existing = await User.findOne({ email });
        if (existing) {
          console.log(`⚠️  Judge already exists: ${email}`);
          continue;
        }

        const judge = await User.create({
          email,
          name,
          password,
          role: 'judge',
          isActive: true,
        });

        createdJudges.push({ email, name, id: judge._id });
        console.log(`✅ Judge created: ${email} / ${name} (ID: ${judge._id})`);
      } catch (error) {
        failedJudges.push({ data, error: error.message });
        console.error(`❌ Failed: ${error.message}`);
      }
    }

    // Summary
    console.log('\n=== Summary ===');
    console.log(`✅ Created: ${createdJudges.length}`);
    console.log(`❌ Failed: ${failedJudges.length}`);

    if (createdJudges.length > 0) {
      console.log('\n📋 Created Judges (can login with these credentials):');
      createdJudges.forEach(j => {
        console.log(`  📧 Email: ${j.email}`);
        console.log(`  👤 Name: ${j.name}`);
        console.log(`  🔑 ID: ${j.id}\n`);
      });
    }

    if (failedJudges.length > 0) {
      console.log('\n❌ Failed Judges:');
      failedJudges.forEach(f => console.log(`  - ${f.data}: ${f.error}`));
    }

    await mongoose.connection.close();
    process.exit(createdJudges.length > 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
};

// Get judge data from command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`\n📘 Usage Examples:
  
  Create judges:
  node create_judge.js "judge1@sliit.lk,Judge One,Password123" "judge2@sliit.lk,Judge Two,Password456"
  
  Quick test (copy & paste):
  node create_judge.js "test1@sliit.lk,Test Judge,Test@1234" "test2@sliit.lk,Test Judge 2,Test@1234"\n`);
  process.exit(0);
}

createJudges(args);
