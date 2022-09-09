import React, { useState, useEffect } from 'react';
import { string, bool, shape, arrayOf, func } from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { ScrollView, Icon } from 'ming-ui';
import cx from 'classnames';
import { VerticalMiddle, FlexSpacer, FlexCenter } from 'worksheet/components/Basics';
import NoProjectsStatus from './NoProjectsStatus';
import SearchInput from './SearchInput';
import AppGroupSkeleton from './AppGroupSkeleton';
import AppList from './AppList';
import HomeSetting from './HomeSetting';
import _ from 'lodash';

const Con = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ScrollCon = styled(ScrollView)`
  flex: 1;
`;
const AppsCon = styled.div`
  padding: 21px 40px 64px 80px;
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
`;

const GroupTab = styled.div`
  cursor: pointer;
  padding: 5px 16px;
  color: #757575;
  background-color: #f5f5f5;
  margin-right: 8px;
  border-radius: 36px;
  font-weight: bolder;
  max-width: 156px;
  &.active,
  &:hover {
    color: #2196f3;
    background-color: rgba(33, 150, 243, 0.08);
  }
`;

const SearchInputCon = styled.div`
  display: flex;
  padding: 24px 80px 16px 76px;
`;

const NoExternalAppTip = styled.div`
  margin: -12px 0 20px;
`;

function GroupTitle(props) {
  const { disabled, title, group, isFolded, count, showAllTip, onClick = _.noop } = props;
  return (
    <GroupTitleCon className={cx({ mBottom8: isFolded })}>
      <GroupTitleContent className={cx({ disabled })} onClick={disabled ? _.noop : onClick}>
        {disabled ? (
          <span className="mRight18" />
        ) : (
          <Icon icon={isFolded ? 'arrow-right-tip' : 'arrow-down'} className="arrowIcon mRight6 Font12 Gray_9d" />
        )}
        <div className="ellipsis">{title}</div>
      </GroupTitleContent>
      {_.isNumber(count) && count !== 0 && <span className="Gray_bd mLeft4 Bold">{count}</span>}
      {showAllTip && <ShowAllTip>{_l('所有组织')}</ShowAllTip>}
    </GroupTitleCon>
  );
}

function MarkedGroupTile(props) {
  const { projectId, markedGroup } = props;
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
        {markedGroup.map((group, i) => (
          <GroupTile>
            <GroupTitle
              title={group.name}
              count={group.count}
              group={group}
              isFolded={foldedMap[group.id]}
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
        ))}
      </GroupTiles>
    </div>
  );
}

MarkedGroupTile.propTypes = {
  projectId: string,
  markedGroup: arrayOf(shape({})),
};

