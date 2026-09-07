const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'db_files');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const HOSTELS_FILE = path.join(DATA_DIR, 'hostels.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

// Helper to read / write JSON
const readJSON = (filePath, defaultVal = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultVal;
  }
};

const writeJSON = (filePath, data) => {
  try {
    // Write to a temp file first and rename — avoids leaving a
    // corrupted/half-written JSON file if the process crashes mid-write.
    const tmpPath = `${filePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    // Re-throw so callers (and the centralized error handler) know the
    // write failed instead of silently pretending it succeeded.
    const AppError = require('../utils/AppError');
    throw new AppError('Failed to save data. Please try again.', 500);
  }
};

// Initial Seed Data
const getInitialUsers = () => {
  const salt = bcrypt.genSaltSync(12);
  const hashedPassword = bcrypt.hashSync('password123', salt);

  return [
    {
      _id: 'user_1',
      name: 'Demo Student',
      email: 'demo@messmate.com',
      password: hashedPassword,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'user_2',
      name: 'Aarav Sharma',
      email: 'aarav@messmate.com',
      password: hashedPassword,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'user_3',
      name: 'Priya Patel',
      email: 'priya@messmate.com',
      password: hashedPassword,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'user_4',
      name: 'Rohan Verma',
      email: 'rohan@messmate.com',
      password: hashedPassword,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'user_5',
      name: 'Ananya Iyer',
      email: 'ananya@messmate.com',
      password: hashedPassword,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    },
  ];
};

const getInitialHostels = () => {
  return [
    {
      _id: 'hostel_1',
      name: 'Sunrise PG & Mess',
      city: 'Meerut',
      monthlyMessCost: 3000,
      address: 'Near University Road, Saket, Meerut, UP 250001',
      description: 'A student-favorite PG known for warm homestyle North Indian meals, fluffy rotis made on tawa, and special Sunday sweet treats.',
      foodAvailability: '3 Meals/Day (Breakfast, Lunch & Dinner)',
      createdBy: 'user_1',
      images: [{ url: 'https://rkmrc-cs.zohosites.in/college/dinning2.webp', alt: 'Hostel mess dining' }],
      createdAt: new Date('2026-08-01').toISOString(),
      updatedAt: new Date('2026-08-01').toISOString(),
    },
    {
      _id: 'hostel_2',
      name: 'Starlight Student Residency',
      city: 'Kota',
      monthlyMessCost: 4200,
      address: 'Landmark City, Kunhari, Kota, Rajasthan 324008',
      description: 'Located in the heart of coaching hub Kota. Provides balanced, hygienic meals tailored for competitive exam aspirants with unlimited chapati.',
      foodAvailability: '3 Meals + Evening Tea & Snacks',
      createdBy: 'user_2',
      images: [{ url: 'https://image-static.collegedunia.com/public/college_data/images/campusimage/1763026614b9510cc7-eee3-43ca-8e6e-8cb1500d1070.webp', alt: 'Hostel mess dining' }],
      createdAt: new Date('2026-08-05').toISOString(),
      updatedAt: new Date('2026-08-05').toISOString(),
    },
    {
      _id: 'hostel_3',
      name: 'Green Valley Hostel',
      city: 'Bengaluru',
      monthlyMessCost: 5500,
      address: '5th Block, Koramangala, Bengaluru, Karnataka 560095',
      description: 'Modern PG featuring both South Indian and North Indian cuisines. Crispy dosas, filter coffee, paneer butter masala, and fresh fruit bowls.',
      foodAvailability: 'Breakfast & Dinner (Mon-Fri), 3 Meals (Weekends)',
      createdBy: 'user_3',
      images: [{ url: 'https://vaishnavhostels.in/girls/wp-content/uploads/2019/03/Mess-girls-hostel-02.jpg', alt: 'Hostel mess dining' }],
      createdAt: new Date('2026-08-10').toISOString(),
      updatedAt: new Date('2026-08-10').toISOString(),
    },
    {
      _id: 'hostel_4',
      name: "Scholar's Den PG",
      city: 'Delhi',
      monthlyMessCost: 4500,
      address: 'Hudson Lane, GTB Nagar, North Campus, New Delhi 110009',
      description: 'Just 5 minutes from Delhi University North Campus. Famous for Friday Rajma Chawal, butter rotis, and weekly Chinese night specials.',
      foodAvailability: '3 Meals / Day (Veg + Egg options)',
      createdBy: 'user_1',
      createdAt: new Date('2026-08-12').toISOString(),
      updatedAt: new Date('2026-08-12').toISOString(),
    },
    {
      _id: 'hostel_5',
      name: 'Hillview Residency & PG',
      city: 'Pune',
      monthlyMessCost: 3800,
      address: 'Viman Nagar, Near Symbiosis Campus, Pune, Maharashtra 411014',
      description: 'Spacious living space with a vibrant canteen. Offers authentic Maharashtrian dishes like Poha, Pithla Bhakri along with North Indian thalis.',
      foodAvailability: '3 Meals / Day (Pure Veg)',
      createdBy: 'user_2',
      createdAt: new Date('2026-08-15').toISOString(),
      updatedAt: new Date('2026-08-15').toISOString(),
    },
    {
      _id: 'hostel_6',
      name: 'TechHub PG & Mess',
      city: 'Hyderabad',
      monthlyMessCost: 4800,
      address: 'Gachibowli, Near IIIT Junction, Hyderabad, Telangana 500032',
      description: 'Caters to engineering students and tech interns. Famous for Hyderabadi Dum Biryani on Thursdays, South Indian breakfast, and clean filtered water.',
      foodAvailability: '3 Meals / Day (Veg & Non-Veg)',
      createdBy: 'user_3',
      createdAt: new Date('2026-08-18').toISOString(),
      updatedAt: new Date('2026-08-18').toISOString(),
    },
    {
      _id: 'hostel_7',
      name: 'Apex Student Living',
      city: 'Jaipur',
      monthlyMessCost: 3200,
      address: 'Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur, Rajasthan 302017',
      description: 'Affordable hostel mess near MNIT. Fresh seasonal veggies, warm rotis with ghee, and authentic Daal Baati Churma on alternate Sundays.',
      foodAvailability: '3 Meals / Day (Pure Veg)',
      createdBy: 'user_1',
      createdAt: new Date('2026-08-20').toISOString(),
      updatedAt: new Date('2026-08-20').toISOString(),
    },
    {
      _id: 'hostel_8',
      name: 'Shree Balaji Hostel',
      city: 'Noida',
      monthlyMessCost: 3500,
      address: 'Sector 62, Near Electronic City Metro, Noida, UP 201309',
      description: 'Clean, disciplined hostel mess serving simple and healthy homestyle food with curd, salad, and dal daily.',
      foodAvailability: '3 Meals / Day',
      createdBy: 'user_2',
      createdAt: new Date('2026-08-22').toISOString(),
      updatedAt: new Date('2026-08-22').toISOString(),
    },
  ];
};

const getInitialReviews = () => {
  return [
    {
      _id: 'rev_1',
      hostel: 'hostel_1',
      user: 'user_2',
      rating: 5,
      categories: { taste: 5, hygiene: 5, portionSize: 4, variety: 4 },
      tags: ['Taste', 'Hygiene', 'Sunday Special', 'Homestyle'],
      comment: 'Hands down the best hostel mess food in Saket Meerut! The rotis are soft and served hot from the tawa. Sunday halwa poori is unmissable.',
      createdAt: new Date('2026-08-02').toISOString(),
    },
    {
      _id: 'rev_2',
      hostel: 'hostel_1',
      user: 'user_3',
      rating: 4,
      categories: { taste: 4, hygiene: 4, portionSize: 5, variety: 4 },
      tags: ['Good Portions', 'Taste', 'Value for Money'],
      comment: 'Very generous portions, the mess uncle is super sweet and gives extra sabzi whenever requested. Highly recommended for first-year students.',
      createdAt: new Date('2026-08-03').toISOString(),
    },
    {
      _id: 'rev_3',
      hostel: 'hostel_2',
      user: 'user_1',
      rating: 4,
      categories: { taste: 4, hygiene: 5, portionSize: 5, variety: 3 },
      tags: ['Good Portions', 'Hygiene', 'Healthy Options'],
      comment: 'Very solid mess for Kota students. Unlimited hot chapatis are a blessing during late-night study sessions. Very neat and clean kitchen.',
      createdAt: new Date('2026-08-06').toISOString(),
    },
    {
      _id: 'rev_4',
      hostel: 'hostel_3',
      user: 'user_4',
      rating: 5,
      categories: { taste: 5, hygiene: 5, portionSize: 4, variety: 5 },
      tags: ['Taste', 'Variety', 'Hygiene'],
      comment: 'The breakfast spread here is top tier! Hot ghee podi idlis, crispy dosas, and filter coffee. Dinner has decent North Indian paneer options too.',
      createdAt: new Date('2026-08-11').toISOString(),
    },
    {
      _id: 'rev_5',
      hostel: 'hostel_4',
      user: 'user_2',
      rating: 5,
      categories: { taste: 5, hygiene: 4, portionSize: 5, variety: 4 },
      tags: ['Taste', 'Good Portions', 'Sunday Special'],
      comment: 'Rajma Chawal on Fridays is legendary here! Authentic Delhi style food. Tiffin delivery option to colleges is also super convenient.',
      createdAt: new Date('2026-08-13').toISOString(),
    },
    {
      _id: 'rev_6',
      hostel: 'hostel_5',
      user: 'user_3',
      rating: 4,
      categories: { taste: 4, hygiene: 5, portionSize: 4, variety: 4 },
      tags: ['Hygiene', 'Healthy Options', 'Taste'],
      comment: 'The misal pav and poha for breakfast are delicious! Very clean mess with high hygiene standards. Loved the fresh seasonal salads.',
      createdAt: new Date('2026-08-16').toISOString(),
    },
    {
      _id: 'rev_7',
      hostel: 'hostel_6',
      user: 'user_5',
      rating: 5,
      categories: { taste: 5, hygiene: 5, portionSize: 5, variety: 4 },
      tags: ['Taste', 'Sunday Special', 'Good Portions'],
      comment: 'Thursday Chicken Biryani / Veg Dum Biryani is restaurant quality! Unlimited raita and mirchi ka salan. Best mess in Gachibowli.',
      createdAt: new Date('2026-08-19').toISOString(),
    },
    {
      _id: 'rev_8',
      hostel: 'hostel_7',
      user: 'user_4',
      rating: 4,
      categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 3 },
      tags: ['Homestyle', 'Value for Money', 'Taste'],
      comment: 'Authentic Rajasthani touch with pure desi ghee on rotis. Daal baati on alternate Sundays is a feast with batchmates.',
      createdAt: new Date('2026-08-21').toISOString(),
    },
  ];
};

// Initialize JSON files if empty
const initData = () => {
  if (!fs.existsSync(USERS_FILE)) writeJSON(USERS_FILE, getInitialUsers());
  if (!fs.existsSync(HOSTELS_FILE)) writeJSON(HOSTELS_FILE, getInitialHostels());
  if (!fs.existsSync(REVIEWS_FILE)) writeJSON(REVIEWS_FILE, getInitialReviews());
};

initData();

// Storage Service API
const store = {
  // Users
  getUsers: () => readJSON(USERS_FILE, getInitialUsers()),
  findUserById: (id) => store.getUsers().find((u) => u._id === id || u.id === id),
  findUserByEmail: (email) =>
    store.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase().trim()),
  createUser: (userData) => {
    const users = store.getUsers();
    const newUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    return newUser;
  },

  // Hostels
  getHostels: () => readJSON(HOSTELS_FILE, getInitialHostels()),
  findHostelById: (id) => store.getHostels().find((h) => h._id === id || h.id === id),
  createHostel: (hostelData) => {
    const hostels = store.getHostels();
    const newHostel = {
      _id: `hostel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...hostelData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    hostels.unshift(newHostel);
    writeJSON(HOSTELS_FILE, hostels);
    return newHostel;
  },
  updateHostel: (id, updates) => {
    const hostels = store.getHostels();
    const index = hostels.findIndex((h) => h._id === id || h.id === id);
    if (index === -1) return null;

    hostels[index] = {
      ...hostels[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(HOSTELS_FILE, hostels);
    return hostels[index];
  },
  deleteHostel: (id) => {
    const hostels = store.getHostels().filter((h) => h._id !== id && h.id !== id);
    writeJSON(HOSTELS_FILE, hostels);
    // Also delete associated reviews
    const reviews = store.getReviews().filter((r) => r.hostel !== id);
    writeJSON(REVIEWS_FILE, reviews);
    return true;
  },

  // Reviews
  getReviews: () => readJSON(REVIEWS_FILE, getInitialReviews()),
  findReviewsByHostel: (hostelId) =>
    store.getReviews().filter((r) => r.hostel === hostelId),
  findReviewByUserAndHostel: (userId, hostelId) =>
    store.getReviews().find((r) => r.hostel === hostelId && (r.user === userId || r.user?._id === userId)),
  findReviewById: (id) => store.getReviews().find((r) => r._id === id || r.id === id),
  createReview: (reviewData) => {
    const reviews = store.getReviews();
    const newReview = {
      _id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...reviewData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reviews.unshift(newReview);
    writeJSON(REVIEWS_FILE, reviews);
    return newReview;
  },
  updateReview: (id, updates) => {
    const reviews = store.getReviews();
    const index = reviews.findIndex((r) => r._id === id || r.id === id);
    if (index === -1) return null;

    reviews[index] = {
      ...reviews[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(REVIEWS_FILE, reviews);
    return reviews[index];
  },
  deleteReview: (id) => {
    const reviews = store.getReviews().filter((r) => r._id !== id && r.id !== id);
    writeJSON(REVIEWS_FILE, reviews);
    return true;
  },
  findReviewsByUser: (userId) => {
    return store.getReviews().filter((r) => r.user === userId || r.user?._id === userId);
  },
};


const REFRESH_FILE = path.join(DATA_DIR, 'refresh_sessions.json');
const createRefreshSession = (payload) => { const rows=readJSON(REFRESH_FILE,[]); const row={_id:`rs_${Date.now()}_${Math.random().toString(36).slice(2)}`,...payload,expiresAt:new Date(payload.expiresAt).toISOString(),revokedAt:null}; rows.push(row); writeJSON(REFRESH_FILE,rows); return row; };
const findRefreshSession = (hash) => readJSON(REFRESH_FILE,[]).find(x=>x.tokenHash===hash) || null;
const revokeRefreshSession = (hash) => { const rows=readJSON(REFRESH_FILE,[]); const row=rows.find(x=>x.tokenHash===hash); if(row && !row.revokedAt) row.revokedAt=new Date().toISOString(); writeJSON(REFRESH_FILE,rows); };
const revokeRefreshFamily = (familyId) => { const rows=readJSON(REFRESH_FILE,[]); rows.filter(x=>String(x.familyId)===String(familyId) && !x.revokedAt).forEach(x=>x.revokedAt=new Date().toISOString()); writeJSON(REFRESH_FILE,rows); };
const setRefreshReplacement = (hash,nextHash) => { const rows=readJSON(REFRESH_FILE,[]); const row=rows.find(x=>x.tokenHash===hash); if(row) row.replacedByHash=nextHash; writeJSON(REFRESH_FILE,rows); };
const revokeAllRefreshSessions = (userId) => { const rows=readJSON(REFRESH_FILE,[]); rows.filter(x=>String(x.user)===String(userId)).forEach(x=>x.revokedAt=new Date().toISOString()); writeJSON(REFRESH_FILE,rows); };
const setUserVerification = (id,hash,expires) => { const rows=readJSON(USERS_FILE); const u=rows.find(x=>String(x._id)===String(id)); if(u){u.emailVerificationTokenHash=hash;u.emailVerificationExpiresAt=new Date(expires).toISOString();writeJSON(USERS_FILE,rows);} };
const findUserByVerification = (hash) => readJSON(USERS_FILE).find(x=>x.emailVerificationTokenHash===hash && new Date(x.emailVerificationExpiresAt)>new Date()) || null;
const verifyUser = (id) => { const rows=readJSON(USERS_FILE); const u=rows.find(x=>String(x._id)===String(id)); if(u){u.isEmailVerified=true;delete u.emailVerificationTokenHash;delete u.emailVerificationExpiresAt;writeJSON(USERS_FILE,rows);} };
const setUserReset = (id,hash,expires) => { const rows=readJSON(USERS_FILE); const u=rows.find(x=>String(x._id)===String(id)); if(u){u.passwordResetTokenHash=hash;u.passwordResetExpiresAt=new Date(expires).toISOString();writeJSON(USERS_FILE,rows);} };
const findUserByReset = (hash) => readJSON(USERS_FILE).find(x=>x.passwordResetTokenHash===hash && new Date(x.passwordResetExpiresAt)>new Date()) || null;
const resetUserPassword = (id, hashedPassword) => { const rows=readJSON(USERS_FILE); const u=rows.find(x=>String(x._id)===String(id)); if(u){u.password=hashedPassword;delete u.passwordResetTokenHash;delete u.passwordResetExpiresAt;writeJSON(USERS_FILE,rows);} };
const clearUserReset = (id) => { const rows=readJSON(USERS_FILE); const u=rows.find(x=>String(x._id)===String(id)); if(u){delete u.passwordResetTokenHash;delete u.passwordResetExpiresAt;writeJSON(USERS_FILE,rows);} };

Object.assign(store, { createRefreshSession, findRefreshSession, revokeRefreshSession, revokeRefreshFamily, setRefreshReplacement, revokeAllRefreshSessions, setUserVerification, findUserByVerification, verifyUser, setUserReset, findUserByReset, resetUserPassword, clearUserReset });

module.exports = store;
