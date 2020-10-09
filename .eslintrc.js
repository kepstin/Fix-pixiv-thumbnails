module.exports = {
  env: {
    browser: true,
    es2017: true
  },
  extends: [
    'standard'
  ],
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    'max-len': ['error', { code: 128 }]
  }
}
