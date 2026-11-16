import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import User from '../src/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lost-and-found';

async function makeAdmin() {
  const targetEmail = (process.argv[2] || '').trim().toLowerCase();

  if (!targetEmail) {
    console.error('❌ Error: Please provide an email address.');
    console.log('Usage: npm run make-admin <user-email>');
    console.log('Example: npm run make-admin adityakumar06799@gmail.com');
    process.exit(1);
  }

  console.log(`🔌 Connecting to MongoDB...`);
  await mongoose.connect(MONGODB_URI);

  const user = await User.findOne({ email: targetEmail });
  if (!user) {
    console.error(`❌ User not found with email: ${targetEmail}`);
    console.log('Make sure the user has registered or signed up first.');
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`ℹ️  User "${user.name}" (${user.email}) is already an Administrator.`);
    process.exit(0);
  }

  user.role = 'admin';
  await user.save();

  console.log(`✅ Success! "${user.name}" (${user.email}) has been promoted to Administrator.`);
  console.log(`👉 When signed in, visit: http://localhost:3000/en/admin`);
  process.exit(0);
}

makeAdmin().catch((err) => {
  console.error('❌ Failed to update role:', err);
  process.exit(1);
});
