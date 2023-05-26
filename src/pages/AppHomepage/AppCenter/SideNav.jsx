import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Tooltip, ScrollView } from 'ming-ui';
import ThirdApp from './components/ThirdApp';
import MyProcess from 'src/pages/workflow/MyProcess';
import MyProcessEntry from 'src/pages/workflow/MyProcess/Entry';
import PopupLinks from './components/PopupLinks';
import privateSource from 'src/api/privateSource';
import SvgIcon from 'src/components/SvgIcon';
import _ from 'lodash';
import { navigateTo } from 'src/router/navigateTo';

const NATIVE_APP_ITEM = [
  { id: 'feed', icon: 'dynamic-empty', text: _l('动态'), color: '#2196f3', href: '/feed', key: 1 },
  { id: 'task', icon: 'task_basic_application', text: _l('任务'), color: '#3cca8f', href: '/apps/task', key: 2 },
  { id: 'calendar', icon: 'sidebar_calendar', text: _l('日程'), color: '#ff6d6c', href: '/apps/calendar/home', key: 3 },
  { id: 'knowledge', icon: 'sidebar_knowledge', text: _l('文件'), color: '#F89803', href: '/apps/kc/my', key: 4 },
  { id: 'hr', icon: 'hr_home', text: _l('人事'), color: '#607D8B', href: '/hr', key: 5, openInNew: true },
];

const Con = styled.div`
  overflow: hidden;
  background: #f7f8fc;
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
        display: inline-block;
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
  padding: 14px 8px;
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
  .entryIcon {
    font-size: 24px;
    color: #515151;
  }
  .name {
    font-size: 12px;
  }
  .fullName {
    font-size: 14px;
  }
  .name {
    color: #9e9e9e;
  }
  &.isExpanded {
    width: 164px;
  }
  &.active {
    .entryIcon,
    .fullName,
    .name {
      color: #2196f3;
    }
    background: rgba(33, 150, 243, 0.1);
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

const ProcessEntry = styled.div`
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
    type: 'app',
    icon: 'widgets',
    name: _l('应用'),
    href: '/app/my',
  },
  {
    type: 'myProcess',
    icon: 'task_alt',
    name: _l('待办'),
    fullName: _l('流程待办%01011'),
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
];

const educateEntries = [
  {
    type: 'title',
    title: _l('学习'),
  },
  {
    icon: 'sidebar_video_tutorial',
    name: _l('视频学习'),
    color: '#7C58C2',
    href: 'https://learn.mingdao.net',
  },
  {
    icon: 'help',
    name: _l('帮助文档'),
    color: '#5F7D8B',
    href: 'https://help.mingdao.com',
  },
  {
    icon: 'flag',
    name: _l('实践案例'),
    color: '#2eb240',
    href: 'https://blog.mingdao.com/category/case-study',
  },
  {
    type: 'title',
    title: _l('资源'),
  },
  {
    icon: 'rss_feed',
    color: '#FFA700',
    href: 'https://blog.mingdao.com',
    name: _l('明道云博客'),
  },
  {
    icon: 'zero',
    color: '#2196F3',
    name: _l('零代码社区'),
    href: 'https://bbs.mingdao.net/',
  },
];

export default function SideNav(props) {
  const { active, currentProject = {} } = props;
  const [isExpanded, setIsExpanded] = useState(localStorage.getItem('homeNavIsExpanded') === '1');
  const [countData, setCountData] = useState();
  const [myProcessVisible, setMyProcessVisible] = useState();
  const [thirdPartyAppVisible, setThirdPartyAppVisible] = useState();
  const [sourcesList, setSourcesList] = useState([]);
  const { projectId } = currentProject;
  const cooperationItems = NATIVE_APP_ITEM.filter(
    item =>
      !_.includes(_.get(md, 'global.Config.ForbidSuites') || [], item.key) &&
      (item.id !== 'hr' || _.get(currentProject, 'isHrVisible')),
  );

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

  return (
    <Con className={cx({ isExpanded })}>
      <ScrollView>
        <Content>
          {myProcessVisible && (
            <MyProcess
              countData={countData}
              onCancel={() => setMyProcessVisible(false)}
              updateCountData={setCountData}
            />
          )}
          {thirdPartyAppVisible && <ThirdApp onCancel={() => setThirdPartyAppVisible(false)} />}
          <ModuleEntries>
            {(!cooperationItems.length ? moduleEntries.filter(m => m.type !== 'cooperation') : moduleEntries)
              .filter(
                o =>
                  !(o.type === 'cooperation' && !NATIVE_APP_ITEM.length) &&
                  !(o.type === 'lib' && md.global.SysSettings.hideTemplateLibrary) &&
                  !(o.type === 'integration' && md.global.SysSettings.hideIntegration),
              )
              .map((entry, i) => {
                const content = (
                  <ModuleEntry
                    key={i}
                    className={cx('moduleEntry', {
                      active: active === entry.type,
                      libraryEntry: 'lib' === entry.type,
                      isExpanded,
                    })}
                    href={'lib' === entry.type ? `${entry.href}?projectId=${projectId}` : entry.href}
                    onClick={
                      !entry.href
                        ? e => {
                            if (entry.type === 'myProcess') {
                              setMyProcessVisible(true);
                            } else if (entry.type === 'integration') {
                              const type = localStorage.getItem('integrationUrl');
                              if (type) {
                                navigateTo('/integration/' + type);
                              } else {
                                navigateTo('/integration');
                              }
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
                if (entry.type === 'myProcess') {
                  return (
                    <MyProcessEntry
                      countData={countData}
                      updateCountData={setCountData}
                      renderContent={count => (
                        <ProcessEntry isExpanded={isExpanded}>
                          {content}
                          {!!count && (
                            <span
                              className={cx('count', { isExpanded, outed: String(count) === '99+' })}
                              onClick={() => {
                                setMyProcessVisible(true);
                              }}
                            >
                              {count}
                            </span>
                          )}
                        </ProcessEntry>
                      )}
                    />
                  );
                }
                if (entry.type === 'cooperation') {
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
                }
                return content;
              })}
          </ModuleEntries>
          <Spacer />
          <ResourceEntries>
            {sourcesList.map((entry, index) => {
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
              if (entry.id === 'educate') {
                return (
                  <Trigger
                    action={['hover']}
                    popupAlign={{
                      points: ['tl', 'tr'],
                      offset: [16, -108],
                      overflow: { adjustY: true },
                    }}
                    popup={<PopupLinks openInNew items={educateEntries} />}
                    mouseLeaveDelay={0.2}
                  >
                    {content}
                  </Trigger>
                );
              }
              if (!isExpanded && _.includes(['recommend', 'thirdPartyApp', 'integration'], entry.id)) {
                return (
                  <Tooltip popupPlacement="right" text={<span>{entry.name}</span>}>
                    {content}
                  </Tooltip>
                );
              }
              return content;
            })}
            <ResourceEntry
              className="resourceEntry expandBtn"
              onClick={() => {
                setIsExpanded(!isExpanded);
                safeLocalStorageSetItem('homeNavIsExpanded', !isExpanded ? '1' : '');
              }}
            >
              <span className="fullName Font12 Gray_9e flex" style={{ marginLeft: '25px' }}>
                {_l('v%0', md.global.Config.Version)}
              </span>
              <i className={`entryIcon icon ${isExpanded ? 'icon-menu_left' : 'icon-menu_right'} Gray_75`} />
            </ResourceEntry>
          </ResourceEntries>
        </Content>
      </ScrollView>
    </Con>
  );
}
