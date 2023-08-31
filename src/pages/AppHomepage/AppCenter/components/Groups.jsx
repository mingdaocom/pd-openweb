import React, { useState, useEffect } from 'react';
import { string, bool, arrayOf, shape } from 'prop-types';
import styled from 'styled-components';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { Dialog, ScrollView } from 'ming-ui';
import cx from 'classnames';
import { VerticalMiddle, FlexCenter } from 'worksheet/components/Basics';
import { navigateTo } from 'router/navigateTo';
import homeAppAjax from 'src/api/homeApp';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import AppTrash from 'src/pages/worksheet/common/Trash/AppTrash';
import GroupsSkeleton from './GroupsSkeleton';
import EditGroup from './EditGroup';
import GroupItem from './GroupItem';
import _ from 'lodash';

const Con = styled.div`
  width: 238px;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
  .header {
    justify-content: space-between;
    font-weight: 500;
    margin-right: -12px;
  }
  .title {
    font-size: 20px;
  }
  .upgradeIcon {
    color: #fcb400;
    font-size: 16px;
    margin-left: 6px;
  }
  &:not(.isFolded) {
    overflow: hidden;
  }
  &.isFolded {
    width: 0px;
  }
`;

const PaddingCon = styled.div`
  width: 238px;
  padding: 0px 38px;
`;

const GroupsCon = styled.div`
  flex: 1;
`;
const BaseBtnCon = styled(FlexCenter)`
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 32px;
  z-index: 2;
  &:hover {
    background: #f5f5f5;
  }
`;

function getSortType(type) {
  return { star: 1, project: 2, personal: 3 }[type];
}

const SortableGroupItem = SortableElement(props => <GroupItem {...props} />);

