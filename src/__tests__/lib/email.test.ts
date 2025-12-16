import { describe, it, expect, vi, beforeEach } from 'vitest'
import { emailTemplates } from '@/lib/email'

describe('Email Templates', () => {
  describe('welcome template', () => {
    it('should generate welcome email with user name', () => {
      const template = emailTemplates.welcome('John Doe')

      expect(template.subject).toBe('Welcome to PropEstate!')
      expect(template.html).toContain('John Doe')
      expect(template.html).toContain('Welcome to PropEstate')
      expect(template.text).toContain('John Doe')
    })
  })

  describe('inquiryReceived template', () => {
    it('should generate inquiry email with all details', () => {
      const template = emailTemplates.inquiryReceived(
        'Agent Smith',
        'John Buyer',
        'john@example.com',
        '+1234567890',
        'I am interested in this property',
        '3BHK Apartment in Mumbai'
      )

      expect(template.subject).toContain('3BHK Apartment in Mumbai')
      expect(template.html).toContain('Agent Smith')
      expect(template.html).toContain('John Buyer')
      expect(template.html).toContain('john@example.com')
      expect(template.html).toContain('+1234567890')
      expect(template.html).toContain('I am interested in this property')
    })

    it('should work without phone number', () => {
      const template = emailTemplates.inquiryReceived(
        'Agent Smith',
        'John Buyer',
        'john@example.com',
        null,
        'I am interested'
      )

      expect(template.html).not.toContain('Phone')
    })
  })

  describe('contactFormSubmission template', () => {
    it('should generate contact form email', () => {
      const template = emailTemplates.contactFormSubmission(
        'Jane Doe',
        'jane@example.com',
        '+0987654321',
        'General Inquiry',
        'I have a question about your services'
      )

      expect(template.subject).toContain('General Inquiry')
      expect(template.html).toContain('Jane Doe')
      expect(template.html).toContain('jane@example.com')
      expect(template.html).toContain('I have a question')
    })
  })

  describe('passwordReset template', () => {
    it('should generate password reset email with link', () => {
      const resetLink = 'https://propestate.com/reset?token=abc123'
      const template = emailTemplates.passwordReset('John Doe', resetLink)

      expect(template.subject).toContain('Reset Your Password')
      expect(template.html).toContain(resetLink)
      expect(template.html).toContain('John Doe')
      expect(template.text).toContain(resetLink)
    })
  })

  describe('newsletter template', () => {
    it('should generate newsletter email', () => {
      const template = emailTemplates.newsletter(
        'New Properties This Week',
        '<p>Check out our latest listings!</p>'
      )

      expect(template.subject).toContain('New Properties This Week')
      expect(template.html).toContain('Check out our latest listings!')
    })
  })

  describe('propertyApproved template', () => {
    it('should generate property approval email', () => {
      const template = emailTemplates.propertyApproved(
        'John Owner',
        'Luxury Villa in Goa'
      )

      expect(template.subject).toContain('Luxury Villa in Goa')
      expect(template.subject).toContain('Approved')
      expect(template.html).toContain('John Owner')
      expect(template.html).toContain('Luxury Villa in Goa')
    })
  })
})
