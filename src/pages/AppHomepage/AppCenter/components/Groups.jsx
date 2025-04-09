import React, { useState } from 'react';
import { string, bool, arrayOf, shape } from 'prop-types';
import styled from 'styled-components';
import { Dialog, ScrollView, UpgradeIcon, SortableList } from 'ming-ui';
import cx from 'classnames';
import { VerticalMiddle, FlexCenter } from 'worksheet/components/Basics';
import { navigateTo } from 'router/navigateTo';
import homeAppAjax from 'src/api/homeApp';
import { getFeatureStatus } from 'src/util';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/util/enum';
import AppTrash from 'src/pages/worksheet/common/Trash/AppTrash';
import GroupsSkeleton from './GroupsSkeleton';
import EditGroup from './EditGroup';
import GroupItem from './GroupItem';
import _ from 'lodash';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

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
  .groupItem {
    padding: 0 14px;
  }
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

export default function Groups(props) {
  const {
    loading,
    activeGroupId,
    projectId,
    currentProject,
    markedGroup,
    activeGroup,
    groups = [],
    actions,
    dashboardColor,
    projectGroupsLang = [],
    myPermissions = [],
  } = props;
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
  ].map(listItem => ({
    ...listItem,
    groups: _.sortBy(listItem.groups, g => (sorts[listItem.type] || []).indexOf(g.id)),
  }));
  const featureType = getFeatureStatus(projectId, VersionProductType.recycle);
  const hasManageAppAuth = hasPermission(myPermissions, PERMISSION_ENUM.APP_RESOURCE_SERVICE);
  const isAllActive = location.pathname === '/app/my';

  const staticGroupList = [
    {
      key: 'all',
      fontIcon: 'grid_view',
      name: _l('全部'),
      to: '/app/my',
      active: isAllActive,
      className: 'mTop10',
      onClick: () => {
        actions.loadAppAndGroups({ projectId, noGroupsLoading: true });
        navigateTo('/app/my');
      },
    },
    {
      key: 'myApps',
      fontIcon: 'person1',
      name: _l('我拥有的'),
      to: '/app/my/owned',
      active: !isAllActive && !activeGroupId,
      onClick: () => {
        actions.loadOwnedApps({ projectId });
        navigateTo('/app/my/owned');
      },
    },
    {
      key: 'recycle',
      fontIcon: 'knowledge-recycle',
      name: (
        <span>
          {_l('回收站')}
          {isFree && <UpgradeIcon />}
        </span>
      ),
      onClick: () => {
        if (featureType === '2') {
          buriedUpgradeVersionDialog(projectId, VersionProductType.recycle);
        } else {
          setTrashVisible(true);
        }
      },
    },
  ];

  const expandBtn = (
    <BaseBtnCon
      className={isFolded ? 'mLeft24' : ''}
      onClick={() => {
        setIsFolded(!isFolded);
        safeLocalStorageSetItem('homeGroupsIsFolded', !isFolded ? '1' : '');
      }}
    >
      <i className={`expandIcon Right Hand Font20 Gray_75 icon ${!isFolded ? 'icon-menu_left' : 'icon-menu'}`}></i>
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

  const renderItem = ({ item, listItem, dragging }) => {
    const { id, name, isMarked, groupType } = item;

    const onDelete = (deleteId, groupType) => {
      Dialog.confirm({
        title: _l('删除分组"%0"', name),
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
    };

    const onMark = markedId => {
      actions.markGroup({
        id: markedId,
        isMarked: !isMarked,
        groupType,
        projectId,
      });
    };

    return (
      <GroupItem
        {...props}
        {...item}
        className="groupItemWrap"
        name={_.get(projectGroupsLang, `${id}.data[0].value`) || name}
        hasManageAppAuth={hasManageAppAuth}
        itemType={listItem.type}
        isDragging={dragging}
        onEdit={setIsEditingGroupId}
        onDelete={onDelete}
        onMark={onMark}
      />
    );
  };

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

            {staticGroupList.map((group, index) =>
              group.key === 'recycle' && !featureType ? null : (
                <GroupItem key={index} dashboardColor={dashboardColor} itemType="static" {..._.omit(group, 'key')} />
              ),
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
                  .filter(listItem => listItem.groups && listItem.groups.length)
                  .map((listItem, i) => (
                    <div key={i} className="mTop20">
                      <div className="title Gray_9e Font12 mBottom6">{listItem.name}</div>
                      {listItem.groups && !!listItem.groups.length && (
                        <SortableList
                          items={listItem.groups}
                          itemKey="id"
                          itemClassName="groupItem"
                          helperClass="groupItemHelperClass"
                          renderItem={itemProps => renderItem({ ...itemProps, listItem })}
                          onSortEnd={newItems => {
                            setSorts(oldSorts => ({ ...oldSorts, [listItem.type]: newItems.map(g => g.id) }));
                            homeAppAjax.editGroupSort({
                              projectId,
                              ids: newItems.map(g => g.id),
                              sortType: getSortType(listItem.type),
                            });
                            if (listItem.type !== 'personal') {
                              actions.updateGroupSorts(newItems, listItem.type);
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
          {...props}
          hasManageAppAuth={hasManageAppAuth}
          projectId={projectId}
          {...(editingGroup
            ? {
                name: editingGroup.name,
                icon: editingGroup.icon,
                groupType: editingGroup.groupType,
              }
            : {})}
          type={addGroupVisible ? 'add' : 'edit'}
          projectGroupsLan={projectGroupsLang}
          editingGroupId={editingGroupId}
          onChange={({ name, icon, groupType, langData = [] }) => {
            if (addGroupVisible) {
              actions.addGroup({
                projectId,
                name,
                icon,
                groupType,
                langData,
                cb: (status, id) => {
                  if (status === 1) {
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
  loading: bool,
  activeGroupId: string,
  projectId: string,
  currentProject: shape({}),
  activeGroup: shape({}),
  groups: arrayOf(shape({})),
};
