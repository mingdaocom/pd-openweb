import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import { Button, Checkbox, Dialog, Icon, Support } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import openAuthorAjax from 'src/api/openAuthor';
import { pathCompletion } from 'src/utils/common';
import { AI_TABS, INSTALL_CONFIGS, INSTALL_MODE_OPTIONS, QUICK_CONNECT_TOOLS, SKILL_MODULES } from './constant';
import { getInstallData, getInstallTip, getMcpConfigData } from './util';
import './index.less';

function Header() {
  return (
    <div className="pBottom12">
      <div className="Font18 Bold LineHeight28">{_l('连接 AI')}</div>
      <div className="mTop2 Font13 LineHeight22">
        {_l('连接 HAP 与 AI Agent 工具，助力 AI 编程与自动化')}
        <Support className="mLeft6" type={3} text={_l('使用指南')} href="https://help.mingdao.com/ai/connect-ai" />
      </div>
    </div>
  );
}

const handleCopy = text => {
  copy(text);
  alert(_l('已复制'));
};

const renderFieldLabel = text => (
  <div className="fieldLabel">
    <span className="required">*</span>
    {text}
  </div>
);

function ConnectAiDialog({ visible, projectId, initialPersonalTokens = null, onCancel = () => {} }) {
  const [activeTab, setActiveTab] = useState('MCP');
  const [configType, setConfigType] = useState('personal');
  const [personalTokens, setPersonalTokens] = useState(initialPersonalTokens || []);
  const [apps, setApps] = useState([]);
  const [authKeys, setAuthKeys] = useState([]);
  const [selectedTokenId, setSelectedTokenId] = useState(initialPersonalTokens?.[0]?.id || '');
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedAuthId, setSelectedAuthId] = useState('');
  const [selectedTool, setSelectedTool] = useState('claude-code');
  const [installMode, setInstallMode] = useState('dialog');
  const [withSkills, setWithSkills] = useState(true);
  const [selectedSkillModules, setSelectedSkillModules] = useState(SKILL_MODULES.map(item => item.key));
  const [cliEnabled, setCliEnabled] = useState(true);
  const ajaxRef = useRef({});
  const refreshFromCreateRef = useRef(null);

  const request = useCallback((key, promise) => {
    ajaxRef.current[key]?.abort?.();
    ajaxRef.current[key] = promise;
    return promise;
  }, []);

  const fetchPersonalTokens = useCallback(
    ({ keepSelected = false } = {}) => {
      if (!projectId || projectId === 'external') return;

      request('pat', openAuthorAjax.getPATsByProject({ status: 1, projectId }))
        .then(res => {
          const list = res || [];

          setPersonalTokens(list);
          setSelectedTokenId(prevId =>
            keepSelected && list.some(item => item.id === prevId) ? prevId : list[0]?.id || '',
          );
        })
        .catch(() => {
          setPersonalTokens([]);
          setSelectedTokenId('');
        });
    },
    [projectId, request],
  );

  const fetchApps = useCallback(() => {
    request('apps', appManagementAjax.getAppForManager({ projectId, type: 0 }))
      .then(res => {
        const list = (res || []).map(item => ({ id: item.appId, name: item.appName }));
        setApps(list);
        setSelectedAppId(prevId => prevId || list[0]?.id || '');
      })
      .catch(() => {
        setApps([]);
        setSelectedAppId('');
      });
  }, [projectId, request]);

  const fetchAuthKeys = useCallback(
    (appId, { keepSelected = false } = {}) => {
      if (!appId) return;

      request('auth', appManagementAjax.getAuthorizes({ appId }))
        .then(res => {
          const list = (res || []).filter(item => item.status === 1).map(item => ({ ...item, id: item.appKey }));

          setAuthKeys(list);
          setSelectedAuthId(prevId =>
            keepSelected && list.some(item => item.id === prevId) ? prevId : list[0]?.id || '',
          );
        })
        .catch(() => {
          setAuthKeys([]);
          setSelectedAuthId('');
        });
    },
    [request],
  );

  const fetchCliEnabled = useCallback(() => {
    request('cliEnabled', openAuthorAjax.getCliAccessPolicySetting({ projectId }, { silent: true }))
      .then(data => {
        setCliEnabled(data);

        if (!data) {
          setSelectedSkillModules(list => list.filter(item => item !== 'CLI'));
        }
      })
      .catch(() => setCliEnabled(true));
  }, [projectId, request]);

  const handleRefreshFromCreate = useCallback(() => {
    const refresh = refreshFromCreateRef.current;
    refreshFromCreateRef.current = null;
    refresh?.();
  }, []);

  useEffect(() => {
    window.addEventListener('focus', handleRefreshFromCreate);

    return () => {
      refreshFromCreateRef.current = null;
      window.removeEventListener('focus', handleRefreshFromCreate);
    };
  }, [handleRefreshFromCreate]);

  useEffect(() => {
    if (!visible || !projectId || projectId === 'external') return;

    fetchApps();
    fetchCliEnabled();
  }, [visible, projectId, fetchApps, fetchCliEnabled]);

  useEffect(() => {
    if (!selectedAppId) return;

    fetchAuthKeys(selectedAppId);
  }, [selectedAppId, fetchAuthKeys]);

  const mcpData = getMcpConfigData({
    configType,
    personalTokens,
    selectedTokenId,
    apps,
    selectedAppId,
    authKeys,
    selectedAuthId,
  });
  const installData = getInstallData({
    activeTab,
    installMode,
    projectId,
    cliEnabled,
    selectedTool,
    withSkills,
    selectedSkillModules,
    mcpJsonText: mcpData.jsonText,
    showMcpJson: mcpData.showJson,
  });

  const handleInstall = () => {
    if (!installData.canInstall) {
      alert(activeTab === 'Skills' ? _l('请先选择要安装的 Skills 模块') : _l('请先选择令牌或授权密钥'), 3);
      return;
    }

    const tool = installData.currentTool;
    if (!tool) return;

    if (activeTab === 'MCP' && !withSkills && tool.getMcpInstallUrl) {
      const [serverName, serverConfig] = Object.entries(mcpData.config.mcpServers)[0];
      window.location.assign(tool.getMcpInstallUrl(serverName, btoa(JSON.stringify(serverConfig))));
      return;
    }

    copy(installData.installMessage);

    if (installData.isOtherTool) {
      alert(_l('已复制安装提示词'));
      return;
    }

    window.location.assign(tool.getChatUrl(installData.installMessage));
  };

  const toggleSkillModule = key => {
    setSelectedSkillModules(list => (list.includes(key) ? list.filter(item => item !== key) : list.concat(key)));
  };

  const renderSelectExtra = type => (
    <div
      onMouseDown={e => e.preventDefault()}
      className="extraCreate"
      onClick={() => {
        if (type === 'personalToken') {
          refreshFromCreateRef.current = () => fetchPersonalTokens({ keepSelected: true });
          window.open(pathCompletion('/personal?type=pat'), '_blank');
          return;
        }

        if (type === 'authKey') {
          if (!selectedAppId) {
            alert(_l('请先选择应用'), 3);
            return;
          }

          refreshFromCreateRef.current = () => fetchAuthKeys(selectedAppId, { keepSelected: true });
          window.open(pathCompletion(`/worksheetapi/${selectedAppId}`), '_blank');
        }
      }}
    >
      <Icon icon="plus" />
      <span className="Font14">{_l('去创建')}</span>
    </div>
  );

  const renderQuickConnectCard = () => (
    <div className="quickConnectCard">
      <div className="segmentWrap installModeWrap">
        {INSTALL_MODE_OPTIONS.map(item => (
          <div
            key={item.key}
            className={cx('segmentItem', { active: installMode === item.key })}
            onClick={() => setInstallMode(item.key)}
          >
            {item.label}
          </div>
        ))}
      </div>

      {installMode === 'manual' ? (
        <div className="manualInstallHint">{installData.manualInstallHint}</div>
      ) : (
        <div className="quickConnectToolsRow">
          <div className="quickConnectLabel">{_l('连接到：')}</div>
          <div className="quickConnectList">
            {QUICK_CONNECT_TOOLS.map(item => (
              <div
                key={item.key}
                className={cx('toolItem', { active: selectedTool === item.key, noIcon: !item.icon })}
                onClick={() => setSelectedTool(item.key)}
              >
                {!!item.icon && (
                  <Icon icon={item.icon} className="toolIcon" style={item.iconStyle || { color: item.iconColor }} />
                )}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSkillsCard = () => (
    <div className="installCard">
      <div className="installTitle">{INSTALL_CONFIGS.Skills.title}</div>
      <div className="installDesc">{INSTALL_CONFIGS.Skills.desc}</div>

      {installMode === 'manual' ? (
        <div className="codeDataCard">
          <pre className="codeDataText">{installData.skillManualCommandText}</pre>
          <div className="copyBtn" onClick={() => handleCopy(installData.skillManualCommandText)}>
            <Icon icon="content-copy" className="Font13" />
            <span>{_l('复制')}</span>
          </div>
        </div>
      ) : (
        <div className="skillModuleList">
          {SKILL_MODULES.map(item => {
            const disabled = installData.cliDisabled && item.key === 'CLI';
            const checked = selectedSkillModules.includes(item.key);
            const label = disabled ? (
              <span className="skillModuleLabel">
                <span>{item.label}</span>
                <Tooltip title={_l('CLI 访问策略未开启，需组织管理员在「组织后台 - 数据与访问」中开启后才能使用')}>
                  <Icon icon="info1" className="skillModuleTipIcon" />
                </Tooltip>
              </span>
            ) : (
              item.label
            );

            return (
              <div
                key={item.key}
                className={cx('skillModuleItem', { active: checked, disabled })}
                onClick={() => !disabled && toggleSkillModule(item.key)}
              >
                <Checkbox noMargin disabled={disabled} checked={checked} text={label} />
                <div className="skillModuleContent">
                  <div className="textSecondary">{item.desc}</div>
                  <div className="skillModuleDivider" />
                  <ul className="skillAbilityList">
                    {item.abilities.map(ability => (
                      <li key={ability}>{ability}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCliCard = () => (
    <div className={cx('installCard', { cliDisabledCard: installData.cliDisabled })}>
      <div className="installTitle">{INSTALL_CONFIGS.CLI.title}</div>
      <div className="installDesc">{INSTALL_CONFIGS.CLI.desc}</div>

      {installData.cliDisabled ? (
        <div className="cliDisabledState">
          <div className="cliDisabledIcon">
            <Icon icon="lock" />
          </div>
          <div className="cliDisabledTitle">{_l('CLI 访问策略未开启')}</div>
          <div className="cliDisabledDesc">{_l('需组织管理员在「组织后台 - 数据与访问」中开启后才能使用')}</div>
        </div>
      ) : (
        <div className="codeDataCard">
          <div className="codeDataText nowrap">{installData.skillCliCommandText}</div>
          <div className="copyBtn" onClick={() => handleCopy(installData.skillCliCommandText)}>
            <Icon icon="content-copy" className="Font13" />
            <span>{_l('复制')}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderInstallActions = () => (
    <div className="installActions">
      {['MCP', 'CLI'].includes(activeTab) && (
        <div className="installOptionRow">
          <Checkbox checked={withSkills} onClick={checked => setWithSkills(!checked)} text={_l('同时安装配套Skills')} />
          <span className="recommendTag">{_l('推荐')}</span>
        </div>
      )}
      <Button type="primary" className="installBtn w100" disabled={!installData.canInstall} onClick={handleInstall}>
        {installData.isOtherTool ? _l('复制安装提示词') : _l('安装')}
      </Button>
      <div className="installTip">
        {getInstallTip({
          activeTab,
          withSkills,
          canInstall: installData.canInstall,
          currentTool: installData.currentTool,
          isOtherTool: installData.isOtherTool,
        })}
      </div>
    </div>
  );

  return (
    <Dialog
      dialogClasses="connectAiDialog"
      visible={visible}
      onCancel={onCancel}
      showFooter={false}
      overlayClosable={false}
      width={800}
      title={<Header />}
    >
      <div className="tabBar">
        {AI_TABS.map(tab => (
          <div
            key={tab.key}
            className={cx('tabItem', { active: activeTab === tab.key })}
            onClick={() => setActiveTab(tab.key)}
          >
            <Icon icon={tab.icon} />
            <span>{tab.label}</span>
          </div>
        ))}
      </div>

      <div className="tabPanel">
        {!installData.shouldHideCliInstall && renderQuickConnectCard()}

        {activeTab === 'MCP' ? (
          <div className="configCard">
            <div className="cardTitle">{_l('MCP 配置')}</div>

            <div className="segmentWrap">
              {[
                { key: 'personal', label: _l('个人') },
                { key: 'app', label: _l('应用') },
              ].map(item => (
                <div
                  key={item.key}
                  className={cx('segmentItem', { active: configType === item.key })}
                  onClick={() => setConfigType(item.key)}
                >
                  {item.label}
                </div>
              ))}
            </div>

            <div className="configHint">
              {configType === 'personal' ? _l('按个人权限操作 HAP 数据') : _l('按应用授权范围操作 HAP 数据')}
            </div>

            {configType === 'personal' ? (
              <>
                {renderFieldLabel(_l('个人访问令牌'))}
                <Select
                  className="connectAiSelect"
                  dropdownClassName="connectAiSelectDropdown"
                  placeholder={personalTokens.length ? _l('请选择个人访问令牌') : _l('当前组织暂无可用令牌')}
                  notFoundContent={_l('当前组织暂无可用令牌')}
                  value={selectedTokenId || undefined}
                  options={personalTokens.map(item => ({ label: item.name, value: item.id }))}
                  onChange={setSelectedTokenId}
                  dropdownRender={menu => (
                    <div className="connectAiSelectDropdownWrap">
                      {menu}
                      {renderSelectExtra('personalToken')}
                    </div>
                  )}
                />
              </>
            ) : (
              <>
                {renderFieldLabel(_l('应用'))}
                <Select
                  className="connectAiSelect"
                  dropdownClassName="connectAiSelectDropdown"
                  placeholder={_l('选择应用')}
                  notFoundContent={_l('暂无数据')}
                  value={selectedAppId || undefined}
                  showSearch
                  optionFilterProp="label"
                  options={apps.map(item => ({ label: item.name, value: item.id }))}
                  onChange={setSelectedAppId}
                />
                {selectedAppId && (
                  <>
                    {renderFieldLabel(_l('授权密钥'))}
                    <Select
                      className="connectAiSelect"
                      dropdownClassName="connectAiSelectDropdown"
                      placeholder={_l('选择授权密钥')}
                      notFoundContent={_l('暂无数据')}
                      value={selectedAuthId || undefined}
                      options={authKeys.map(item => ({ label: item.name, value: item.id }))}
                      onChange={setSelectedAuthId}
                      dropdownRender={menu => (
                        <div className="connectAiSelectDropdownWrap">
                          {menu}
                          {renderSelectExtra('authKey')}
                        </div>
                      )}
                    />
                  </>
                )}
              </>
            )}

            {installMode === 'manual' && mcpData.showJson && (
              <div className="codeDataCard">
                <pre className="codeDataText">{mcpData.maskedJsonText}</pre>
                <div className="copyBtn" onClick={() => handleCopy(mcpData.jsonText)}>
                  <Icon icon="content-copy" className="Font13" />
                  <span>{_l('复制')}</span>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'Skills' ? (
          renderSkillsCard()
        ) : (
          renderCliCard()
        )}

        {installMode === 'dialog' && !installData.shouldHideCliInstall && renderInstallActions()}
      </div>
    </Dialog>
  );
}

export default ConnectAiDialog;
