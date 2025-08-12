const db = require('./config/database');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const [result] = await db.promise().query('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Check if freshers table exists and has data
    const [freshers] = await db.promise().query('SELECT * FROM freshers');
    console.log(`📊 Found ${freshers.length} freshers in database`);
    
    // Show sample fresher data
    if (freshers.length > 0) {
      console.log('📋 Sample fresher data:');
      console.log(JSON.stringify(freshers[0], null, 2));
    }
    
    // Test login query
    const testEmail = 'john.doe@company.com';
    const testPassword = 'john123';
    
    const [loginResult] = await db.promise().query(
      'SELECT * FROM freshers WHERE email = ? AND password = ?',
      [testEmail, testPassword]
    );
    
    console.log(`🔐 Login test for ${testEmail}: ${loginResult.length > 0 ? 'SUCCESS' : 'FAILED'}`);
    
    if (loginResult.length > 0) {
      console.log('✅ Login query working correctly');
    } else {
      console.log('❌ Login query failed - no matching user found');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 