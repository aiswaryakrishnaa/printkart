const bcrypt = require('bcryptjs');
const { User, prisma } = require('../models');
const { connectDB } = require('../config/database');

async function resetAdminPassword() {
  try {
    // Connect to database
    await connectDB();
    
    const email = process.argv[2] || 'admin@example.com';
    const newPassword = process.argv[3] || 'admin123';
    
    console.log(`\n🔐 Resetting password for: ${email}`);
    console.log(`New password: ${newPassword}\n`);
    
    // Find the user using Prisma directly
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found! Creating new admin user...\n');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Create new admin user
      user = await prisma.user.create({
        data: {
          fullName: 'Admin User',
          email: email,
          phone: '+1234567890',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`\nYou can now login with:`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${newPassword}\n`);
      return;
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the password using Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password reset successfully!');
    console.log(`User: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`\nYou can now login with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}\n`);
     
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetAdminPassword().then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

