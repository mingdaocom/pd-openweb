const fs = require('fs');
const path = require('path');

const PACK_DIRS = ['build/dist/pack', 'build/dist/single/pack', 'build/dist/singleExtractModules/pack'];

function parseObjectEntries(objectCode) {
  const entries = new Map();
  const entryReg = /(\d+)\s*:\s*["']([^"']+)["']/g;
  let entryMatch;

  while ((entryMatch = entryReg.exec(objectCode))) {
    entries.set(entryMatch[1], entryMatch[2]);
  }

  return entries;
}

function parseJsFilenameMaps(runtimeCode) {
  const maps = [];
  const reg =
    /\.u\s*=\s*([a-zA-Z_$][\w$]*)\s*=>\s*([\s\S]*?)(?=,\s*[a-zA-Z_$][\w$]*\.[a-zA-Z_$][\w$]*\s*=|,\s*\(\(\)\s*=>|;)/g;
  let match;

  while ((match = reg.exec(runtimeCode))) {
    const entries = new Map();
    const variableName = match[1];
    const expression = match[2];
    const conditionReg = new RegExp(`${variableName}===([0-9]+)\\?["']([^"']+\\.js)["']`, 'g');
    const hashMapReg = new RegExp(
      `\\(\\{([\\s\\S]*?)\\}\\[${variableName}\\]\\|\\|${variableName}\\)\\s*\\+\\s*["']\\.["']\\s*\\+\\s*\\{([\\s\\S]*?)\\}\\[${variableName}\\]\\s*\\+\\s*["']\\.chunk\\.js["']`,
    );
    let conditionMatch;

    while ((conditionMatch = conditionReg.exec(expression))) {
      entries.set(conditionMatch[1], conditionMatch[2]);
    }

    const hashMapMatch = expression.match(hashMapReg);

    if (hashMapMatch) {
      const nameMap = parseObjectEntries(hashMapMatch[1]);
      const hashMap = parseObjectEntries(hashMapMatch[2]);

      hashMap.forEach((chunkHash, chunkId) => {
        entries.set(chunkId, `${nameMap.get(chunkId) || chunkId}.${chunkHash}.chunk.js`);
      });
    }

    maps.push(entries);
  }

  return maps;
}

function parseCssFilenameMap(runtimeCode) {
  const maps = [];
  const reg = /\.miniCssF\s*=\s*([a-zA-Z_$][\w$]*)\s*=>\s*["']{2}\s*\+\s*\{([\s\S]*?)\}\[\1\]\s*\+\s*["']\.css["']/g;
  let match;

  while ((match = reg.exec(runtimeCode))) {
    const entries = parseObjectEntries(match[2]);

    maps.push(new Map([...entries].map(([chunkId, cssHash]) => [chunkId, `${cssHash}.css`])));
  }

  return maps;
}

function parseCssChunkMap(runtimeCode) {
  const maps = [];
  const reg = /\.f\.miniCss\s*=\s*\([^)]*\)\s*=>\s*\{\s*var\s+[a-zA-Z_$][\w$]*\s*=\s*\{([\s\S]*?)\}/g;
  let match;

  while ((match = reg.exec(runtimeCode))) {
    const chunkIds = new Set();
    const entryReg = /(\d+)\s*:\s*1/g;
    let entryMatch;

    while ((entryMatch = entryReg.exec(match[1]))) {
      chunkIds.add(entryMatch[1]);
    }

    maps.push(chunkIds);
  }

  return maps;
}

function mergeFilenameMaps(maps, runtimePath, assetType, duplicateMappings) {
  const merged = new Map();

  maps.forEach(map => {
    map.forEach((assetFile, chunkId) => {
      const existing = merged.get(chunkId);

      if (existing && existing !== assetFile) {
        duplicateMappings.push(`${runtimePath}: ${assetType} chunk ${chunkId} -> ${existing}, ${assetFile}`);
      }

      merged.set(chunkId, assetFile);
    });
  });

  return merged;
}

function mergeChunkMaps(maps) {
  const merged = new Set();

  maps.forEach(map => {
    map.forEach(chunkId => merged.add(chunkId));
  });

  return merged;
}

function verifyRuntime(runtimePath) {
  const runtimeCode = fs.readFileSync(runtimePath, 'utf8');
  const packDir = path.dirname(runtimePath);
  const jsFilenameMaps = parseJsFilenameMaps(runtimeCode);
  const cssFilenameMaps = parseCssFilenameMap(runtimeCode);
  const cssChunkMaps = parseCssChunkMap(runtimeCode);
  const duplicateMappings = [];
  const missingJsFiles = [];
  const missingMappings = [];
  const missingCssFiles = [];
  const jsFilenameMap = mergeFilenameMaps(jsFilenameMaps, runtimePath, 'js', duplicateMappings);
  const cssFilenameMap = mergeFilenameMaps(cssFilenameMaps, runtimePath, 'css', duplicateMappings);
  const cssChunkMap = mergeChunkMaps(cssChunkMaps);

  jsFilenameMap.forEach((jsFile, chunkId) => {
    const jsPath = path.join(packDir, jsFile);

    if (!fs.existsSync(jsPath)) {
      missingJsFiles.push(`${runtimePath}: chunk ${chunkId} -> ${jsFile}`);
    }
  });

  if (cssChunkMap.size && !cssFilenameMap.size) {
    missingMappings.push(`${runtimePath}: found css chunk markers but no miniCssF filename map`);
  }

  cssFilenameMap.forEach((cssFile, chunkId) => {
    const cssPath = path.join(packDir, cssFile);

    if (!fs.existsSync(cssPath)) {
      missingCssFiles.push(`${runtimePath}: chunk ${chunkId} -> ${cssFile}`);
    }
  });

  cssChunkMap.forEach(chunkId => {
    if (!cssFilenameMap.has(chunkId)) {
      missingMappings.push(`${runtimePath}: chunk ${chunkId} is marked as css chunk but has no miniCssF mapping`);
    }
  });

  return {
    jsChunkCount: jsFilenameMap.size,
    cssChunkCount: cssChunkMap.size,
    duplicateMappings,
    missingJsFiles,
    missingMappings,
    missingCssFiles,
  };
}

function getRuntimeFiles(packDir) {
  if (!fs.existsSync(packDir)) return [];

  return fs
    .readdirSync(packDir)
    .filter(file => /^runtime\..*\.entry\.js$/.test(file))
    .map(file => path.join(packDir, file));
}

function main() {
  const rootPath = process.cwd();
  const packDirs = PACK_DIRS.map(dir => path.resolve(rootPath, dir));
  const missingPackDirs = packDirs.filter(packDir => !fs.existsSync(packDir));
  const runtimeFiles = packDirs.flatMap(getRuntimeFiles);
  const errors = [];
  let jsChunkCount = 0;
  let cssChunkCount = 0;

  missingPackDirs.forEach(packDir => {
    errors.push(`Missing webpack pack directory: ${packDir}`);
  });

  if (!runtimeFiles.length) {
    errors.push('No webpack runtime entry files found');
  }

  runtimeFiles.forEach(runtimePath => {
    const result = verifyRuntime(runtimePath);

    jsChunkCount += result.jsChunkCount;
    cssChunkCount += result.cssChunkCount;
    errors.push(
      ...result.duplicateMappings,
      ...result.missingJsFiles,
      ...result.missingMappings,
      ...result.missingCssFiles,
    );
  });

  if (errors.length) {
    console.error('Webpack runtime assets verification failed:');
    errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(
    `Webpack runtime assets verified: ${jsChunkCount} js chunks, ${cssChunkCount} css chunks in ${runtimeFiles.length} runtime files`,
  );
}

main();
