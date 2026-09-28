import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { ScrollView, SvgIcon } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import privateSource from 'src/api/privateSource';
import { HAP_PREFIX_CLS } from 'src/common/config/theme/antdTheme';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getCurrentProject } from 'src/utils/services/project';
import { FEATURE_PERMISSION, hasFeaturePermission, hasPermission } from 'src/utils/services/security/permission';
import ThirdApp from './components/ThirdApp';

const POPOVER_TRANSITION_NAME = `${HAP_PREFIX_CLS}-zoom-big`;
const DROPDOWN_STYLES = { root: { transformOrigin: 'left top' } };
const DROPDOWN_ITEM_STYLE = { color: 'var(--color-text-secondary)' };

const getNativeAppItems = () => [
  { id: 'feed', icon: 'dynamic-empty', text: _l('动态'), color: '#1677ff', href: '/feed', key: 1 },
  { id: 'task', icon: 'task_basic_application', text: _l('任务'), color: '#3cca8f', href: '/apps/task', key: 2 },
  { id: 'calendar', icon: 'sidebar_calendar', text: _l('日程'), color: '#ff6d6c', href: '/apps/calendar/home', key: 3 },
  { id: 'knowledge', icon: 'sidebar_knowledge', text: _l('文件'), color: '#F89803', href: '/apps/kc/my', key: 4 },
  { id: 'hr', icon: 'hr_home', text: _l('人事'), color: '#607D8B', href: '/hr', key: 5, openInNew: true },
];

const getNativeIntegrationItems = () => [
  {
    id: 'api',
    icon: 'connect',
    color: 'var(--color-mingo)',
    text: _l('API集成'),
    href: '/integration/connect',
    key: 1,
  },
  {
    id: 'datapipeline',
    icon: 'a-Data_integration1',
    color: 'var(--color-cyan)',
    text: _l('数据集成'),
    href: '/integration/dataConnect',
    key: 2,
  },
];

const getDropdownItems = items =>
  items.map(item => ({
    key: item.id,
    icon: item.icon ? <i className={`icon icon-${item.icon} Font20`} style={{ color: item.color }} /> : undefined,
    label: item.name || item.text,
    style: DROPDOWN_ITEM_STYLE,
    onClick: () => {
      if (item.onClick) {
        item.onClick();
      } else if (item.openInNew) {
        window.open(pathCompletion(item.href), '_blank', 'noopener,noreferrer');
      } else {
        navigateTo(item.href);
      }
    },
  }));

const Con = styled.div`
  overflow: hidden;
  background-color: ${({ $themeBgColor }) => $themeBgColor};
  transition: width 0.2s;
  width: 68px;
  position: relative;
  .sideNavMask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  &.isExpanded {
    width: 180px;
    .moduleEntry,
    .resourceEntry:not(.expandBtn) {
      flex-direction: row;
      justify-content: start;
      padding: 0 12px;
      height: 40px;
      min-height: 40px;
      .name {
        display: none;
      }
      .fullName {
        display: flex;
        align-items: center;
      }
    }
    .resourceEntry:not(.expandBtn) {
      width: 156px;
    }
    .expandBtn {
      margin-right: 4px;
    }
  }
`;
const Content = styled.div`
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
`;

const BaseEntry = styled.a`
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  .fullName {
    display: none;
    margin-left: 8px;
    font-size: 14px;
  }
  &:hover {
    color: inherit;
    background: var(--color-background-primary);
  }
`;

const ModuleEntries = styled.div``;

const ModuleEntry = styled(BaseEntry)`
  margin: 8px 0;
  min-height: 48px;
  padding: 4px;
  box-sizing: border-box;
  position: relative;
  .entryIcon {
    font-size: 24px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }
  .name {
    font-size: 12px;
    color: var(--color-text-primary);
    opacity: 0.8;
    width: 100%;
    line-height: 18px;
    text-align: center;
    white-space: normal;
    word-break: break-word;
  }
  .fullName {
    font-size: 14px;
    color: var(--color-text-primary);
  }
  &.isExpanded {
    width: 164px;
  }
  &.active {
    .entryIcon,
    .fullName,
    .name {
      color: ${({ $themeColor }) => $themeColor};
    }
    background: ${({ $activeColor }) => $activeColor};
  }
`;

const Spacer = styled.div`
  flex: 1;
`;
const ResourceEntries = styled.div``;
const ResourceEntry = styled(BaseEntry)`
  margin: 6px auto 0;
  width: 40px;
  height: 40px;
  .entryIcon {
    font-size: 20px;
  }
`;

const DashboardEntry = styled.div`
  position: relative;
  .count {
    cursor: pointer;
    color: var(--color-white);
    position: absolute;
    right: 0px;
    top: -2px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    line-height: 20px;
    width: 20px;
    height: 20px;
    background-color: var(--color-error);
    z-index: 1;
    &.isExpanded {
      right: 12px;
      top: 10px;
    }
    &.outed {
      width: auto;
      padding: 0 4px;
    }
  }
  .weakCount {
    height: 7px;
    width: 7px;
    border-radius: 20px;
    background-color: var(--color-error);
    position: absolute;
    left: 31px;
    top: 5px;
    &.isExpanded {
      left: 82px;
      top: 10px;
    }
  }
`;

