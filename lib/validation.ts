// filepath: lib/validation.ts

/**
 * Validates an email address format
 * @param email - The email string to validate
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const trimmed = email.trim();
  if (trimmed.length === 0) return false;
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(trimmed);
}

/**
 * Validates OTP format (6-digit numeric)
 * @param otp - The OTP string to validate
 * @returns true if valid, false otherwise
 */
export function validateOTP(otp: string): boolean {
  if (!otp || typeof otp !== 'string') return false;
  
  // Must be exactly 6 digits
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
}

/**
 * Validates a name (minimum 2 characters)
 * @param name - The name string to validate
 * @returns true if valid, false otherwise
 */
export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  
  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z][a-zA-Z\s\-']*$/;
  return nameRegex.test(trimmed);
}

/**
 * Validates age (must be between 13 and 120)
 * @param age - The age number to validate
 * @returns true if valid, false otherwise
 */
export function validateAge(age: number): boolean {
  return typeof age === 'number' && age >= 13 && age <= 120;
}

/**
 * Validates phone number format
 * @param phone - The phone string to validate
 * @returns true if valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove spaces and dashes for validation
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // International format: + followed by 10-15 digits
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(cleaned);
}