export default {
  rules: {
    "block-no-empty": true,
    "color-no-invalid-hex": true,
    "comment-no-empty": true,
    "declaration-block-no-duplicate-properties": true,
    "declaration-block-no-shorthand-property-overrides": true,
    "font-family-no-duplicate-names": true,
    "function-calc-no-unspaced-operator": true,
    "media-feature-name-no-unknown": true,
    "no-duplicate-at-import-rules": true,
    "no-duplicate-selectors": true,
    "no-invalid-double-slash-comments": true,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["where"]
      }
    ],
    "selector-pseudo-element-no-unknown": true,
    "unit-no-unknown": [
      true,
      {
        ignoreUnits: ["svh"]
      }
    ]
  }
};
