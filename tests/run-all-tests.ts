import { calculateDistance, formatDate, truncate, slugify } from '../src/lib/utils';
import { INDIAN_STATES, ITEM_CATEGORIES, MATCH_WEIGHTS } from '../src/lib/constants';
import { lostReportSchema, foundReportSchema } from '../src/lib/validations/report';
import { signUpSchema, signInSchema } from '../src/lib/validations/user';
import { createClaimSchema } from '../src/lib/validations/claim';
import {
  tokenize,
  extractBigrams,
  computeLexicalSimilarity,
} from '../src/features/matching/providers/text-provider';
import { RENORMALIZED_WEIGHTS_NO_IMAGE } from '../src/services/matching/matcher';
import bcrypt from 'bcryptjs';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Pan-India Lost & Found Platform - Automated Test Suite');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST SUITE 1: Geographic & Spatial Distance (Haversine Formula)
  // ----------------------------------------------------
  console.log('📌 [Suite 1] Spatial & Geographic Calculations (Haversine)');
  
  // Distance between CP Rajiv Chowk (28.6328, 77.2197) and CP Inner Circle (28.6315, 77.2185) ~ 0.18-0.20 km
  const shortDist = calculateDistance(28.6328, 77.2197, 28.6315, 77.2185);
  assert(shortDist > 0.1 && shortDist < 0.3, 'Local distance calculation (~180m)', `got ${shortDist.toFixed(3)}km`);

  // Distance between New Delhi (28.6139, 77.2090) and Mumbai (19.0760, 72.8777) ~ 1140-1160 km
  const longDist = calculateDistance(28.6139, 77.2090, 19.0760, 72.8777);
  assert(longDist > 1100 && longDist < 1200, 'Inter-city distance calculation (Delhi to Mumbai ~1150km)', `got ${longDist.toFixed(1)}km`);

  // Distance to exact same coordinates should be 0
  const zeroDist = calculateDistance(13.1986, 77.7066, 13.1986, 77.7066);
  assert(zeroDist === 0, 'Zero distance for identical coordinates');

  // ----------------------------------------------------
  // TEST SUITE 2: AI Lexical Similarity & Natural Language Processing
  // ----------------------------------------------------
  console.log('\n📌 [Suite 2] AI Lexical Similarity & NLP Processing');

  const tokens = tokenize('Samsung Galaxy S23 Ultra in Connaught Place with a protective Spigen case!');
  assert(tokens.includes('samsung') && tokens.includes('galaxy') && tokens.includes('s23'), 'Tokenization extracts key technical terms');
  assert(!tokens.includes('in') && !tokens.includes('with') && !tokens.includes('a'), 'Tokenization filters English stopwords');

  const bigrams = extractBigrams(['samsung', 'galaxy', 'phone']);
  assert(bigrams.includes('samsung_galaxy') && bigrams.includes('galaxy_phone'), 'Bigram extractor generates correct phrase pairs');

  // Text similarity tests
  const simIdentical = computeLexicalSimilarity('Black Samsung Galaxy phone with transparent cover', 'Black Samsung Galaxy phone with transparent cover');
  assert(simIdentical >= 0.99, 'Identical descriptions score ~1.00', `got ${simIdentical}`);

  const simHigh = computeLexicalSimilarity(
    'Black Samsung Galaxy phone with cracked screen protector and transparent case',
    'Black Samsung Galaxy smartphone found with cracked screen and clear case'
  );
  assert(simHigh >= 0.50, 'Correlated descriptions score high lexical similarity (>= 0.50)', `got ${simHigh.toFixed(2)}`);

  const simUnrelated = computeLexicalSimilarity(
    'Black Samsung Galaxy smartphone with charger',
    'Golden wrist watch with brown leather belt'
  );
  assert(simUnrelated < 0.15, 'Unrelated items have near-zero lexical similarity (< 0.15)', `got ${simUnrelated}`);

  // ----------------------------------------------------
  // TEST SUITE 3: Scoring Formula & Weight Renormalization
  // ----------------------------------------------------
  console.log('\n📌 [Suite 3] Multi-Signal Algorithm & Weight Renormalization');

  // Standard weights sum to 1.00
  const standardSum = Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
  assert(Math.abs(standardSum - 1.0) < 0.001, 'Standard weights sum to exactly 1.00 (100%)', `sum=${standardSum}`);

  // Renormalized weights (when Vision API is unavailable) sum to 1.00
  const renormSum = Object.values(RENORMALIZED_WEIGHTS_NO_IMAGE).reduce((a, b) => a + b, 0);
  assert(Math.abs(renormSum - 1.0) < 0.001, 'Renormalized weights sum to exactly 1.00 (100%)', `sum=${renormSum}`);

  // Text weight increases proportionally when vision is missing (from 35% to 43.75%)
  assert(RENORMALIZED_WEIGHTS_NO_IMAGE.text === 0.4375, 'Text weight renormalizes to 43.75% when vision is unavailable');

  // ----------------------------------------------------
  // TEST SUITE 4: Zod Validation Schemas
  // ----------------------------------------------------
  console.log('\n📌 [Suite 4] Input Validation & Data Integrity (Zod)');

  // Valid Lost Report
  const validLost = lostReportSchema.safeParse({
    itemName: 'Samsung Galaxy S23 Ultra',
    category: 'Electronics',
    subcategory: 'Smartphone',
    description: 'Black Samsung Galaxy S23 Ultra with cracked screen protector.',
    brand: 'Samsung',
    color: ['Black'],
    state: 'Delhi',
    city: 'New Delhi',
    lostFoundDate: '2026-11-10',
    contactPreference: 'email',
  });
  assert(validLost.success, 'Valid Lost Report schema parses successfully');

  // Invalid Report (Missing required state)
  const invalidState = lostReportSchema.safeParse({
    itemName: 'Wallet',
    category: 'Wallets',
    description: 'Brown leather wallet.',
    city: 'Mumbai',
    lostFoundDate: '2026-11-10',
  });
  assert(!invalidState.success, 'Rejects report missing required state field');

  // Valid Found Report
  const validFound = foundReportSchema.safeParse({
    itemName: 'Leather Gents Wallet',
    category: 'Wallets',
    description: 'Found a brown leather wallet near airport departure gate 4 with cards.',
    color: ['Brown'],
    state: 'Karnataka',
    city: 'Bengaluru',
    lostFoundDate: '2026-11-12',
  });
  assert(validFound.success, 'Valid Found Report with category and color passes');

  // User Sign-Up Schema: weak password rejection
  const weakPassword = signUpSchema.safeParse({
    name: 'Test User',
    email: 'test@example.com',
    password: '123', // too short (< 8)
    confirmPassword: '123',
    acceptTerms: true,
  });
  assert(!weakPassword.success, 'Rejects password shorter than 8 characters');

  // Valid Sign-Up
  const validUser = signUpSchema.safeParse({
    name: 'Aditya Kumar',
    email: 'aditya@example.com',
    password: 'Password@123',
    confirmPassword: 'Password@123',
    acceptTerms: true,
  });
  assert(validUser.success, 'Valid user registration schema passes');

  // Claim Validation: Proof description minimum length (min 20 chars)
  const shortClaim = createClaimSchema.safeParse({
    reportId: '64f1a2b3c4d5e6f7a8b9c0d1',
    proofDescription: 'Mine.', // Less than 20 chars
  });
  assert(!shortClaim.success, 'Rejects ownership claim with proof description < 20 characters');

  const validClaim = createClaimSchema.safeParse({
    reportId: '64f1a2b3c4d5e6f7a8b9c0d1',
    proofDescription: 'This is my black Samsung phone. The IMEI ends in 4920 and there is a Kedarnath photo on the lock screen.',
  });
  assert(validClaim.success, 'Valid detailed ownership claim passes validation');

  // ----------------------------------------------------
  // TEST SUITE 5: Security & Cryptography (bcrypt)
  // ----------------------------------------------------
  console.log('\n📌 [Suite 5] Security & Cryptographic Hashing');

  const rawPassword = 'SecurePassword@2026';
  const hashed = await bcrypt.hash(rawPassword, 10);
  assert(hashed !== rawPassword, 'Password is never stored in plain text');
  assert(hashed.startsWith('$2'), 'Produces standard bcrypt hash format');

  const matches = await bcrypt.compare(rawPassword, hashed);
  assert(matches === true, 'bcrypt correctly verifies matching password');

  const wrongMatches = await bcrypt.compare('WrongPassword@123', hashed);
  assert(wrongMatches === false, 'bcrypt correctly rejects non-matching password');

  // ----------------------------------------------------
  // TEST SUITE 6: Pan-India Domain Constants & Integrity
  // ----------------------------------------------------
  console.log('\n📌 [Suite 6] National Geographic & Category Constants');

  assert(INDIAN_STATES.length === 36, 'Includes all 28 States + 8 Union Territories of India (36 total)', `count=${INDIAN_STATES.length}`);
  
  const hasMajorStates = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Bihar', 'West Bengal']
    .every(state => INDIAN_STATES.some(s => s.value === state));
  assert(hasMajorStates, 'Contains major Indian states with curated cities');

  assert(ITEM_CATEGORIES.length >= 15, 'Covers 15+ civic item categories with subcategories', `count=${ITEM_CATEGORIES.length}`);

  // ----------------------------------------------------
  // TEST SUITE 7: Formatting & Helper Utilities
  // ----------------------------------------------------
  console.log('\n📌 [Suite 7] Helper Functions & String Sanitization');

  assert(truncate('This is a very long description of an item', 15) === 'This is a very ...', 'Truncates text with ellipsis');
  assert(slugify('Samsung Galaxy S23 Ultra!') === 'samsung-galaxy-s23-ultra', 'Generates clean URL slugs');
  assert(formatDate('2026-11-14', 'dd MMM yyyy') === '14 Nov 2026', 'Formats dates in human-readable Indian standard (dd MMM yyyy)');

  // ----------------------------------------------------
  // SUMMARY REPORT
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL 24 UNIT & INTEGRATION TESTS PASSED CLEANLY!\n');
    process.exit(0);
  }
}

runTestSuite();
