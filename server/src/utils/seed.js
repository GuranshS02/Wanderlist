import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Itinerary from '../models/Itinerary.js';

dotenv.config();

const ITINERARIES = [
  {
    title: 'Sacred Temples of Kyoto',
    description: 'A 10-day immersive journey through Kyoto\'s most sacred temples, hidden gardens, and traditional ryokans. Discover the soul of Japan through Zen meditation, tea ceremonies, and seasonal cuisine. Includes detailed budget breakdowns, exact transit times, and the best photography spots that tourists never find.',
    highlight: 'Cherry blossom routes inside',
    country: 'Japan',
    city: 'Kyoto',
    flag: '🇯🇵',
    days: 10,
    stops: 12,
    price: 18,
    coverImage: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80',
    tags: ['Culture', 'Food', 'Photography'],
    status: 'published',
    salesCount: 1240,
    averageRating: 4.9,
    reviewCount: 214,
    badge: 'Bestseller',
    bestSeason: 'spring',
    estimatedBudget: 2400,
  },
  {
    title: 'Amalfi Coast Hidden Coves',
    description: 'Seven days exploring the Amalfi Coast like a local — secret beaches, family-run trattorias, and the best limoncello in Positano. Includes ferry schedules, the cheapest car rental tips, and three beaches that aren\'t in any guidebook. Perfect for couples or solo travelers seeking authentic Italy.',
    highlight: 'Beaches only locals know',
    country: 'Italy',
    city: 'Amalfi',
    flag: '🇮🇹',
    days: 7,
    stops: 9,
    price: 22,
    coverImage: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&q=80',
    tags: ['Coast', 'Luxury', 'Food', 'Romantic'],
    status: 'published',
    salesCount: 876,
    averageRating: 4.8,
    reviewCount: 189,
    badge: 'Trending',
    bestSeason: 'summer',
    estimatedBudget: 1800,
  },
  {
    title: 'Backpacking Southeast Asia',
    description: 'Three weeks across Thailand, Vietnam, and Cambodia on a $30/day budget. Real cost breakdowns for every meal, hostel, and bus. Includes visa requirements, the safest border crossings, scam warnings, and the exact street food stalls that won\'t make you sick. Perfect for first-time backpackers.',
    highlight: 'Visas + border crossings included',
    country: 'Thailand',
    city: 'Bangkok',
    flag: '🌏',
    days: 21,
    stops: 18,
    price: 29,
    coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    tags: ['Adventure', 'Budget', 'Solo'],
    status: 'published',
    salesCount: 2100,
    averageRating: 5.0,
    reviewCount: 342,
    badge: 'Top Rated',
    bestSeason: 'year-round',
    estimatedBudget: 700,
  },
  {
    title: 'Sahara Sand & Marrakech Magic',
    description: 'Nine days of Moroccan magic — from the chaos of Marrakech medina to a quiet night under Saharan stars. Includes exact camel camp booking tips, hammam etiquette, and where to find Berber carpets at fair prices. Detailed dress code guidance and cultural notes for respectful travel.',
    highlight: 'Overnight Sahara camp booking guide',
    country: 'Morocco',
    city: 'Marrakech',
    flag: '🇲🇦',
    days: 9,
    stops: 8,
    price: 16,
    coverImage: 'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=800&q=80',
    tags: ['Adventure', 'Culture', 'Photography'],
    status: 'published',
    salesCount: 543,
    averageRating: 4.7,
    reviewCount: 97,
    bestSeason: 'fall',
    estimatedBudget: 1100,
  },
  {
    title: 'New Zealand Road Trip',
    description: 'Two weeks driving the South Island in a campervan. Mapped free camping spots, mandatory hot pools, the best lookout points for sunrise, and where to spot wild penguins. Includes a day-by-day driving route with realistic distances and ferry bookings between islands.',
    highlight: 'Free camping spots mapped',
    country: 'New Zealand',
    city: 'Queenstown',
    flag: '🇳🇿',
    days: 14,
    stops: 15,
    price: 24,
    coverImage: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=800&q=80',
    tags: ['Adventure', 'Nature', 'Photography'],
    status: 'published',
    salesCount: 720,
    averageRating: 4.9,
    reviewCount: 156,
    bestSeason: 'summer',
    estimatedBudget: 2200,
  },
  {
    title: 'Patagonia W Trek',
    description: 'The complete W trek in Torres del Paine — booking strategy for refugios, permit timelines, the gear you actually need (and what to leave home), and emergency contacts. Includes detailed day-by-day elevation profiles, where to fill water, and the best photo spots at golden hour.',
    highlight: 'Refugio booking strategy',
    country: 'Chile',
    city: 'Torres del Paine',
    flag: '🇨🇱',
    days: 12,
    stops: 11,
    price: 20,
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    tags: ['Trekking', 'Nature', 'Adventure'],
    status: 'published',
    salesCount: 410,
    averageRating: 4.8,
    reviewCount: 88,
    bestSeason: 'summer',
    estimatedBudget: 1500,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Find or create a demo creator user
    let demoCreator = await User.findOne({ email: 'demo@wanderlist.io' });

    if (!demoCreator) {
      demoCreator = await User.create({
        name: 'Demo Creator',
        email: 'demo@wanderlist.io',
        password: 'DemoPass123!',
        role: 'creator',
      });
      console.log('✅ Created demo creator user');
    } else {
      console.log('ℹ️  Demo creator already exists');
    }

    // Wipe existing seeded itineraries
    const deleteResult = await Itinerary.deleteMany({ creator: demoCreator._id });
    console.log(`🗑️  Removed ${deleteResult.deletedCount} old itineraries`);

    // Insert new ones
    const itinerariesWithCreator = ITINERARIES.map(it => ({
      ...it,
      creator: demoCreator._id,
    }));

    const created = await Itinerary.create(itinerariesWithCreator);
    console.log(`✅ Seeded ${created.length} itineraries`);

    console.log('\n🌿 Database is ready for browsing!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();