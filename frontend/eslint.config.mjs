import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("plugin:react/recommended"),
  ...compat.extends("plugin:react-hooks/recommended"),
  ...compat.extends("plugin:jsx-a11y/recommended"),
  ...compat.extends("plugin:import/recommended"),
  ...compat.extends("plugin:security/recommended"),
  {
    plugins: ["react", "react-hooks", "jsx-a11y", "import", "security"],
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
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/no-absolute-path": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "warn",
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

      // Security Rules
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",

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
      "indent": ["warn", 2, { SwitchCase: 1 }],
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
      "import/no-anonymous-default-export": "off",
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
      "security/detect-object-injection": "off",
    },
  },
];

export default eslintConfig;
