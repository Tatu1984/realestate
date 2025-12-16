import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@propestate.com' },
    update: {},
    create: {
      email: 'admin@propestate.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '+91 9876543210',
      userType: 'ADMIN',
      isVerified: true,
    },
  })
  console.log('Created admin user:', admin.email)

  // Create Sample Users
  const userPassword = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: userPassword,
      name: 'John Smith',
      phone: '+91 9876543211',
      userType: 'INDIVIDUAL',
      isVerified: true,
    },
  })

  // Create Agent
  const agent = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      password: userPassword,
      name: 'Rajesh Kumar',
      phone: '+91 9876543212',
      userType: 'AGENT',
      isVerified: true,
    },
  })

  await prisma.agentProfile.upsert({
    where: { userId: agent.id },
    update: {},
    create: {
      userId: agent.id,
      companyName: 'Kumar Real Estate',
      licenseNumber: 'RERA123456',
      experience: 10,
      specialization: 'Residential Properties',
      description: 'Expert in residential properties with 10+ years of experience in Mumbai real estate market.',
      city: 'Mumbai',
      state: 'Maharashtra',
      isFeatured: true,
      rating: 4.5,
      totalDeals: 150,
    },
  })

  // Create Builder
  const builder = await prisma.user.upsert({
    where: { email: 'builder@example.com' },
    update: {},
    create: {
      email: 'builder@example.com',
      password: userPassword,
      name: 'Prakash Constructions',
      phone: '+91 9876543213',
      userType: 'BUILDER',
      isVerified: true,
    },
  })

  const builderProfile = await prisma.builderProfile.upsert({
    where: { userId: builder.id },
    update: {},
    create: {
      userId: builder.id,
      companyName: 'Prakash Constructions Pvt Ltd',
      establishedYear: 1995,
      totalProjects: 25,
      ongoingProjects: 5,
      description: 'Leading real estate developer with 25+ years of experience in building premium residential and commercial projects.',
      website: 'https://prakashconstructions.com',
      city: 'Bangalore',
      state: 'Karnataka',
      isFeatured: true,
    },
  })

  // Create Project
  const project = await prisma.project.create({
    data: {
      builderId: builderProfile.id,
      name: 'Prakash Sky Gardens',
      description: 'Premium 2/3/4 BHK apartments with world-class amenities in the heart of Whitefield.',
      status: 'ONGOING',
      location: 'Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      totalUnits: 200,
      availableUnits: 50,
      priceRange: '₹85 Lac - ₹2.5 Cr',
      amenities: JSON.stringify(['Swimming Pool', 'Gym', 'Club House', 'Children Play Area', 'Garden']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      ]),
      isFeatured: true,
      isPopular: true,
    },
  })

  // Create Sample Properties
  const properties = [
    {
      userId: user1.id,
      title: '3 BHK Luxury Apartment in Powai',
      description: 'Spacious 3 BHK apartment with stunning lake view. Modern amenities, 24/7 security, and premium fittings.',
      propertyType: 'APARTMENT',
      listingType: 'SELL',
      address: 'Tower A, Lake Heights',
      locality: 'Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076',
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      floorNumber: 12,
      totalFloors: 25,
      facing: 'East',
      furnishing: 'SEMI_FURNISHED',
      builtUpArea: 1450,
      carpetArea: 1200,
      price: 25000000,
      pricePerSqft: 17241,
      maintenance: 15000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      ]),
      amenities: JSON.stringify(['Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden']),
      status: 'ACTIVE',
      listingTier: 'FEATURED',
      views: 245,
    },
    {
      userId: agent.id,
      title: '4 BHK Villa in Whitefield',
      description: 'Beautiful independent villa with private garden, modern architecture, and premium location.',
      propertyType: 'VILLA',
      listingType: 'SELL',
      address: 'Palm Meadows',
      locality: 'Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      bedrooms: 4,
      bathrooms: 4,
      balconies: 3,
      totalFloors: 2,
      facing: 'North',
      furnishing: 'FURNISHED',
      builtUpArea: 3500,
      carpetArea: 3000,
      plotArea: 4000,
      price: 45000000,
      pricePerSqft: 12857,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      ]),
      amenities: JSON.stringify(['Swimming Pool', 'Garden', 'Parking', 'Security']),
      status: 'ACTIVE',
      listingTier: 'PREMIUM',
      views: 189,
    },
    {
      userId: user1.id,
      title: '2 BHK Apartment for Rent in Indiranagar',
      description: 'Well-maintained 2 BHK in prime location. Close to metro, restaurants, and shopping.',
      propertyType: 'APARTMENT',
      listingType: 'RENT',
      address: '100 Feet Road',
      locality: 'Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038',
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      floorNumber: 5,
      totalFloors: 10,
      facing: 'South',
      furnishing: 'FURNISHED',
      builtUpArea: 1100,
      carpetArea: 900,
      price: 45000,
      maintenance: 5000,
      securityDeposit: 200000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      ]),
      amenities: JSON.stringify(['Gym', 'Parking', 'Security', 'Lift', 'Power Backup']),
      status: 'ACTIVE',
      listingTier: 'BASIC',
      views: 78,
    },
    {
      userId: agent.id,
      title: 'Commercial Office Space in BKC',
      description: 'Premium office space in prime business district. Ready to move with all modern facilities.',
      propertyType: 'COMMERCIAL',
      listingType: 'RENT',
      address: 'Trade Centre',
      locality: 'BKC',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      floorNumber: 15,
      totalFloors: 30,
      facing: 'West',
      furnishing: 'FURNISHED',
      builtUpArea: 2500,
      carpetArea: 2000,
      price: 350000,
      maintenance: 25000,
      securityDeposit: 2100000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      ]),
      amenities: JSON.stringify(['Parking', 'Security', 'Lift', 'Power Backup', 'CCTV']),
      status: 'ACTIVE',
      listingTier: 'FEATURED',
      views: 156,
    },
    {
      userId: builder.id,
      projectId: project.id,
      title: '3 BHK in Prakash Sky Gardens',
      description: 'New launch! Premium 3 BHK apartment in our flagship project with world-class amenities.',
      propertyType: 'APARTMENT',
      listingType: 'SELL',
      address: 'Prakash Sky Gardens, Tower B',
      locality: 'Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      floorNumber: 8,
      totalFloors: 20,
      facing: 'East',
      furnishing: 'UNFURNISHED',
      builtUpArea: 1800,
      carpetArea: 1500,
      price: 15000000,
      pricePerSqft: 8333,
      maintenance: 8000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      ]),
      amenities: JSON.stringify(['Swimming Pool', 'Gym', 'Club House', 'Children Play Area', 'Garden', 'Security']),
      status: 'ACTIVE',
      listingTier: 'PREMIUM',
      views: 312,
    },
  ]

  for (const property of properties) {
    await prisma.property.create({ data: property })
  }
  console.log('Created sample properties')

  // Create FAQs
  const faqs = [
    {
      question: 'How do I post a property?',
      answer: 'Login to your account, go to Dashboard, and click on "Post Property". Fill in the details and submit.',
      category: 'Selling',
      order: 1,
    },
    {
      question: 'Is it free to list property?',
      answer: 'Basic listings are free. Premium and Featured listings have additional charges.',
      category: 'Selling',
      order: 2,
    },
  ]

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq })
  }
  console.log('Created FAQs')

  // Create Membership Plans
  const plans = [
    {
      name: 'Basic',
      description: 'Free plan for individual property owners',
      price: 0,
      duration: 30,
      basicListings: 1,
      features: JSON.stringify(['1 Property Listing', 'Basic Support']),
    },
    {
      name: 'Silver',
      description: 'For property owners with multiple properties',
      price: 999,
      duration: 30,
      basicListings: 5,
      featuredListings: 1,
      features: JSON.stringify(['5 Property Listings', '1 Featured Listing', 'Priority Support']),
    },
    {
      name: 'Gold',
      description: 'For real estate agents and brokers',
      price: 2999,
      duration: 30,
      basicListings: 20,
      featuredListings: 5,
      premiumListings: 2,
      features: JSON.stringify(['20 Property Listings', '5 Featured Listings', '2 Premium Listings', '24/7 Support', 'Analytics Dashboard']),
    },
  ]

  for (const plan of plans) {
    await prisma.membershipPlan.create({ data: plan })
  }
  console.log('Created membership plans')

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
