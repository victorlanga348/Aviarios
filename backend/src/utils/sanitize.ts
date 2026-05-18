/**
 * Sanitization utility using DOMPurify (isomorphic — works in Node.js).
 * Strips all HTML tags and attributes from user-supplied strings,
 * preventing stored XSS if data is ever rendered via non-React means.
 */
import DOMPurify from 'isomorphic-dompurify';

/**
 * Removes all HTML tags from a string. Returns an empty string for nullish input.
 * Example: sanitize('<script>alert(1)</script>hello') => 'hello'
 */
export function sanitize(input: string | null | undefined): string {
    if (input == null) return '';
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}
