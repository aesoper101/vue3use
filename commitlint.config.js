/*eslint-disable*/

// Docs: https://github.com/conventional-changelog/commitlint/#what-is-commitlint
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'enhance',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
};
