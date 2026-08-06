import { CLI_COMMAND, QUICK_CONNECT_TOOLS, SKILL_MANUAL_COMMAND_BLOCKS, SKILL_MODULES } from './constant';

const getMcpBaseUrl = () => md.global?.Config?.MCPUrl || 'https://api.mingdao.com/mcp';

export const buildPersonalConfig = (tokenItem, needMask = false) => {
  const formatMaskedToken = rawToken => {
    if (typeof rawToken !== 'string') return '';
    return rawToken.length > 10 ? `${rawToken.slice(0, 7)}${'*'.repeat(10)}${rawToken.slice(-3)}` : rawToken;
  };

  const token = tokenItem?.rawToken
    ? needMask
      ? formatMaskedToken(tokenItem.rawToken)
      : tokenItem.rawToken
    : 'YOUR_PERSONAL_TOKEN';

  return {
    mcpServers: {
      hap_personal_mcp: {
        url: getMcpBaseUrl(),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  };
};

export const buildAppConfig = (appItem, authItem, needMask = false) => {
  const maskAppCredential = (str, startW, endW, middleW) => {
    if (typeof str !== 'string') return '';
    const start = str.slice(0, startW);
    const end = str.slice(-endW);
    const middle = '*'.repeat(middleW);
    return start + middle + end;
  };

  const appKey = authItem?.appKey
    ? needMask
      ? maskAppCredential(authItem.appKey, 4, 4, 8)
      : authItem.appKey
    : 'YOUR_APP_KEY';
  const sign = authItem?.sign ? (needMask ? maskAppCredential(authItem.sign, 6, 4, 78) : authItem.sign) : 'YOUR_SIGN';

  return {
    mcpServers: {
      [`hap-mcp-${appItem?.name || 'APP'}`]: {
        url: `${getMcpBaseUrl()}?HAP-Appkey=${appKey}&HAP-Sign=${sign}`,
      },
    },
  };
};

export const getMcpConfigData = ({
  configType,
  personalTokens,
  selectedTokenId,
  apps,
  selectedAppId,
  authKeys,
  selectedAuthId,
}) => {
  const token = personalTokens.find(item => item.id === selectedTokenId);
  const app = apps.find(item => item.id === selectedAppId);
  const auth = authKeys.find(item => item.id === selectedAuthId);
  const isPersonalConfig = configType === 'personal';
  const config = isPersonalConfig ? buildPersonalConfig(token) : buildAppConfig(app, auth);
  const maskedConfig = isPersonalConfig ? buildPersonalConfig(token, true) : buildAppConfig(app, auth, true);

  return {
    config,
    showJson: isPersonalConfig ? !!token : !!(app && auth),
    jsonText: JSON.stringify(config, null, 2),
    maskedJsonText: JSON.stringify(maskedConfig, null, 2),
  };
};

export const getSkillDialogCommand = selectedSkillModules => {
  const selectedModules = SKILL_MODULES.filter(item => selectedSkillModules.includes(item.key));
  const SKILL_REPOSITORY_URL = 'https://github.com/mingdaocom/hap-skills';

  if (!selectedModules.length) return '';

  if (selectedModules.length === SKILL_MODULES.length) {
    return _l('帮我安装这个 skill：%0', SKILL_REPOSITORY_URL);
  }

  return _l(
    '帮我安装这个 skill 里 %0 目录下的技能：%1',
    selectedModules.map(item => item.path).join('、'),
    SKILL_REPOSITORY_URL,
  );
};

export const getInstallMsg = ({ tab, mcpJson, withSkills, selectedSkillModules }) => {
  if (tab === 'MCP') {
    if (withSkills) {
      return `${_l('帮我安装这个 MCP+Skills')}\n— MCP: ${mcpJson}\n— Skills:${getSkillDialogCommand(['MCP'])}`;
    } else {
      return _l('帮我安装') + ` HAP MCP: ${mcpJson}`;
    }
  }

  if (tab === 'CLI') {
    if (withSkills) {
      return `${_l('帮我安装这个 CLI+Skills')}\n— CLI: ${CLI_COMMAND}\n— Skill:${getSkillDialogCommand(['CLI'])}`;
    } else {
      return _l('帮我安装') + ` HAP CLI: ${CLI_COMMAND}`;
    }
  }

  return getSkillDialogCommand(selectedSkillModules);
};

export const getSkillManualCommandText = cliDisabled =>
  SKILL_MANUAL_COMMAND_BLOCKS.filter(item => !cliDisabled || !item.cliRequired)
    .map(item => `${item.title}\n${item.command}`)
    .join('\n\n');

export const getInstallData = ({
  activeTab,
  installMode,
  projectId,
  cliEnabled,
  selectedTool,
  withSkills,
  selectedSkillModules,
  mcpJsonText,
  showMcpJson,
}) => {
  const isMcpTab = activeTab === 'MCP';
  const isCliTab = activeTab === 'CLI';
  const isSkillsTab = activeTab === 'Skills';
  const cliDisabled = !!projectId && projectId !== 'external' && !cliEnabled;
  const skillManualCommandText = getSkillManualCommandText(cliDisabled);
  const installMessage = getInstallMsg({ tab: activeTab, mcpJson: mcpJsonText, withSkills, selectedSkillModules });
  const skillCliCommandText = (() => {
    if (isMcpTab) return '';
    if (installMode === 'dialog') return installMessage;

    return isSkillsTab ? skillManualCommandText : CLI_COMMAND;
  })();

  return {
    canInstall: isMcpTab ? showMcpJson : isSkillsTab ? selectedSkillModules.length > 0 : !cliDisabled,
    cliDisabled,
    currentTool: QUICK_CONNECT_TOOLS.find(item => item.key === selectedTool),
    installMessage,
    isOtherTool: selectedTool === 'other',
    manualInstallHint: isMcpTab ? _l('复制下方配置，添加到 MCP 服务中') : _l('在终端中执行以下命令，即可完成安装'),
    shouldHideCliInstall: isCliTab && cliDisabled,
    skillCliCommandText,
    skillManualCommandText,
  };
};

export const getInstallTip = ({ activeTab, canInstall, currentTool, isOtherTool, withSkills }) => {
  if (!canInstall) {
    if (activeTab === 'MCP') return _l('请选择要连接的 AI Agent 工具与 MCP 配置');
    if (activeTab === 'Skills') return _l('请选择要安装的 Skills 模块');

    return _l('请选择要连接的 AI Agent 工具');
  }

  if (isOtherTool) {
    return _l('复制提示词发给 AI 助手，完成安装。');
  }

  if (!currentTool) return '';

  if (activeTab === 'MCP' && !withSkills && currentTool.getMcpInstallUrl) {
    return _l('将打开%0，并进入 MCP 安装流程，请在客户端确认', currentTool.label);
  }

  return currentTool.injectChat
    ? _l('将打开%0，并填入安装提示词，请在客户端确认执行', currentTool.label)
    : _l('将复制安装提示词，并打开%0，请在客户端粘贴后执行', currentTool.label);
};
