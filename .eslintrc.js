module.exports = {
  env: {
    node: true
  },
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    "camelcase": "warn",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}