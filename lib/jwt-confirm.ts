import jwt from "jsonwebtoken"

export interface ConfirmationTokenPayload {
  user_id: string
  email: string
  type: "email_confirmation"
  iat?: number
  exp?: number
}

/**
 * Generate a signed JWT for email confirmation.
 * Token is valid for 24 hours.
 */
export function generateConfirmToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET environment variable is not set")

  return jwt.sign(
    { user_id: userId, email, type: "email_confirmation" },
    secret,
    { expiresIn: "24h" }
  )
}

/**
 * Verify and decode a JWT email confirmation token.
 * Throws if the token is invalid or expired.
 */
export function verifyConfirmToken(token: string): ConfirmationTokenPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET environment variable is not set")

  return jwt.verify(token, secret) as ConfirmationTokenPayload
}
