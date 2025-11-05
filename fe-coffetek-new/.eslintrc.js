module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended" // cần thêm để ESLint nhận rules TS
  ],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-empty-object-type": "off"
      }
    }
  ]
};