function MarkedGroupTab(props) {
  const { projectId, markedGroup, setting } = props;
  const [activeGroupId, setActiveGroupId] = useState(_.get(markedGroup, '0.id'));
  const [isFolded, setIsFolded] = useState();
  let safeActiveGroupId = activeGroupId;
  const activeGroup = _.find(markedGroup, { id: safeActiveGroupId }) || markedGroup[0];
  if (activeGroupId !== activeGroup.id) {
    safeActiveGroupId = activeGroup.id;
  }
  return (
    <div>
      <GroupTitle title={_l('星标分组')} isFolded={isFolded} onClick={() => setIsFolded(!isFolded)} />
      {!isFolded && (
        <React.Fragment>
          <GroupTabs>
            {markedGroup.map((group, i) => (
              <GroupTab
                key={i}
                className={cx('ellipsis', { active: safeActiveGroupId === group.id })}
                onClick={() => setActiveGroupId(group.id)}
              >
                {group.name}
              </GroupTab>
            ))}
          </GroupTabs>
          {activeGroup && (
            <AppList {...props} type="group" groupId={activeGroup.id} projectId={projectId} apps={activeGroup.apps} />
          )}
        </React.Fragment>
      )}
    </div>
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
    ...rest
  } = props;
  const { actions } = rest;
  const showType = setting.displayType === 0 ? 'tile' : 'tab';
  const isExternal = projectId === 'external';
  const showExternalAndAlone = setting.exDisplay || isExternal;
  const [foldedMap, setFoldedMap] = useState(
    safeParse(localStorage.getItem(`home_fold_${md.global.Account.accountId}`) || '{}'),
  );
  const noProjects = !md.global.Account.projects.length;
  const markedGroup = (props.markedGroup || [])
    .map(g => ({
      ...g,
      apps: (g.appIds || []).map(aId => _.find([...myApps, ...markedApps], { id: aId })).filter(_.identity),
    }))
    .filter(g => g.apps.length);
  function toggleFolded(key) {
    setFoldedMap(oldValue => ({ ...oldValue, [key]: !oldValue[key] }));
  }
  function renderGroup({ title, type, allowCreate, apps = [] } = {}) {
    return (
      (!!apps.length || (type === 'project' && !noProjects) || (type === 'external' && isExternal)) && (
        <React.Fragment>
          <GroupTitle
            disabled={type === 'external' && isExternal && !apps.length}
            title={title}
            count={apps.length}
            showAllTip={type === 'star' && setting.markedAppDisplay === 1}
            isFolded={foldedMap[type]}
            onClick={() => toggleFolded(type)}
          />
          {!foldedMap[type] && (
            <AppList {...props} type={type} projectId={projectId} allowCreate={allowCreate} apps={apps} />
          )}
          {type === 'external' && isExternal && !apps.length && (
            <NoExternalAppTip className="Font14 Gray75">{_l('暂无外部协作者的应用')}</NoExternalAppTip>
          )}
        </React.Fragment>
      )
    );
  }

  function handleKeyDown(e) {
    console.log(e);
  }
  useEffect(() => {
    safeLocalStorageSetItem(`home_fold_${md.global.Account.accountId}`, JSON.stringify(foldedMap));
  }, [foldedMap]);
  useEffect(() => {
    safeLocalStorageSetItem(`home_show_type_${md.global.Account.accountId}`, showType);
  }, [showType]);
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  if (loading) {
    return <AppGroupSkeleton />;
  }
  if (activeGroup) {
    return (
      <Con>
        <SearchInputCon>
          <SearchInput placeholder={_l('搜索应用')} value={keywords} onChange={v => actions.updateKeywords(v)} />
        </SearchInputCon>
        <ScrollCon>
          <AppsCon>
            <GroupTitle
              disabled
              title={activeGroup.name}
              count={activeGroupApps.length}
              isFolded={foldedMap[activeGroup.id]}
              onClick={() => toggleFolded(activeGroup.id)}
            />
            <AppList
              {...props}
              allowCreate={!keywords && !noProjects}
              type="group"
              groupId={activeGroup.id}
              groupType={activeGroup.groupType}
              projectId={projectId}
              apps={activeGroupApps}
            />
          </AppsCon>
        </ScrollCon>
      </Con>
    );
  }
  return (
    <Con>
      {!projectId && <NoProjectsStatus hasExternalApps />}
      <SearchInputCon>
        <SearchInput placeholder={_l('搜索应用')} value={keywords} onChange={v => actions.updateKeywords(v)} />
        {!isExternal && projectId && (
          <HomeSetting setting={setting} onUpdate={value => actions.editHomeSetting({ projectId, ...value })} />
        )}
      </SearchInputCon>
      <ScrollCon>
        <AppsCon>
          {!isExternal && renderGroup({ title: _l('星标应用'), type: 'star', apps: markedApps })}
          {!isExternal && showType === 'tab' && !!markedGroup.length && (
            <MarkedGroupTab
              {...props}
              allowCreate={!keywords && !noProjects}
              projectId={projectId}
              markedGroup={markedGroup}
            />
          )}
          {!isExternal && showType === 'tile' && !!markedGroup.length && (
            <MarkedGroupTile
              {...props}
              allowCreate={!keywords && !noProjects}
              projectId={projectId}
              markedGroup={markedGroup}
            />
          )}
          {!isExternal &&
            renderGroup({
              title: _l('全部应用'),
              type: 'project',
              allowCreate: !keywords && !noProjects,
              apps: myApps,
            })}
          {(showExternalAndAlone || !projectId) &&
            renderGroup({ title: _l('外部协作'), type: 'external', apps: externalApps })}
          {(isExternal || !projectId) && renderGroup({ title: _l('个人应用'), type: 'personal', apps: aloneApps })}
        </AppsCon>
      </ScrollCon>
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
};
