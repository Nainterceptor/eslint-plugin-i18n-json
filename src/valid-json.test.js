const rule = require('./valid-json');
const {
  RuleTester,
} = require('eslint');

const ruleTester = new RuleTester();

jest.mock('./json-linter-error.js', () => () => {
  throw new SyntaxError('line 5: invalid json syntax');
}, {
  virtual: true,
});

jest.mock('./json-linter-pass.js', () => () => ({}), {
  virtual: true,
});

jest.mock('chalk', () => ({
  bold: {
    red: jest.fn(str => str),
  },
}));

ruleTester.run('valid-json', rule, {
  valid: [
    {
      code: `
      /*{
          "translationKeyA": "translation value a",
          "translationKeyB": "translation value b"
      }*/
      `,
      options: [],
    },
    // supports a custom linter
    {
      code: `
        /*{}*/
      `,
      options: [
        {
          linter: './json-linter-pass.js',
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
      /*{
          "translationKeyA": "translation value a"
          "translationKeyB: "translation value b"
      }*/
      `,
      options: [],
      errors: [
        {
          message: /\nInvalid JSON\.\n\n.*/,
          line: 2,
          col: 0,
        },
      ],
    },
    {
      code: `
      /**/
      `,
      options: [],
      errors: [
        {
          message: /\nInvalid JSON\.\n\n.*/,
          line: 1,
          col: 0,
        },
      ],
    },
    // supports a custom linter
    {
      code: `
        /*{*/
      `,
      options: [
        {
          linter: './json-linter-error.js',
        },
      ],
      errors: [
        {
          message: /\nInvalid JSON\.\n\n.*/,
          line: 5,
          col: 0,
        },
      ],
    },
    // parser must return a plain object
    {
      code: `
        /*"SOME_VALID_JSON"*/
      `,
      options: [],
      errors: [
        {
          message: /\nInvalid JSON\.\n\n.*SyntaxError: Translation file must be a JSON object\./,
          line: 0,
          col: 0,
        },
      ],
    },
  ],
});
