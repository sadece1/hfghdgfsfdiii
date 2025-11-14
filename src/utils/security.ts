import DOMPurify from 'dompurify';
import validator from 'validator';

// Frontend Security Utilities
export class SecurityUtils {
  // Input sanitization
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  // HTML sanitization with allowed tags
  static sanitizeHTML(input: string, allowedTags: string[] = []): string {
    if (typeof input !== 'string') return input;
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'title']
    });
  }

  // Escape HTML entities
  static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Validate email
  static validateEmail(email: string): boolean {
    return validator.isEmail(email) && email.length <= 254;
  }

  // Validate password strength
  static validatePassword(password: string): { isValid: boolean; message?: string } {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!hasUpperCase) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!hasLowerCase) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!hasNumbers) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    if (!hasSpecialChar) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }
    
    return { isValid: true };
  }

  // Validate username
  static validateUsername(username: string): { isValid: boolean; message?: string } {
    if (username.length < 3 || username.length > 30) {
      return { isValid: false, message: 'Username must be between 3 and 30 characters' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    
    return { isValid: true };
  }

  // Validate phone number
  static validatePhone(phone: string): boolean {
    return validator.isMobilePhone(phone);
  }

  // Check for malicious patterns
  static detectMaliciousPatterns(input: string): boolean {
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text\/html/i,
      /base64/i,
      /document\.cookie/i,
      /window\.location/i,
      /alert\s*\(/i,
      /confirm\s*\(/i,
      /prompt\s*\(/i
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(input));
  }

  // Validate file type
  static validateFileType(filename: string, allowedTypes: string[] = ['jpg', 'jpeg', 'png', 'gif', 'webp']): boolean {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? allowedTypes.includes(ext) : false;
  }

  // Validate file size
  static validateFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // Generate secure random string
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const crypto = window.crypto || (window as any).msCrypto;
    
    if (crypto && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback for older browsers
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    return result;
  }

  // Rate limiting (client-side)
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  
  static checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
      const now = Date.now();
    
    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    const limit = this.rateLimitMap.get(key)!;
    
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
        return true;
      }

    if (limit.count >= maxRequests) {
        return false;
      }

    limit.count++;
      return true;
  }

  // CSRF token generation
  static generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, expectedToken: string): boolean {
    return token === expectedToken && token.length === 64;
  }

  // Secure localStorage operations
  static secureSetItem(key: string, value: string): void {
    try {
      const encryptedValue = btoa(value); // Base64 encoding
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Failed to store item securely:', error);
    }
  }

  static secureGetItem(key: string): string | null {
    try {
      const encryptedValue = localStorage.getItem(key);
      return encryptedValue ? atob(encryptedValue) : null;
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  }

  static secureRemoveItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item securely:', error);
    }
  }

  // Input validation for forms
  static validateFormInput(input: any, rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    type?: 'email' | 'phone' | 'url' | 'number';
    custom?: (value: any) => { isValid: boolean; message?: string };
  }): { isValid: boolean; message?: string } {
    const value = String(input || '');

    if (rules.required && !value.trim()) {
      return { isValid: false, message: 'This field is required' };
    }

    if (rules.minLength && value.length < rules.minLength) {
      return { isValid: false, message: `Minimum length is ${rules.minLength} characters` };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return { isValid: false, message: `Maximum length is ${rules.maxLength} characters` };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return { isValid: false, message: 'Invalid format' };
    }

    if (rules.type === 'email' && !this.validateEmail(value)) {
      return { isValid: false, message: 'Invalid email address' };
    }

    if (rules.type === 'phone' && !this.validatePhone(value)) {
      return { isValid: false, message: 'Invalid phone number' };
    }

    if (rules.type === 'url' && !validator.isURL(value)) {
      return { isValid: false, message: 'Invalid URL' };
    }

    if (rules.type === 'number' && !validator.isNumeric(value)) {
      return { isValid: false, message: 'Invalid number' };
    }

    if (rules.custom) {
      const customResult = rules.custom(value);
      if (!customResult.isValid) {
        return customResult;
      }
    }

    return { isValid: true };
  }

  // Content Security Policy helpers
  static createCSPNonce(): string {
    return this.generateSecureToken(16);
  }

  // XSS prevention for user-generated content
  static safeRenderContent(content: string): string {
    if (this.detectMaliciousPatterns(content)) {
      return 'Content blocked for security reasons';
    }
    return this.sanitizeHTML(content, ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li']);
  }
}

// Security constants
export const SECURITY_CONSTANTS = {
  MAX_FILE_SIZE_MB: 5,
  MAX_IMAGE_SIZE_MB: 2,
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  ALLOWED_DOCUMENT_TYPES: ['pdf', 'doc', 'docx', 'txt'],
  MAX_INPUT_LENGTH: 1000,
  MAX_DESCRIPTION_LENGTH: 5000,
  RATE_LIMIT_WINDOW_MS: 60000,
  MAX_REQUESTS_PER_WINDOW: 10
};

// Security hooks for React components
export const useSecurity = () => {
  const sanitizeInput = SecurityUtils.sanitizeInput;
  const validateEmail = SecurityUtils.validateEmail;
  const validatePassword = SecurityUtils.validatePassword;
  const validateUsername = SecurityUtils.validateUsername;
  const detectMaliciousPatterns = SecurityUtils.detectMaliciousPatterns;
  const checkRateLimit = SecurityUtils.checkRateLimit;

  return {
    sanitizeInput,
    validateEmail,
    validatePassword,
    validateUsername,
    detectMaliciousPatterns,
    checkRateLimit,
    constants: SECURITY_CONSTANTS
  };
};