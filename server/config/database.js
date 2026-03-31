const prisma = require('./prisma');

// Test Prisma connection
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ MySQL connected successfully via Prisma');
    
    // Test query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified');
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    console.error('⚠️  Please ensure MySQL is running and DATABASE_URL in .env is correct');
    console.error('💡 The server will start but database operations will fail until MySQL is connected');
    // Don't exit - allow server to start for health checks
  }
};

module.exports = { prisma, connectDB };

