import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { string, bool, shape, arrayOf, func } from 'prop-types';
import styled from 'styled-components';
import { ScrollView, Icon } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import { Tooltip } from 'antd';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { VerticalMiddle } from 'worksheet/components/Basics';
import AddAppItem from './AddAppItem';
import NoProjectsStatus from './NoProjectsStatus';
import SearchInput from './SearchInput';
import AppGroupSkeleton from './AppGroupSkeleton';
import AppList from './AppList';
import HomeSetting from './HomeSetting';
import _ from 'lodash';
import { navigateTo } from 'src/router/navigateTo';
import RecentAppList from './RecentAppList';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);

const Con = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ScrollCon = styled(ScrollView)`
  flex: 1;
`;
const AppsCon = styled.div`
  padding: 0px 40px 160px 80px;
`;

const GroupTiles = styled.div``;
const GroupTile = styled.div``;
const ShowAllTip = styled.div`
  margin-left: 12px;
  height: 24px;
  line-height: 24px;
  border-radius: 24px;
  padding: 0 10px;
  background: #f4f4f4;
  color: #757575;
  font-size: 12px;
`;
const GroupTitleCon = styled(VerticalMiddle)`
  height: 32px;
  width: fit-content;
  .groupStarIcon {
    display: none;
    margin-left: 10px;
    cursor: pointer;
    i {
      color: #f9ce1d;
      font-size: 18px;
    }
  }
  &:hover {
    .groupStarIcon {
      display: block;
    }
  }
`;
const GroupTitleContent = styled(VerticalMiddle)`
  display: inline-flex;
  height: 28px;
  padding: 0 8px;
  margin-left: -26px;
  max-width: 300px;
  font-size: 17px;
  font-weight: bolder;
  border-radius: 4px;
  .mRight4 {
    margin-right: 4px;
  }
  .icon-arrow-down {
    visibility: hidden;
  }
  &:not(.disabled) {
    cursor: pointer;
    &:hover {
      background: #f2f2f2;
      .icon-arrow-down {
        visibility: visible;
      }
    }
  }
`;

const GroupTabs = styled.div`
  display: flex;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const GroupTab = styled.div`
  cursor: pointer;
  padding: 5px 16px;
  color: #757575;
  background-color: #f5f5f5;
  margin-right: 8px;
  border-radius: 36px;
  font-weight: bolder;
  max-width: 200px;
  margin-bottom: 8px;
  &.active,
  &:hover {
    color: #2196f3;
    background-color: rgba(33, 150, 243, 0.08);
  }
`;

const GroupTabClickPopup = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 200px;
  height: 46px;
  padding: 0 16px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.24);
  &:hover {
    color: #2196f3;
    i {
      color: #2196f3 !important;
    }
  }
`;

const SearchInputCon = styled.div`
  display: flex;
  padding: 24px 70px 16px 76px;
`;

const NoExternalAppTip = styled.div`
  margin: -12px 0 20px;
`;

const NoSearchResultTip = styled.div`
  margin-top: -12px;
`;

const AddAppItemBtn = styled(AddAppItem)`
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  .newAppBtn {
    font-size: 13px;
    display: inline-block;
    color: #fff;
    line-height: 36px;
    font-weight: 700;
    border-radius: 36px;
    height: 36px;
    padding: 0 18px 0 16px;
    cursor: pointer;
    background: #2196f3;
    &:hover {
      background: #1565bf;
    }
  }
  &.addAppItemWrap .addAppItemMenu {
    top: 40px !important;
    right: 0px;
    left: auto !important;
  }
`;

