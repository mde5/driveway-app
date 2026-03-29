import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const listings = [
  {
    address: '20 King St W, Toronto, ON',
    neighbourhood: 'Financial District',
    lat: 43.6481,
    lng: -79.3814,
    pricePerHour: 8,
    pricePerDay: 45,
    description: 'Secure underground spot steps from Union Station. Great for commuters.',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    available: true,
  },
  {
    address: '382 College St, Toronto, ON',
    neighbourhood: 'Kensington Market',
    lat: 43.6547,
    lng: -79.4078,
    pricePerHour: 5,
    pricePerDay: 28,
    description: 'Private laneway spot behind the house. Close to Little Italy and Kensington.',
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800',
    available: true,
  },
  {
    address: '88 Bloor St W, Toronto, ON',
    neighbourhood: 'Yorkville',
    lat: 43.6702,
    lng: -79.3929,
    pricePerHour: 12,
    pricePerDay: 65,
    description: 'Indoor spot in a luxury building garage. Perfect for shopping on Bloor.',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    available: true,
  },
  {
    address: '55 Mill St, Toronto, ON',
    neighbourhood: 'Distillery District',
    lat: 43.6503,
    lng: -79.3595,
    pricePerHour: 7,
    pricePerDay: 35,
    description: 'Outdoor spot near the Distillery District. Ideal for events and festivals.',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    available: true,
  },
  {
    address: '628 King St W, Toronto, ON',
    neighbourhood: 'King West',
    lat: 43.6441,
    lng: -79.4003,
    pricePerHour: 6,
    pricePerDay: 32,
    description: 'Flat driveway spot in a quiet side street. Walking distance to King West restaurants and bars.',
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800',
    available: true,
  },
  {
    address: '2365 Bloor St W, Toronto, ON',
    neighbourhood: 'Bloor West Village',
    lat: 43.6539,
    lng: -79.4637,
    pricePerHour: 4,
    pricePerDay: 20,
    description: 'Single car driveway in a residential neighbourhood. Easy in/out access.',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    available: true,
  },
  {
    address: '171 East Liberty St, Toronto, ON',
    neighbourhood: 'Liberty Village',
    lat: 43.6380,
    lng: -79.4195,
    pricePerHour: 6,
    pricePerDay: 30,
    description: 'Covered spot in a condo building. Great for Liberty Village events.',
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    available: true,
  },
  {
    address: '235 Queens Quay W, Toronto, ON',
    neighbourhood: 'Harbourfront',
    lat: 43.6387,
    lng: -79.3847,
    pricePerHour: 9,
    pricePerDay: 50,
    description: 'Outdoor spot with lake views. Great for waterfront events and concerts.',
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800',
    available: true,
  },
]

async function seed() {
  console.log(`Seeding ${listings.length} listings...`)
  for (const listing of listings) {
    const ref = await addDoc(collection(db, 'listings'), listing)
    console.log(`Added: ${listing.neighbourhood} (${ref.id})`)
  }
  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
