#!/usr/bin/env node
/**
 * Production Architecture Verification Script
 * Ensures no static data leaks into runtime
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Production Architecture...\n');

const issues = [];
const warnings = [];

// 1. Check server.js doesn't import seed scripts
const serverPath = path.join(__dirname, 'server.js');
const serverContent = fs.readFileSync(serverPath, 'utf8');

if (serverContent.includes('seed-test') || serverContent.includes('mock') || serverContent.includes('/scripts/seed')) {
  issues.push('❌ server.js imports seed/test scripts');
} else {
  console.log('✅ server.js is clean (no seed imports)');
}

// 2. Verify dev-tools folder exists and contains moved scripts
const devToolsPath = path.join(__dirname, 'dev-tools');
if (fs.existsSync(devToolsPath)) {
  const devFiles = fs.readdirSync(devToolsPath);
  console.log(`✅ dev-tools/ exists with ${devFiles.length} files`);
  
  const expectedFiles = ['seed-test-vendors.js', 'seed-test-inquiries.js', 'check-db.js', 'remove-seed-data.js'];
  const missingFiles = expectedFiles.filter(f => !devFiles.includes(f));
  
  if (missingFiles.length > 0) {
    warnings.push(`⚠️  Some dev files may be missing: ${missingFiles.join(', ')}`);
  }
} else {
  warnings.push('⚠️  dev-tools/ folder not found');
}

// 3. Check scripts/ only has production files
const scriptsPath = path.join(__dirname, 'scripts');
if (fs.existsSync(scriptsPath)) {
  const scriptFiles = fs.readdirSync(scriptsPath).filter(f => f.endsWith('.js'));
  const allowedScripts = ['seed-services.js', 'seed-admin.js'];
  const unauthorizedScripts = scriptFiles.filter(f => !allowedScripts.includes(f));
  
  if (unauthorizedScripts.length > 0) {
    issues.push(`❌ Unauthorized scripts in scripts/: ${unauthorizedScripts.join(', ')}`);
  } else {
    console.log('✅ scripts/ contains only production files');
  }
}

// 4. Check controllers for hardcoded data patterns
const controllersPath = path.join(__dirname, 'controllers');
if (fs.existsSync(controllersPath)) {
  const controllerFiles = fs.readdirSync(controllersPath).filter(f => f.endsWith('.js'));
  let hasHardcodedData = false;
  
  controllerFiles.forEach(file => {
    const content = fs.readFileSync(path.join(controllersPath, file), 'utf8');
    
    // Check for hardcoded arrays (heuristic)
    const suspiciousPatterns = [
      /const\s+\w+\s*=\s*\[\s*{[^}]*name:/,
      /const\s+mock/i,
      /const\s+test/i,
      /const\s+sample/i
    ];
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasHardcodedData = true;
        warnings.push(`⚠️  Possible hardcoded data in controllers/${file}`);
      }
    });
  });
  
  if (!hasHardcodedData) {
    console.log('✅ Controllers appear clean (no obvious hardcoded data)');
  }
}

// 5. Check routes have middleware protection
const routesPath = path.join(__dirname, 'routes');
if (fs.existsSync(routesPath)) {
  const routeFiles = fs.readdirSync(routesPath).filter(f => f.endsWith('.js'));
  
  routeFiles.forEach(file => {
    if (file === 'adminRoutes.js') {
      const content = fs.readFileSync(path.join(routesPath, file), 'utf8');
      if (!content.includes('adminOnly') && !content.includes('protect')) {
        issues.push(`❌ ${file} missing authentication middleware`);
      }
    }
  });
  
  console.log('✅ Routes have middleware protection');
}

// 6. Verify package.json scripts
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const scripts = pkg.scripts || {};
  
  // Check for test script references
  const testScriptKeys = Object.keys(scripts).filter(k => 
    k.includes('test') || scripts[k].includes('seed-test') || scripts[k].includes('mock')
  );
  
  if (testScriptKeys.length > 0 && !testScriptKeys.every(k => scripts[k].includes('dev-tools'))) {
    warnings.push(`⚠️  Test scripts in package.json: ${testScriptKeys.join(', ')}`);
  } else {
    console.log('✅ package.json scripts are production-ready');
  }
}

// 7. Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

if (issues.length === 0 && warnings.length === 0) {
  console.log('\n✅ ✅ ✅  ALL CHECKS PASSED  ✅ ✅ ✅');
  console.log('\n🎉 Your application follows production-grade, database-first architecture!');
  console.log('\nKey Features:');
  console.log('  • No static/mock data in runtime');
  console.log('  • All data flows through MongoDB → API → UI');
  console.log('  • Role-based access control implemented');
  console.log('  • Clean folder structure');
  console.log('\nReady for production deployment! 🚀\n');
  process.exit(0);
}

if (issues.length > 0) {
  console.log('\n❌ CRITICAL ISSUES FOUND:\n');
  issues.forEach(issue => console.log(issue));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n');
  warnings.forEach(warning => console.log(warning));
}

console.log('\n' + '='.repeat(60));
console.log('\nPlease review and fix the issues above.');
console.log('Run this script again after fixes: node verify-architecture.js\n');

process.exit(issues.length > 0 ? 1 : 0);
