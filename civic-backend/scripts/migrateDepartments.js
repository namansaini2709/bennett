const mongoose = require('mongoose');
const Department = require('../models/Department');
const User = require('../models/User');
const Report = require('../models/Report');
require('dotenv').config();

const departmentMapping = {
  'MUNICIPAL ADMINISTRATION': {
    name: 'Municipal Administration',
    code: 'ADMIN',
    description: 'General municipal administration and governance',
    categories: ['other'],
    contactEmail: 'admin@civicsetu.gov.in',
    contactPhone: '8001234560'
  },
  'PUBLIC WORKS': {
    name: 'Public Works Department',
    code: 'PWD',
    description: 'Responsible for road maintenance, infrastructure development, and public construction projects',
    categories: ['road_issue', 'drainage', 'encroachment'],
    contactEmail: 'pwd@civicsetu.gov.in',
    contactPhone: '8001234567'
  },
  'PWD': {
    name: 'Public Works Department',
    code: 'PWD',
    description: 'Responsible for road maintenance, infrastructure development, and public construction projects',
    categories: ['road_issue', 'drainage', 'encroachment'],
    contactEmail: 'pwd@civicsetu.gov.in',
    contactPhone: '8001234567'
  },
  'ELECTRICITY': {
    name: 'Electricity Department',
    code: 'ELEC',
    description: 'Manages power supply, street lighting, and electrical infrastructure maintenance',
    categories: ['electricity', 'street_light'],
    contactEmail: 'electricity@civicsetu.gov.in',
    contactPhone: '8001234568'
  },
  'WATER': {
    name: 'Water Supply Department',
    code: 'WATER',
    description: 'Oversees water supply, distribution, and quality management',
    categories: ['water_supply'],
    contactEmail: 'water@civicsetu.gov.in',
    contactPhone: '8001234569'
  },
  'SANITATION': {
    name: 'Sanitation Department',
    code: 'SAN',
    description: 'Handles garbage collection, waste management, and city cleanliness',
    categories: ['garbage'],
    contactEmail: 'sanitation@civicsetu.gov.in',
    contactPhone: '8001234570'
  },
  'TRAFFIC': {
    name: 'Traffic Management Department',
    code: 'TRAFFIC',
    description: 'Manages traffic flow, parking, and road safety initiatives',
    categories: ['traffic'],
    contactEmail: 'traffic@civicsetu.gov.in',
    contactPhone: '8001234571'
  },
  'ENVIRONMENT': {
    name: 'Environment Department',
    code: 'ENV',
    description: 'Monitors and controls pollution, environmental compliance, and green initiatives',
    categories: ['pollution'],
    contactEmail: 'environment@civicsetu.gov.in',
    contactPhone: '8001234572'
  },
  'GENERAL': {
    name: 'General Administration',
    code: 'GEN',
    description: 'Handles miscellaneous civic issues and general administrative matters',
    categories: ['other'],
    contactEmail: 'admin@civicsetu.gov.in',
    contactPhone: '8001234573'
  }
};

const migrateDepartments = async () => {
  try {
    console.log('🔄 Starting department migration...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const existingDepartments = await Department.find({});
    console.log(`📊 Found ${existingDepartments.length} existing departments in Department collection\n`);

    const departmentsFromUsers = await User.distinct('department', {
      department: { $exists: true, $ne: null },
      isDeleted: false
    });
    console.log(`👥 Found ${departmentsFromUsers.length} unique departments from Users:`);
    console.log(departmentsFromUsers);
    console.log('');

    const departmentsFromReports = await Report.distinct('department', {
      department: { $exists: true, $ne: null },
      isDeleted: false
    });
    console.log(`📝 Found ${departmentsFromReports.length} unique departments from Reports:`);
    console.log(departmentsFromReports);
    console.log('');

    const allDepartmentCodes = new Set([...departmentsFromUsers, ...departmentsFromReports]);
    console.log(`🔍 Total unique department codes found: ${allDepartmentCodes.size}`);
    console.log([...allDepartmentCodes]);
    console.log('');

    const departmentsToCreate = [];

    for (const code of allDepartmentCodes) {
      const upperCode = code.toUpperCase();

      const existingDept = await Department.findOne({ code: upperCode });
      if (existingDept) {
        console.log(`⏭️  Skipping ${upperCode} - already exists`);
        continue;
      }

      let deptData = departmentMapping[upperCode];

      if (!deptData) {
        const safeCode = code.replace(/\s+/g, '').toUpperCase().substring(0, 10);
        const emailSafe = code.replace(/\s+/g, '_').toLowerCase();
        deptData = {
          name: `${code} Department`,
          code: safeCode,
          description: `Department managing ${code.toLowerCase()} related issues`,
          categories: [],
          contactEmail: `${emailSafe}@civicsetu.gov.in`,
          contactPhone: null
        };
        console.log(`⚠️  No mapping found for ${upperCode}, creating with default data as ${safeCode}`);
      }

      departmentsToCreate.push(deptData);
    }

    if (departmentsToCreate.length === 0) {
      console.log('\n✅ All departments already exist, creating standard departments if needed...\n');

      for (const [key, deptData] of Object.entries(departmentMapping)) {
        const exists = await Department.findOne({ code: deptData.code });
        if (!exists) {
          departmentsToCreate.push(deptData);
        }
      }
    }

    if (departmentsToCreate.length > 0) {
      console.log(`\n📝 Creating ${departmentsToCreate.length} new departments...\n`);

      for (const deptData of departmentsToCreate) {
        const dept = await Department.create(deptData);
        console.log(`✅ Created: ${dept.name} (${dept.code})`);
      }
    }

    console.log('\n🔄 Updating existing Users and Reports with standardized department codes...\n');

    for (const code of allDepartmentCodes) {
      const upperCode = code.toUpperCase();
      const mappedData = departmentMapping[upperCode];
      const mappedCode = mappedData?.code || code.replace(/\s+/g, '').toUpperCase().substring(0, 10);

      if (code !== mappedCode) {
        const userUpdateResult = await User.updateMany(
          { department: code },
          { $set: { department: mappedCode } }
        );
        console.log(`👥 Updated ${userUpdateResult.modifiedCount} users from "${code}" to "${mappedCode}"`);

        const reportUpdateResult = await Report.updateMany(
          { department: code },
          { $set: { department: mappedCode } }
        );
        console.log(`📝 Updated ${reportUpdateResult.modifiedCount} reports from "${code}" to "${mappedCode}"`);
      }
    }

    const finalDepartments = await Department.find({}).sort({ name: 1 });
    console.log('\n📊 Final Department List:');
    console.log('========================');
    finalDepartments.forEach(dept => {
      console.log(`${dept.code.padEnd(10)} | ${dept.name.padEnd(40)} | Categories: ${dept.categories.length}`);
    });

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

migrateDepartments();