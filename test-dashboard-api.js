const axios = require('axios');

async function testDashboardAPI() {
    try {
        console.log('🧪 Testing Dashboard API...\n');

        // First, login to get a token
        console.log('1️⃣ Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'admin123'
        });

        const token = loginResponse.data.data.token;
        console.log('✅ Login successful!\n');

        // Now fetch dashboard data
        console.log('2️⃣ Fetching dashboard data...');
        const dashboardResponse = await axios.get('http://localhost:5000/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = dashboardResponse.data.data;

        console.log('✅ Dashboard data received!\n');
        console.log('📊 Stats:');
        console.log(`   Total Users: ${data.stats.totalUsers}`);
        console.log(`   Total Products: ${data.stats.totalProducts}`);
        console.log(`   Total Orders: ${data.stats.totalOrders}`);
        console.log(`   Total Revenue: ₹${data.stats.totalRevenue}`);

        console.log(`\n📦 Top Products (${data.topProducts.length}):`);
        data.topProducts.forEach(p => {
            console.log(`   - ${p.title} - ₹${p.price} (Stock: ${p.stock})`);
        });

        console.log(`\n👥 New Users (${data.newUsers.length}):`);
        data.newUsers.forEach(u => {
            console.log(`   - ${u.fullName} (${u.email})`);
        });





        console.log(`\n📋 Recent Orders (${data.recentOrders.length}):`);
        data.recentOrders.slice(0, 3).forEach(o => {
            console.log(`   - Order #${o.id} - ${o.user.fullName} - ₹${o.total}`);
        });

        console.log('\n✅ All data is coming from the backend correctly!');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testDashboardAPI();


