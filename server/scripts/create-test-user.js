/**
 * Creates a test customer user for logging into the mobile app.
 * Usage: node server/scripts/create-test-user.js [email] [password]
 * Default: user@example.com / user123
 */
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { connectDB } = require('../config/database');

async function createTestUser() {
  try {
    await connectDB();

    const email = process.argv[2] || 'user@example.com';
    const password = process.argv[3] || 'user123';

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log('\n✅ Test user password updated!');
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      user = await prisma.user.create({
        data: {
          fullName: 'Test User',
          email,
          phone: '+9876543210',
          password: hashedPassword,
          role: 'customer',
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true
        }
      });
      console.log('\n✅ Test user created!');
    }

    console.log('\n📱 Use these credentials to login in the mobile app:');
    console.log('   Email:    ' + email);
    console.log('   Password: ' + password + '\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
