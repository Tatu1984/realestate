import { z } from 'zod'

// Common validations
export const emailSchema = z.string().email('Invalid email address')
export const phoneSchema = z.string().regex(/^[+]?[\d\s-]{10,15}$/, 'Invalid phone number').optional().nullable()
export const urlSchema = z.string().url('Invalid URL').optional().nullable()
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')

// User types
export const userTypes = ['INDIVIDUAL', 'AGENT', 'BUILDER', 'ADMIN'] as const
export const userTypeSchema = z.enum(userTypes)

// Property types
export const propertyTypes = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'PG', 'ROOMMATE'] as const
export const propertyTypeSchema = z.enum(propertyTypes)

// Listing types
export const listingTypes = ['SELL', 'RENT', 'PG', 'ROOMMATE'] as const
export const listingTypeSchema = z.enum(listingTypes)

// Property status
export const propertyStatuses = ['PENDING', 'ACTIVE', 'SOLD', 'EXPIRED'] as const
export const propertyStatusSchema = z.enum(propertyStatuses)

// Listing tiers
export const listingTiers = ['BASIC', 'FEATURED', 'PREMIUM'] as const
export const listingTierSchema = z.enum(listingTiers)

// Furnishing types
export const furnishingTypes = ['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'] as const
export const furnishingTypeSchema = z.enum(furnishingTypes).optional().nullable()

// Project status
export const projectStatuses = ['ONGOING', 'COMPLETED', 'UPCOMING'] as const
export const projectStatusSchema = z.enum(projectStatuses)

// Inquiry status
export const inquiryStatuses = ['PENDING', 'RESPONDED', 'CLOSED'] as const
export const inquiryStatusSchema = z.enum(inquiryStatuses)

// Contact message status
export const contactMessageStatuses = ['NEW', 'READ', 'REPLIED'] as const
export const contactMessageStatusSchema = z.enum(contactMessageStatuses)

// Membership status
export const membershipStatuses = ['ACTIVE', 'EXPIRED', 'CANCELLED'] as const
export const membershipStatusSchema = z.enum(membershipStatuses)

// Transaction status
export const transactionStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const
export const transactionStatusSchema = z.enum(transactionStatuses)

// Transaction types
export const transactionTypes = ['MEMBERSHIP', 'LISTING_UPGRADE', 'FEATURED'] as const
export const transactionTypeSchema = z.enum(transactionTypes)

// Banner positions
export const bannerPositions = ['HOT_ZONE', 'PRIME_ZONE', 'FEATURED_ZONE', 'HOME_BANNER'] as const
export const bannerPositionSchema = z.enum(bannerPositions)

// Ad positions
export const adPositions = ['SIDEBAR', 'HEADER', 'FOOTER', 'INLINE'] as const
export const adPositionSchema = z.enum(adPositions)

// Priority levels
export const priorityLevels = ['LOW', 'MEDIUM', 'HIGH'] as const
export const prioritySchema = z.enum(priorityLevels)

// Alert types
export const alertTypes = ['INFO', 'WARNING', 'ERROR', 'SUCCESS'] as const
export const alertTypeSchema = z.enum(alertTypes)

// Alert placements
export const alertPlacements = ['TOP_BANNER', 'POPUP', 'SIDEBAR', 'FOOTER'] as const
export const alertPlacementSchema = z.enum(alertPlacements)

// Amenity categories
export const amenityCategories = ['BASIC', 'SOCIETY', 'ADDITIONAL'] as const
export const amenityCategorySchema = z.enum(amenityCategories)

// Default image types
export const defaultImageTypes = ['PROPERTY', 'AVATAR', 'BANNER', 'LOGO'] as const
export const defaultImageTypeSchema = z.enum(defaultImageTypes)

// Response statuses
export const responseStatuses = ['NEW', 'CONTACTED', 'SITE_VISIT', 'CONVERTED', 'CLOSED'] as const
export const responseStatusSchema = z.enum(responseStatuses)

// Request statuses
export const requestStatuses = ['PENDING', 'APPROVED', 'REJECTED'] as const
export const requestStatusSchema = z.enum(requestStatuses)

// Reminder statuses
export const reminderStatuses = ['PENDING', 'COMPLETED'] as const
export const reminderStatusSchema = z.enum(reminderStatuses)

// ========== AUTH SCHEMAS ==========

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: phoneSchema,
  userType: userTypeSchema.optional().default('INDIVIDUAL'),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// ========== USER SCHEMAS ==========

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema,
  avatar: urlSchema,
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  userType: userTypeSchema.optional(),
})

