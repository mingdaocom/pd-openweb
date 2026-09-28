const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export const DEFAULT_VERSION = '0.0.1';
export const INITIAL_VERSION_BASE = '0.0.0';

export const normalizeVersion = value => String(value || '').replace(/^v/, '');

export const formatVersion = value => {
  const version = normalizeVersion(value);

  return version ? `v${version}` : '';
};

export const parseVersion = value => {
  const parts = normalizeVersion(value).split('.');

  return [parts[0] || '0', parts[1] || '0', parts[2] || '0'];
};

export const isVersionComplete = version => VERSION_PATTERN.test(normalizeVersion(version));

export const compareVersions = (version, targetVersion) => {
  const versionParts = parseVersion(version).map(Number);
  const targetParts = parseVersion(targetVersion).map(Number);

  for (let index = 0; index < versionParts.length; index += 1) {
    if (versionParts[index] > targetParts[index]) return 1;
    if (versionParts[index] < targetParts[index]) return -1;
  }

  return 0;
};

export const isVersionGreaterThan = (version, targetVersion) =>
  isVersionComplete(version) && isVersionComplete(targetVersion) && compareVersions(version, targetVersion) > 0;

/** 生成当前版本的下一个修订版本，例如 0.0.2 -> 0.0.3。 */
export const getNextPatchVersion = version => {
  if (!isVersionComplete(version)) return DEFAULT_VERSION;

  const [major, minor, patch] = parseVersion(version).map(Number);

  return `${major}.${minor}.${patch + 1}`;
};

/**
 * 根据最新历史版本生成发布表单的版本初值和严格下限。
 * 无历史版本时默认 0.0.1，且必须高于 0.0.0。
 */
export const getReleaseVersionDefaults = latestVersionNo => {
  const minimumVersion = normalizeVersion(latestVersionNo);
  const hasHistoryVersion = isVersionComplete(minimumVersion);

  return {
    version: hasHistoryVersion ? getNextPatchVersion(minimumVersion) : DEFAULT_VERSION,
    minimumVersion: hasHistoryVersion ? minimumVersion : INITIAL_VERSION_BASE,
  };
};
