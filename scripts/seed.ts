import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first, fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';

// Fix Windows Node.js querySrv ECONNREFUSED on MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import User from '../src/models/User';
import ItemReport from '../src/models/ItemReport';
import Match from '../src/models/Match';
import Claim from '../src/models/Claim';
import Notification from '../src/models/Notification';
import AuditLog from '../src/models/AuditLog';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lost-and-found';

async function seed() {
  console.log('--------------------------------------------------');
  console.log('🚀 KhojSetu / FoundIt - National AI Lost & Found Seeder');
  console.log(`Connecting to database at: ${MONGODB_URI}`);
  console.log('--------------------------------------------------');

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
    console.log(' Connected to MongoDB successfully.');
  } catch (err: any) {
    console.error('\n❌ Could not connect to MongoDB:', err.message);
    console.log('\n💡 Tip: If you are using MongoDB Atlas:');
    console.log('   Update MONGODB_URI in .env.local with your mongodb+srv:// connection string.');
    console.log('   If using local MongoDB, ensure your MongoDB service (mongod) is running.\n');
    process.exit(1);
  }

  try {
    console.log('\n🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      ItemReport.deleteMany({}),
      Match.deleteMany({}),
      Claim.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log(' Collections cleared.');

    // 1. Create Users
    console.log('\n👤 Creating demo users...');
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 12);
    const userPasswordHash = await bcrypt.hash('User@12345', 12);

    const admin = await User.create({
      name: 'Dr. Alok Verma (Portal Administrator)',
      email: 'admin@foundit.in',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+91 98765 43210',
      preferredLanguage: 'en',
      isActive: true,
      isEmailVerified: true,
    });

    const rahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+91 98111 22334',
      preferredLanguage: 'en',
      isActive: true,
      isEmailVerified: true,
    });

    const priya = await User.create({
      name: 'Priya Verma',
      email: 'priya.verma@example.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+91 98222 33445',
      preferredLanguage: 'hi',
      isActive: true,
      isEmailVerified: true,
    });

    const amit = await User.create({
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+91 98333 44556',
      preferredLanguage: 'en',
      isActive: true,
      isEmailVerified: true,
    });

    console.log(` Created 4 users (1 Admin, 3 Citizens).`);

    // 2. Create Realistic Lost & Found Reports
    console.log('\n📦 Creating realistic Pan-India Lost and Found items...');

    // Pair 1: Samsung Galaxy S23 Ultra in Connaught Place, New Delhi (~91% Match)
    const lostPhone = await ItemReport.create({
      userId: rahul._id,
      reportType: 'LOST',
      itemName: 'Samsung Galaxy S23 Ultra (Phantom Black)',
      category: 'Electronics',
      subcategory: 'Smartphone',
      description: 'Black Samsung Galaxy S23 Ultra with a tiny crack on the top left corner of the tempered glass. Has a transparent Spigen back cover with a Delhi Metro smart card tucked inside.',
      brand: 'Samsung',
      color: ['Black', 'Transparent'],
      distinctiveFeatures: 'Transparent Spigen case with Delhi Metro smart card inside, Kedarnath wallpaper on lock screen, IMEI ending in 4920.',
      state: 'Delhi',
      city: 'New Delhi',
      locality: 'Rajiv Chowk Metro Station, Connaught Place',
      location: {
        type: 'Point',
        coordinates: [77.2197, 28.6328], // [lon, lat]
      },
      lostFoundDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      lostFoundTime: '18:45',
      status: 'active',
      moderationStatus: 'approved',
      views: 42,
      contactPreference: 'email',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/samsung_s23_black',
        },
      ],
    });

    const foundPhone = await ItemReport.create({
      userId: priya._id,
      reportType: 'FOUND',
      itemName: 'Black Samsung Galaxy Smartphone',
      category: 'Electronics',
      subcategory: 'Smartphone',
      description: 'Found a black flagship Samsung phone with a clear plastic protective cover and a metro card at Connaught Place near gate 4. Handed over to the local control desk.',
      brand: 'Samsung',
      color: ['Black', 'Transparent'],
      distinctiveFeatures: 'Spigen clear case with card inside, phone is locked with PIN.',
      state: 'Delhi',
      city: 'New Delhi',
      locality: 'Connaught Place Inner Circle, near Metro Gate 4',
      location: {
        type: 'Point',
        coordinates: [77.2185, 28.6315], // [lon, lat] ~150 meters away
      },
      lostFoundDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lostFoundTime: '19:15',
      status: 'active',
      moderationStatus: 'approved',
      views: 38,
      contactPreference: 'email',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/found_samsung_cp',
        },
      ],
    });

    // Pair 2: Brown Titan Leather Wallet in Kempegowda Airport, Bengaluru (~87% Match)
    const lostWallet = await ItemReport.create({
      userId: amit._id,
      reportType: 'LOST',
      itemName: 'Brown Leather Titan Bi-Fold Wallet',
      category: 'Wallets',
      subcategory: 'Mens Wallet',
      description: 'Dark brown genuine leather Titan wallet lost while boarding flight to Delhi. Contains SBI Global debit card and Karnataka Driver License in the name of Amit Patel.',
      brand: 'Titan',
      color: ['Brown'],
      distinctiveFeatures: 'Titan metal logo on front corner, slight stitching fray on the currency pocket, Karnataka DL inside.',
      state: 'Karnataka',
      city: 'Bengaluru',
      locality: 'Kempegowda International Airport Terminal 1, Gate 12',
      location: {
        type: 'Point',
        coordinates: [77.7066, 13.1986],
      },
      lostFoundDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lostFoundTime: '06:30',
      status: 'active',
      moderationStatus: 'approved',
      views: 29,
      contactPreference: 'both',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/brown_wallet',
        },
      ],
    });

    const foundWallet = await ItemReport.create({
      userId: rahul._id,
      reportType: 'FOUND',
      itemName: 'Brown Leather Gents Wallet with Cards',
      category: 'Wallets',
      subcategory: 'Mens Wallet',
      description: 'Found brown branded leather wallet left behind on the waiting lounge seats near departure gate 12 at Bangalore airport. Deposited at CISF Lost & Found desk.',
      brand: 'Titan',
      color: ['Brown'],
      distinctiveFeatures: 'Contains bank debit card and government photo identification.',
      state: 'Karnataka',
      city: 'Bengaluru',
      locality: 'Kempegowda International Airport T1 CISF Counter',
      location: {
        type: 'Point',
        coordinates: [77.7068, 13.1989],
      },
      lostFoundDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lostFoundTime: '07:00',
      status: 'active',
      moderationStatus: 'approved',
      views: 31,
      contactPreference: 'email',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/found_wallet_blr',
        },
      ],
    });

    // Pair 3: Black HP Laptop Bag in Sector 62, Noida (~78% Match)
    const lostBag = await ItemReport.create({
      userId: priya._id,
      reportType: 'LOST',
      itemName: 'Black HP Pavilion Laptop Backpack',
      category: 'Bags',
      subcategory: 'Backpack',
      description: 'Black HP laptop backpack with red zipper detailing. Contains college project notebooks, 65W HP charger, and Logitech wireless mouse.',
      brand: 'HP',
      color: ['Black', 'Red'],
      distinctiveFeatures: 'Red accent strip on front pocket, Logitech USB nano dongle in the mesh side pouch.',
      state: 'Uttar Pradesh',
      city: 'Noida',
      locality: 'Sector 62 Metro Station auto stand',
      location: {
        type: 'Point',
        coordinates: [77.3734, 28.6256],
      },
      lostFoundDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lostFoundTime: '17:15',
      status: 'active',
      moderationStatus: 'approved',
      views: 18,
      contactPreference: 'phone',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/hp_laptop_bag',
        },
      ],
    });

    const foundBag = await ItemReport.create({
      userId: amit._id,
      reportType: 'FOUND',
      itemName: 'Black HP Laptop Bag with Red Stripe',
      category: 'Bags',
      subcategory: 'Backpack',
      description: 'Found a black HP computer backpack near Noida sector 62 metro station ticket counter with charger and notebook inside.',
      brand: 'HP',
      color: ['Black', 'Red'],
      distinctiveFeatures: 'Contains laptop charger, notebook with engineering notes.',
      state: 'Uttar Pradesh',
      city: 'Noida',
      locality: 'Sector 62 Metro Station Station Master Office',
      location: {
        type: 'Point',
        coordinates: [77.3736, 28.6258],
      },
      lostFoundDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lostFoundTime: '17:45',
      status: 'active',
      moderationStatus: 'approved',
      views: 22,
      contactPreference: 'email',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/found_bag_noida',
        },
      ],
    });

    // Unmatched Lost Item (Apple Watch in Mumbai)
    await ItemReport.create({
      userId: rahul._id,
      reportType: 'LOST',
      itemName: 'Apple Watch Series 8 (Midnight Aluminum 45mm)',
      category: 'Accessories',
      subcategory: 'Smartwatch',
      description: 'Lost Apple Watch Series 8 midnight blue aluminum case with black sport band near Bandstand promenade during evening walk.',
      brand: 'Apple',
      color: ['Blue', 'Black'],
      distinctiveFeatures: 'Small scratch on digital crown, monogram engraved on clasp.',
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Bandstand Promenade, Bandra West',
      location: {
        type: 'Point',
        coordinates: [72.8197, 19.0434],
      },
      lostFoundDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lostFoundTime: '19:30',
      status: 'active',
      moderationStatus: 'approved',
      views: 55,
      contactPreference: 'email',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/apple_watch',
        },
      ],
    });

    // Unmatched Found Item (Honda Bike Keys in Patna)
    await ItemReport.create({
      userId: priya._id,
      reportType: 'FOUND',
      itemName: 'Honda Two-Wheeler Keys with Hanuman Keychain',
      category: 'Keys',
      subcategory: 'Vehicle Keys',
      description: 'Found a pair of Honda motorcycle ignition keys attached with a brass metal Hanuman ji idol keychain and small metallic whistle.',
      brand: 'Honda',
      color: ['Silver', 'Gold'],
      distinctiveFeatures: 'Brass Hanuman idol keychain with two keys and round security fob.',
      state: 'Bihar',
      city: 'Patna',
      locality: 'Dak Bungalow Crossing, near Patna Junction',
      location: {
        type: 'Point',
        coordinates: [85.1376, 25.6093],
      },
      lostFoundDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      lostFoundTime: '12:15',
      status: 'active',
      moderationStatus: 'approved',
      views: 14,
      contactPreference: 'phone',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/honda_keys',
        },
      ],
    });

    // Recovered Item (Titan Watch in Chennai)
    await ItemReport.create({
      userId: amit._id,
      reportType: 'LOST',
      itemName: 'Titan Edge Slim Dial Classic Watch',
      category: 'Jewelry',
      subcategory: 'Watch',
      description: 'Ultra slim Titan Edge golden dial watch with black leather strap. Successfully reunited through FoundIt portal!',
      brand: 'Titan',
      color: ['Gold', 'Black'],
      distinctiveFeatures: 'Serial number 1044-YBA engraved on case back.',
      state: 'Tamil Nadu',
      city: 'Chennai',
      locality: 'Anna Nagar Roundtana',
      location: {
        type: 'Point',
        coordinates: [80.2091, 13.085],
      },
      lostFoundDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lostFoundTime: '20:00',
      status: 'recovered',
      moderationStatus: 'approved',
      views: 89,
      contactPreference: 'email',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/titan_watch_recovered',
        },
      ],
    });

    // Pending Moderation Item (Suspicious/Needs Admin Approval)
    await ItemReport.create({
      userId: rahul._id,
      reportType: 'FOUND',
      itemName: 'Gold Ring found near Railway Station',
      category: 'Jewelry',
      subcategory: 'Ring',
      description: 'Found a yellow gold wedding band near the waiting hall benches.',
      brand: 'Tanishq',
      color: ['Gold'],
      distinctiveFeatures: 'Initial engraving inside.',
      state: 'Rajasthan',
      city: 'Jaipur',
      locality: 'Jaipur Junction Railway Station',
      lostFoundDate: new Date(),
      status: 'active',
      moderationStatus: 'pending',
      views: 2,
    });

    console.log(' Created 10 realistic Pan-India items across Delhi, Karnataka, UP, Mumbai, Bihar, TN, and Rajasthan.');

    // 3. Generate Pre-Calculated AI Matches
    console.log('\n🤖 Generating AI Matches for correlated pairs...');

    const phoneMatch = await Match.create({
      lostReportId: lostPhone._id,
      foundReportId: foundPhone._id,
      textScore: 0.92,
      imageScore: null,
      attributeScore: 0.95,
      locationScore: 0.98, // ~150 meters apart
      dateScore: 0.95,     // Same day
      finalScore: 0.912,
      matchPercentage: 91,
      matchReasons: [
        'High textual similarity in item description (92%)',
        'Same category: Electronics > Smartphone',
        'Identical brand: Samsung',
        'Shared color attributes: Black, Transparent',
        'Immediate geographic proximity in Connaught Place, New Delhi (< 0.2 km)',
        'Reported on the exact same date and within 30 minutes',
      ],
      matchingProvider: 'hybrid',
      confidenceLevel: 'high',
      status: 'pending',
      notificationSent: true,
    });

    const walletMatch = await Match.create({
      lostReportId: lostWallet._id,
      foundReportId: foundWallet._id,
      textScore: 0.88,
      imageScore: null,
      attributeScore: 0.90,
      locationScore: 0.97, // Same airport terminal
      dateScore: 0.95,
      finalScore: 0.876,
      matchPercentage: 88,
      matchReasons: [
        'High textual similarity in item description (88%)',
        'Same category: Wallets > Mens Wallet',
        'Identical brand: Titan',
        'Same location: Kempegowda International Airport Terminal 1, Bengaluru',
        'Identical date of incident',
      ],
      matchingProvider: 'hybrid',
      confidenceLevel: 'high',
      status: 'pending',
      notificationSent: true,
    });

    const bagMatch = await Match.create({
      lostReportId: lostBag._id,
      foundReportId: foundBag._id,
      textScore: 0.82,
      imageScore: null,
      attributeScore: 0.85,
      locationScore: 0.95, // Sector 62 metro
      dateScore: 0.90,
      finalScore: 0.785,
      matchPercentage: 79,
      matchReasons: [
        'Strong textual description match (82%)',
        'Same category: Bags > Backpack',
        'Identical brand: HP',
        'Matching color scheme: Black with Red accents',
        'Nearby location: Sector 62 Metro Station, Noida (< 0.1 km)',
      ],
      matchingProvider: 'hybrid',
      confidenceLevel: 'high',
      status: 'pending',
      notificationSent: true,
    });

    console.log(` Created 3 high-confidence AI matches (91%, 88%, 79%).`);

    // 4. Create Sample Ownership Claim (Under Review for Admin moderation demo)
    console.log('\n📝 Creating sample Ownership Claim for verification workflow demo...');
    const sampleClaim = await Claim.create({
      reportId: foundPhone._id,
      matchId: phoneMatch._id,
      claimantId: rahul._id,
      proofDescription: 'This is my Samsung Galaxy S23 Ultra Phantom Black (256GB). The phone lock screen shows a high-res photo of the Kedarnath Temple. The phone is inside a transparent Spigen Ultra Hybrid case. Inside the case is my Delhi Metro Card with card number ending in 8841.',
      distinctiveProof: 'The device IMEI 1 ends in 4920 and IMEI 2 ends in 4921. There is a tiny scuff mark on the S-Pen clicker button.',
      status: 'under_review',
      adminRemarks: 'Claimant provided matching IMEI and described Kedarnath lock screen. Pending final verification from police desk.',
      supportingEvidence: [
        {
          url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
          publicId: 'seed/proof_purchase_receipt',
        },
      ],
    });
    console.log(' Created 1 sample ownership claim (status: under_review).');

    // 5. Create In-App Notifications
    console.log('\n🔔 Creating sample notifications...');
    await Notification.create([
      {
        userId: rahul._id,
        title: 'High AI Match Found (91%)!',
        message: 'A found Samsung Galaxy Smartphone at Connaught Place has a 91% match with your lost Samsung S23 Ultra.',
        type: 'match_found',
        relatedReportId: lostPhone._id,
        relatedMatchId: phoneMatch._id,
        isRead: false,
      },
      {
        userId: priya._id,
        title: 'Ownership Claim Submitted',
        message: 'Rahul Sharma has submitted an ownership claim for the Samsung phone you found at Connaught Place.',
        type: 'claim_submitted',
        relatedReportId: foundPhone._id,
        relatedClaimId: sampleClaim._id,
        isRead: false,
      },
      {
        userId: amit._id,
        title: 'Potential Match Found (88%)',
        message: 'A found Titan Wallet at Bengaluru Airport matches your reported lost item.',
        type: 'match_found',
        relatedReportId: lostWallet._id,
        relatedMatchId: walletMatch._id,
        isRead: true,
      },
    ]);
    console.log(' Created 3 notification events.');

    // 6. Create Audit Logs
    console.log('\n📋 Creating audit trail entries...');
    await AuditLog.create([
      {
        userId: rahul._id,
        action: 'CREATE_REPORT',
        resourceType: 'ItemReport',
        resourceId: lostPhone._id,
        metadata: { itemName: lostPhone.itemName, category: lostPhone.category },
        ipAddress: '127.0.0.1',
      },
      {
        userId: priya._id,
        action: 'CREATE_REPORT',
        resourceType: 'ItemReport',
        resourceId: foundPhone._id,
        metadata: { itemName: foundPhone.itemName, category: foundPhone.category },
        ipAddress: '127.0.0.1',
      },
      {
        userId: rahul._id,
        action: 'SUBMIT_CLAIM',
        resourceType: 'Claim',
        resourceId: sampleClaim._id,
        metadata: { reportId: foundPhone._id, matchScore: 91 },
        ipAddress: '127.0.0.1',
      },
    ]);
    console.log(' Created 3 audit log events.');

    // Summary Output
    console.log('\n==================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('\n🔑 DEMO ACCOUNTS TO TEST WITH:\n');
    console.log('1. PORTAL ADMINISTRATOR:');
    console.log('   Email:    admin@foundit.in');
    console.log('   Password: Admin@12345');
    console.log('   Access:   /admin (Admin Dashboard, Moderation, User Mgmt, Analytics, Claims)');
    console.log('\n2. CITIZEN 1 (Lost S23 Ultra & Submitted Claim):');
    console.log('   Email:    rahul.sharma@example.com');
    console.log('   Password: User@12345');
    console.log('   Access:   /dashboard (My Reports, 91% AI Match, Track Claim)');
    console.log('\n3. CITIZEN 2 (Found S23 Phone in Connaught Place):');
    console.log('   Email:    priya.verma@example.com');
    console.log('   Password: User@12345');
    console.log('   Access:   /dashboard (Found Reports, Claim received notification)');
    console.log('\n4. CITIZEN 3 (Lost Wallet at Bengaluru Airport):');
    console.log('   Email:    amit.patel@example.com');
    console.log('   Password: User@12345');
    console.log('   Access:   /dashboard (88% AI Match for Titan Wallet)');
    console.log('\n--------------------------------------------------');
    console.log('📊 SEEDED RECORDS SUMMARY:');
    console.log('   • 4 Users (1 Admin, 3 Citizens)');
    console.log('   • 10 Item Reports (Pan-India: Delhi, BLR, Noida, Mumbai, Patna, Chennai, Jaipur)');
    console.log('   • 3 Pre-Calculated AI Matches (91%, 88%, 79%)');
    console.log('   • 1 Active Ownership Claim in review');
    console.log('   • 3 In-App Notifications');
    console.log('   • 3 System Audit Logs');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed();
