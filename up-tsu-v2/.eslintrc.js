/* eslint-env node */

// These rules override the configurations in the app.
// Use --skip-eslint-extra or set SKIP_ESLINT_EXRA=1 to ignore this.
// See https://eslint.org/docs/user-guide/configuring
module.exports = {
  parserOptions: {
    // Parse with latest JavaScript version
    ecmaVersion: "latest",
  },
  // Add all global variables in the browser, as well as $/jQuery.
  // This handles the most common use of JavaScript in projects.
  env: {
    browser: true,
    jquery: true,
  },
  globals: {
    _: true, // underscore.js
    d3: true, // d3.js
    vg: true, // vega.js
    L: true, // leaflet.js
    ga: true, // Google analytics
    g1: true, // g1.min.js
    topojson: true, // topojson.js
    moment: true, // moment.js
    numeral: true, // numeral.js
    assert: true, // chai.js
  },

  // Check JS inside HTML files. Strips Tornado templates {{ ... }}, {% ... %}, etc
  plugins: ["html", "template"],
  // Use eslint recommended rules by default
  extends: "eslint:recommended",
  // Issue a warning when JS functions are too complex
  rules: {
    complexity: ["warn", { max: 10 }],
  },
};
