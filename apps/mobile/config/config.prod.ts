/**
 * These are configuration settings for the production environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  API_URL: process.env.EXPO_PUBLIC_API_URL,
  BACKEND_API_KEY: process.env.EXPO_PUBLIC_BACKEND_API_KEY,
  BACKEND_API_URL: process.env.EXPO_PUBLIC_BACKEND_API_URL,
}
