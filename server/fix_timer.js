const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sliit_got_talent';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    // The schemas
    const settingSchema = new mongoose.Schema({}, { strict: false });
    const Setting = mongoose.model('Setting', settingSchema);
    
    let settings = await Setting.findOne();
    if (!settings) {
        settings = new Setting({});
    }

    // Set countdown to magically be 2 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    
    settings.set('countdownEnd', futureDate);
    await settings.save();
    
    console.log(`Set timer to ${futureDate}`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
