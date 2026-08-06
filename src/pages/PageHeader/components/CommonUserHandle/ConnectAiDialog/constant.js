export const AI_TABS = [
  { key: 'MCP', label: 'MCP', icon: 'mcp' },
  { key: 'CLI', label: 'CLI', icon: 'url' },
  { key: 'Skills', label: 'Skills', icon: 'extension_black1' },
];

export const QUICK_CONNECT_TOOLS = [
  {
    key: 'claude-code',
    label: 'Claude Code',
    icon: 'claudecode',
    iconColor: '#D97757',
    injectChat: true,
    getChatUrl: msg => `claude://claude.ai/new?q=${encodeURIComponent(msg)}`,
  },
  {
    key: 'codex',
    label: 'Codex',
    icon: 'codex',
    iconStyle: {
      background: 'linear-gradient(180deg, #B1A7FF 0%, #7A9DFF 50%, #3941FF 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    injectChat: true,
    getChatUrl: msg => `codex://new?prompt=${encodeURIComponent(msg)}`,
  },
  {
    key: 'cursor',
    label: 'Cursor',
    icon: 'cursor',
    iconColor: 'var(--color-text-primary)',
    injectChat: true,
    getChatUrl: msg =>
      `cursor://anysphere.cursor-deeplink/prompt?text=${encodeURIComponent(msg.replace(/&/g, '\\u0026'))}`,
    getMcpInstallUrl: (name, config) =>
      `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(name)}&config=${encodeURIComponent(config)}`,
  },
  {
    key: 'zcode',
    label: 'ZCode',
    icon: 'zcode',
    iconColor: 'var(--color-text-primary)',
    getChatUrl: () => 'zcode://',
  },
  {
    key: 'trae',
    label: 'Trae',
    icon: 'trae-color',
    iconColor: '#32F08C',
    getChatUrl: () => 'trae://',
  },
  {
    key: 'workbuddy',
    label: 'WorkBuddy',
    icon: 'workbuddy',
    iconColor: '#27B994',
    getChatUrl: () => 'workbuddy://',
  },
  {
    key: 'other',
    label: _l('其他'),
  },
];

export const INSTALL_MODE_OPTIONS = [
  { key: 'dialog', label: _l('对话安装') },
  { key: 'manual', label: _l('手动安装') },
];

export const SKILL_MANUAL_COMMAND = 'npx skills add mingdaocom/hap-skills';
export const CLI_COMMAND = 'pip install hap-cli';

export const SKILL_MODULES = [
  {
    key: 'MCP',
    label: 'MCP',
    path: 'skills/mcp',
    desc: _l('让 Agent 通过 MCP 服务直接操作明道云,需先完成 MCP 配置'),
    abilities: [_l('智能建应用 — 全自动方案设计 + 应用搭建'), _l('MCP 配置助手 — 自动配置并管理 MCP 服务')],
  },
  {
    key: 'CLI',
    label: 'CLI',
    path: 'skills/cli',
    desc: _l('在终端或脚本里用 hap 命令直接操作 HAP,需先安装 hap-cli 并登录'),
    abilities: [
      _l('建应用 — 从需求搭出可用应用,含示例数据'),
      _l('改应用 — 改字段、视图、权限、工作流'),
      _l('查数据 — 复杂筛选、分组、透视聚合'),
      _l('多环境管理 — 多环境/账号安全执行'),
    ],
  },
  {
    key: 'API',
    label: 'API',
    path: 'skills/api',
    desc: _l('基于 HAP V3 API 做二次开发,需先配置 API 鉴权'),
    abilities: [
      _l('API 开发 — 数据查询、业务编辑、数据迁移'),
      _l('视图插件开发 — 看板、甘特图、地图等视图'),
      _l('前端项目搭建 — 把明道云后端搭独立站点'),
    ],
  },
];

export const SKILL_MANUAL_COMMAND_BLOCKS = [
  {
    key: 'all',
    title: _l('# 安装全部 Skill（CLI + MCP + API 全部能力）'),
    command: SKILL_MANUAL_COMMAND,
    cliRequired: true,
  },
  {
    key: 'cli',
    title: _l('# 仅安装 CLI Skill（命令行操作：建应用、改应用、查数据、多环境管理）'),
    command: `${SKILL_MANUAL_COMMAND} --skill hap-cli --skill hap-cli-app-creator --skill hap-cli-app-editor --skill hap-cli-data-query --skill hap-cli-environments`,
    cliRequired: true,
  },
  {
    key: 'mcp',
    title: _l('# 仅安装 MCP Skill（MCP直连：方案设计、自动搭建、示例数据）'),
    command: `${SKILL_MANUAL_COMMAND} --skill hap-mcp-app-builder`,
  },
  {
    key: 'api',
    title: _l('# 仅安装 API Skill（接口开发：API 开发、视图插件、网站搭建）'),
    command: `${SKILL_MANUAL_COMMAND} --skill hap-apiv3-data --skill hap-view-plugin --skill hap-api-website`,
  },
];

export const INSTALL_CONFIGS = {
  CLI: {
    title: _l('安装 CLI'),
    desc: _l(
      '通过终端命令调用 HAP 能力，覆盖应用、工作表、工作流、审批、通讯录、日程、群聊等更多场景，适用于在本地终端、服务器脚本或自动化脚本中使用。必须安装 Python 环境（版本号 >= 3.10）。',
    ),
    command: CLI_COMMAND,
  },
  Skills: {
    title: _l('安装 Skills'),
    desc: _l(
      '让 AI 真正掌握操作 HAP 的能力，覆盖 CLI 命令、MCP 服务、API 接口三种使用方式，从建应用、改数据到二次开发全流程支持。',
    ),
  },
};
