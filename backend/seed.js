const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Hostel = require('./models/Hostel');
const Review = require('./models/Review');

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/messmate';

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await Review.deleteMany({});
    await Hostel.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Cleared existing database records.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Demo Student',
        email: 'demo@messmate.com',
        password: 'password123',
        isEmailVerified: true,
      },
      {
        name: 'Aarav Sharma',
        email: 'aarav@messmate.com',
        password: 'password123',
        isEmailVerified: true,
      },
      {
        name: 'Priya Patel',
        email: 'priya@messmate.com',
        password: 'password123',
        isEmailVerified: true,
      },
      {
        name: 'Rohan Verma',
        email: 'rohan@messmate.com',
        password: 'password123',
        isEmailVerified: true,
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya@messmate.com',
        password: 'password123',
        isEmailVerified: true,
      },
      {
        name: 'Kavya Singh',
        email: 'kavya@messmate.com',
        password: 'password123',
        isEmailVerified: true,
      },
      {
        name: 'Aditya Nair',
        email: 'aditya@messmate.com',
        password: 'password123',
        isEmailVerified: true,
      },
      {
        name: 'Sneha Roy',
        email: 'sneha@messmate.com',
        password: 'password123',
        isEmailVerified: true,
      },
    ]);

    console.log(`👤 Created ${users.length} users.`);

    // 2. Create Hostels
    const demoUser = users[0];
    const aarav = users[1];
    const priya = users[2];

    const hostels = await Hostel.create([
      {
        name: 'Sunrise PG & Mess',
        city: 'Meerut',
        monthlyMessCost: 3000,
        address: 'Near University Road, Saket, Meerut, UP 250001',
        description:
          'A student-favorite PG known for warm homestyle North Indian meals, fluffy rotis made on tawa, and special Sunday sweet treats.',
        foodAvailability: '3 Meals/Day (Breakfast, Lunch & Dinner)',
        createdBy: demoUser._id,
        images: [{ url: 'https://rkmrc-cs.zohosites.in/college/dinning2.webp', alt: 'Hostel mess dining' }],
      },
      {
        name: 'Starlight Student Residency',
        city: 'Kota',
        monthlyMessCost: 4200,
        address: 'Landmark City, Kunhari, Kota, Rajasthan 324008',
        description:
          'Located in the heart of coaching hub Kota. Provides balanced, hygienic meals tailored for competitive exam aspirants with unlimited chapati.',
        foodAvailability: '3 Meals + Evening Tea & Snacks',
        createdBy: aarav._id,
        images: [{ url: 'https://image-static.collegedunia.com/public/college_data/images/campusimage/1763026614b9510cc7-eee3-43ca-8e6e-8cb1500d1070.webp', alt: 'Hostel mess dining' }],
      },
      {
        name: 'Green Valley Hostel',
        city: 'Bengaluru',
        monthlyMessCost: 5500,
        address: '5th Block, Koramangala, Bengaluru, Karnataka 560095',
        description:
          'Modern PG featuring both South Indian and North Indian cuisines. Crispy dosas, filter coffee, paneer butter masala, and fresh fruit bowls.',
        foodAvailability: 'Breakfast & Dinner (Mon-Fri), 3 Meals (Weekends)',
        createdBy: priya._id,
        images: [{ url: 'https://vaishnavhostels.in/girls/wp-content/uploads/2019/03/Mess-girls-hostel-02.jpg', alt: 'Hostel mess dining' }],
      },
      {
        name: "Scholar's Den PG",
        city: 'Delhi',
        monthlyMessCost: 4500,
        address: 'Hudson Lane, GTB Nagar, North Campus, New Delhi 110009',
        description:
          'Just 5 minutes from Delhi University North Campus. Famous for Friday Rajma Chawal, butter rotis, and weekly Chinese night specials.',
        foodAvailability: '3 Meals / Day (Veg + Egg options)',
        createdBy: demoUser._id,
      },
      {
        name: 'Hillview Residency & PG',
        city: 'Pune',
        monthlyMessCost: 3800,
        address: 'Viman Nagar, Near Symbiosis Campus, Pune, Maharashtra 411014',
        description:
          'Spacious living space with a vibrant canteen. Offers authentic Maharashtrian dishes like Poha, Pithla Bhakri along with North Indian thalis.',
        foodAvailability: '3 Meals / Day (Pure Veg)',
        createdBy: aarav._id,
      },
      {
        name: 'TechHub PG & Mess',
        city: 'Hyderabad',
        monthlyMessCost: 4800,
        address: 'Gachibowli, Near IIIT Junction, Hyderabad, Telangana 500032',
        description:
          'Caters to engineering students and tech interns. Famous for Hyderabadi Dum Biryani on Thursdays, South Indian breakfast, and clean filtered water.',
        foodAvailability: '3 Meals / Day (Veg & Non-Veg)',
        createdBy: priya._id,
      },
      {
        name: 'Apex Student Living',
        city: 'Jaipur',
        monthlyMessCost: 3200,
        address: 'Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur, Rajasthan 302017',
        description:
          'Affordable hostel mess near MNIT. Fresh seasonal veggies, warm rotis with ghee, and authentic Daal Baati Churma on alternate Sundays.',
        foodAvailability: '3 Meals / Day (Pure Veg)',
        createdBy: demoUser._id,
      },
      {
        name: 'Shree Balaji Hostel',
        city: 'Noida',
        monthlyMessCost: 3500,
        address: 'Sector 62, Near Electronic City Metro, Noida, UP 201309',
        description:
          'Clean, disciplined hostel mess serving simple and healthy homestyle food with curd, salad, and dal daily.',
        foodAvailability: '3 Meals / Day',
        createdBy: aarav._id,
      },
    ]);

    console.log(`🏨 Created ${hostels.length} hostels.`);

    // 3. Create realistic reviews for each hostel
    const reviewsData = [
      // Sunrise PG (Meerut)
      {
        hostel: hostels[0]._id,
        user: users[1]._id,
        rating: 5,
        categories: { taste: 5, hygiene: 5, portionSize: 4, variety: 4 },
        tags: ['Taste', 'Hygiene', 'Sunday Special', 'Homestyle'],
        comment:
          'Hands down the best hostel mess food in Saket Meerut! The rotis are soft and served hot from the tawa. Sunday halwa poori is unmissable.',
      },
      {
        hostel: hostels[0]._id,
        user: users[2]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 5, variety: 4 },
        tags: ['Good Portions', 'Taste', 'Value for Money'],
        comment:
          'Very generous portions, the mess uncle is super sweet and gives extra sabzi whenever requested. Highly recommended for first-year students.',
      },
      {
        hostel: hostels[0]._id,
        user: users[3]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 3 },
        tags: ['Homestyle', 'Hygiene'],
        comment:
          'Food tastes very close to home. Less oily compared to other PGs in the neighborhood. Variety could be slightly improved on weekdays.',
      },
      {
        hostel: hostels[0]._id,
        user: users[4]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 5, portionSize: 4, variety: 4 },
        tags: ['Hygiene', 'Taste'],
        comment:
          'Clean dining hall with stainless steel plates and RO drinking water. The dal fry and jeera rice combo on Tuesdays is great.',
      },

      // Starlight Student Residency (Kota)
      {
        hostel: hostels[1]._id,
        user: users[0]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 5, portionSize: 5, variety: 3 },
        tags: ['Good Portions', 'Hygiene', 'Healthy'],
        comment:
          'Very solid mess for Kota students. Unlimited hot chapatis are a blessing during late-night study sessions. Very neat and clean kitchen.',
      },
      {
        hostel: hostels[1]._id,
        user: users[2]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 4 },
        tags: ['Taste', 'Variety'],
        comment:
          'Good balance of nutrition and taste. Evening tea with samosa or kachori every Wednesday is nice relief after test days.',
      },
      {
        hostel: hostels[1]._id,
        user: users[5]._id,
        rating: 3,
        categories: { taste: 3, hygiene: 4, portionSize: 4, variety: 3 },
        tags: ['Good Portions'],
        comment:
          'Decent food, never had any stomach issues. The taste can feel repetitive after 3 months, but portion sizes are definitely sufficient.',
      },

      // Green Valley Hostel (Bengaluru)
      {
        hostel: hostels[2]._id,
        user: users[3]._id,
        rating: 5,
        categories: { taste: 5, hygiene: 5, portionSize: 4, variety: 5 },
        tags: ['Taste', 'Variety', 'Hygiene'],
        comment:
          'The breakfast spread here is top tier! Hot ghee podi idlis, crispy dosas, and filter coffee. Dinner has decent North Indian paneer options too.',
      },
      {
        hostel: hostels[2]._id,
        user: users[4]._id,
        rating: 5,
        categories: { taste: 5, hygiene: 4, portionSize: 4, variety: 5 },
        tags: ['Taste', 'Variety', 'Weekend Special'],
        comment:
          'Weekend brunch is something everyone looks forward to. You definitely get what you pay for in Koramangala.',
      },
      {
        hostel: hostels[2]._id,
        user: users[6]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 4 },
        tags: ['Hygiene', 'Good Portions'],
        comment:
          'Super clean kitchen, sanitized utensils. The coconut chutney and sambar taste authentic. Cost is slightly premium but worth the quality.',
      },

      // Scholar's Den PG (Delhi)
      {
        hostel: hostels[3]._id,
        user: users[1]._id,
        rating: 5,
        categories: { taste: 5, hygiene: 4, portionSize: 5, variety: 4 },
        tags: ['Taste', 'Good Portions', 'Sunday Special'],
        comment:
          'Rajma Chawal on Fridays is legendary here! Authentic Delhi style food. Tiffin delivery option to colleges is also super convenient.',
      },
      {
        hostel: hostels[3]._id,
        user: users[5]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 4 },
        tags: ['Taste', 'Value for Money'],
        comment:
          'Great value for North Campus. Food is served hot. The paratha breakfast with curd and pickle gives good energy for morning lectures.',
      },
      {
        hostel: hostels[3]._id,
        user: users[7]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 3 },
        tags: ['Homestyle', 'Hygiene'],
        comment:
          'Homestyle food that is not overly spicy. Kitchen staff is polite and accommodates meal timings for students with late labs.',
      },

      // Hillview Residency (Pune)
      {
        hostel: hostels[4]._id,
        user: users[2]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 5, portionSize: 4, variety: 4 },
        tags: ['Hygiene', 'Healthy', 'Taste'],
        comment:
          'The misal pav and poha for breakfast are delicious! Very clean mess with high hygiene standards. Loved the fresh seasonal salads.',
      },
      {
        hostel: hostels[4]._id,
        user: users[6]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 4 },
        tags: ['Variety', 'Good Portions'],
        comment:
          'Great variety throughout the week. You never get bored. Gulab jamun on Saturday dinners is a sweet perk.',
      },

      // TechHub PG (Hyderabad)
      {
        hostel: hostels[5]._id,
        user: users[4]._id,
        rating: 5,
        categories: { taste: 5, hygiene: 5, portionSize: 5, variety: 4 },
        tags: ['Taste', 'Sunday Special', 'Good Portions'],
        comment:
          'Thursday Chicken Biryani / Veg Dum Biryani is restaurant quality! Unlimited raita and mirchi ka salan. Best mess in Gachibowli.',
      },
      {
        hostel: hostels[5]._id,
        user: users[0]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 5, variety: 4 },
        tags: ['Good Portions', 'Taste'],
        comment:
          'Very filling meals with great rice and curry options. Perfect for students and interns working long coding hours.',
      },

      // Apex Student Living (Jaipur)
      {
        hostel: hostels[6]._id,
        user: users[3]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 3 },
        tags: ['Homestyle', 'Value for Money', 'Taste'],
        comment:
          'Authentic Rajasthani touch with pure desi ghee on rotis. Daal baati on alternate Sundays is a feast with batchmates.',
      },
      {
        hostel: hostels[6]._id,
        user: users[5]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 4 },
        tags: ['Value for Money', 'Hygiene'],
        comment:
          'Extremely affordable mess cost for the quality provided. Very clean dining hall.',
      },

      // Shree Balaji Hostel (Noida)
      {
        hostel: hostels[7]._id,
        user: users[7]._id,
        rating: 4,
        categories: { taste: 4, hygiene: 4, portionSize: 4, variety: 3 },
        tags: ['Healthy', 'Homestyle'],
        comment:
          'Simple, unpretentious food that keeps your stomach light. Daily curd and salad are always fresh.',
      },
    ];

    await Review.create(reviewsData);
    console.log(`⭐ Created ${reviewsData.length} reviews.`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
