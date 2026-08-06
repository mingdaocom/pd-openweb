const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT_PATH, print, runCommand } = require('./utils');

const API_ZIP_TARGETS = {
  report: {
    url: process.env.REPORT_API_DOC_URL || 'http://118.24.27.163:28086/v/api-docs?group=report',
    outputDir: path.join(ROOT_PATH, 'src/pages/Statistics/api'),
  },
  workflow: {
    url: process.env.WORKFLOW_API_DOC_URL || 'http://118.24.27.163:28085/v/api-docs?group=workflow%20all',
    outputDir: path.join(ROOT_PATH, 'src/pages/workflow/apiV2'),
  },
};

async function main() {
  const targetName = process.argv[2];
  const target = API_ZIP_TARGETS[targetName];

  if (!target) {
    throw new Error(`未知 API 生成目标: ${targetName || ''}, 可用目标: ${Object.keys(API_ZIP_TARGETS).join(', ')}`);
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `md-api-${targetName}-`));
  const zipPath = path.join(tempDir, 'api.zip');

  try {
    fs.mkdirSync(target.outputDir, { recursive: true });
    print.info(`拉取 ${target.url}`);
    await runCommand('curl', ['-fL', target.url, '-o', zipPath]);
    print.info(`解压到 ${target.outputDir}`);
    await runCommand('unzip', ['-o', zipPath, '-d', target.outputDir]);
    print.success(`${targetName} api 生成完成`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

if (require.main === module) {
  main().catch(err => {
    print.danger(err.stack || err.message);
    process.exit(1);
  });
}

module.exports = main;
