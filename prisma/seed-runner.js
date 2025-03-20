const fs = require('fs');
const { execSync } = require('child_process');

const flagFile = '.seeded';

if (!fs.existsSync(flagFile)) {
  console.log('Seeding database...');
  try {
    execSync('ts-node prisma/seed.ts', { stdio: 'inherit' });
    fs.writeFileSync(flagFile, 'seeded');
    console.log('Database seeded and flag file created.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
} else {
  console.log('Database already seeded, skipping...');
}
