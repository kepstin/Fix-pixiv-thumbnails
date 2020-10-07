module.exports = {
  env: {
    browser: true,
    es2017: true
  },
  extends: [
    'standard'
  ],
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }]
  }
}
