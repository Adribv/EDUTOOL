#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 EDULIVES Frontend Optimization Script');
console.log('=====================================\n');

// Function to run commands
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// Main optimization process
async function optimize() {
  console.log('🔍 Checking project structure...\n');

  // Check if we're in the frontend directory
  if (!fileExists('package.json')) {
    console.error('❌ Please run this script from the frontend directory');
    process.exit(1);
  }

  // Check if node_modules exists
  if (!fileExists('node_modules')) {
    console.log('📦 Installing dependencies...');
    runCommand('npm install', 'Installing dependencies');
  }

  // Clean previous builds
  if (fileExists('dist')) {
    console.log('🧹 Cleaning previous build...');
    runCommand('rm -rf dist', 'Cleaning dist directory');
  }

  // Run linting
  console.log('🔍 Running code quality checks...');
  runCommand('npm run lint', 'Linting code');

  // Build the project
  console.log('🏗️ Building optimized production bundle...');
  runCommand('npm run build', 'Building production bundle');

  // Analyze bundle size
  console.log('📊 Analyzing bundle size...');
  try {
    const distPath = path.join(process.cwd(), 'dist');
    const files = fs.readdirSync(distPath);
    
    let totalSize = 0;
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        const sizeInKB = (stats.size / 1024).toFixed(2);
        totalSize += stats.size;
        console.log(`   📄 ${file}: ${sizeInKB} KB`);
      }
    });

    const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`\n📦 Total bundle size: ${totalSizeInMB} MB`);

    if (totalSizeInMB > 2) {
      console.log('⚠️  Warning: Bundle size is larger than 2MB. Consider further optimization.');
    } else {
      console.log('✅ Bundle size is optimized!');
    }
  } catch (error) {
    console.log('⚠️  Could not analyze bundle size:', error.message);
  }

  // Preview the build
  console.log('\n🌐 Starting preview server...');
  console.log('📝 Press Ctrl+C to stop the preview server\n');
  
  try {
    runCommand('npm run preview', 'Starting preview server');
  } catch (error) {
    console.log('ℹ️  Preview server stopped');
  }
}

// Performance tips
function showPerformanceTips() {
  console.log('\n💡 Performance Optimization Tips:');
  console.log('================================');
  console.log('1. Use React DevTools Profiler to identify slow components');
  console.log('2. Monitor Core Web Vitals in production');
  console.log('3. Implement service workers for offline functionality');
  console.log('4. Use image optimization and lazy loading');
  console.log('5. Consider implementing virtual scrolling for large lists');
  console.log('6. Monitor bundle size regularly');
  console.log('7. Use Lighthouse for performance audits');
  console.log('8. Implement proper caching strategies');
}

// Run optimization
optimize().then(() => {
  showPerformanceTips();
  console.log('\n🎉 Optimization process completed!');
}).catch((error) => {
  console.error('❌ Optimization failed:', error);
  process.exit(1);
}); 