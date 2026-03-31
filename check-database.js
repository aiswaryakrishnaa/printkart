const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndSeedDatabase() {
    try {
        console.log('🔍 Checking database...\n');

        // Check counts
        const userCount = await prisma.user.count();
        const productCount = await prisma.product.count();
        const orderCount = await prisma.order.count();
        const categoryCount = await prisma.category.count();

        console.log('📊 Current Database Stats:');
        console.log(`   Users: ${userCount}`);
        console.log(`   Products: ${productCount}`);
        console.log(`   Orders: ${orderCount}`);
        console.log(`   Categories: ${categoryCount}\n`);

        if (userCount === 0 && productCount === 0) {
            console.log('⚠️  Database appears to be empty. Would you like to add sample data?');
            console.log('   Run: node seed-sample-data.js\n');
        } else {
            console.log('✅ Database has data!\n');

            // Show sample data
            const sampleUsers = await prisma.user.findMany({ take: 3 });
            const sampleProducts = await prisma.product.findMany({ take: 3 });

            console.log('👥 Sample Users:');
            sampleUsers.forEach(u => console.log(`   - ${u.fullName} (${u.email})`));

            console.log('\n📦 Sample Products:');
            sampleProducts.forEach(p => console.log(`   - ${p.title} - ₹${p.price}`));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndSeedDatabase();
