// Test script to verify OAuth configuration
console.log('🔍 Testing OAuth Configuration...\n');

// Check environment variables
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET', 
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

console.log('📋 Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n🔗 Expected Redirect URI:');
console.log(`http://localhost:3000/api/auth/callback/google`);

console.log('\n📝 Google Cloud Console Setup:');
console.log('1. Go to: https://console.cloud.google.com/');
console.log('2. Select project: static-beach-450916-i8');
console.log('3. Navigate to: APIs & Services > Credentials');
console.log('4. Click on OAuth 2.0 Client ID');
console.log('5. Add redirect URI: http://localhost:3000/api/auth/callback/google');

console.log('\n🚀 Next Steps:');
console.log('1. Update Google Cloud Console with correct redirect URI');
console.log('2. Restart Next.js server: npm run dev');
console.log('3. Test Google login');
