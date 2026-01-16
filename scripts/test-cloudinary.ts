import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

async function testCloudinaryConfig() {
    console.log('🔍 Testing Cloudinary Configuration...\n');

    // Load environment variables
    const config = new ConfigService();

    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');

    console.log('📋 Configuration Values:');
    console.log(`   Cloud Name: ${cloudName || '❌ NOT SET'}`);
    console.log(`   API Key: ${apiKey || '❌ NOT SET'}`);
    console.log(`   API Secret: ${apiSecret ? '✅ SET (hidden for security)' : '❌ NOT SET'}`);
    console.log(`   API Secret Length: ${apiSecret?.length || 0} characters\n`);

    // Check if all values are set
    if (!cloudName || !apiKey || !apiSecret) {
        console.error('❌ ERROR: Missing Cloudinary credentials in .env file\n');
        console.log('Please ensure all three values are set:');
        console.log('   - CLOUDINARY_CLOUD_NAME');
        console.log('   - CLOUDINARY_API_KEY');
        console.log('   - CLOUDINARY_API_SECRET\n');
        process.exit(1);
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
    } catch (error: any) {
        console.error('❌ FAILED! Cloudinary connection test failed!\n');
        console.error('Error Details:');
        console.error(`   Message: ${error.message}`);
        console.error(`   Error: ${error.error?.message || 'Unknown error'}\n`);

        if (error.http_code === 401) {
            console.error('🔑 Authentication Error:');
            console.error('   Your API credentials are incorrect.');
            console.error('   Please verify your credentials at:');
            console.error('   https://console.cloudinary.com/console\n');
        } else if (error.http_code === 404) {
            console.error('🔍 Not Found Error:');
            console.error('   Your Cloud Name might be incorrect.\n');
        } else {
            console.error('🌐 Network/Connection Error:');
            console.error('   Please check your internet connection.\n');
        }

        console.error('💡 Troubleshooting Steps:');
        console.error('   1. Go to: https://console.cloudinary.com/console');
        console.error('   2. Copy your Cloud Name, API Key, and API Secret');
        console.error('   3. Update your .env file with the correct values');
        console.error('   4. Make sure there are no extra spaces or quotes');
        console.error('   5. Restart your application\n');

        process.exit(1);
    }
}

// Run the test
testCloudinaryConfig();
