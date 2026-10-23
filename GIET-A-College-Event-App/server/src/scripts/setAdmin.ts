import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User, { UserRole } from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const targetEmail = 'kaditya39546@gmail.com'.toLowerCase().trim();

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not found in .env');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB successfully.`);

  let user = await User.findOne({ email: targetEmail });
  if (user) {
    user.role = UserRole.ADMIN;
    user.profileCompleted = true;
    if (!user.name) user.name = 'Administrator';
    await user.save();
    console.log(`[SUCCESS] Existing user ${targetEmail} updated to role: ${user.role}`);
  } else {
    user = await User.create({
      email: targetEmail,
      name: 'Administrator',
      role: UserRole.ADMIN,
      profileCompleted: true,
    });
    console.log(`[SUCCESS] New Admin user created for ${targetEmail} with role: ${user.role}`);
  }

  console.log(`User details:`, {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    profileCompleted: user.profileCompleted,
  });

  await mongoose.disconnect();
  console.log(`Disconnected from MongoDB.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Error setting admin:', err);
  process.exit(1);
});
