const http = require('http');

async function testLogin(email, password) {
  return new Promise((resolve) => {
    console.log(`🔐 Testing login for: ${email}`);
    
    const postData = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.success) {
            console.log(`✅ Login successful for ${email}`);
            console.log(`   User ID: ${response.user.id}`);
            console.log(`   Role: ${response.user.role}`);
            console.log(`   Name: ${response.user.name}`);
          } else {
            console.log(`❌ Login failed for ${email}: ${response.message}`);
          }
        } catch (error) {
          console.error(`❌ Error parsing response for ${email}:`, error.message);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Error testing login for ${email}:`, error.message);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

async function testAllLogins() {
  const testUsers = [
    { email: 'john.doe@company.com', password: 'john123' },
    { email: 'jane.smith@company.com', password: 'jane123' },
    { email: 'mike.johnson@company.com', password: 'mike123' },
    { email: 'sarah.wilson@company.com', password: 'sarah123' },
    { email: 'david.brown@company.com', password: 'david123' },
    { email: 'alice.johnson@company.com', password: 'ali123' },
  ];
  
  for (const user of testUsers) {
    await testLogin(user.email, user.password);
    console.log('---');
  }
}

testAllLogins(); 