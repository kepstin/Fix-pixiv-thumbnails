module.exports = {
  env: {
    browser: true,
    es2017: true,
    greasemonkey: true
  },
  extends: [
    'standard'
  ],
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    'max-len': ['error', { code: 128 }],
    camelcase: ['error', { allow: ['^GM_'] }]
  }
}
