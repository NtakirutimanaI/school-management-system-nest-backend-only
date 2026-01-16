require('dotenv').config();
const cloudinary = require('cloudinary').v2;

async function testCloudinaryConfig() {
    console.log('🔍 Testing Cloudinary Configuration...\n');

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('📋 Configuration Values:');
    console.log(`   Cloud Name: ${cloudName || '❌ NOT SET'}`);
    console.log(`   API Key: ${apiKey || '❌ NOT SET'}`);
    console.log(`   API Secret: ${apiSecret ? '✅ SET (' + apiSecret.substring(0, 5) + '...)' : '❌ NOT SET'}`);
    console.log(`   API Secret Length: ${apiSecret?.length || 0} characters\n`);

    // Check if all values are set
    if (!cloudName || !apiKey || !apiSecret) {
        console.error('❌ ERROR: Missing Cloudinary credentials in .env file\n');
        console.log('Please ensure all three values are set in your .env file:');
        console.log('   - CLOUDINARY_CLOUD_NAME');
        console.log('   - CLOUDINARY_API_KEY');
        console.log('   - CLOUDINARY_API_SECRET\n');
        process.exit(1);
    }

    // Check API Secret length
    if (apiSecret.length < 20) {
        console.warn('⚠️  WARNING: Your API Secret seems too short!');
        console.warn('   Cloudinary API Secrets are typically 24+ characters long.');
        console.warn('   Please verify you copied the complete secret.\n');
    }

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    console.log('🔌 Testing Cloudinary Connection...\n');

    try {
        // Test the connection by pinging the API
        const result = await cloudinary.api.ping();

        console.log('✅ SUCCESS! Cloudinary is properly configured!\n');
        console.log('📊 API Response:', result);
        console.log('\n🎉 You can now upload files to Cloudinary!\n');

        // Get account details
        try {
            const usage = await cloudinary.api.usage();
            console.log('📈 Account Usage:');
            console.log(`   Plan: ${usage.plan || 'Free'}`);
            console.log(`   Credits Used: ${usage.credits?.used || 0} / ${usage.credits?.limit || 'Unlimited'}`);
            console.log(`   Storage: ${((usage.storage?.used || 0) / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Bandwidth: ${((usage.bandwidth?.used || 0) / 1024 / 1024).toFixed(2)} MB\n`);
        } catch (usageError) {
            console.log('ℹ️  Could not fetch usage details (this is normal for some plans)\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ FAILED! Cloudinary connection test failed!\n');
        console.error('Error Details:');
        console.error(`   Message: ${error.message}`);
        console.error(`   HTTP Code: ${error.http_code || 'N/A'}\n`);

        if (error.http_code === 401) {
            console.error('🔑 Authentication Error:');
            console.error('   Your API credentials are INCORRECT.');
            console.error('   Please verify your credentials at:');
            console.error('   https://console.cloudinary.com/console\n');
            console.error('   Make sure to copy the COMPLETE API Secret (usually 24 characters)\n');
        } else if (error.http_code === 404) {
            console.error('🔍 Not Found Error:');
            console.error('   Your Cloud Name might be incorrect.\n');
        } else {
            console.error('🌐 Network/Connection Error:');
            console.error('   Please check your internet connection.\n');
        }

        console.error('💡 Troubleshooting Steps:');
        console.error('   1. Go to: https://console.cloudinary.com/console');
        console.error('   2. Look for "Account Details" or "API Keys"');
        console.error('   3. Copy your Cloud Name, API Key, and API Secret');
        console.error('   4. Click "Reveal" next to API Secret to see the full value');
        console.error('   5. Update your .env file with the COMPLETE values');
        console.error('   6. Make sure there are NO extra spaces, quotes, or line breaks');
        console.error('   7. Restart your application\n');

        process.exit(1);
    }
}

// Run the test
testCloudinaryConfig();
