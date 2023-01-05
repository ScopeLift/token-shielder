module.exports = {
  overrides: [
    {
      files: ["**/*.js", "**/*.ts", "**/*.tsx", "**/*.jsx"],
      options: {
        bracketSpacing: true,
        trailingComma: "es5",
        tabWidth: 2,
        printWidth: 100,
        singleQuote: true,
        semi: true,
        // @trivago/prettier-plugin-sort-imports options
        importOrder: [
          "^react(.*)",
          "next/(.*)",
          "<THIRD_PARTY_MODULES>",
          "@/(.*)",
          "^[./]",
        ],
        importOrderSortSpecifiers: true,
      },
    },
  ],
};
