import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  loginSchema,
  createPropertySchema,
  createInquirySchema,
  createContactSchema,
  updateUserSchema,
  emailSchema,
  phoneSchema,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid emails', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true)
      expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false)
      expect(emailSchema.safeParse('test@').success).toBe(false)
      expect(emailSchema.safeParse('@domain.com').success).toBe(false)
    })
  })

  describe('phoneSchema', () => {
    it('should accept valid phone numbers', () => {
      expect(phoneSchema.safeParse('1234567890').success).toBe(true)
      expect(phoneSchema.safeParse('+1-234-567-8900').success).toBe(true)
      expect(phoneSchema.safeParse('+91 98765 43210').success).toBe(true)
    })

    it('should accept null/undefined as optional', () => {
      expect(phoneSchema.safeParse(null).success).toBe(true)
      expect(phoneSchema.safeParse(undefined).success).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(phoneSchema.safeParse('123').success).toBe(false)
      expect(phoneSchema.safeParse('abc').success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept registration with optional fields', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890',
        userType: 'AGENT' as const,
      }
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject short password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password')
      }
    })

    it('should reject short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid userType', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        userType: 'INVALID',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'anypassword',
      }
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: '',
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createPropertySchema', () => {
    const validProperty = {
      title: 'Beautiful 3BHK Apartment',
      propertyType: 'APARTMENT' as const,
      listingType: 'SELL' as const,
      address: '123 Main Street',
      locality: 'Downtown',
      city: 'Mumbai',
      state: 'Maharashtra',
      price: 5000000,
    }

    it('should accept valid property data', () => {
      const result = createPropertySchema.safeParse(validProperty)
      expect(result.success).toBe(true)
    })

    it('should accept property with all optional fields', () => {
      const fullProperty = {
        ...validProperty,
        description: 'A beautiful apartment with great views',
        bedrooms: 3,
        bathrooms: 2,
        builtUpArea: 1200,
        carpetArea: 1000,
        furnishing: 'FURNISHED' as const,
        pincode: '400001',
      }
      const result = createPropertySchema.safeParse(fullProperty)
      expect(result.success).toBe(true)
    })

    it('should reject invalid propertyType', () => {
      const invalid = { ...validProperty, propertyType: 'INVALID' }
      const result = createPropertySchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject negative price', () => {
      const invalid = { ...validProperty, price: -1000 }
      const result = createPropertySchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject short title', () => {
      const invalid = { ...validProperty, title: 'Hi' }
      const result = createPropertySchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('createInquirySchema', () => {
    const validInquiry = {
      receiverId: 'clxyz123456789abcdefgh',
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'I am interested in this property.',
    }

    it('should accept valid inquiry data', () => {
      const result = createInquirySchema.safeParse(validInquiry)
      expect(result.success).toBe(true)
    })

    it('should accept inquiry with optional propertyId', () => {
      const inquiry = {
        ...validInquiry,
        propertyId: 'clxyz987654321hijklmno',
        phone: '+1234567890',
      }
      const result = createInquirySchema.safeParse(inquiry)
      expect(result.success).toBe(true)
    })

    it('should reject short message', () => {
      const invalid = { ...validInquiry, message: 'Hi' }
      const result = createInquirySchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject invalid email', () => {
      const invalid = { ...validInquiry, email: 'invalid-email' }
      const result = createInquirySchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('createContactSchema', () => {
    const validContact = {
      name: 'John Smith',
      email: 'john@example.com',
      message: 'I have a question about your services.',
    }

    it('should accept valid contact data', () => {
      const result = createContactSchema.safeParse(validContact)
      expect(result.success).toBe(true)
    })

    it('should accept contact with optional fields', () => {
      const contact = {
        ...validContact,
        phone: '+1234567890',
        subject: 'General Inquiry',
      }
      const result = createContactSchema.safeParse(contact)
      expect(result.success).toBe(true)
    })

    it('should reject short message', () => {
      const invalid = { ...validContact, message: 'Hi' }
      const result = createContactSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('updateUserSchema', () => {
    it('should accept partial update data', () => {
      const result = updateUserSchema.safeParse({ name: 'New Name' })
      expect(result.success).toBe(true)
    })

    it('should accept multiple fields', () => {
      const result = updateUserSchema.safeParse({
        name: 'New Name',
        phone: '+1234567890',
        isActive: true,
      })
      expect(result.success).toBe(true)
    })

    it('should accept empty object (no updates)', () => {
      const result = updateUserSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })
})
