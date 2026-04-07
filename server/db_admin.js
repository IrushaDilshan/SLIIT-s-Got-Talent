/**
 * Database Administration CLI Tool
 * Manage indexes, collections, and database maintenance
 * 
 * Usage:
 * node db_admin.js status              # Show connection status
 * node db_admin.js stats               # Show database statistics
 * node db_admin.js indexes             # Show and create indexes
 * node db_admin.js verify              # Verify database integrity
 * node db_admin.js collections         # List all collections
 * node db_admin.js size                # Show database size
 * node db_admin.js backup              # Create database backup
 * node db_admin.js restore <file>      # Restore from backup
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const dbUtils = require('./config/dbUtils');
const fs = require('fs');
const path = require('path');

const commands = {
  /**
   * Show database connection status
   */
  status: async () => {
    try {
      const status = dbUtils.getConnectionStatus();
      console.log('\n📊 Database Connection Status:');
      console.log(`   State: ${status.state.toUpperCase()}`);
      console.log(`   Host: ${status.host}`);
      console.log(`   Port: ${status.port}`);
      console.log(`   Database: ${status.db}\n`);
    } catch (error) {
      console.error('Error getting status:', error);
    }
  },

  /**
   * Show database statistics
   */
  stats: async () => {
    try {
      const stats = await dbUtils.getDbStats();
      if (stats) {
        console.log('\n📈 Database Statistics:');
        console.log(`   Collections: ${stats.collections}`);
        console.log(`   Indexes: ${stats.indexes}`);
        console.log(`   Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
        console.log(`   Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB\n`);
      }
    } catch (error) {
      console.error('Error getting stats:', error);
    }
  },

  /**
   * Create and show indexes
   */
  indexes: async () => {
    try {
      console.log('\n🔑 Creating and displaying indexes...\n');
      await dbUtils.createIndexes();
      
      const JudgeScore = require('./models/JudgeScore');
      const indexes = await JudgeScore.collection.getIndexes();
      console.log('JudgeScore Indexes:');
      Object.entries(indexes).forEach(([name, spec]) => {
        console.log(`   ${name}:`, spec);
      });
      console.log('');
    } catch (error) {
      console.error('Error managing indexes:', error);
    }
  },

  /**
   * Verify database integrity
   */
  verify: async () => {
    try {
      console.log('\n🔍 Verifying database integrity...\n');
      const isValid = await dbUtils.verifyIntegrity();
      if (isValid) {
        console.log('✅ Database integrity verified\n');
      } else {
        console.log('⚠️  Database integrity issues found\n');
      }
    } catch (error) {
      console.error('Error verifying integrity:', error);
    }
  },

  /**
   * List all collections
   */
  collections: async () => {
    try {
      const collections = await dbUtils.listCollections();
      console.log('\n📚 Database Collections:');
      collections.forEach(col => console.log(`   - ${col}`));
      console.log('');
    } catch (error) {
      console.error('Error listing collections:', error);
    }
  },

  /**
   * Show database size
   */
  size: async () => {
    try {
      const sizeMB = await dbUtils.getDbSize();
      console.log(`\n💾 Database Size: ${sizeMB} MB\n`);
    } catch (error) {
      console.error('Error getting database size:', error);
    }
  },

  /**
   * Backup database (export as JSON)
   */
  backup: async () => {
    try {
      console.log('\n💾 Creating database backup...\n');

      const backupsDir = path.join(__dirname, 'backups');
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupsDir, `backup-${timestamp}.json`);

      const User = require('./models/User');
      const Contestant = require('./models/Contestant');
      const JudgeScore = require('./models/JudgeScore');
      const Vote = require('./models/Vote');

      const backup = {
        timestamp: new Date(),
        users: await User.find(),
        contestants: await Contestant.find(),
        judgeScores: await JudgeScore.find(),
        votes: await Vote.find(),
      };

      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      console.log(`✅ Backup created: ${backupFile}\n`);
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  },

  /**
   * Restore database from backup
   */
  restore: async (backupFile) => {
    try {
      if (!backupFile) {
        console.log('Please provide a backup file path');
        console.log('Usage: node db_admin.js restore <file>\n');
        return;
      }

      if (!fs.existsSync(backupFile)) {
        console.log(`File not found: ${backupFile}\n`);
        return;
      }

      console.log('\n🔄 Restoring database from backup...\n');

      const backup = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));

      const User = require('./models/User');
      const Contestant = require('./models/Contestant');
      const JudgeScore = require('./models/JudgeScore');
      const Vote = require('./models/Vote');

      // Clear existing data
      await User.deleteMany({});
      await Contestant.deleteMany({});
      await JudgeScore.deleteMany({});
      await Vote.deleteMany({});

      // Restore data
      if (backup.users && backup.users.length > 0) {
        await User.insertMany(backup.users);
        console.log(`✅ Restored ${backup.users.length} users`);
      }

      if (backup.contestants && backup.contestants.length > 0) {
        await Contestant.insertMany(backup.contestants);
        console.log(`✅ Restored ${backup.contestants.length} contestants`);
      }

      if (backup.judgeScores && backup.judgeScores.length > 0) {
        await JudgeScore.insertMany(backup.judgeScores);
        console.log(`✅ Restored ${backup.judgeScores.length} judge scores`);
      }

      if (backup.votes && backup.votes.length > 0) {
        await Vote.insertMany(backup.votes);
        console.log(`✅ Restored ${backup.votes.length} votes`);
      }

      console.log('\n✅ Database restored successfully\n');
    } catch (error) {
      console.error('Error restoring database:', error);
    }
  },

  /**
   * Show help
   */
  help: () => {
    console.log(`
🗄️  Database Administration Tool

Commands:
  status              Show database connection status
  stats               Show database statistics
  indexes             Show and create indexes
  verify              Verify database integrity
  collections         List all collections
  size                Show database size
  backup              Create database backup
  restore <file>      Restore from backup
  help                Show this help message

Examples:
  node db_admin.js status
  node db_admin.js stats
  node db_admin.js backup
  node db_admin.js restore ./backups/backup-2026-04-07.json
    `);
  },
};

/**
 * Main CLI handler
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    if (!commands[command]) {
      console.log(`Unknown command: ${command}`);
      commands.help();
      process.exit(1);
    }

    // Connect to database (except for help)
    if (command !== 'help') {
      await connectDB();
    }

    // Execute command
    if (command === 'restore') {
      await commands[command](args[1]);
    } else {
      await commands[command]();
    }

    if (command !== 'help') {
      await mongoose.connection.close();
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