// ========== PROPERTY SCHEMAS ==========

export const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(5000).optional().nullable(),
  propertyType: propertyTypeSchema,
  listingType: listingTypeSchema,
  address: z.string().min(5).max(500),
  locality: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{5,10}$/, 'Invalid pincode').optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  bedrooms: z.number().int().min(0).max(20).optional().nullable(),
  bathrooms: z.number().int().min(0).max(20).optional().nullable(),
  balconies: z.number().int().min(0).max(10).optional().nullable(),
  floorNumber: z.number().int().min(-5).max(200).optional().nullable(),
  totalFloors: z.number().int().min(1).max(200).optional().nullable(),
  facing: z.string().max(50).optional().nullable(),
  furnishing: furnishingTypeSchema,
  builtUpArea: z.number().positive().optional().nullable(),
  carpetArea: z.number().positive().optional().nullable(),
  plotArea: z.number().positive().optional().nullable(),
  price: z.number().positive('Price must be positive'),
  pricePerSqft: z.number().positive().optional().nullable(),
  maintenance: z.number().min(0).optional().nullable(),
  securityDeposit: z.number().min(0).optional().nullable(),
  images: z.string().optional().nullable(),
  videoUrl: urlSchema,
  amenities: z.string().optional().nullable(),
  status: propertyStatusSchema.optional(),
  listingTier: listingTierSchema.optional(),
  availableFrom: z.string().datetime().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
})

export const updatePropertySchema = createPropertySchema.partial()

export const propertyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  city: z.string().optional(),
  propertyType: propertyTypeSchema.optional(),
  listingType: listingTypeSchema.optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  status: propertyStatusSchema.optional(),
  userId: z.string().cuid().optional(),
  search: z.string().optional(),
})

// ========== PROJECT SCHEMAS ==========

export const createProjectSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(5000).optional().nullable(),
  status: projectStatusSchema.optional().default('ONGOING'),
  location: z.string().min(3).max(500),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  startDate: z.string().datetime().optional().nullable(),
  completionDate: z.string().datetime().optional().nullable(),
  totalUnits: z.number().int().positive().optional().nullable(),
  availableUnits: z.number().int().min(0).optional().nullable(),
  priceRange: z.string().max(100).optional().nullable(),
  amenities: z.string().optional().nullable(),
  images: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  isPopular: z.boolean().optional().default(false),
  builderId: z.string().cuid(),
})

export const updateProjectSchema = createProjectSchema.partial()

// ========== INQUIRY SCHEMAS ==========

export const createInquirySchema = z.object({
  propertyId: z.string().cuid().optional().nullable(),
  receiverId: z.string().cuid(),
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export const updateInquirySchema = z.object({
  status: inquiryStatusSchema,
})

// ========== CONTACT SCHEMAS ==========

export const createContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().max(200).optional().nullable(),
  message: z.string().min(10).max(2000),
})

export const updateContactSchema = z.object({
  status: contactMessageStatusSchema,
})

// ========== NEWS SCHEMAS ==========

export const createNewsSchema = z.object({
  title: z.string().min(5).max(300),
  slug: slugSchema,
  content: z.string().min(50),
  excerpt: z.string().max(500).optional().nullable(),
  image: urlSchema,
  isPublished: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
})

export const updateNewsSchema = createNewsSchema.partial()

// ========== FAQ SCHEMAS ==========

export const createFaqSchema = z.object({
  question: z.string().min(10).max(500),
  answer: z.string().min(10).max(5000),
  category: z.string().max(100).optional().nullable(),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export const updateFaqSchema = createFaqSchema.partial()

// ========== CITY SCHEMAS ==========

export const createCitySchema = z.object({
  name: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  isPopular: z.boolean().optional().default(false),
  image: urlSchema,
})

export const updateCitySchema = createCitySchema.partial()

// ========== LOCALITY SCHEMAS ==========

export const createLocalitySchema = z.object({
  name: z.string().min(2).max(100),
  cityId: z.string().cuid(),
  pincode: z.string().regex(/^\d{5,10}$/).optional().nullable(),
})

export const updateLocalitySchema = createLocalitySchema.partial()

// ========== LOAN SCHEMAS ==========

export const createLoanSchema = z.object({
  bankName: z.string().min(2).max(200),
  bankLogo: urlSchema,
  interestRate: z.number().positive().max(100),
  maxAmount: z.number().positive().optional().nullable(),
  minAmount: z.number().positive().optional().nullable(),
  tenure: z.string().max(50).optional().nullable(),
  processingFee: z.string().max(100).optional().nullable(),
  features: z.string().optional().nullable(),
  link: urlSchema,
  isActive: z.boolean().optional().default(true),
})

export const updateLoanSchema = createLoanSchema.partial()

// ========== CATEGORY SCHEMAS ==========

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: slugSchema,
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
  image: urlSchema,
  parentId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
})