const GroupTabList = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 0 0 8px;

  ul {
    overflow: hidden;
    height: 27px;
    font-size: 0;
    li {
      display: inline-block;
      box-sizing: border-box;
      font-size: 15px;
      cursor: pointer;
      &:first-child {
        .liContent {
          margin-right: 24px;
        }
      }
      &:hover {
        .liContent {
          .itemText {
            border-bottom: 2px solid #ddd;
          }
          .starIcon {
            display: inline-block;
            &:hover {
              color: #f9ce1d;
            }
          }
        }
      }
      &.isActive {
        .liContent {
          .itemText {
            border-bottom: 2px solid #2196f3;
            font-weight: bold;
            color: #333;
          }
        }
      }

      .liContent {
        display: flex;
        align-items: center;
        position: relative;
        margin-right: 32px;
        .itemText {
          border-bottom: 2px solid rgba(0, 0, 0, 0);
          padding-bottom: 2px;
          max-width: 200px;
          color: #757575;
          font-weight: bold;

          &::before {
            display: block;
            content: attr(title);
            font-weight: bold;
            height: 0;
            overflow: hidden;
            visibility: hidden;
          }
        }
        .divideLine {
          height: 12px;
          border-right: 1px solid #ddd;
          margin-left: 24px;
        }
        .starIcon {
          position: absolute;
          top: 1px;
          right: -20px;
          display: none;
          color: #bdbdbd;
          font-size: 13px;
          &.isMarked {
            color: #f9ce1d;
          }
        }
      }
    }
  }
  .moreTab {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 15px;
    cursor: pointer;
    width: 145px;
    min-width: 145px;
    height: 27px;

    span {
      padding-bottom: 2px;
      border-bottom: 2px solid transparent;
      color: #757575;
      &.isActive {
        color: #2196f3;
        border-bottom: 2px solid #2196f3;
      }
    }
    &:hover {
      span,
      i {
        color: #2196f3 !important;
      }
    }
  }
`;

const MorePopupContainer = styled.div`
  width: 220px;
  background: #fff;
  border-radius: 3px;
  padding: 6px 0;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  .groupItem {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    &:hover {
      background: #f8f8f8;
      .listStarIcon {
        display: block;
      }
    }
    &.isActive {
      background: #f0f7ff;
      color: #2196f3;
    }

    .listStarIcon {
      display: none;
      color: #bdbdbd;
      margin-left: 8px;
      &:hover {
        color: #f9ce1d;
      }
      &.isMarked {
        color: #f9ce1d;
      }
    }
  }