const getModuleEntries = () => [
  {
    type: 'dashboard',
    icon: 'home_page',
    name: _l('工作台'),
    href: '/dashboard',
  },
  {
    type: 'app',
    icon: 'widgets',
    name: _l('应用'),
    href: '/app/my',
  },
  {
    type: 'favorite',
    icon: 'star',
    name: _l('收藏'),
    fullName: _l('收藏'),
    href: '/favorite',
  },
  window.platformENV.isHap
    ? {
        type: 'market',
        icon: 'merchant',
        name: _l('市场'),
        fullName: _l('市场'),
      }
    : {
        type: 'lib',
        icon: 'custom_store',
        name: _l('应用库%01000'),
        fullName: _l('应用库%01012'),
        href: '/app/lib',
      },
  {
    type: 'cooperation',
    icon: 'cooperation',
    name: _l('协作%01001'),
    fullName: _l('协作%01013'),
  },
  {
    type: 'integration',
    icon: 'hub',
    name: _l('集成%01002'),
    fullName: _l('集成%01002'),
  },
  {
    type: 'plugin',
    icon: 'extension_black1',
    name: _l('插件'),
    fullName: _l('插件'),
  },
];

export default function SideNav(props) {
  const { active, currentProject = {}, countData, dashboardColor, hasBgImg, myPermissions = [] } = props;
  const [isExpanded, setIsExpanded] = useState(localStorage.getItem('homeNavIsExpanded') === '1');
  const [thirdPartyAppVisible, setThirdPartyAppVisible] = useState();
  const [sourcesList, setSourcesList] = useState([]);
  const moduleEntries = getModuleEntries();
  const nativeAppItems = getNativeAppItems();
  const nativeIntegrationItems = getNativeIntegrationItems();
  const { projectId } = currentProject;
  const cooperationItems = nativeAppItems.filter(
    item =>
      md.global.SysSettings.forbidSuites.indexOf(item.key) === -1 &&
      (item.id !== 'hr' || _.get(currentProject, 'isHrVisible')),
  );
  const count = countData ? (countData.waitingDispose > 99 ? '99+' : countData.waitingDispose) : 0;
  const isExternal = _.isEmpty(getCurrentProject(projectId));
  const hasPluginAuth =
    hasFeaturePermission(projectId, FEATURE_PERMISSION.PLUGIN) ||
    hasPermission(myPermissions, PERMISSION_ENUM.MANAGE_PLUGINS);
  const hasDataIntegrationAuth =
    !_.get(window, 'md.global.SysSettings.hideDataPipeline') &&
    hasPermission(myPermissions, [
      PERMISSION_ENUM.CREATE_SYNC_TASK_FEATURE,
      PERMISSION_ENUM.CREATE_SYNC_TASK,
      PERMISSION_ENUM.MANAGE_SYNC_TASKS,
      PERMISSION_ENUM.MANAGE_DATA_SOURCES,
      PERMISSION_ENUM.MANAGE_DATA_MIRROR,
    ]);

  useEffect(() => {
    privateSource.getSources({ status: 1 }).then(result => {
      const list = result.map(item => {
        return {
          color: item.color,
          iconUrl: item.iconUrl,
          name: item.eventParams && item.eventParams.name == 'tpapp' ? _l('第三方应用') : item.name,
          id: item.eventParams ? 'thirdPartyApp' : item.id,
          href: item.linkParams ? item.linkParams.url : null,
        };
      });

      setSourcesList(list);
    });
  }, []);

  const renderModuleItem = (entry, index) => {
    if (isExternal && ['favorite', 'integration', 'plugin'].includes(entry.type)) {
      return '';
    }

    const content = (
      <ModuleEntry
        key={index}
        $themeColor={dashboardColor.themeColor}
        $activeColor={dashboardColor.activeColor}
        className={cx('moduleEntry', {
          active: active === entry.type,
          libraryEntry: 'lib' === entry.type,
          isExpanded,
        })}
        href={
          'lib' === entry.type
            ? projectId === 'external'
              ? entry.href
              : pathCompletion(`${entry.href}?projectId=${projectId}`, { hasDomain: false })
            : pathCompletion(entry.href, { hasDomain: false })
        }
        onClick={
          !entry.href
            ? () => {
                if (entry.type === 'integration') {
                  const type = localStorage.getItem('integrationUrl');
                  navigateTo('/integration/' + (type || ''));
                } else if (entry.type === 'plugin') {
                  const type = localStorage.getItem('pluginUrl');
                  navigateTo('/plugin/' + (type || ''));
                } else if (entry.type === 'market') {
                  window.open(`${md.global.Config.MarketUrl}/apps`);
                }
              }
            : _.noop
        }
      >
        <i className={`entryIcon icon icon-${entry.icon}`} />
        <span className="name">{entry.name}</span>
        <span className="fullName ellipsis">{entry.fullName || entry.name}</span>
      </ModuleEntry>
    );

    switch (entry.type) {
      case 'dashboard':
        return (
          <DashboardEntry key={index}>
            {content}
            {!!count && <span className={cx('count', { isExpanded, outed: String(count) === '99+' })}>{count}</span>}
            {!count && !!_.get(countData, 'waitingExamine') && (
              <span className={cx('weakCount', { isExpanded })}></span>
            )}
          </DashboardEntry>
        );
      case 'cooperation':
        return (
          <Dropdown
            key={index}
            trigger={['hover']}
            placement="rightTop"
            transitionName={POPOVER_TRANSITION_NAME}
            styles={DROPDOWN_STYLES}
            menu={{ items: getDropdownItems(cooperationItems), style: { width: 200 } }}
          >
            {content}
          </Dropdown>
        );
      case 'integration':
        return hasDataIntegrationAuth ? (
          <Dropdown
            key={index}
            trigger={['hover']}
            placement="rightTop"
            transitionName={POPOVER_TRANSITION_NAME}
            styles={DROPDOWN_STYLES}
            menu={{ items: getDropdownItems(nativeIntegrationItems), style: { width: 200 } }}
          >
            {content}
          </Dropdown>
        ) : (
          content
        );
      default:
        return content;
    }
  };

  const renderResourceItem = (entry, index) => {
    const content = (
      <ResourceEntry
        {...(entry.href ? { target: '_blank' } : {})}
        className="resourceEntry"
        key={index}
        href={entry.href}
        onClick={() => {
          if (!entry.href) {
            if (entry.id === 'thirdPartyApp') {
              setThirdPartyAppVisible(true);
            }
          }
        }}
      >
        {entry.icon && <i className={`entryIcon icon icon-${entry.icon}`} style={{ color: entry.color }} />}
        {entry.iconUrl && <SvgIcon size="18" fill={entry.color} url={entry.iconUrl} />}
        <span className="fullName ellipsis">{entry.name}</span>
      </ResourceEntry>
    );

    switch (true) {
      case !isExpanded && _.includes(['recommend', 'thirdPartyApp', 'integration'], entry.id):
        return (
          <Tooltip key={index} placement="right" title={entry.name}>
            {content}
          </Tooltip>
        );
      default:
        return content;
    }
  };

  return (
    <Con
      className={cx('sideNavWrapper', { isExpanded })}
      $themeBgColor={hasBgImg ? 'unset' : 'var(--color-background-primary)'}
    >
      <div className="sideNavMask" />
      <ScrollView className="h100">
        <Content>
          {thirdPartyAppVisible && <ThirdApp onCancel={() => setThirdPartyAppVisible(false)} />}
          <ModuleEntries>
            {(!cooperationItems.length ? moduleEntries.filter(m => m.type !== 'cooperation') : moduleEntries)
              .filter(
                o =>
                  !(o.type === 'cooperation' && !nativeAppItems.length) &&
                  !(o.type === 'lib' && md.global.SysSettings.hideTemplateLibrary) &&
                  !(o.type === 'integration' && md.global.SysSettings.hideIntegration) &&
                  !(o.type === 'plugin' && md.global.SysSettings.hidePlugin),
              )
              .map((entry, index) => {
                if (entry.type === 'plugin' && !hasPluginAuth) {
                  return null;
                }

                return renderModuleItem(entry, index);
              })}
          </ModuleEntries>
          <Spacer />
          <ResourceEntries>
            {sourcesList.map((entry, index) => renderResourceItem(entry, index))}

            <div className="flexRow alignItemsCenter">
              {(window.platformENV.isOverseas || window.platformENV.isLocal) && isExpanded && (
                <div className="flex mTop6 Font12 textTertiary" style={{ marginLeft: 44 }}>
                  {'v' + md.global.Config.Version}
                </div>
              )}

              <Tooltip placement="right" title={isExpanded ? _l('收起导航') : _l('展开导航')}>
                <ResourceEntry
                  className="resourceEntry expandBtn"
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                    safeLocalStorageSetItem('homeNavIsExpanded', !isExpanded ? '1' : '');
                  }}
                >
                  {(window.platformENV.isOverseas || window.platformENV.isLocal) && (
                    <span className="fullName Font12 textSecondary flex" style={{ marginLeft: '25px' }}>
                      {'v' + md.global.Config.Version}
                    </span>
                  )}
                  <i className={`entryIcon icon ${isExpanded ? 'icon-menu_left' : 'icon-menu_right'} textSecondary`} />
                </ResourceEntry>
              </Tooltip>
            </div>
          </ResourceEntries>
        </Content>
      </ScrollView>
    </Con>
  );
}
