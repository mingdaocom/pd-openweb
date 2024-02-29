import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Tooltip, ScrollView } from 'ming-ui';
import ThirdApp from './components/ThirdApp';
import PopupLinks from './components/PopupLinks';
import privateSource from 'src/api/privateSource';
import SvgIcon from 'src/components/SvgIcon';
import _ from 'lodash';
import { navigateTo } from 'src/router/navigateTo';
import { getCurrentProject } from 'src/util';

const NATIVE_APP_ITEM = [
  { id: 'feed', icon: 'dynamic-empty', text: _l('动态'), color: '#2196f3', href: '/feed', key: 1 },
  { id: 'task', icon: 'task_basic_application', text: _l('任务'), color: '#3cca8f', href: '/apps/task', key: 2 },
  { id: 'calendar', icon: 'sidebar_calendar', text: _l('日程'), color: '#ff6d6c', href: '/apps/calendar/home', key: 3 },
  { id: 'knowledge', icon: 'sidebar_knowledge', text: _l('文件'), color: '#F89803', href: '/apps/kc/my', key: 4 },
  { id: 'hr', icon: 'hr_home', text: _l('人事'), color: '#607D8B', href: '/hr', key: 5, openInNew: true },
];

const Con = styled.div`
  overflow: hidden;
  background: ${({ themeBgColor }) => themeBgColor};
  transition: width 0.2s;
  width: 68px;
  &.isExpanded {
    width: 180px;
    .moduleEntry,
    .resourceEntry {
      flex-direction: row;
      justify-content: start;
      padding: 0 12px;
      height: 40px;
      .name {
        display: none;
      }
      .fullName {
        display: flex;
        align-items: center;
      }
    }
    .resourceEntry {
      width: 156px;
    }
    .expandBtn {
      justify-content: end;
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
    background: #fff;
  }
`;

const ModuleEntries = styled.div``;

const ModuleEntry = styled(BaseEntry)`
  margin: 8px 0;
  height: 48px;
  position: relative;
  .entryIcon {
    font-size: 24px;
    color: rgba(0, 0, 0, 0.65);
  }
  .name {
    font-size: 12px;
  }
  .fullName {
    font-size: 14px;
  }
  .name {
    color: rgba(0, 0, 0, 0.4);
  }
  &.isExpanded {
    width: 164px;
  }
  &.active {
    .entryIcon,
    .fullName,
    .name {
      color: ${({ themeColor }) => themeColor};
    }
    background: ${({ activeColor }) => activeColor};
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
    color: #fff;
    position: absolute;
    right: 0px;
    top: -2px;
    border-radius: 20px;
    font-size: 12px;
    text-align: center;
    line-height: 20px;
    width: 20px;
    height: 20px;
    background-color: #ff0000;
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
`;

