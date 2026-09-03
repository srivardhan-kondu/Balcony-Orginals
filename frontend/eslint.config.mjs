import next from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

/* ---------------------------------------------------------------------------
   The plugins wired up directly rather than through `eslint-config-next`.

   That preset pulls in `typescript-eslint`, which refuses to load without the
   TypeScript compiler installed — and there is not a `.ts` file in this tree.
   Adding a compiler so a linter can decline to lint it is the wrong trade.

   What is switched on here is what craco enforced before the move, plus the one
   thing that is genuinely new:

     react-hooks   at the settings it already had. Unchanged.
     @next/next    the App Router mistakes that are invisible until production —
                   a raw <a> where a <Link> belongs, a <head> element in the
                   wrong place, a sync script blocking the document.
     jsx-a11y      as warnings. The rule set was never enforced here and this is
                   not the change to start failing a build over, but the site
                   plainly cares about this (focus traps, 44px targets,
                   aria-hidden on every decoration) so the findings are worth
                   seeing rather than hiding.

   `react/recommended` is deliberately absent. Its complaints on this codebase
   are `no-unescaped-entities` firing on ordinary apostrophes in English prose,
   which is noise, not a defect.
   --------------------------------------------------------------------------- */
export default [
  { ignores: [".next/**", "node_modules/**", "build/**", "out/**"] },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "@next/next": next, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      // Every jsx-a11y rule, demoted to a warning.
      ...Object.fromEntries(
        Object.keys(jsxA11y.configs.recommended.rules).map((rule) => [rule, "warn"])
      ),
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      /* The stills go through the hand-built width ladder in lib/images.js, and
         `next/image` is switched off in next.config.js so the two pipelines do
         not overlap. A standing warning about a decision already made and
         documented is just something to learn to scroll past. */
      "@next/next/no-img-element": "off",
    },
  },
];
