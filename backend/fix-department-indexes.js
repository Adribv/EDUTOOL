const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/EDULIVES';

async function fixDepartmentIndexes() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Check existing indexes on departments collection
    console.log('📋 Checking existing indexes on departments collection...');
    const indexes = await db.collection('departments').indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));
    
    // Look for email field indexes
    const emailIndexes = indexes.filter(index => 
      index.key && Object.keys(index.key).includes('email')
    );
    
    if (emailIndexes.length > 0) {
      console.log('⚠️  Found email field indexes:', emailIndexes);
      
      // Drop email field indexes
      for (const index of emailIndexes) {
        const indexName = index.name;
        console.log(`🗑️  Dropping index: ${indexName}`);
        await db.collection('departments').dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      }
    } else {
      console.log('✅ No email field indexes found');
    }
    
    // Create proper indexes for the current schema
    console.log('🔧 Creating proper indexes for current schema...');
    
    // Create unique index on name field
    await db.collection('departments').createIndex(
      { name: 1 }, 
      { unique: true, name: 'name_unique' }
    );
    console.log('✅ Created unique index on name field');
    
    // Create index on vicePrincipal field for faster queries
    await db.collection('departments').createIndex(
      { vicePrincipal: 1 }, 
      { name: 'vicePrincipal_index' }
    );
    console.log('✅ Created index on vicePrincipal field');
    
    // Create index on teachers array for faster queries
    await db.collection('departments').createIndex(
      { teachers: 1 }, 
      { name: 'teachers_index' }
    );
    console.log('✅ Created index on teachers field');
    
    console.log('🎉 Department indexes fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing department indexes:', error);
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the fix
fixDepartmentIndexes().catch(console.error); 