const moduleEntries = [
  {
    type: 'dashboard',
    icon: 'home1',
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
  {
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
    fullName: _l('集成中心%01014'),
  },
  {
    type: 'plugin',
    icon: 'extension_black1',
    name: _l('插件'),
    fullName: _l('插件中心'),
  },
];

export default function SideNav(props) {
  const { active, currentProject = {}, countData, dashboardColor } = props;
  const [isExpanded, setIsExpanded] = useState(localStorage.getItem('homeNavIsExpanded') === '1');
  const [thirdPartyAppVisible, setThirdPartyAppVisible] = useState();
  const [sourcesList, setSourcesList] = useState([]);
  const { projectId } = currentProject;
  const cooperationItems = NATIVE_APP_ITEM.filter(
    item =>
      !_.includes(_.get(md, 'global.Config.ForbidSuites') || [], item.key) &&
      (item.id !== 'hr' || _.get(currentProject, 'isHrVisible')),
  );
  const count = countData ? (countData.myProcessCount > 99 ? '99+' : countData.myProcessCount) : 0;
  const isExternal = _.isEmpty(getCurrentProject(projectId));

  useEffect(() => {
    privateSource.getSources({ status: 1 }).then(result => {
      const list = result.map(item => {
        return {
          color: item.color,
          iconUrl: item.iconUrl,
          name: item.name,
          id: item.eventParams ? 'thirdPartyApp' : item.id,
          href: item.linkParams ? item.linkParams.url : null,
        };
      });

      setSourcesList(list);
    });
  }, []);

  const renderModuleItem = (entry, index) => {
    if (isExternal && entry.type === 'favorite') {
      return '';
    }
    const content = (
      <ModuleEntry
        key={index}
        themeColor={dashboardColor.themeColor}
        activeColor={dashboardColor.activeColor}
        className={cx('moduleEntry', {
          active: active === entry.type,
          libraryEntry: 'lib' === entry.type,
          isExpanded,
        })}
        href={'lib' === entry.type ? `${entry.href}?projectId=${projectId}` : entry.href}
        onClick={
          !entry.href
            ? e => {
                if (entry.type === 'integration') {
                  const type = localStorage.getItem('integrationUrl');
                  navigateTo('/integration/' + (type || ''));
                } else if (entry.type === 'plugin') {
                  const type = localStorage.getItem('pluginUrl');
                  navigateTo('/plugin/' + (type || ''));
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
          <DashboardEntry isExpanded={isExpanded}>
            {content}
            {!!count && <span className={cx('count', { isExpanded, outed: String(count) === '99+' })}>{count}</span>}
          </DashboardEntry>
        );
      case 'cooperation':
        return (
          <Trigger
            action={['hover']}
            popupAlign={{
              points: ['tl', 'tr'],
              offset: [12, -4],
            }}
            popup={
              <PopupLinks
                items={NATIVE_APP_ITEM.filter(
                  item =>
                    !_.includes(_.get(md, 'global.Config.ForbidSuites') || [], item.key) &&
                    (item.id !== 'hr' || _.get(currentProject, 'isHrVisible')),
                )}
              />
            }
          >
            {content}
          </Trigger>
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
      case !isExpanded && _.includes(['thirdPartyApp', 'integration'], entry.id):
        return (
          <Tooltip popupPlacement="right" text={<span>{entry.name}</span>}>
            {content}
          </Tooltip>
        );
      default:
        return content;
    }
  };

  return (
    <Con className={cx({ isExpanded })} themeBgColor={dashboardColor.bgColor}>
      <ScrollView>
        <Content>
          {thirdPartyAppVisible && <ThirdApp onCancel={() => setThirdPartyAppVisible(false)} />}
          <ModuleEntries>
            {(!cooperationItems.length ? moduleEntries.filter(m => m.type !== 'cooperation') : moduleEntries)
              .filter(
                o =>
                  !(o.type === 'cooperation' && !NATIVE_APP_ITEM.length) &&
                  !(o.type === 'lib' && md.global.SysSettings.hideTemplateLibrary) &&
                  !(o.type === 'integration' && md.global.SysSettings.hideIntegration),
              )
              .map((entry, index) => renderModuleItem(entry, index))}
          </ModuleEntries>
          <Spacer />
          <ResourceEntries>
            {sourcesList.map((entry, index) => renderResourceItem(entry, index))}
            <ResourceEntry
              className="resourceEntry expandBtn"
              onClick={() => {
                setIsExpanded(!isExpanded);
                safeLocalStorageSetItem('homeNavIsExpanded', !isExpanded ? '1' : '');
              }}
            >
              <span className="fullName Font12 Gray_9e flex" style={{ marginLeft: '25px' }}>
                {'v' + md.global.Config.Version}
              </span>
              <i className={`entryIcon icon ${isExpanded ? 'icon-menu_left' : 'icon-menu_right'} Gray_75`} />
            </ResourceEntry>
          </ResourceEntries>
          {/* isExpanded && md.global.Config.IsPlatformLocal && md.global.Config.IsCobranding && (
            <div className="w100 TxtCenter pTop12 pBottom12 Gray_9e">
              <span className="pointer Font12" onClick={() => window.open('https://www.mingdao.com')}>
                {_l('基于明道云应用平台内核')}
              </span>
            </div>
          )*/}
        </Content>
      </ScrollView>
    </Con>
  );
}
