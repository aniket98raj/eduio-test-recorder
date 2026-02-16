#!/bin/bash
# =============================================================================
# Create Demo User for Testing
# =============================================================================

node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUser() {
  const password = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'demo@eduio.io',
      name: 'Demo User',
      password: password,
      role: 'admin',
    },
  });
  
  console.log('✅ Demo user created:');
  console.log('   Email: demo@eduio.io');
  console.log('   Password: demo123');
}

createDemoUser()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
"