`;

function GroupTitle(props) {
  const {
    disabled,
    title,
    group,
    isFolded,
    count,
    showAllTip,
    onClick = _.noop,
    actions,
    projectId,
    iconName,
    svgIcon,
  } = props;
  return (
    <GroupTitleCon className={cx({ mBottom8: isFolded })}>
      <GroupTitleContent className={cx({ disabled })} onClick={disabled ? _.noop : onClick}>
        {disabled ? (
          <span className="mRight18" />
        ) : (
          <Icon icon={isFolded ? 'arrow-right-tip' : 'arrow-down'} className="mRight4 Font12 Gray_9d" />
        )}
        {iconName && <Icon icon={iconName} className="mRight4 Font20 Gray_75" />}
        {svgIcon && (
          <SvgIcon
            className="mRight4 mTop5"
            size={20}
            url={
              svgIcon.iconUrl ||
              `${md.global.FileStoreConfig.pubHost.replace(/\/$/, '')}/customIcon/${svgIcon.icon}.svg`
            }
            fill="#757575"
          />
        )}
        <div className="ellipsis">{title}</div>
        {_.isNumber(count) && count !== 0 && <span className="Gray_bd mLeft6 Bold Font15">{count}</span>}
      </GroupTitleContent>
      {showAllTip && <ShowAllTip>{_l('所有组织')}</ShowAllTip>}
      {!!group && (
        <Tooltip title={_l('取消标星')} placement="bottom">
          <div
            className="groupStarIcon"
            onClick={() => {
              actions.markGroup({
                id: group.id,
                isMarked: !group.isMarked,
                groupType: group.groupType,
                projectId,
              });
            }}
          >
            <Icon icon="task-star" />
          </div>
        </Tooltip>
      )}
    </GroupTitleCon>
  );
}

function MarkedGroupTile(props) {
  const { projectId, markedGroup, actions, keywords } = props;
  const [foldedMap, setFoldedMap] = useState(
    safeParse(localStorage.getItem(`home_fold_${md.global.Account.accountId}`) || '{}'),
  );
  useEffect(() => {
    safeLocalStorageSetItem(
      `home_fold_${md.global.Account.accountId}`,
      JSON.stringify(
        _.pickBy(
          {
            ...safeParse(localStorage.getItem(`home_fold_${md.global.Account.accountId}`) || '{}'),
            ...foldedMap,
          },
          (v, key) =>
            key.length !== 24 ||
            _.includes(
              markedGroup.map(g => g.id),
              key,
            ),
        ),
      ),
    );
  }, [foldedMap]);
  return (
    <div>
      <GroupTiles>
        {markedGroup.map((group, i) => {
          return group.apps.length || !keywords ? (
            <GroupTile>
              <GroupTitle
                actions={actions}
                projectId={projectId}
                title={group.name}
                count={group.apps.length}
                group={group}
                isFolded={foldedMap[group.id]}
                svgIcon={{ icon: group.icon, iconUrl: group.iconUrl }}
                onClick={() => setFoldedMap(oldValue => ({ ...oldValue, [group.id]: !foldedMap[group.id] }))}
              />
              {!foldedMap[group.id] && (
                <AppList
                  {...props}
                  type="group"
                  groupId={group.id}
                  groupType={group.groupType}
                  projectId={projectId}
                  apps={group.apps}
                />
              )}
            </GroupTile>
          ) : null;
        })}
      </GroupTiles>
    </div>
  );
}

MarkedGroupTile.propTypes = {
  projectId: string,
  markedGroup: arrayOf(shape({})),
};

function MarkedGroupTab(props) {
  const { projectId, markedGroup, actions, keywords } = props;
  const [activeGroupId, setActiveGroupId] = useState(
    localStorage.getItem(`home_active_star_group_${projectId}_${md.global.Account.accountId}`) ||
      _.get(markedGroup, '0.id'),
  );
  const [isFolded, setIsFolded] = useState();
  const [popupVisible, setPopupVisible] = useState({});
  let safeActiveGroupId = activeGroupId;
  const activeGroup = _.find(markedGroup, { id: safeActiveGroupId }) || markedGroup[0];
  if (activeGroupId !== activeGroup.id) {
    safeActiveGroupId = activeGroup.id;
  }
  return (
    !keywords && (
      <div>
        <GroupTitle
          title={_l('星标分组')}
          isFolded={isFolded}
          iconName="folder_special_black_24dp"
          onClick={() => setIsFolded(!isFolded)}
        />
        {!isFolded && (
          <React.Fragment>
            <GroupTabs>
              {markedGroup.map((group, i) => (
                <Trigger
                  getPopupContainer={() => document.body}
                  popupVisible={popupVisible[group.id]}
                  popupAlign={{
                    points: ['tl', 'bl'],
                    offset: [0, 8],
                    overflow: { adjustX: true, adjustY: true },
                  }}
                  popup={
                    <GroupTabClickPopup
                      className="groupTabClickPopup"
                      onClick={() => {
                        actions.markGroup({
                          id: group.id,
                          isMarked: !group.isMarked,
                          groupType: group.groupType,
                          projectId,
                        });
                      }}
                    >
                      <Icon icon="task-star" className="Gray_9d Font20" />
                      <span className="mLeft10 mTop2">{_l('取消标星')}</span>
                    </GroupTabClickPopup>
                  }
                >
                  <ClickAwayable
                    onClickAway={() => setPopupVisible({ [group.id]: false })}
                    onClickAwayExceptions={['.groupTabClickPopup']}
                  >
                    <GroupTab
                      key={i}
                      className={cx('ellipsis', { active: safeActiveGroupId === group.id })}
                      onClick={() => {
                        setActiveGroupId(group.id);
                        safeLocalStorageSetItem(
                          `home_active_star_group_${projectId}_${md.global.Account.accountId}`,
                          group.id,
                        );
                      }}
                      onContextMenu={e => {
                        e.preventDefault();
                        setPopupVisible({ [group.id]: true });
                      }}
                    >
                      {group.name}
                    </GroupTab>
                  </ClickAwayable>
                </Trigger>
              ))}
            </GroupTabs>
            {activeGroup && (
              <AppList
                {...props}
                type="group"
                groupId={activeGroup.id}
                groupType={activeGroup.groupType}
                projectId={projectId}
                apps={activeGroup.apps}
              />
            )}
          </React.Fragment>
        )}
      </div>
    )
  );
}

MarkedGroupTab.propTypes = {
  projectId: string,
  markedGroup: arrayOf(shape({})),
};

export default function AppGrid(props) {
  const {
    setting = {},
    keywords,
    activeGroup,
    projectId,
    loading,
    myApps = [],
    markedApps = [],
    externalApps = [],
    aloneApps = [],
    activeGroupApps = [],
    recentApps = [],
    groups = [],
    isAllActive,
    ...rest
  } = props;
  const { actions } = rest;
  const showType = setting.displayType === 0 ? 'tile' : 'tab';
  const isExternal = projectId === 'external';
  const showExternalAndAlone = setting.exDisplay || isExternal;
  const [foldedMap, setFoldedMap] = useState(
    safeParse(localStorage.getItem(`home_fold_${md.global.Account.accountId}`) || '{}'),
  );
  const [currentGroupTab, setCurrentGroupTab] = useState(
    localStorage.getItem(`home_active_group_tab_${projectId}_${md.global.Account.accountId}`) || 'all',
  );
  const [morePopupVisible, setMorePopupVisible] = useState(false);
  const [moreGroups, setMoreGroups] = useState([]);
  const groupListRef = useRef();
  const [activeMoreGroup, setActiveMoreGroup] = useState('');
  const projectGroups = groups.filter(g => g.groupType === 1);
  const [hasMore, setHasMore] = useState(false);
  const moreTabRef = useRef();

  const noProjects = !md.global.Account.projects.length;
  const allowCreate = !keywords && !noProjects;
  const markedGroup = (props.markedGroup || []).map(g => ({
    ...g,
    apps: (g.appIds || []).map(aId => _.find([...myApps, ...markedApps], { id: aId })).filter(_.identity),
  }));

  function toggleFolded(key) {
    setFoldedMap(oldValue => ({ ...oldValue, [key]: !oldValue[key] }));
  }

  const getDisplayGroupCount = () => {
    const liWidthArr = [...groupListRef.current.children].map(item => item.offsetWidth);
    let displayWidth = 0;
    let count = 0;
    liWidthArr.forEach(item => {
      displayWidth += item;
      if (displayWidth <= groupListRef.current.offsetWidth) {
        count++;
      }
    });
    return count;
  };

  const switchMoreBtn = () => {
    if (groupListRef.current) {
      moreTabRef.current && (moreTabRef.current.style.display = 'none');
      setHasMore(groupListRef.current.offsetHeight < groupListRef.current.scrollHeight);
      moreTabRef.current && (moreTabRef.current.style.display = 'flex');
    }

    const $box = $('.myAppGroupDetail');
    if (window.ResizeObserver && !!$box.length && !$box.data('bind')) {
      const observer = new ResizeObserver(switchMoreBtn);

      observer.observe($box[0]);
      $box.data('bind', true);
    }
  };

  useLayoutEffect(switchMoreBtn, [groups, groupListRef.current]);

  useLayoutEffect(() => {
    if (hasMore) {
      if (
        $(groupListRef.current).find('li').eq(0).offset().top !== $(groupListRef.current).find('.isActive').offset().top
      ) {
        setActiveMoreGroup($(groupListRef.current).find('.isActive').text());
      }
    }
  }, [hasMore]);

  useEffect(() => {
    if (groups.length) {
      const cacheGroupTabId = localStorage.getItem(`home_active_group_tab_${projectId}_${md.global.Account.accountId}`);
      const cacheGroup = projectGroups.filter(g => g.id === cacheGroupTabId)[0];
      if (!cacheGroup) {
        //记忆的分组不存在，切换到全部tab
        setCurrentGroupTab('all');
        setActiveMoreGroup('');
      }
    }
  }, [groups]);

  const onMarkGroup = (e, group) => {
    e.stopPropagation();
    actions.markGroup({
      id: group.id,
      isMarked: !group.isMarked,
      groupType: group.groupType,
      projectId,
    });
  };

  function renderProjectGroups() {
    const groupList = [{ id: 'all', name: _l('全部') }].concat(projectGroups);
    return (
      !!projectGroups.length && (
        <GroupTabList>
          <ul ref={groupListRef}>
            {groupList.map((group, index) => {
              return (
                <li
                  key={index}
                  className={cx({ isActive: group.id === currentGroupTab })}
                  onClick={() => {
                    if (currentGroupTab === group.id) {
                      return;
                    }
                    setCurrentGroupTab(group.id);
                    setActiveMoreGroup('');
                  }}
                >
                  <div className="liContent">
                    <span title={group.name} className="overflow_ellipsis itemText">
                      {group.name}
                    </span>
                    {group.id === 'all' ? (
                      <div className="divideLine" />
                    ) : (
                      <Tooltip
                        title={group.isMarked ? _l('取消标星') : _l('标星，显示在首页')}
                        placement="bottom"
                        mouseEnterDelay={0.2}
                      >
                        <div
                          className={cx('starIcon', { isMarked: group.isMarked })}
                          onClick={e => onMarkGroup(e, group)}
                        >
                          <Icon icon={group.isMarked ? 'task-star' : 'star-hollow'} />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {hasMore && (
            <Trigger
              action={['click']}
              getPopupContainer={() => document.body}
              popupVisible={morePopupVisible}
              onPopupVisibleChange={visible => setMorePopupVisible(visible)}
              popupAlign={{
                points: ['tr', 'br'],
                offset: [0, 10],
                overflow: { adjustX: true, adjustY: true },
              }}
              popup={
                <MorePopupContainer>
                  {moreGroups.map(group => {
                    return (
                      <div
                        className={cx('groupItem', { isActive: group.id === currentGroupTab })}
                        onClick={() => {
                          setCurrentGroupTab(group.id);
                          setActiveMoreGroup(group.name);
                          setMorePopupVisible(false);
                        }}
                      >
                        <span className="overflow_ellipsis" title={group.name}>
                          {group.name}
                        </span>
                        <Tooltip title={group.isMarked ? _l('取消标星') : _l('标星，显示在首页')} placement="bottom">
                          <div
                            className={cx('listStarIcon', { isMarked: group.isMarked })}
                            onClick={e => {
                              onMarkGroup(e, group);
                              setMorePopupVisible(false);
                            }}
                          >
                            <Icon icon={group.isMarked ? 'task-star' : 'star-hollow'} />
                          </div>
                        </Tooltip>
                      </div>
                    );
                  })}
                </MorePopupContainer>
              }
            >
              <div
                className="moreTab"
                ref={moreTabRef}
                onClick={() => {
                  const displayGroupCount = getDisplayGroupCount();
                  const newMoreGroups = projectGroups.filter((_, i) => i >= displayGroupCount - 1);
                  setMoreGroups(newMoreGroups);
                }}
              >
                <div className="flexRow alignItemsCenter">
                  <span className={cx('overflow_ellipsis bold', { isActive: !!activeMoreGroup })}>
                    {activeMoreGroup || _l('更多')}
                  </span>
                  <Icon icon="arrow-down-border" className="mLeft10 Gray_9d pBottom2" />
                </div>
              </div>
            </Trigger>
          )}
        </GroupTabList>
      )
    );
  }

  function renderGroup({ title, type, allowCreate, apps = [], iconName } = {}) {
    return (
      (!!apps.length || (type === 'project' && !noProjects) || (type === 'external' && isExternal)) && (
        <React.Fragment>
          <GroupTitle
            disabled={(type === 'external' && isExternal && !apps.length) || isAllActive}
            title={title}
            count={apps.length}
            showAllTip={type === 'star' && setting.markedAppDisplay === 1}
            isFolded={foldedMap[type]}
            iconName={iconName}
            onClick={() => toggleFolded(type)}
          />
          {(!foldedMap[type] || isAllActive) && (
            <React.Fragment>
              {setting.isAllAndProject && type === 'project' && !isAllActive && !keywords && renderProjectGroups()}
              <AppList
                {...props}
                type={currentGroupTab === 'all' ? type : 'group'}
                projectId={projectId}
                allowCreate={allowCreate}
                groupId={currentGroupTab !== 'all' && !!groups.length && !isAllActive ? currentGroupTab : undefined}
                groupType={
                  currentGroupTab !== 'all' && !!groups.length && !isAllActive
                    ? (projectGroups.filter(g => g.id === currentGroupTab)[0] || {}).groupType
                    : undefined
                }
                apps={
                  type === 'project' &&
                  currentGroupTab !== 'all' &&
                  setting.isAllAndProject &&
                  !isAllActive &&
                  !!groups.length &&
                  !keywords
                    ? apps.filter(app => _.includes(app.groupIds, currentGroupTab))
                    : apps
                }
              />
            </React.Fragment>
          )}
          {type === 'project' && !apps.length && keywords && (
            <NoSearchResultTip className="Font14 Gray_9e">{_l('无搜索结果')}</NoSearchResultTip>
          )}
          {type === 'external' && isExternal && !apps.length && (
            <NoExternalAppTip className="Font14 Gray75">{_l('暂无外部协作者的应用')}</NoExternalAppTip>
          )}
        </React.Fragment>
      )
    );
  }

  function renderRecentApp({ title, type, apps = [] } = {}) {
    return (
      !!apps.length && (
        <React.Fragment>
          <GroupTitle
            title={title}
            count={null}
            isFolded={foldedMap[type]}
            iconName="access_time"
            onClick={() => toggleFolded(type)}
          />
          {!foldedMap[type] && (
            <RecentAppList {...props} projectId={projectId} apps={apps} onMarkApp={args => actions.markApp(args)} />
          )}
        </React.Fragment>
      )
    );
  }

  useEffect(() => {
    safeLocalStorageSetItem(`home_fold_${md.global.Account.accountId}`, JSON.stringify(foldedMap));
  }, [foldedMap]);
  useEffect(() => {
    safeLocalStorageSetItem(`home_show_type_${md.global.Account.accountId}`, showType);
  }, [showType]);
  useEffect(() => {
    safeLocalStorageSetItem(
      `home_active_group_tab_${projectId}_${md.global.Account.accountId}`,
      currentGroupTab !== 'all' ? currentGroupTab : '',
    );
  }, [currentGroupTab]);

  if (activeGroup || isAllActive) {
    return (
      <Con>
        <SearchInputCon>
          <SearchInput placeholder={_l('搜索应用')} value={keywords} onChange={v => actions.updateKeywords(v)} />
        </SearchInputCon>
        {loading ? (
          <AppGroupSkeleton />
        ) : (
          <ScrollCon>
            <AppsCon>
              {isAllActive ? (
                renderGroup({
                  title: _l('全部应用'),
                  type: 'project',
                  allowCreate: allowCreate,
                  apps: myApps,
                })
              ) : (
                <React.Fragment>
                  <GroupTitle
                    disabled
                    title={activeGroup.name}
                    count={activeGroupApps.length}
                    isFolded={foldedMap[activeGroup.id]}
                    onClick={() => toggleFolded(activeGroup.id)}
                  />
                  {keywords && !activeGroupApps.length && (
                    <div className="Font14 Gray_9e mTop24">{_l('无搜索结果')}</div>
                  )}
                  <AppList
                    {...props}
                    allowCreate={allowCreate && !!activeGroup.id}
                    type="group"
                    groupId={activeGroup.id}
                    groupType={activeGroup.groupType}
                    projectId={projectId}
                    apps={activeGroupApps}
                  />
                </React.Fragment>
              )}
            </AppsCon>
          </ScrollCon>
        )}
      </Con>
    );
  }
  return (
    <Con>
      {!loading && !projectId && <NoProjectsStatus hasExternalApps />}
      <SearchInputCon>
        <SearchInput placeholder={_l('搜索应用')} value={keywords} onChange={v => actions.updateKeywords(v)} />
        {!isExternal && projectId && (
          <HomeSetting setting={setting} onUpdate={value => actions.editHomeSetting({ projectId, ...value })} />
        )}
        <div className="flex" />
        {((allowCreate &&
          !isExternal &&
          !_.get(
            _.find(md.global.Account.projects, item => item.projectId === projectId),
            'cannotCreateApp',
          )) ||
          keywords) && (
          <AddAppItemBtn
            projectId={projectId}
            createAppFromEmpty={(...args) =>
              actions.createAppFromEmpty(...args, id => {
                args[0].createType !== 1 ? navigateTo('/app/' + id) : alert(_l('添加外部链接成功'));
              })
            }
          >
            <span className="newAppBtn">
              <i className="Icon icon icon-plus Font13 mRight5 White" />
              {_l('新建应用')}
            </span>
          </AddAppItemBtn>
        )}
      </SearchInputCon>
      {loading ? (
        <AppGroupSkeleton isIndexPage={true} />
      ) : (
        <ScrollCon>
          <AppsCon>
            {!isExternal &&
              setting.displayCommonApp &&
              renderRecentApp({ title: _l('最近使用'), type: 'recent', apps: recentApps })}
            {!isExternal &&
              renderGroup({ title: _l('星标应用'), type: 'star', apps: markedApps, iconName: 'star_outline' })}
            {!isExternal && showType === 'tab' && !!markedGroup.length && (
              <MarkedGroupTab {...props} allowCreate={allowCreate} projectId={projectId} markedGroup={markedGroup} />
            )}
            {!isExternal && showType === 'tile' && !!markedGroup.length && (
              <MarkedGroupTile {...props} allowCreate={allowCreate} projectId={projectId} markedGroup={markedGroup} />
            )}
            {!isExternal &&
              renderGroup({
                title: _l('我的应用'),
                type: 'project',
                allowCreate: allowCreate,
                apps: myApps,
                iconName: 'grid_view',
              })}
            {(showExternalAndAlone || !projectId) &&
              renderGroup({
                title: _l('外部协作'),
                type: 'external',
                apps: externalApps,
                iconName: 'external_collaboration',
              })}
            {(isExternal || !projectId) && renderGroup({ title: _l('个人应用'), type: 'personal', apps: aloneApps })}
          </AppsCon>
        </ScrollCon>
      )}
    </Con>
  );
}

AppGrid.propTypes = {
  isAdmin: bool,
  setting: shape({}),
  activeGroup: shape({}),
  projectId: string,
  currentProject: shape({}),
  loading: bool,
  markedGroup: arrayOf(shape({})),
  myApps: arrayOf(shape({})),
  markedApps: arrayOf(shape({})),
  externalApps: arrayOf(shape({})),
  aloneApps: arrayOf(shape({})),
  activeGroupApps: arrayOf(shape({})),
  recentApps: arrayOf(shape({})),
};
