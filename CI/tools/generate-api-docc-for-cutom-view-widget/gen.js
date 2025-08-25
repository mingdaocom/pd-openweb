const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

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

const apiControllers = [
  { name: 'worksheet', description: '工作表', relativePath: 'src/api/worksheet' },
  { name: 'appManagement', description: '应用管理', relativePath: 'src/api/appManagement' },
  { name: 'homeApp', description: '应用', relativePath: 'src/api/homeApp' },
  { name: 'actionLog', description: '操作日志', relativePath: 'src/api/actionLog' },
  { name: 'instance', description: '工作流-流程实例', relativePath: 'src/pages/workflow/api/instance' },
  {
    name: 'instanceVersion',
    description: '工作流-流程实例版本',
    relativePath: 'src/pages/workflow/api/instanceVersion',
  },
  { name: 'process', description: '工作流-流程', relativePath: 'src/pages/workflow/api/process' },
  { name: 'processVersion', description: '工作流-流程版本', relativePath: 'src/pages/workflow/api/processVersion' },
  { name: 'delegation', description: '工作流-委托', relativePath: 'src/pages/workflow/api/delegation' },
  { name: 'qiniu', description: '七牛', relativePath: 'src/api/qiniu' },
  { name: 'plugin', description: '插件', relativePath: 'src/api/plugin' },
];

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
}

parse();
