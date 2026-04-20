import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Tour data with real coordinates from Cartagena, Islas del Rosario and Barú
 * Images are from Unsplash (free, public URLs)
 */
const tours = [
  {
    title: "Centro Histórico de Cartagena - UNESCO World Heritage",
    slug: "centro-historico-cartagena",
    description: "Explora las calles empedradas del casco antiguo de Cartagena, declarado Patrimonio de la Humanidad por la UNESCO. Descubre la arquitectura colonial, plazas históricas, la Catedral Metropolitana y la impresionante muralla que rodea la ciudad. Incluye visita guiada con historiador local.",
    price: 45,
    images: [
      "https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1470090718468-62b2868ef14c?w=800&h=600&fit=crop"
    ],
    coords: { lat: 10.4236, lng: -75.5366 },
    duration: "4 hours",
    rating: 4.8,
    reviews: [],
    category: "Historical",
    featured: true,
  },
  {
    title: "Islas del Rosario - Paradise Islands Tour",
    slug: "islas-del-rosario",
    description: "Disfruta de un día paradisíaco en las Islas del Rosario, un archipiélago de 27 islas con aguas cristalinas perfectas para snorkel y buceo. Explora arrecifes de coral, observa peces tropicales y relájate en playas de arena blanca. Incluye almuerzo típico caribeño, transporte en lancha rápida y equipo de snorkel.",
    price: 85,
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    ],
    coords: { lat: 10.1667, lng: -75.7667 },
    duration: "Full day (8 hours)",
    rating: 4.9,
    reviews: [],
    category: "Beach",
    featured: true,
  },
  {
    title: "Castillo San Felipe de Barajas",
    slug: "castillo-san-felipe",
    description: "Visita la fortaleza más grande construida por los españoles en América. Explora su complejo sistema de túneles subterráneos defensivos, observa el ingenio militar del siglo XVII y disfruta de vistas panorámicas de la ciudad desde lo alto del castillo. Guía experto incluido.",
    price: 35,
    images: [
      "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1470090718468-62b2868ef14c?w=800&h=600&fit=crop"
    ],
    coords: { lat: 10.4235, lng: -75.5414 },
    duration: "3 hours",
    rating: 4.7,
    reviews: [],
    category: "Historical",
    featured: false,
  },
  {
    title: "Playa Blanca - Isla Barú - White Sand Paradise",
    slug: "playa-blanca-baru",
    description: "Relájate en una de las playas más hermosas del Caribe colombiano con arena blanca pristina y aguas turquesas cristalinas. Disfruta de servicio de playa, sombrillas, hamacas y acceso a bar con bebidas frescas. Perfecto para descansar, nadar y tomar el sol. Transporte incluido desde Cartagena.",
    price: 55,
    images: [
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1520454974749-611481863552?w=800&h=600&fit=crop"
    ],
    coords: { lat: 10.2167, lng: -75.6167 },
    duration: "6 hours",
    rating: 4.6,
    reviews: [],
    category: "Beach",
    featured: true,
  },
  {
    title: "Volcán del Totumo - Mud Spa Experience",
    slug: "volcan-del-totumo",
    description: "Vive una experiencia única y terapéutica bañándote en el lodo volcánico del Totumo, rico en minerales beneficiosos para la piel. Tras el baño, relájate en una laguna de agua dulce. Incluye baño posterior en la ciénaga, sesión de masaje relajante y almuerzo. Experiencia poco común en el mundo.",
    price: 50,
    images: [
      "https://images.unsplash.com/photo-1582719201952-9c7bea5bcf5b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
    ],
    coords: { lat: 10.7333, lng: -75.2167 },
    duration: "5 hours",
    rating: 4.5,
    reviews: [],
    category: "Adventure",
    featured: false,
  },
  {
    title: "Ciénaga de la Virgen - Mangrove Kayaking at Sunset",
    slug: "cienaga-de-la-virgen",
    description: "Recorre en kayak o lancha los fascinantes manglares de la Ciénaga de la Virgen. Observa aves exóticas, caimanes, peces de agua dulce y la biodiversidad del ecosistema costero. Disfruta del atardecer caribeño desde el agua. Guía naturalista experimentado y equipo seguro incluido.",
    price: 40,
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    ],
    coords: { lat: 10.4500, lng: -75.5167 },
    duration: "3 hours",
    rating: 4.4,
    reviews: [],
    category: "Nature",
    featured: false,
  },
  {
    title: "Convento de La Popa - Historic Monastery with Views",
    slug: "convento-la-popa",
    description: "Sube a una colina de 150 metros sobre el nivel del mar para visitar el hermoso Convento de La Popa, construcción del siglo XVII. Disfruta de vistas panorámicas de toda la bahía de Cartagena desde la terraza. Aprende la historia religiosa y arquitectónica del lugar. Visita guiada cultural incluida.",
    price: 38,
    images: [
      "https://images.unsplash.com/photo-1470090718468-62b2868ef14c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop"
    ],
    coords: { lat: 10.4175, lng: -75.5339 },
    duration: "2.5 hours",
    rating: 4.6,
    reviews: [],
    category: "Historical",
    featured: false,
  },
  {
    title: "Snorkel & Diving at Coral Islands",
    slug: "snorkel-diving-coral",
    description: "Experiencia de snorkel y buceo en las mejores áreas de arrecife de coral. Mira tortugas marinas, peces coloridos y ecosistemas submarinos únicos. Apto para principiantes y expertos. Incluye certificación PADI si lo deseas. Equipo completo y guía profesional incluido.",
    price: 95,
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
    ],
    coords: { lat: 10.1500, lng: -75.7500 },
    duration: "Full day (8 hours)",
    rating: 4.9,
    reviews: [],
    category: "Adventure",
    featured: true,
  },
];

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    const email = 'admin@tourism.com';
    const password = 'Admin123!';
    const displayName = 'Admin User';

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });

    // Create user profile in Firestore with admin role
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      displayName,
      email,
      role: 'admin',
      photoURL: null,
      phone: null,
      createdAt: Timestamp.now(),
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 UID: ${user.uid}`);
    console.log('\n⚠️  IMPORTANT: Verify this email in Firebase Console → Authentication');
    
    return user.uid;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin user already exists with this email');
      return null;
    }
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function seedTours(adminId: string) {
  console.log('\n🌱 Seeding tours...');
  
  for (const tour of tours) {
    try {
      await addDoc(collection(db, 'tours'), {
        ...tour,
        createdAt: Timestamp.now(),
        authorId: adminId,
      });
      console.log(`✅ Created tour: "${tour.title}"`);
    } catch (error) {
      console.error(`❌ Error creating tour "${tour.title}":`, error);
    }
  }
}

const accommodations = [
  {
    name: 'Hotel Boutique Casa del Coliseo',
    slug: 'hotel-boutique-casa-del-coliseo',
    description: 'Hotel boutique en el corazón del Centro Histórico de Cartagena. Arquitectura colonial restaurada con todas las comodidades modernas. Piscina en la azotea con vista a la ciudad amurallada.',
    type: 'hotel',
    pricePerNight: 120,
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
    coords: { lat: 10.4236, lng: -75.5366 },
    address: 'Calle del Coliseo #34-71, Centro Histórico, Cartagena',
    amenities: ['WiFi', 'Pool', 'Air Conditioning', 'Breakfast', 'Room Service', 'Bar'],
    rating: 4.8, reviewCount: 24, rooms: 15, maxGuests: 2,
    checkInTime: '15:00', checkOutTime: '11:00', featured: true,
  },
  {
    name: 'Hostal Makondo Beach',
    slug: 'hostal-makondo-beach',
    description: 'Hostal frente al mar en Bocagrande. Ambiente joven y social con dormitorios compartidos y habitaciones privadas. Perfecto para viajeros con presupuesto.',
    type: 'hostel',
    pricePerNight: 25,
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'],
    coords: { lat: 10.3980, lng: -75.5556 },
    address: 'Av. San Martín #8-45, Bocagrande, Cartagena',
    amenities: ['WiFi', 'Kitchen', 'Laundry', 'Beach Access'],
    rating: 4.3, reviewCount: 56, rooms: 20, maxGuests: 4,
    checkInTime: '14:00', checkOutTime: '12:00', featured: false,
  },
  {
    name: 'Resort Isla del Encanto',
    slug: 'resort-isla-del-encanto',
    description: 'Resort todo incluido en las Islas del Rosario. Cabañas sobre el agua, snorkel, kayak y spa. La experiencia caribeña definitiva.',
    type: 'resort',
    pricePerNight: 250,
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80'],
    coords: { lat: 10.1667, lng: -75.7667 },
    address: 'Islas del Rosario, Cartagena',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Beach Access', 'Room Service'],
    rating: 4.9, reviewCount: 18, rooms: 30, maxGuests: 4,
    checkInTime: '14:00', checkOutTime: '11:00', featured: true,
  },
  {
    name: 'Apartamento Vista al Mar Getsemaní',
    slug: 'apartamento-vista-mar-getsemani',
    description: 'Apartamento moderno con vista al mar en el barrio artístico de Getsemaní. Cocina equipada, terraza privada y ubicación inmejorable para explorar la vida nocturna.',
    type: 'apartment',
    pricePerNight: 85,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
    coords: { lat: 10.4200, lng: -75.5450 },
    address: 'Calle de la Sierpe #26-18, Getsemaní, Cartagena',
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Parking'],
    rating: 4.5, reviewCount: 32, rooms: 2, maxGuests: 4,
    checkInTime: '15:00', checkOutTime: '11:00', featured: false,
  },
];

const promotions = [
  {
    code: 'BIENVENIDO20',
    description: '20% de descuento en tu primera reserva',
    type: 'percentage',
    value: 20,
    minPurchase: 50,
    maxUses: 100,
    applicableTo: 'all',
    active: true,
  },
  {
    code: 'GRUPO10',
    description: '10% de descuento para grupos de 4 o más personas',
    type: 'group',
    value: 10,
    minParticipants: 4,
    maxUses: 50,
    applicableTo: 'tours',
    active: true,
  },
  {
    code: 'VERANO2026',
    description: '$15 de descuento en cualquier tour',
    type: 'fixed',
    value: 15,
    minPurchase: 40,
    maxUses: 200,
    applicableTo: 'tours',
    active: true,
  },
];

async function seedAccommodations() {
  console.log('\n🏨 Seeding accommodations...');
  for (const acc of accommodations) {
    try {
      await addDoc(collection(db, 'accommodations'), {
        ...acc,
        createdAt: Timestamp.now(),
      });
      console.log(`✅ Created accommodation: "${acc.name}"`);
    } catch (error) {
      console.error(`❌ Error creating accommodation "${acc.name}":`, error);
    }
  }
}

async function seedPromotions() {
  console.log('\n🎁 Seeding promotions...');
  const now = new Date();
  const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  for (const promo of promotions) {
    try {
      await addDoc(collection(db, 'promotions'), {
        ...promo,
        currentUses: 0,
        startDate: Timestamp.fromDate(now),
        endDate: Timestamp.fromDate(sixMonthsLater),
        createdAt: Timestamp.now(),
      });
      console.log(`✅ Created promotion: "${promo.code}"`);
    } catch (error) {
      console.error(`❌ Error creating promotion "${promo.code}":`, error);
    }
  }
}

async function main() {
  console.log('🌍 Tourism Platform - Database Seed Script');
  console.log('==========================================\n');

  try {
    if (!process.env.VITE_FIREBASE_PROJECT_ID) {
      throw new Error('VITE_FIREBASE_PROJECT_ID environment variable is missing. Please check your .env file.');
    }

    console.log(`📍 Firebase Project: ${process.env.VITE_FIREBASE_PROJECT_ID}\n`);

    const adminId = await createAdminUser();

    if (!adminId) {
      console.log('\n⚠️  Admin user already exists. Using existing admin account.');
    }

    const finalAdminId = adminId || 'admin';

    await seedTours(finalAdminId);
    await seedAccommodations();
    await seedPromotions();

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1️⃣  Go to Firebase Console → Authentication');
    console.log('2️⃣  Verify the admin@tourism.com email');
    console.log('3️⃣  Check Firestore collections: tours, accommodations, promotions, users');
    console.log('\n🔓 Admin Login Credentials:');
    console.log('   Email: admin@tourism.com');
    console.log('   Password: Admin123!');
    console.log('\n🎁 Promo Codes: BIENVENIDO20, GRUPO10, VERANO2026\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

main();