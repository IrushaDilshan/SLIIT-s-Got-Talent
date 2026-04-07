/**
 * Database Management Utilities
 * Provides helper functions for database operations, cleanup, and maintenance
 */

const mongoose = require('mongoose');

const dbUtils = {
  /**
   * Check if database is connected
   */
  isConnected: () => {
    return mongoose.connection.readyState === 1; // 1 = connected
  },

  /**
   * Get connection status details
   */
  getConnectionStatus: () => {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    return {
      state: states[mongoose.connection.readyState],
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      db: mongoose.connection.name,
    };
  },

  /**
   * Get database statistics
   */
  getDbStats: async () => {
    try {
      const stats = await mongoose.connection.db.stats();
      return stats;
    } catch (error) {
      console.error('Error getting DB stats:', error);
      return null;
    }
  },

  /**
   * Get collection information
   */
  getCollectionInfo: async (collectionName) => {
    try {
      const collection = mongoose.connection.collection(collectionName);
      const stats = await collection.stats();
      return stats;
    } catch (error) {
      console.error(`Error getting collection info for ${collectionName}:`, error);
      return null;
    }
  },

  /**
   * Drop all collections (USE WITH CAUTION - Development only)
   */
  dropAllCollections: async () => {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      for (const collection of collections) {
        await mongoose.connection.db.dropCollection(collection.name);
      }
      
      console.log('✅ All collections dropped');
      return true;
    } catch (error) {
      console.error('Error dropping collections:', error);
      return false;
    }
  },

  /**
   * Drop specific collection
   */
  dropCollection: async (collectionName) => {
    try {
      await mongoose.connection.db.dropCollection(collectionName);
      console.log(`✅ Collection '${collectionName}' dropped`);
      return true;
    } catch (error) {
      if (error.code === 26) {
        console.log(`ℹ️  Collection '${collectionName}' does not exist`);
        return true;
      }
      console.error(`Error dropping collection '${collectionName}':`, error);
      return false;
    }
  },

  /**
   * Create indexes for collections
   */
  createIndexes: async () => {
    try {
      const JudgeScore = require('../models/JudgeScore');
      const User = require('../models/User');
      const Contestant = require('../models/Contestant');
      const Vote = require('../models/Vote');

      await JudgeScore.collection.createIndex({ judgeId: 1, contestantId: 1, round: 1 }, { unique: true });
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await Contestant.collection.createIndex({ universityId: 1 }, { unique: true });
      await Vote.collection.createIndex({ voterId: 1, contestantId: 1 });

      console.log('✅ Database indexes created successfully');
      return true;
    } catch (error) {
      console.error('Error creating indexes:', error);
      return false;
    }
  },

  /**
   * Verify database integrity
   */
  verifyIntegrity: async () => {
    try {
      const JudgeScore = require('../models/JudgeScore');
      const duplicates = await JudgeScore.aggregate([
        {
          $group: {
            _id: { judgeId: '$judgeId', contestantId: '$contestantId', round: '$round' },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gt: 1 } } },
      ]);

      if (duplicates.length > 0) {
        console.warn('⚠️  Found duplicate judge scores:', duplicates);
        return false;
      }

      console.log('✅ Database integrity verified');
      return true;
    } catch (error) {
      console.error('Error verifying integrity:', error);
      return false;
    }
  },

  /**
   * Get database size in MB
   */
  getDbSize: async () => {
    try {
      const stats = await mongoose.connection.db.stats();
      const sizeInMB = (stats.dataSize / (1024 * 1024)).toFixed(2);
      return sizeInMB;
    } catch (error) {
      console.error('Error getting DB size:', error);
      return null;
    }
  },

  /**
   * List all collections
   */
  listCollections: async () => {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      return collections.map(c => c.name);
    } catch (error) {
      console.error('Error listing collections:', error);
      return [];
    }
  },
};

module.exports = dbUtils;
