module.exports = {
  plugins: {
    '@release-it/conventional-changelog': {
      ignoreRecommendedBump: true,
      preset: {
        name: 'angular',
      },
    },
  },
  git: {
    push: true,
    requireCommits: true,
    requireCommitsFail: false,
    commitMessage: 'Release ${name}@${version}',
  },
  github: {
    release: true,
    releaseName: '${name}@${version}',
  },
  hooks: {
    'before:init': 'turbo build',
  },
};
