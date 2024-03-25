module.exports = {
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
    release: false,
  },
};
