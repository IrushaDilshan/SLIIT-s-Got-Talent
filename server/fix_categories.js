const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sliit_got_talent';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    // The schemas
    const contestantSchema = new mongoose.Schema({}, { strict: false });
    const Contestant = mongoose.model('Contestant', contestantSchema);
    
    // Find and update all contestants to fix talentType typos and casing
    const formatTitleCase = (str) => {
        if (!str) return 'Other';
        let clean = str.trim();
        // Fix the specific spelling error
        if (clean.toLowerCase() === 'dansing') {
            clean = 'Dancing';
        }
        return clean.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const contestants = await Contestant.find({});
    let updatedCount = 0;
    
    for (let c of contestants) {
        const oldType = c.get('talentType');
        const newType = formatTitleCase(oldType);
        
        if (oldType !== newType) {
            c.set('talentType', newType);
            await c.save();
            updatedCount++;
            console.log(`Updated "${oldType}" -> "${newType}"`);
        }
    }
    
    console.log(`Successfully fixed ${updatedCount} category typos!`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
