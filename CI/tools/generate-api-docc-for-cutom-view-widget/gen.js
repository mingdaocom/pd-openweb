const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// API 控制器描述映射（只需要维护描述信息）
const controllerDescriptions = {
  worksheet: '工作表',
  appManagement: '应用管理',
  homeApp: '应用',
  actionLog: '操作日志',
  instance: '工作流-流程实例',
  instanceVersion: '工作流-流程实例版本',
  process: '工作流-流程',
  processVersion: '工作流-流程版本',
  delegation: '工作流-委托',
  qiniu: '七牛',
  attachment: '附件',
  plugin: '插件',
  fixedData: '固定数据',
  user: '用户',
};

/**
 * 从 widgetFunctions.js 中自动解析 API 控制器配置
 */
function parseApiControllersFromWidgetFunctions() {
  const widgetFunctionsPath = path.join(
    __dirname,
    '../../../src/pages/worksheet/views/CustomWidgetView/widgetFunctions.js',
  );
  const code = fs.readFileSync(widgetFunctionsPath, 'utf-8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  const controllers = [];

  traverse(ast, {
    CallExpression(nodePath) {
      // 查找 forEach 调用
      if (nodePath.node.callee.type === 'MemberExpression' && nodePath.node.callee.property.name === 'forEach') {
        const arrayNode = nodePath.node.callee.object;
        // 检查是否是 getMainWebApi 中的数组
        if (arrayNode.type === 'ArrayExpression') {
          arrayNode.elements.forEach(element => {
            if (element.type === 'ObjectExpression') {
              let controller = null;
              let ajaxImportName = null;

              element.properties.forEach(prop => {
                if (prop.key.name === 'controller' && prop.value.type === 'StringLiteral') {
                  controller = prop.value.value;
                }
                if (prop.key.name === 'ajax' && prop.value.type === 'Identifier') {
                  ajaxImportName = prop.value.name;
                }
              });

              if (controller && ajaxImportName) {
                controllers.push({ controller, ajaxImportName });
              }
            }
          });
        }
      }
    },
  });

  // 解析 import 语句获取文件路径
  const importMap = {};
  traverse(ast, {
    ImportDeclaration(nodePath) {
      const source = nodePath.node.source.value;
      nodePath.node.specifiers.forEach(spec => {
        if (spec.type === 'ImportDefaultSpecifier') {
          importMap[spec.local.name] = source;
        }
      });
    },
  });

  // 构建最终的 apiControllers 数组
  return controllers.map(({ controller, ajaxImportName }) => {
    let relativePath = importMap[ajaxImportName] || '';
    // 移除 src/ 前缀（如果有的话）
    relativePath = relativePath.replace(/^src\//, 'src/');
    return {
      name: controller,
      description: controllerDescriptions[controller] || controller,
      relativePath,
    };
  });
}

function parseParams(text) {
  const lines = text.split('\n');
  const result = [];

  const paramRegex = /@param\s+\{(.+?)\}\s+(?:\[)?(\w+(?:\.\w+)*)?(?:\])?\s*(.*)/;

  for (const line of lines) {
    if (line.trim().startsWith('* @param')) {
      const paramMatch = line.match(paramRegex);
      if (paramMatch) {
        const type = paramMatch[1];
        let name = paramMatch[2] || '';
        let description = paramMatch[3].trim();

        // 处理特殊情况，如 "流程管理后台批量操作"
        if (!name && description.includes('}*')) {
          const parts = description.split('}*');
          name = parts[1].trim();
          description = parts[0] + '}';
        }

        if (name !== 'args' && name !== 'options' && !/^options\./.test(name)) {
          result.push({ type, name, description });
        }
      }
    }
  }

  return result;
}

function parseJSFile(filePath) {
  console.log(`正在解析文件: ${filePath}`);
  const code = fs.readFileSync(filePath, 'utf-8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  const methods = [];

  traverse(ast, {
    ObjectProperty(path) {
      if (path.node.value.type === 'FunctionExpression') {
        const comments = path.node.leadingComments ? path.node.leadingComments[0].value : '';

        const methodRegex = /\* ([^\n]+)/;
        const methodMatch = comments.match(methodRegex);
        const methodDescription = methodMatch ? methodMatch[1].trim() : '';

        const method = {
          name: path.node.key.name,
          description: methodDescription,
          comments: comments,
          args: parseParams(comments),
        };
        methods.push(method);
      }
    },
  });

  console.log(`共找到 ${methods.length} 个方法`);
  return methods;
}

function generateMarkdown(methods, controllerName, controllerDescription) {
  let markdown = `# ${controllerDescription}\n\n`;

  methods.forEach(method => {
    markdown += `## ${method.name}\n\n`;
    markdown += `${method.description}\n\n`;
    markdown += `### 参数\n\n`;
    method.args.forEach(arg => {
      markdown += `${arg.name}  {${arg.type}}  ${arg.description}  \n`;
    });
    // markdown += `${method.comments} \n\n`;
    // method.params.forEach(param => {
    //   if (param.name === 'args' && param.args && param.args.length > 0) {
    //     markdown += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
    //     param.args.forEach(arg => {
    //       markdown += `  - \`${arg.name}\` (${arg.type}): ${arg.description}\n`;
    //     });
    //   } else {
    //     markdown += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
    //   }
    // });

    // if (method.returns) {
    //   markdown += `\n### 返回值\n\n`;
    //   markdown += `{${method.returns.type}} ${method.returns.description}\n`;
    // }

    markdown += `\n\`\`\`js
import { apis } from "mdye";

apis.${controllerName}.${method.name}(args)
  .then(res => {
    console.log(res);
  });
\`\`\``;

    markdown += '\n---\n\n';
  });

  return markdown;
}

function getAPIDoc(inputFile, controllerName, controllerDescription) {
  try {
    console.log('开始生成API文档');
    const methods = parseJSFile(inputFile);
    const markdown = generateMarkdown(methods, controllerName, controllerDescription);
    return {
      markdown,
      data: methods,
    };
  } catch (error) {
    console.error('生成API文档时发生错误:', error);
  }
}

// 自动从 widgetFunctions.js 解析 API 控制器配置
const apiControllers = parseApiControllersFromWidgetFunctions();
console.log('自动解析到的 API 控制器:', apiControllers.map(c => c.name).join(', '));

function generateControllerType(controllerData) {
  const controllerTypeList = [];
  controllerData.forEach(controller => {
    const { data } = controller;
    controllerTypeList.push(`
  /**
   * ${controller.description}
   */
  ${controller.name}: {
${data
  .map(
    method => `
  /**
   * ${method.description}
   * @param params 参数
${method.args.map(arg => `   * @param params.${arg.name.replace('args.', '')} ${arg.description}`).join('\n')}
   */
  ${method.name}: (params: {
${method.args.map(arg => `    ${arg.name.replace('args.', '')}: ${arg.type.replace('array', 'Array')};`).join('\n')}
  }) => any
`,
  )
  .join('\n')}
};
`);
  });
  return `export const apis: {
${controllerTypeList.join('\n')}
};`;
}

function generateMdyeApiJs(controllerData) {
  let result = '';
  controllerData.forEach(controller => {
    result += `${controller.name}: {${controller.data
      .map(
        method => `
    ${method.name}: function (data) {
      return window.api.call('${controller.name}', '${method.name}', data);
    },`,
      )
      .join('')}
},\n`;
  });
  return `module.exports = {
  ${result}
}`;
}

const AI_DOC_DIR = path.join(__dirname, 'output', 'ai-doc');

function generateControllerGrepLines(controller) {
  const lines = [];
  controller.data.forEach(method => {
    const params = method.args
      .map(arg => `${arg.name.replace('args.', '')}(${arg.type},${(arg.description || '').replace(/,/g, '，')})`)
      .join(', ');
    const paramNames = method.args.map(a => a.name.replace('args.', '')).join(', ');
    const line = `API: apis.${controller.name}.${method.name} | 描述: ${method.description} | 参数: ${params || '无'} | 调用: apis.${controller.name}.${method.name}({ ${paramNames} })`;
    lines.push(line);
  });
  return lines.join('\n');
}

function generateGrepFriendlyDoc(controllerData) {
  const lines = [];
  controllerData.forEach(controller => {
    lines.push(generateControllerGrepLines(controller));
  });
  return lines.join('\n');
}

/**
 * 生成符合 Anthropic Agent Skills 规范的 SKILL.md
 * 检索策略：先按意图选分类文件再 grep，只读命中行，不载入整文件，省 token
 */
function generateSkillMd(controllerData) {
  const controllerList = controllerData
    .map(c => `| ${c.name} | ${c.description} | \`references/${c.name}-grep.txt\` |`)
    .join('\n');

  return `---
name: mingdao-custom-view-api
description: 明道云自定义视图/组件 API。检索：先按意图选 references/{分类}-grep.txt（见意图→分类表），再 grep 关键词或 apis.x.y，只读命中行勿载入整文件；不确定时 grep api-grep.txt。
---

# Overview

references 下仅 grep 文件，每行格式：\`API: apis.x.y | 描述 | 参数 | 调用\`，命中一行即完整信息。

# 检索（高效且省 token）

1. **选文件**：按意图从下表选一个 \`references/{分类}-grep.txt\`，避免用全量 \`api-grep.txt\`（约 500 行）。
2. **执行 grep**：\`grep "关键词" references/{分类}-grep.txt\` 或 \`grep "apis.控制器.方法" references/{分类}-grep.txt\`。只使用 grep 输出行，勿将整文件载入上下文。
3. **不确定分类**：\`grep "关键词" references/api-grep.txt\`。

**意图→分类**（优先用分类文件）：

| 意图/场景 | 分类 | 文件 |
|-----------|------|------|
| 记录、行、视图、工作表、筛选、控件 | worksheet | \`worksheet-grep.txt\` |
| 应用、分组、角色 | appManagement | \`appManagement-grep.txt\` |
| 应用首页、导航 | homeApp | \`homeApp-grep.txt\` |
| 流程实例、审批、运行 | instance | \`instance-grep.txt\` |
| 流程版本、发布 | instanceVersion | \`instanceVersion-grep.txt\` |
| 流程定义、设计 | process | \`process-grep.txt\` |
| 流程版本定义 | processVersion | \`processVersion-grep.txt\` |
| 委托、转交 | delegation | \`delegation-grep.txt\` |
| 用户、成员、账号 | user | \`user-grep.txt\` |
| 附件、上传、下载 | attachment | \`attachment-grep.txt\` |
| 操作日志 | actionLog | \`actionLog-grep.txt\` |
| 七牛、存储 | qiniu | \`qiniu-grep.txt\` |
| 插件 | plugin | \`plugin-grep.txt\` |
| 固定数据、选项集 | fixedData | \`fixedData-grep.txt\` |

**分类→文件路径**：

| 分类 | 说明 | 文件 |
|------|------|------|
${controllerList}

# 插件运行

插件不是独立运行的，是工作表的一部分；工作表的环境信息通过 \`config\` 传给视图。代码中必须通过 mdye 包的 \`config\` 获取；开发调试时可用 \`window.config\`。

\`\`\`插件信息
{
  "config": {
    "appId": "string",         // 当前应用ID
    "worksheetId": "string",  // 当前工作表ID
    "projectId": "string",    // 当前组织ID
    "viewId": "string",       // 当前视图ID
    "filters": [{}],          // 当前视图的筛选条件
    "query": {},              // 当前页面的 url query 参数
    "controls": [{            // 当前视图下的字段配置信息
      "controlId": "string",
      "controlName": "string"
    }],
    "worksheetInfo": {},      // 当前工作表配置信息
    "currentAccount": {       // 当前用户
      "accountId": "",
      "fullname": "",
      "avatar": "",
      "lang": ""
    }
  }
}
\`\`\`

# 获取接口返回格式

**仅限开发工具侧**（如 AI 助手、IDE 等）用于查看接口返回数据结构；**禁止在业务侧/插件代码中使用**，业务代码只通过 mdye 提供的 \`apis\` 正常调用接口。

接口文档无返回数据格式说明。开发工具需查看实际返回时，通过 **在真实网页环境中执行代码** 调用接口，命令会返回接口数据。接口无法在终端直接请求，必须经 mdye-cli 在已打开的插件/网页中执行。

**命令格式**（mdye-cli 路径以项目为准，如环境变量 \`MDYE_CLI_PATH\` 或 \`packages/mdye-cli\`）：

\`\`\`bash
node <mdye-cli路径>/cli.js send execute -p '{"code": "return await mdye_apis.<控制器>.<方法>(params)"}'
\`\`\`

**参数从运行环境取**：终端侧没有 \`worksheetId\`、\`appId\` 等，code 会在**网页环境**执行，请在 code 里用 \`window.config\` 取当前上下文，勿写死或从终端传。

| 参数示例 | 在 code 中的取值 |
|----------|------------------|
| 应用/工作表/视图/组织 | \`window.config.appId\`、\`window.config.worksheetId\`、\`window.config.viewId\`、\`window.config.projectId\` |

**示例**（开发工具查看 getWorksheetInfo 返回格式，worksheetId 用当前视图的）：

\`\`\`bash
node packages/mdye-cli/cli.js send execute -p '{"code": "return await mdye_apis.worksheet.getWorksheetInfo({ worksheetId: window.config.worksheetId })"}'
\`\`\`

注意：code 内使用 \`mdye_apis\`（不是 apis），与插件运行环境一致；先确保已在浏览器中打开对应插件/页面再执行命令。

# Guidelines

- 业务侧调用形式：\`apis.{controller}.{method}(params)\`，返回 Promise
- 获取返回格式：仅开发工具侧使用 mdye-cli send execute，code 中用 \`window.config\` 传参；**不得在业务/插件代码中使用该方式**
`;
}

/**
 * 将所有 AI 相关文档输出到 output/ai-doc，符合 Skills 规范：SKILL.md + references/
 */
function writeAiDocs(controllerData) {
  if (!fs.existsSync(path.dirname(AI_DOC_DIR))) {
    fs.mkdirSync(path.dirname(AI_DOC_DIR), { recursive: true });
  }
  fs.mkdirSync(AI_DOC_DIR, { recursive: true });

  const referencesDir = path.join(AI_DOC_DIR, 'references');
  fs.mkdirSync(referencesDir, { recursive: true });

  const outputDir = path.join(__dirname, 'output');
  if (fs.existsSync(path.join(outputDir, 'api-grep.txt'))) fs.unlinkSync(path.join(outputDir, 'api-grep.txt'));

  controllerData.forEach(controller => {
    const mapPath = path.join(referencesDir, `${controller.name}-map.txt`);
    if (fs.existsSync(mapPath)) fs.unlinkSync(mapPath);
  });
  if (fs.existsSync(path.join(referencesDir, 'api-map.txt'))) fs.unlinkSync(path.join(referencesDir, 'api-map.txt'));

  controllerData.forEach(controller => {
    const grepContent = generateControllerGrepLines(controller);
    const grepPath = path.join(referencesDir, `${controller.name}-grep.txt`);
    fs.writeFileSync(grepPath, grepContent);
  });

  const combinedGrepLines = controllerData.map(controller => generateControllerGrepLines(controller)).filter(Boolean);
  fs.writeFileSync(path.join(referencesDir, 'api-grep.txt'), combinedGrepLines.join('\n'));

  const skillMd = generateSkillMd(controllerData);
  fs.writeFileSync(path.join(AI_DOC_DIR, 'SKILL.md'), skillMd);
}

function parse() {
  const needParseApiControllers = apiControllers.map(controller => {
    return {
      filePath: path.join(__dirname, '../../../', controller.relativePath) + '.js',
      controllerName: controller.name,
      description: controller.description,
    };
  });
  const markdownList = [];
  const controllerData = [];

  needParseApiControllers.forEach(controller => {
    const { markdown, data } = getAPIDoc(controller.filePath, controller.controllerName, controller.description);
    markdownList.push(markdown);
    controllerData.push({
      name: controller.controllerName,
      description: controller.description,
      data,
    });
  });
  const apiCatalog = needParseApiControllers
    .map(controller => {
      return `- [${controller.description}](#${controller.description})`;
    })
    .join('\n');
  const allMarkdown =
    '# 明道云插件接口文档  \n\n' +
    '```本文档由代码自动生成。如果某些参数描述难以理解，建议在主站进行相应操作，并观察发送的请求内容以获得更清晰的理解。```  ' +
    '\n\n' +
    markdownList.join('\n---\n\n');
  fs.writeFileSync('./output/api-doc.md', allMarkdown);
  fs.writeFileSync('./output/api-doc.json', JSON.stringify(controllerData));

  const controllerTypeList = generateControllerType(controllerData);
  fs.writeFileSync('./output/api-doc.d.ts', controllerTypeList);

  const mdyeApiJs = generateMdyeApiJs(controllerData);
  fs.writeFileSync('./output/mdye-api.js', mdyeApiJs);

  writeAiDocs(controllerData);
}

parse();
