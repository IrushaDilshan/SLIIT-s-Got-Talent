#!/usr/bin/env node

/**
 * System Verification Script
 * Checks all components of the judge scoring system
 * Run: node verify-system.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(status, message) {
  if (status === '✓') {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
    checks.passed++;
  } else if (status === '✗') {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
    checks.failed++;
  } else if (status === '⚠') {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
    checks.warnings++;
  } else {
    console.log(`${colors.cyan}${status}${colors.reset} ${message}`);
  }
}

async function verifyEnvironment() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}1. ENVIRONMENT CONFIGURATION${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  // Check .env file
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    log('✓', '.env file exists');
  } else {
    log('✗', '.env file not found');
  }

  // Check required env variables
  if (process.env.MONGO_URI) {
    log('✓', 'MONGO_URI is set');
    if (process.env.MONGO_URI.includes('judge-scoring-db')) {
      log('✓', 'Database name is "judge-scoring-db"');
    } else {
      log('✗', 'Database name should be "judge-scoring-db"');
    }
  } else {
    log('✗', 'MONGO_URI not set in .env');
  }

  if (process.env.JWT_SECRET) {
    log('✓', 'JWT_SECRET is set');
  } else {
    log('✗', 'JWT_SECRET not set in .env');
  }

  if (process.env.PORT) {
    log('✓', `Server PORT configured: ${process.env.PORT}`);
  }

  if (process.env.NODE_ENV) {
    log('✓', `NODE_ENV: ${process.env.NODE_ENV}`);
  }
}

async function verifyModels() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}2. MODEL FILES${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const models = ['User', 'Contestant', 'JudgeScore', 'Vote'];
  
  for (const model of models) {
    const filePath = path.join(__dirname, 'models', `${model}.js`);
    if (fs.existsSync(filePath)) {
      log('✓', `${model}.js model exists`);
    } else {
      log('✗', `${model}.js model not found`);
    }
  }
}

async function verifyControllers() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}3. CONTROLLER FILES${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const controllers = ['auth', 'judge', 'contestant'];
  
  for (const controller of controllers) {
    const filePath = path.join(__dirname, 'controllers', `${controller}.Controller.js`);
    if (fs.existsSync(filePath)) {
      log('✓', `${controller}.Controller.js exists`);
    } else {
      log('✗', `${controller}.Controller.js not found`);
    }
  }
}

async function verifyRoutes() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}4. ROUTE FILES${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const routes = ['auth', 'judge', 'contestant'];
  
  for (const route of routes) {
    const filePath = path.join(__dirname, 'routes', `${route}.Routes.js`);
    if (fs.existsSync(filePath)) {
      log('✓', `${route}.Routes.js exists`);
    } else {
      log('✗', `${route}.Routes.js not found`);
    }
  }
}

async function verifyMiddleware() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}5. MIDDLEWARE FILES${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const middleware = ['authMiddleware', 'roleMiddleware', 'errorHandler'];
  
  for (const mw of middleware) {
    const filePath = path.join(__dirname, 'middleware', `${mw}.js`);
    if (fs.existsSync(filePath)) {
      log('✓', `${mw}.js exists`);
    } else {
      log('✗', `${mw}.js not found`);
    }
  }
}

async function verifyDatabase() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}6. DATABASE CONNECTION${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  try {
    if (!process.env.MONGO_URI) {
      log('✗', 'MONGO_URI environment variable not set');
      return;
    }

    // Create minimal connection
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    log('✓', 'MongoDB connection successful');
    log('✓', `Host: ${conn.connection.host}`);
    log('✓', `Database: ${conn.connection.name}`);

    // Check collections
    const collections = await conn.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('contestants')) {
      log('✓', 'Contestants collection exists');
      const count = await conn.connection.db.collection('contestants').countDocuments();
      log('✓', `  └─ ${count} contestants in database`);
      
      const approved = await conn.connection.db.collection('contestants').countDocuments({ status: 'approved' });
      if (approved > 0) {
        log('✓', `  └─ ${approved} approved contestants (ready for judging)`);
      } else {
        log('⚠', '  └─ No approved contestants found (status != "approved")');
      }
    } else {
      log('⚠', 'Contestants collection not found');
    }

    if (collectionNames.includes('judgescores')) {
      log('✓', 'JudgeScores collection exists');
      const count = await conn.connection.db.collection('judgescores').countDocuments();
      log('✓', `  └─ ${count} score submissions in database`);
    } else {
      log('⚠', 'JudgeScores collection not found');
    }

    if (collectionNames.includes('users')) {
      log('✓', 'Users collection exists');
      const judges = await conn.connection.db.collection('users').countDocuments({ role: 'judge' });
      log('✓', `  └─ ${judges} judges registered`);
    } else {
      log('⚠', 'Users collection not found');
    }

    // Sample contestant ObjectId validation
    const sampleContestant = await conn.connection.db.collection('contestants').findOne();
    if (sampleContestant) {
      log('✓', `Sample contestant ID format: ${sampleContestant._id} (valid ObjectId)`);
    }

    await conn.disconnect();
  } catch (error) {
    log('✗', `MongoDB connection failed: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      log('⚠', 'Possible issue: MongoDB not running or connection string incorrect');
    }
  }
}

async function verifyFrontend() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}7. FRONTEND FILES${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const frontendPath = path.join(__dirname, '../web-app/src');
  
  const files = [
    'pages/JudgePanelDashboard.jsx',
    'services/judgeApi.js',
    'services/apiClient.js',
    'components/AuthContext.jsx',
  ];

  for (const file of files) {
    const filePath = path.join(frontendPath, file);
    if (fs.existsSync(filePath)) {
      log('✓', file);
      
      // Check for specific implementations
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (file.includes('JudgePanelDashboard')) {
        if (content.includes('judgeApi.submitScore')) {
          log('✓', '  └─ Has API submission call');
        }
        if (content.includes('useEffect')) {
          log('✓', '  └─ Has useEffect for data fetching');
        }
      }
      
      if (file.includes('judgeApi')) {
        if (content.includes('api.post')) {
          log('✓', '  └─ Uses correct API post format');
        }
        if (content.includes('token')) {
          log('✓', '  └─ Accepts token parameter');
        }
      }
      
      if (file.includes('apiClient')) {
        if (content.includes('export const api')) {
          log('✓', '  └─ Uses named export');
        }
        if (content.includes('Authorization')) {
          log('✓', '  └─ Includes Authorization header');
        }
      }
    } else {
      log('✗', file);
    }
  }
}

async function verifyScripts() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}8. UTILITY SCRIPTS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const scripts = ['seed_db.js', 'db_admin.js'];
  
  for (const script of scripts) {
    const filePath = path.join(__dirname, script);
    if (fs.existsSync(filePath)) {
      log('✓', `${script} exists`);
    } else {
      log('⚠', `${script} not found`);
    }
  }
}

async function verifyPackage() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}9. PACKAGE DEPENDENCIES${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const packagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const required = ['express', 'mongoose', 'jsonwebtoken', 'bcryptjs', 'dotenv'];
    
    for (const dep of required) {
      if (pkg.dependencies[dep]) {
        log('✓', `${dep} (${pkg.dependencies[dep]})`);
      } else {
        log('✗', `${dep} not found in package.json`);
      }
    }
    
    // Check for npm scripts
    if (pkg.scripts) {
      if (pkg.scripts.seed) log('✓', 'npm run seed script available');
      if (pkg.scripts['db:status']) log('✓', 'npm run db:status script available');
    }
  }
}

async function summary() {
  console.log('\n' + `${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.green}Passed:${colors.reset}  ${checks.passed}`);
  console.log(`${colors.red}Failed:${colors.reset}  ${checks.failed}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${checks.warnings}`);

  if (checks.failed === 0) {
    console.log(`\n${colors.green}✓ All checks passed! System is ready.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ ${checks.failed} check(s) failed. Please review above.${colors.reset}`);
  }

  console.log('\n' + `${colors.cyan}Next steps:${colors.reset}`);
  console.log(`1. npm run seed          # Seed test data`);
  console.log(`2. npm start             # Start backend server`);
  console.log(`3. npm start (web-app)   # Start frontend`);
  console.log(`4. Open http://localhost:5173 in browser`);
  console.log(`\n`);
}

async function main() {
  console.log(`\n${colors.cyan}╔═══════════════════════════════════════╗`);
  console.log(`║  SLIIT's Got Talent - System Verification  ║`);
  console.log(`╚═══════════════════════════════════════╝${colors.reset}\n`);

  await verifyEnvironment();
  await verifyModels();
  await verifyControllers();
  await verifyRoutes();
  await verifyMiddleware();
  await verifyDatabase();
  await verifyFrontend();
  await verifyScripts();
  await verifyPackage();
  await summary();
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
});
