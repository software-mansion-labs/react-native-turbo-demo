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
    requireUpstream: false,
    commitMessage: 'Release ${name}@${version}',
    tagName: '${npm.name}@${version}',
    pushArgs: ['--follow-tags', '--force'],
  },
  github: {
    release: true,
    releaseName: '${name}@${version}',
  },
  hooks: {
    'before:init': 'git checkout -B next && turbo build',
    'after:release':
      'gh pr create --body "Release new version of the library." -w && git checkout main',
  },
};