const SortableGroupList = SortableContainer(
  ({ isAdmin, projectId, activeGroupId, groups, item, isDragging, setIsEditingGroupId, actions }) => {
    return (
      <div>
        {!!item.groups.length &&
          item.groups.map((group, j) => {
            return (
              <SortableGroupItem
                isAdmin={isAdmin}
                key={group.id}
                index={j}
                itemType={item.type}
                {...{
                  isDragging,
                  projectId,
                  activeGroupId,
                  id: group.id,
                  groupType: group.groupType,
                  icon: group.icon,
                  iconUrl: group.iconUrl,
                  name: group.name,
                  count: group.count,
                  isMarked: group.isMarked,
                  onEdit: setIsEditingGroupId,
                  onDelete: (deleteId, groupType) => {
                    Dialog.confirm({
                      title: _l('删除分组"%0"', group.name),
                      description: _l('仅删除分组，分组下的应用不会被删除'),
                      buttonType: 'danger',
                      onOk: () => {
                        actions.deleteGroup({
                          id: deleteId,
                          groupType,
                          projectId,
                          cb: err => {
                            if (!err) {
                              if (activeGroupId === deleteId) {
                                navigateTo('/app/my', false, true);
                                actions.loadAppAndGroups({ projectId, noGroupsLoading: true });
                              }
                              alert(_l('删除分组成功'));
                            } else {
                              alert(_l('删除分组失败'), 3);
                            }
                          },
                        });
                      },
                    });
                  },
                  onMark: markedId => {
                    actions.markGroup({
                      id: markedId,
                      isMarked: !group.isMarked,
                      groupType: group.groupType,
                      projectId,
                    });
                  },
                }}
              />
            );
          })}
      </div>
    );
  },
);
export default function Groups(props) {
  const {
    isAdmin,
    loading,
    activeGroupId,
    projectId,
    currentProject,
    markedGroup,
    activeGroup,
    groups = [],
    actions,
    isAllActive,
  } = props;
  const [isDragging, setIsDragging] = useState();
  const [sorts, setSorts] = useState({});
  const [isFolded, setIsFolded] = useState(localStorage.getItem('homeGroupsIsFolded') === '1');
  const [editingGroupId, setIsEditingGroupId] = useState();
  const [addGroupVisible, setAddGroupVisible] = useState();
  const [trashVisible, setTrashVisible] = useState();
  const isFree = currentProject.licenseType === 0;
  const editingGroup = _.find(groups, { id: editingGroupId });
  const list = [
    { name: _l('星标'), type: 'star', groups: markedGroup },
    { name: _l('个人'), type: 'personal', groups: groups.filter(g => g.groupType === 0) },
    { name: _l('组织'), type: 'project', groups: groups.filter(g => g.groupType === 1) },
  ].map(item => ({
    ...item,
    groups: _.sortBy(item.groups, g => (sorts[item.type] || []).indexOf(g.id)),
  }));
  const featureType = getFeatureStatus(projectId, VersionProductType.recycle);
  const expandBtn = (
    <BaseBtnCon
      className={isFolded ? 'mLeft16' : ''}
      onClick={() => {
        setIsFolded(!isFolded);
        safeLocalStorageSetItem('homeGroupsIsFolded', !isFolded ? '1' : '');
      }}
    >
      <i
        className={`expandIcon Right Hand Font20 Gray_75 icon ${!isFolded ? 'icon-menu_left' : 'icon-menu_right'}`}
      ></i>
    </BaseBtnCon>
  );
  if (loading && !isFolded) {
    return (
      <Con>
        <PaddingCon>
          <GroupsSkeleton />
        </PaddingCon>
      </Con>
    );
  }
  return (
    <Con className={cx({ isFolded })}>
      {trashVisible && (
        <AppTrash
          isHomePage
          projectId={projectId}
          onCancel={() => setTrashVisible(false)}
          onRestore={() => {
            actions.loadAppAndGroups(
              Object.assign(
                {
                  projectId,
                  noGroupsLoading: true,
                },
                activeGroup
                  ? {
                      activeGroupType: activeGroup.groupType,
                      activeGroupId: activeGroup.id,
                    }
                  : {},
              ),
            );
          }}
        />
      )}
      {isFolded && expandBtn}
      {!isFolded && (
        <React.Fragment>
          <PaddingCon>
            <VerticalMiddle className="header">
              <span className="title">{_l('应用')}</span>
              {expandBtn}
            </VerticalMiddle>
            <GroupItem
              itemType="static"
              className="mTop10"
              fontIcon="home_page"
              to="/app/my"
              active={!activeGroupId && !isAllActive}
              name={_l('首页')}
              onClick={() => {
                actions.loadAppAndGroups({ projectId, noGroupsLoading: true });
                navigateTo('/app/my');
              }}
            />
            <GroupItem
              itemType="static"
              fontIcon="grid_view"
              to="/app/my/all"
              active={isAllActive}
              name={_l('全部')}
              onClick={() => {
                actions.loadAppAndGroups({ projectId, noGroupsLoading: true });
                navigateTo('/app/my/all');
              }}
            />
            {featureType && (
              <GroupItem
                itemType="static"
                fontIcon="knowledge-recycle"
                name={
                  <span>
                    {_l('回收站')}
                    {isFree && <i className="upgradeIcon icon-auto_awesome"></i>}
                  </span>
                }
                onClick={() => {
                  if (featureType === '2') {
                    buriedUpgradeVersionDialog(projectId, VersionProductType.recycle);
                  } else {
                    setTrashVisible(true);
                  }
                }}
              />
            )}
            <VerticalMiddle className="header mTop20">
              <span className="Font15">{_l('分组')}</span>
              <BaseBtnCon className="mRight5" onClick={() => setAddGroupVisible(true)}>
                <i className="Font24 Gray_9d Hand icon icon-add"></i>
              </BaseBtnCon>
            </VerticalMiddle>
          </PaddingCon>
          <GroupsCon>
            <ScrollView>
              <PaddingCon className="pBottom25">
                {list
                  .filter(item => item.groups && item.groups.length)
                  .map((item, i) => (
                    <div key={i} className="mTop20">
                      <div className="title Gray_9e Font12 mBottom6">{item.name}</div>
                      {item.groups && !!item.groups.length && (
                        <SortableGroupList
                          {...{
                            isAdmin,
                            actions,
                            projectId,
                            activeGroupId,
                            groups,
                            item,
                            isDragging,
                            setIsEditingGroupId,
                          }}
                          axis={'y'}
                          hideSortableGhost
                          helperClass="draggingItem"
                          transitionDuration={0}
                          distance={3}
                          onSortStart={() => setIsDragging(true)}
                          onSortEnd={({ oldIndex, newIndex }) => {
                            setIsDragging(false);
                            const sortedGroups = arrayMove(item.groups, oldIndex, newIndex);
                            setSorts(oldSorts => ({ ...oldSorts, [item.type]: sortedGroups.map(g => g.id) }));
                            homeAppAjax.editGroupSort({
                              projectId,
                              ids: sortedGroups.map(g => g.id),
                              sortType: getSortType(item.type),
                            });
                            if (item.type !== 'personal') {
                              actions.updateGroupSorts(sortedGroups, item.type);
                            }
                          }}
                        />
                      )}
                    </div>
                  ))}
              </PaddingCon>
            </ScrollView>
          </GroupsCon>
        </React.Fragment>
      )}
      {(editingGroupId || addGroupVisible) && (
        <EditGroup
          isAdmin={isAdmin}
          projectId={projectId}
          {...(editingGroup
            ? {
                name: editingGroup.name,
                icon: editingGroup.icon,
                groupType: editingGroup.groupType,
              }
            : {})}
          type={addGroupVisible ? 'add' : 'edit'}
          onChange={({ name, icon, groupType }) => {
            if (addGroupVisible) {
              actions.addGroup({
                projectId,
                name,
                icon,
                groupType,
                cb: status => {
                  if (!status) {
                    setAddGroupVisible(false);
                    alert(_l('新建分组成功'));
                  } else {
                    alert(
                      {
                        2: _l('新建分组失败，分组名重复'),
                        3: _l('新建分组失败，分组超上限'),
                        4: _l('新建分组失败，无权限操作'),
                      }[String(status)] || _l('新建分组失败'),
                      3,
                    );
                  }
                },
              });
            } else {
              actions.editGroup({
                id: editingGroupId,
                projectId,
                name,
                icon,
                groupType,
                cb: status => {
                  if (status === 1) {
                    setIsEditingGroupId(undefined);
                    alert(_l('更新成功'));
                    if (activeGroupId && groupType !== editingGroup.groupType) {
                      navigateTo(`/app/my/group/${projectId}/${groupType}/${editingGroupId}`);
                    }
                  } else {
                    alert(
                      {
                        2: _l('更新分组失败，分组名重复'),
                        3: _l('更新分组失败，分组超上限'),
                        4: _l('更新分组失败，无权限操作'),
                      }[String(status)] || _l('更新分组失败'),
                      3,
                    );
                  }
                },
              });
            }
          }}
          onCancel={() => {
            setAddGroupVisible(false);
            setIsEditingGroupId(undefined);
          }}
        />
      )}
    </Con>
  );
}

Groups.propTypes = {
  isAdmin: bool,
  loading: bool,
  activeGroupId: string,
  projectId: string,
  currentProject: shape({}),
  activeGroup: shape({}),
  groups: arrayOf(shape({})),
};
