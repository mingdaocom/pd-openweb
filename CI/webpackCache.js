const childProcess = require('child_process');
const path = require('path');

function normalizeCacheKey(value) {
  return String(value || 'local')
    .replace(/^refs[\\/]heads[\\/]/, '')
    .replace(/^refs[\\/]remotes[\\/]/, '')
    .replace(/^origin[\\/]/, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .slice(0, 120);
}

function getGitValue(rootPath, command) {
  try {
    return childProcess
      .execSync(command, { cwd: rootPath, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

function getWebpackCacheBranch(rootPath) {
  const envBranch = process.env.GIT_BRANCH;

  if (envBranch) {
    return normalizeCacheKey(envBranch);
  }

  const gitBranch = getGitValue(rootPath, 'git rev-parse --abbrev-ref HEAD');

  if (gitBranch && gitBranch !== 'HEAD') {
    return normalizeCacheKey(gitBranch);
  }

  const gitCommit = getGitValue(rootPath, 'git rev-parse --short HEAD');
  return normalizeCacheKey(gitCommit ? `detached-${gitCommit}` : 'local');
}

function getWebpackCacheDirectory(rootPath) {
  return path.resolve(rootPath, 'node_modules/.cache/webpack', getWebpackCacheBranch(rootPath));
}

function getWebpackCacheName(rootPath, parts) {
  return ['mdpublic', getWebpackCacheBranch(rootPath)].concat(parts).filter(Boolean).join('-');
}

module.exports = {
  getWebpackCacheBranch,
  getWebpackCacheDirectory,
  getWebpackCacheName,
};
