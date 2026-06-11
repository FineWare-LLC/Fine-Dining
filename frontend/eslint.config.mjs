import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores - migrated from .eslintignore
  {
    ignores: [
      // Dependencies
      "node_modules/",
      ".next/",
      "out/",

      // Generated files
      "src/gql/graphql.ts",
      "src/gql/gql.ts", 
      "src/gql/fragment-masking.ts",

      // Build artifacts
      "dist/",
      "build/",

      // Test artifacts
      "coverage/",
      "test-results/",
      "playwright-report/",
      ".nyc_output/",

      // Cache directories
      ".eslintcache",
      ".cache/",

      // Environment files
      ".env*",

      // Configuration files that don't need linting
      "*.config.js",
      "*.config.mjs", 
      "*.config.ts",
      "next.config.mjs",
      "tailwind.config.js",
      "postcss.config.mjs",
      "playwright.config.js",
      "playwright-ct.config.js",

      // Documentation
      "*.md",
      "*.txt",

      // Lock files
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",

      // IDE files
      ".vscode/",
      ".idea/",
      "*.swp",
      "*.swo",

      // OS files
      ".DS_Store",
      "Thumbs.db",

      // Logs
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*"
    ]
  },
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("plugin:react/recommended"),
  ...compat.extends("plugin:react-hooks/recommended"),
  ...compat.extends("plugin:jsx-a11y/recommended"),
  ...compat.extends("plugin:import/recommended"),
  {
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      // React Rules
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "warn", // Encourage prop validation
      "react/no-unused-prop-types": "warn",
      "react/no-array-index-key": "warn",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-uses-react": "off", // Not needed in Next.js
      "react/jsx-uses-vars": "error",
      "react/no-deprecated": "warn",
      "react/no-direct-mutation-state": "error",
      "react/no-unescaped-entities": "warn",
      "react/require-render-return": "error",
      "react/self-closing-comp": "warn",
      "react/jsx-boolean-value": ["warn", "never"],
      "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
      "react/jsx-fragments": ["warn", "syntax"],
      "react/jsx-no-useless-fragment": "warn",

      // React Hooks Rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Import Rules
      "import/no-anonymous-default-export": "warn",
      "import/no-unresolved": "off", // Disabled to avoid alias resolution issues
      "import/named": "error",
      "import/default": "error",
      "import/no-absolute-path": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "off", // Disabled due to alias resolver issues
      "import/no-useless-path-segments": "warn",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Accessibility Rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/no-access-key": "warn",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",


      // Security Rules - Using built-in ESLint rules for security
      "no-eval": "error", // Prevents eval() usage
      "no-implied-eval": "error", // Prevents setTimeout/setInterval with strings
      "no-new-func": "error", // Prevents Function constructor
      "no-script-url": "error", // Prevents javascript: URLs
      "no-global-assign": "error", // Prevents assignment to global variables
      "no-implicit-globals": "error", // Prevents implicit global variables

      // General Code Quality Rules
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      "arrow-spacing": "warn",
      "no-duplicate-imports": "error",
      "no-useless-rename": "warn",
      "object-shorthand": "warn",
      "prefer-destructuring": ["warn", { object: true, array: false }],
      "prefer-template": "warn",
      "template-curly-spacing": "warn",
      "no-useless-concat": "warn",
      "no-multi-spaces": "warn",
      "no-trailing-spaces": "warn",
      "comma-dangle": ["warn", "always-multiline"],
      "semi": ["warn", "always"],
      "quotes": ["warn", "single", { avoidEscape: true }],
      "indent": ["warn", 4, { SwitchCase: 1 }],
      "max-len": ["warn", { code: 100, ignoreUrls: true, ignoreStrings: true }],
      "complexity": ["warn", 10],
      "max-depth": ["warn", 4],
      "max-params": ["warn", 5],
    },
  },
  {
    // Special configuration for test files
    files: ["**/*.test.js", "**/*.test.jsx", "**/*.spec.js", "**/*.spec.jsx"],
    rules: {
      "no-console": "off",
      "max-len": "off",
      "complexity": "off",
    },
  },
  {
    // Special configuration for generated files
    files: ["src/gql/**/*.ts", "src/gql/**/*.js"],
    rules: {
      "max-len": "off",
      "complexity": "off",
      "no-unused-vars": "off",
    },
  },
  {
    // Special configuration for GPU and solver modules
    files: ["src/gpu/**/*.js", "src/gpu/**/*.mjs", "src/lib/HiGHS/**/*.js", "src/lib/HiGHS/**/*.mjs"],
    rules: {
      "complexity": "off",
      "max-params": "off",
    },
  },
];

export default eslintConfig;
