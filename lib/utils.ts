import { NextResponse } from 'next/server';

/**
 * Creates a successful API response
 * @param data - The data to return
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with success format
 */
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

/**
 * Creates an error API response
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @param code - Optional error code
 * @returns NextResponse with error format
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string
) {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      ...(code && { code })
    },
    { status }
  );
}

/**
 * Type guard to check if value is a non-empty string
 * @param value - Value to check
 * @returns True if value is a non-empty string
 */
export function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if value is an array of non-empty strings
 * @param value - Value to check
 * @returns True if value is an array of non-empty strings
 */
export function isValidStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isValidString);
}

