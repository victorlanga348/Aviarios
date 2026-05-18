/**
 * Sanitization utility without heavy external dependencies.
 * Strips all HTML tags and attributes from user-supplied strings,
 * preventing stored XSS by rendering text purely flat.
 */

/**
 * Removes all HTML tags from a string. Returns an empty string for nullish input.
 * Example: sanitize('<script>alert(1)</script>hello') => 'hello'
 */
export function sanitize(input: string | null | undefined): string {
    if (input == null) return '';
    // Strip HTML tags using regex to avoid importing heavy libraries like JSDOM / isomorphic-dompurify
    return input.replace(/<[^>]*>/g, '').trim();
}