export const updateCategorySchema = createCategorySchema.partial()

// ========== TESTIMONIAL SCHEMAS ==========

export const createTestimonialSchema = z.object({
  name: z.string().min(2).max(100),
  designation: z.string().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  content: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5).optional().default(5),
  image: urlSchema,
  isActive: z.boolean().optional().default(true),
})

export const updateTestimonialSchema = createTestimonialSchema.partial()

// ========== EVENT SCHEMAS ==========

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  image: urlSchema,
  link: urlSchema,
  isActive: z.boolean().optional().default(true),
})

export const updateEventSchema = createEventSchema.partial()

// ========== COUNTRY SCHEMAS ==========

export const createCountrySchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().length(2).toUpperCase(),
  phoneCode: z.string().max(10).optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export const updateCountrySchema = createCountrySchema.partial()

// ========== CURRENCY SCHEMAS ==========

export const createCurrencySchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().length(3).toUpperCase(),
  symbol: z.string().min(1).max(10),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
})

export const updateCurrencySchema = createCurrencySchema.partial()

// ========== BANK DETAIL SCHEMAS ==========

export const createBankDetailSchema = z.object({
  accountName: z.string().min(2).max(200),
  accountNumber: z.string().min(5).max(50),
  bankName: z.string().min(2).max(200),
  branchName: z.string().max(200).optional().nullable(),
  ifscCode: z.string().max(20).optional().nullable(),
  swiftCode: z.string().max(20).optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export const updateBankDetailSchema = createBankDetailSchema.partial()

// ========== ADVERTISEMENT SCHEMAS ==========

export const createAdSchema = z.object({
  title: z.string().min(2).max(200),
  image: urlSchema,
  link: urlSchema,
  position: adPositionSchema,
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export const updateAdSchema = createAdSchema.partial()

// ========== BANNER SCHEMAS ==========

export const createBannerSchema = z.object({
  title: z.string().min(2).max(200),
  image: z.string().url(),
  link: urlSchema,
  position: bannerPositionSchema,
  isActive: z.boolean().optional().default(true),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
})

export const updateBannerSchema = createBannerSchema.partial()

// ========== AMENITY SCHEMAS ==========

export const createAmenitySchema = z.object({
  name: z.string().min(2).max(100),
  icon: z.string().max(100).optional().nullable(),
  category: amenityCategorySchema.optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export const updateAmenitySchema = createAmenitySchema.partial()

// ========== TRANSACTION SCHEMAS ==========

export const createTransactionSchema = z.object({
  userId: z.string().cuid(),
  type: transactionTypeSchema,
  amount: z.number().positive(),
  currency: z.string().length(3).optional().default('INR'),
  status: transactionStatusSchema.optional().default('PENDING'),
  paymentMethod: z.string().max(50).optional().nullable(),
  transactionId: z.string().max(200).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
})

export const updateTransactionSchema = z.object({
  status: transactionStatusSchema.optional(),
  paymentMethod: z.string().max(50).optional().nullable(),
  transactionId: z.string().max(200).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
})

// ========== DEFAULT IMAGE SCHEMAS ==========

export const createDefaultImageSchema = z.object({
  name: z.string().min(2).max(100),
  type: defaultImageTypeSchema,
  url: z.string().url(),
  isActive: z.boolean().optional().default(true),
})

export const updateDefaultImageSchema = createDefaultImageSchema.partial()

// ========== REMINDER SCHEMAS ==========

export const createReminderSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional().nullable(),
  dueDate: z.string().datetime(),
  priority: prioritySchema.optional().default('MEDIUM'),
  status: reminderStatusSchema.optional().default('PENDING'),
})

export const updateReminderSchema = createReminderSchema.partial()

// ========== ALERT SCHEMAS ==========

export const createAlertSchema = z.object({
  title: z.string().min(2).max(200),
  message: z.string().min(5).max(1000),
  type: alertTypeSchema.optional().default('INFO'),
  placement: alertPlacementSchema.optional().default('TOP_BANNER'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional().default(true),
})

export const updateAlertSchema = createAlertSchema.partial()

// ========== GOOGLE ADS SCHEMAS ==========

export const updateGoogleAdsSchema = z.object({
  publisherId: z.string().max(100).optional().nullable(),
  headerAdCode: z.string().max(5000).optional().nullable(),
  sidebarAdCode: z.string().max(5000).optional().nullable(),
  footerAdCode: z.string().max(5000).optional().nullable(),
  inArticleAdCode: z.string().max(5000).optional().nullable(),
  isEnabled: z.boolean().optional(),
})

// ========== PAGE SCHEMAS ==========

export const createPageSchema = z.object({
  title: z.string().min(2).max(200),
  slug: slugSchema,
  content: z.string().min(10),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
  isPublished: z.boolean().optional().default(false),
})

export const updatePageSchema = createPageSchema.partial()

// ========== MEMBERSHIP PLAN SCHEMAS ==========

export const createMembershipPlanSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional().nullable(),
  price: z.number().min(0),
  duration: z.number().int().positive(),
  featuredListings: z.number().int().min(0).optional().default(0),
  premiumListings: z.number().int().min(0).optional().default(0),
  basicListings: z.number().int().min(0).optional().default(0),
  features: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export const updateMembershipPlanSchema = createMembershipPlanSchema.partial()

// ========== NEWSLETTER SCHEMAS ==========

export const createNewsletterSchema = z.object({
  email: emailSchema,
})

// ========== REQUIREMENT SCHEMAS ==========

export const createRequirementSchema = z.object({
  requirementType: z.enum(['BUY', 'RENT']),
  propertyType: propertyTypeSchema,
  minBudget: z.number().positive().optional().nullable(),
  maxBudget: z.number().positive().optional().nullable(),
  minArea: z.number().positive().optional().nullable(),
  maxArea: z.number().positive().optional().nullable(),
  bedrooms: z.string().max(10).optional().nullable(),
  preferredLocations: z.string().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export const updateRequirementSchema = createRequirementSchema.partial()

// ========== RESPONSE SCHEMAS ==========

export const createPropertyResponseSchema = z.object({
  propertyId: z.string().cuid(),
  propertyTitle: z.string().min(3).max(200),
  propertyLocation: z.string().max(500).optional().nullable(),
  userName: z.string().min(2).max(100),
  userEmail: emailSchema,
  userPhone: phoneSchema,
  message: z.string().min(10).max(2000),
})

export const updatePropertyResponseSchema = z.object({
  status: responseStatusSchema,
})

export const createProjectResponseSchema = z.object({
  projectId: z.string().cuid(),
  projectName: z.string().min(3).max(200),
  userName: z.string().min(2).max(100),
  userEmail: emailSchema,
  userPhone: phoneSchema,
  message: z.string().min(10).max(2000),
})

export const updateProjectResponseSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']),
})

// ========== REQUEST SCHEMAS ==========

export const createUserRequestSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  userType: z.enum(['INDIVIDUAL', 'AGENT', 'BUILDER']),
  message: z.string().max(2000).optional().nullable(),
  documents: z.string().optional().nullable(),
})

export const updateUserRequestSchema = z.object({
  status: requestStatusSchema,
})

export const createMembershipRequestSchema = z.object({
  userId: z.string().cuid(),
  planId: z.string().cuid(),
  currentPlan: z.string().max(100).optional().nullable(),
  requestedPlan: z.string().min(2).max(100),
  reason: z.string().max(1000).optional().nullable(),
})

export const updateMembershipRequestSchema = z.object({
  status: requestStatusSchema,
})

// ========== SETTINGS SCHEMAS ==========

export const updateSettingsSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  description: z.string().max(500).optional().nullable(),
})

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

// ========== PROFILE SCHEMAS ==========

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema,
  avatar: urlSchema,
})

// ========== FAVORITES SCHEMAS ==========

export const createFavoriteSchema = z.object({
  propertyId: z.string().cuid(),
})

// ========== ID PARAM SCHEMA ==========

export const idParamSchema = z.object({
  id: z.string().cuid(),
})

// ========== PAGINATION SCHEMA ==========

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

// Helper function to validate request body
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: z.ZodError }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error }
    }
    throw error
  }
}

// Helper function to format Zod errors
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
}
