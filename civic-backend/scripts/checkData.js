const mongoose = require('mongoose');
const Department = require('../models/Department');
const User = require('../models/User');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 DEPARTMENTS:');
    console.log('================');
    const departments = await Department.find({});
    console.log(`Total: ${departments.length}\n`);
    departments.forEach(dept => {
      console.log(`${dept.code.padEnd(10)} | ${dept.name}`);
    });

    console.log('\n👥 USERS BY ROLE:');
    console.log('================');
    const usersByRole = await User.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          users: { $push: { name: '$name', email: '$email', department: '$department' } }
        }
      }
    ]);

    usersByRole.forEach(group => {
      console.log(`\n${group._id.toUpperCase()} (${group.count}):`);
      group.users.forEach(u => {
        console.log(`  - ${u.name} (${u.email}) - Dept: ${u.department || 'None'}`);
      });
    });

    console.log('\n✅ Check complete!\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

checkData();