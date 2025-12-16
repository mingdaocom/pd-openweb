import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tree } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, Dialog, Icon, LoadDiv, Menu, MenuItem, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import organizeAjax from 'src/api/organize.js';
import { hasPermission } from 'src/components/checkPermission';
import DisabledDepartmentAndRoleName from 'src/components/DisabledDepartmentAndRoleName';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { downloadFile } from 'src/pages/Admin/util';
import { getCurrentProject } from 'src/utils/project';
import ImportDeptAndRole from '../../components/ImportDeptAndRole';
import * as actions from '../../redux/roleManage/action';
import DialogCreateAndEditRole from './components/DialogCreateAndEditRole';
import EditRoleFolderDialog from './components/EditRoleFolderDialog';
import EmptyStatus from './components/EmptyStatus';
import RoleManageContent from './components/RoleManageContent';
import RoleSearchBox from './components/RoleSearchBox';
import './index.less';

const PAGE_SIZE = 50;

const TreeWrap = styled(Tree)`
  .ant-tree-node-content-wrapper {
    width: 185px;
    display: flex;
    align-items: center;
  }
  .ant-tree-node-content-wrapper:hover,
  .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background-color: transparent !important;
  }
  .ant-tree-switcher-noop {
    display: none !important;
  }
  .ant-tree-title {
    flex: 1;
  }
  .nodeName {
    color: #151515 !important;
  }
  .ant-tree-treenode {
    width: 233px;
    padding: 6px 0 !important;
    border-radius: 3px;
    position: relative;
    &:hover {
      background-color: #f5f5f5;
      .dragIcon {
        opacity: 1;
      }
      .moreActionButton {
        opacity: 1;
      }
    }
    .disabledIcon {
      color: #fd5d22 !important;
    }
    &-selected {
      background-color: rgba(33, 150, 243, 0.11) !important;
      &::before {
        content: '';
        width: 2px;
        height: 13px;
        position: absolute;
        left: 0;
        top: 12px;
      }
      .moreActionButton {
        opacity: 1;
      }
      .nodeName {
        font-weight: 600 !important;
        color: #1677ff !important;
      }
    }
  }
  .dragIcon {
    opacity: 0;
    color: #9e9e9e !important;
  }
  .moreActionButton {
    display: inline-block;
    opacity: 0;
  }
  .ant-tree-draggable-icon {
    width: auto !important;
  }
`;

const DeleteText = styled.div`
  color: #f51744;
`;

const DefaultGroup = {
  title: _l('默认'),
  key: 'defaultGroup',
  isLeaf: false,
  orgRoleGroupId: '',
  selectable: false,
  children: [],
};

// 导入角色模版
const roleTemplatePaths = {
  0: '/staticfiles/template/组织角色导入模板.xlsx',
  1: '/staticfiles/template/Role Import Template.xlsx',
  2: '/staticfiles/template/役割インポートテンプレート.xlsx',
  3: '/staticfiles/template/角色導入模板.xlsx',
};

class RoleManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRoleDialog: false,
      roleFolderDialog: {
        visible: false,
        id: undefined,
      },
      actionPopupVisible: false,
      treeData: [],
      requestParamOrgRoleGroupId: '',
      expandedKeys: [],
      loading: true,
      searchLoading: false,
      searchRes: {
        data: [],
        isMore: false,
        pageIndex: 0,
      },
      pageIndex: 1,
      showDisabledOrgRole: localStorage.getItem('showDisabledOrgRole') === 'false' ? false : true,
      isMore: false,
    };
    this.promise = null;
  }

  componentDidMount() {
    const { match } = this.props;
    const { params = {} } = match;
    this.props.updateIsRequestList(true);
    this.props.updateProjectId(params.projectId);
    this.props.updateSearchValue('');
    this.props.updateCurrentRole({});
    this.props.updateIsImportRole(false);
    this.init(false, true);
  }

  componentWillUnmount() {
    this.props.updateUserLoading(true);
  }

  init = (onlyRefreshGroup = false, initFlag = false) => {
    const { treeData, showDisabledOrgRole } = this.state;
    const { match } = this.props;
    const { params = {} } = match;
    let data = null;
    this.setState({ loading: true });
    organizeAjax
      .getOrgRoleGroupsByProjectId({
        projectId: params.projectId,
        includeDisabled: showDisabledOrgRole,
      })
      .then(res => {
        data = [
          {
            ...DefaultGroup,
            children:
              onlyRefreshGroup && treeData[0] && treeData[0].key === DefaultGroup.key ? treeData[0].children : [],
          },
        ].concat(
          res.map(l => {
            let data = treeData.find(o => o.orgRoleGroupId === l.orgRoleGroupId);
            return {
              ...l,
              title: l.orgRoleGroupName,
              key: l.orgRoleGroupId,
              isLeaf: false,
              selectable: false,
              children: onlyRefreshGroup && data ? data.children : [],
            };
          }),
        );
        if (!onlyRefreshGroup) {
          this.updateChildren(data, [data[0].orgRoleGroupId], true, initFlag);
        } else {
          this.setState({ treeData: data, loading: false });
        }
      });
  };

  updateChildren = (data, orgRoleGroupIds, updateCurrentRole = false, init = false) => {
    const { match, searchValue } = this.props;
    const { params = {} } = match;
    const { pageIndex, showDisabledOrgRole } = this.state;

    if (!data.length) {
      this.setState({ treeData: [], loading: false });
      this.props.updateUserLoading(false);
      return;
    }

    let promiseList = orgRoleGroupIds.map(l => {
      return organizeAjax.getOrganizes({
        pageIndex: pageIndex || 1,
        pageSize: PAGE_SIZE,
        projectId: params.projectId,
        keywords: searchValue,
        orgRoleGroupId: l,
        includeDisabled: showDisabledOrgRole,
      });
    });

    Promise.all(promiseList).then(res => {
      res.forEach((resLi, i) => {
        let index = _.findIndex(data, l => l.orgRoleGroupId === orgRoleGroupIds[i]);
        if (index === 0) {
          const list = resLi.list.map(l => {
            return {
              ...l,
              title: l.organizeName,
              key: l.organizeId,
              isLeaf: true,
            };
          });

          data[index].children = (pageIndex > 1 ? (_.get(data[0], 'children') || []).concat(list) : list).filter(
            v => v.key !== 'isMore',
          );
          if (data[index].children.length >= 50 && resLi.allCount > data[index].children.length) {
            data[index].children = data[index].children
              .filter(v => v.key !== 'isMore')
              .concat({ title: '加载', key: 'isMore', isLeaf: true, selectable: false });
          }
        } else {
          data[index].children = resLi.list.map(l => {
            return {
              ...l,
              title: l.organizeName,
              key: l.organizeId,
              isLeaf: true,
            };
          });
        }
      });

      if (data[0].key === DefaultGroup.key && !data[0].children.length) {
        data = _.slice(data, 1);
      }

      if (updateCurrentRole && data[0]) {
        let roleItem = data[0].children[0];
        if (updateCurrentRole === 'add') {
          roleItem = _.last(data.find(l => l.orgRoleGroupId === orgRoleGroupIds[0]).children);
        }
        if (roleItem) {
          this.handleClick(roleItem, true);
        } else {
          this.props.updateUserLoading(false);
          this.props.updateCurrentRole({});
        }
      }
      this.setState({
        treeData: _.cloneDeep(data),
        loading: false,
        expandedKeys: init ? (data[0] ? [data[0].key] : []) : this.state.expandedKeys,
        pageIndex: pageIndex,
      });
    });
  };

  loadData = (treeNode = {}) => {
    const { treeData, showDisabledOrgRole } = this.state;
    const { match, searchValue } = this.props;
    const { params = {} } = match;

    return new Promise(resolve => {
      const expandedKeys = this.state.expandedKeys;
      const isExpand = this.state.expandedKeys.includes(treeNode.key);

      if (treeNode.children && (treeNode.children.length !== 0 || treeNode.loadData)) {
        this.setState({
          expandedKeys: isExpand ? expandedKeys.filter(l => l !== treeNode.key) : expandedKeys.concat(treeNode.key),
        });
        resolve();
        return;
      }

      organizeAjax
        .getOrganizes({
          pageIndex: 1,
          pageSize: treeNode.orgRoleGroupId ? 1000 : PAGE_SIZE,
          projectId: params.projectId,
          keywords: searchValue,
          orgRoleGroupId: treeNode.orgRoleGroupId,
          includeDisabled: showDisabledOrgRole,
        })
        .then(res => {
          let _data = treeData.map(l => {
            let _children = l.children;

            if (l.orgRoleGroupId === treeNode.orgRoleGroupId) {
              _children = res.list.map(l => {
                return {
                  ...l,
                  title: l.organizeName,
                  key: l.organizeId,
                  isLeaf: true,
                };
              });
            }

            return {
              ...l,
              children: _children,
              loadData: l.orgRoleGroupId === treeNode.orgRoleGroupId || l.loadData,
            };
          });

          this.setState({
            treeData: _data,
            expandedKeys: _.uniq(expandedKeys.concat(treeNode.key)),
          });
          resolve();
        });
    });
  };

  onScrollEnd = () => {
    const { searchValue } = this.props;
    const { searchRes, loading } = this.state;

    if (!searchValue || !searchRes.isMore || loading) return;

    this.setState(
      {
        searchLoading: true,
      },
      () => this.getSearchList(searchValue),
    );
  };

  // 新增编辑角色
  createAndEdit = filed => {
    this.setState({ showRoleDialog: true, filed });
  };

  renderImportInfo = () => {
    return (
      <div className="roleManageContainer">
        <ImportDeptAndRole
          importType="role"
          txt={_l('角色')}
          clickBackList={() => {
            this.props.updateIsImportRole(false);
          }}
          downLoadUrl={roleTemplatePaths[getCurrentLangCode()]}
          updateList={() => {
            this.init();
          }}
        />
      </div>
    );
  };

  closeRoleFolderDialog = () => this.setState({ roleFolderDialog: { visible: false, id: undefined } });

  handleDelete = item => {
    const { treeData, expandedKeys, searchRes } = this.state;
    const { projectId, searchValue } = this.props;
    if (!item.isLeaf) {
      organizeAjax
        .removeOrgRoleGroup({
          projectId,
          orgRoleGroupId: item.orgRoleGroupId,
        })
        .then(res => {
          if (res === 1) {
            alert('删除成功');
            this.setState({ expandedKeys: expandedKeys.filter(l => l !== item.orgRoleGroupId) });
            this.init();
          } else if (res === 24004) {
            alert(_l('角色组存在组织角色，无法删除'), 3);
          } else {
            alert(_l('删除失败'), 2);
          }
        });
    } else {
      organizeAjax
        .deleteOrganizes({
          organizeIds: [item.organizeId],
          projectId,
        })
        .then(res => {
          this.setState({ popupVisible: false, showDeleteId: '' });
          if (res === 1) {
            alert(_l('删除成功'));
            const _treeData = treeData.map(l => {
              return {
                ...l,
                children:
                  l.orgRoleGroupId === item.orgRoleGroupId
                    ? l.children.filter(l => l.organizeId !== item.organizeId)
                    : l.children,
              };
            });
            this.setState({
              searchRes: searchValue
                ? {
                    ...searchRes,
                    data: searchRes.data.filter(l => l.organizeId !== item.organizeId),
                  }
                : searchRes,
              treeData: _treeData,
            });
            this.props.updateIsRequestList(true);
          } else if (res === 24004) {
            alert(_l('角色存在成员，无法删除'), 3);
          } else {
            alert(_l('删除失败'), 2);
          }
        });
    }
  };

  showDeleteDialog = item => {
    this.setState({ actionPopupVisible: false });

    Dialog.confirm({
      title: _l('删除“%0”', item.organizeName || item.orgRoleGroupName),
      children: <DeleteText className="Font13">{_l('删除后无法恢复，请谨慎操作')}</DeleteText>,
      buttonType: 'danger',
      onOk: () => this.handleDelete(item),
    });
  };

  handleClick = (item, forceUpdate = false) => {
    const { treeData } = this.state;
    if (item.key === 'isMore') {
      this.setState({ pageIndex: this.state.pageIndex + 1 }, () => this.updateChildren(treeData, [''], false));
      return;
    }

    const { currentRole } = this.props;

    if (!item.isLeaf) {
      this.loadData(item);
      return;
    }

    if (item.organizeId !== currentRole.organizeId || forceUpdate) {
      this.props.updateUserPageIndex(1);
      this.props.updateCurrentRole(item);
      this.props.updateSelectUserIds([]);
      this.props.getUserList({ roleId: item.organizeId });
    }
  };

  onDrop = info => {
    const { projectId } = this.props;
    const { treeData, showDisabledOrgRole } = this.state;
    const { dragNode, node, dropPosition } = info;
    const dragOrgRoleGroup = dragNode.isLeaf
      ? treeData.find(l => l.orgRoleGroupId === dragNode.orgRoleGroupId).children || []
      : {};
    const dragIndex = dragNode.isLeaf
      ? _.findIndex(dragOrgRoleGroup, l => l.organizeId === dragNode.organizeId)
      : undefined;

    let flag = false;
    if (dragNode.isLeaf !== node.isLeaf) flag = true;
    if (dragNode.isLeaf && !node.isLeaf && node.expanded) flag = false;
    if (dragNode.isLeaf && !node.isLeaf && dropPosition === -1) flag = true;
    if (flag) return;

    let param = {
      projectId,
    };

    if (dragNode.isLeaf) {
      param.organizeId = dragNode.organizeId;
      param.previousOrgRoleId = dropPosition === -1 || !node.isLeaf ? undefined : node.organizeId;
      param.moveOrgRoleGroupId = node.orgRoleGroupId;
    } else {
      param.orgRoleGroupId = dragNode.orgRoleGroupId;
      param.previousOrgRoleGroupId = dropPosition === -1 ? undefined : node.orgRoleGroupId;
    }

    if (
      dragNode.isLeaf &&
      ((dragIndex &&
        dragOrgRoleGroup[dragIndex - 1] &&
        param.previousOrgRoleId === dragOrgRoleGroup[dragIndex - 1].organizeId) ||
        (!param.previousOrgRoleId && param.moveOrgRoleGroupId === dragNode.orgRoleGroupId))
    )
      return;

    let promiseAjax = dragNode.isLeaf ? organizeAjax.setSortOrgRole(param) : organizeAjax.setSortOrgRoleGroup(param);

    promiseAjax.then(res => {
      if (res) {
        alert(_l('调整成功'));
        if (dragNode.isLeaf) {
          this.updateChildren(treeData, _.uniq([node.orgRoleGroupId, dragNode.orgRoleGroupId]));
        } else {
          organizeAjax
            .getOrgRoleGroupsByProjectId({
              projectId,
              includeDisabled: showDisabledOrgRole,
            })
            .then(list => {
              let sortTree = treeData
                .filter(l => l.orgRoleGroupId !== DefaultGroup.orgRoleGroupId)
                .map(l => {
                  let newValue = list.find(m => m.orgRoleGroupId === l.orgRoleGroupId);
                  return {
                    ...l,
                    sortIndex: newValue.sortIndex,
                  };
                });
              this.setState({
                treeData:
                  treeData[0].orgRoleGroupId === DefaultGroup.orgRoleGroupId
                    ? [treeData[0]].concat(_.sortBy(sortTree, 'sortIndex'))
                    : _.sortBy(sortTree, 'sortIndex'),
              });
            });
        }
      }
    });
  };

  handleSearch = value => {
    const { searchRes, treeData } = this.state;

    if (!value) {
      treeData[0] && treeData[0].children[0] && this.handleClick(treeData[0].children[0]);
      return;
    }

    this.setState(
      {
        searchRes: {
          ...searchRes,
          pageIndex: 0,
          isMore: false,
        },
        searchLoading: true,
      },
      () => this.getSearchList(value),
    );
  };

  handleClear = () => {
    const { treeData } = this.state;

    this.setState({
      searchRes: {
        pageIndex: 0,
        isMore: false,
        data: [],
      },
    });
    treeData[0] && treeData[0].children[0] && this.handleClick(treeData[0].children[0]);
  };

  getSearchList = searchWord => {
    const { projectId } = this.props;
    const { searchRes, showDisabledOrgRole } = this.state;
    const { pageIndex, data } = searchRes;

    organizeAjax
      .getOrganizes({
        pageIndex: pageIndex + 1,
        pageSize: PAGE_SIZE,
        projectId: projectId,
        keywords: searchWord,
        includeDisabled: showDisabledOrgRole,
      })
      .then(res => {
        let list = res.list.map(l => {
          return {
            ...l,
            title: l.organizeName,
            key: l.organizeId,
            isLeaf: true,
          };
        });

        if (pageIndex === 0) {
          if (list[0]) {
            this.handleClick(list[0]);
          } else {
            this.props.updateUserLoading(false);
            this.props.updateCurrentRole({});
          }
        }

        this.setState({
          searchRes: {
            data: pageIndex === 0 ? list : data.concat(list),
            pageIndex: pageIndex + 1,
            isMore: res.allCount > list.length,
          },
          searchLoading: false,
        });
      });
  };

  renderSearchList = () => {
    const { searchRes, searchLoading } = this.state;

    if (!searchRes.data.length && !searchLoading)
      return (
        <div className="searchList">
          <div className="Gray_9e Font13 mLeft24">{_l('暂无搜索结果')}</div>
        </div>
      );

    return (
      <div className="searchList">
        {searchRes.data.map(l => this.titleRender(l))}
        {searchLoading && <LoadDiv />}
      </div>
    );
  };

  titleRender = l => {
    const { searchValue, currentRole, authority } = this.props;
    const { showDeleteId = '', actionPopupVisible, treeData } = this.state;
    let orgGroup = {};

    if (searchValue) {
      orgGroup = treeData.find(m => m.orgRoleGroupId === l.orgRoleGroupId) || {};
    }

    const isDefault = !l.isLeaf && l.orgRoleGroupId === '';

    return (
      <div
        className={cx('valignWrapper', {
          roleItem: !!searchValue,
          current: searchValue && currentRole.key === l.key,
        })}
        key={`treeNodeTitleRender-${l.orgRoleGroupId}-${l.key}`}
        onClick={() => this.handleClick(l)}
      >
        {l.key === 'isMore' ? (
          <span className="ThemeColor mLeft26">{_l('加载')}</span>
        ) : (
          <Fragment>
            {searchValue && <Icon icon="person_new" className="Gray_9e Font18" />}
            <span className={cx('flex ellipsis Font13 nodeName', { mLeft4: l.isLeaf })}>
              {orgGroup.title ? `${orgGroup.title}-${l.title}` : l.title}
              {l.disabled && !l.organizeId && (
                <Icon icon="person_off_a" className="Gray_9e Font18 mLeft6 TxtMiddle disabledIcon" />
              )}
            </span>
            {!isDefault && hasPermission(authority, PERMISSION_ENUM.ROLE_MENAGE) && (
              <span className="moreActionButton Hand">
                <Trigger
                  popupVisible={l.key === actionPopupVisible}
                  action={['click']}
                  popupAlign={{
                    points: ['tl', 'bl'],
                    overflow: { adjustX: true, adjustY: true },
                  }}
                  getPopupContainer={() => document.body}
                  onPopupVisibleChange={visible => {
                    this.setState({ actionPopupVisible: visible ? l.key : false });
                  }}
                  popup={
                    <Menu className="Static">
                      {!l.disabled ? (
                        <MenuItem
                          key="0"
                          onClick={() => {
                            l.isLeaf && this.createAndEdit('edit');
                            this.setState(
                              l.isLeaf
                                ? { actionPopupVisible: false }
                                : {
                                    actionPopupVisible: false,
                                    roleFolderDialog: {
                                      visible: true,
                                      id: l.orgRoleGroupId,
                                      name: l.orgRoleGroupName,
                                    },
                                  },
                            );
                          }}
                        >
                          {_l('编辑')}
                        </MenuItem>
                      ) : null}
                      <MenuItem
                        key="2"
                        onClick={e =>
                          !l.disabled ? this.handleDisableOrgRoleConfirm(e, l) : this.disabledAndEnabledOrgRole(e, l)
                        }
                      >
                        {l.disabled ? _l('恢复使用') : _l('停用')}
                      </MenuItem>
                      <MenuItem key="1" className="delRole" onClick={() => this.showDeleteDialog(l)}>
                        {_l('删除')}
                      </MenuItem>
                    </Menu>
                  }
                >
                  <Icon
                    icon="moreop"
                    className="Gray_9e Font18 TxtMiddle editIcon Hover_21"
                    onClick={e => e.stopPropagation()}
                  />
                </Trigger>
              </span>
            )}
            {l.isLeaf && l.remark && l.organizeId !== showDeleteId && (
              <Tooltip placement="rightTop" align={{ offset: [0, -15] }} title={l.remark}>
                <Icon icon="info_outline" className="remarkTooptip Gray_9e Font16 TxtMiddle mLeft2" />
              </Tooltip>
            )}
          </Fragment>
        )}
      </div>
    );
  };

  // 导出角色
  exportRoleList = () => {
    const { projectId } = this.props;
    const url = `${md.global.Config.AjaxApiUrl}download/exportProjectOrgRoleList`;
    let projectName = getCurrentProject(projectId, true).companyName;
    let date = moment().format('YYYYMMDDHHmmss');
    const fileName = `${projectName}_${_l('组织角色')}_${date}` + '.xlsx';

    this.setState({ popupVisible: false });

    downloadFile({
      url,
      params: {
        projectId,
      },
      exportFileName: fileName,
    });
  };

  onExpand = (keys, { node }) => {
    if (!node.loaded) return;

    this.setState({ expandedKeys: _.uniq(keys) });
  };

  // 显示停用角色
  handleShowDisabledOrgRole = () => {
    const { showDisabledOrgRole } = this.state;
    localStorage.setItem('showDisabledOrgRole', !showDisabledOrgRole);
    this.setState({ showDisabledOrgRole: !showDisabledOrgRole }, () => this.init(false, true));
  };

  // 停用组织角色二次确认
  handleDisableOrgRoleConfirm = (e, orgRole) => {
    e.stopPropagation();
    this.setState({ actionPopupVisible: false });
    const name = orgRole.organizeName || orgRole.orgRoleGroupName;
    Dialog.confirm({
      className: 'disabledOrgRoleDialog',
      okText: _l('停用'),
      title: _l('停用“%0”', name),
      buttonType: 'danger',
      description: orgRole.organizeId ? (
        <div>
          <div>{_l('停用后，当前停用的角色将对用户隐藏，角色下的成员不会移除。')}</div>
          <div className="mBottom10">
            {_l('已停用的角色在记录中将呈现如下的停用状态：')}
            <div className="orgRoleStatusWrap">
              <DisabledDepartmentAndRoleName name={name} disabled isRole />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div>{_l('停用后，角色组下角色将对用户隐藏，角色下成员不会移除')}</div>
          <div className="mBottom10">{_l('已停用的角色在记录中将呈现停用状态')}</div>
        </div>
      ),
      onOk: () => {
        this.disabledAndEnabledOrgRole(e, orgRole);
      },
    });
  };

  // 停用/恢复
  disabledAndEnabledOrgRole = (e, orgRole) => {
    e.stopPropagation();
    const { projectId } = this.props;
    const param = { projectId };
    this.setState({ actionPopupVisible: false });
    if (orgRole.organizeId) {
      param.organizeId = orgRole.organizeId;
      this.promise = orgRole.disabled ? organizeAjax.enabledOrganize : organizeAjax.disabledOrganize;
    } else {
      param.organizeGroupId = orgRole.orgRoleGroupId;
      this.promise = orgRole.disabled ? organizeAjax.enabledOrganizeGroup : organizeAjax.disabledOrganizeGroup;
    }

    this.promise(param).then(res => {
      if (res) {
        const treeData = _.cloneDeep(this.state.treeData);
        this.setState({ actionPopupVisible: false });
        const index = treeData.findIndex(v => v.orgRoleGroupId === orgRole.orgRoleGroupId);
        if (orgRole.organizeId) {
          // 停用当前角色
          const childIndex = treeData[index].children.findIndex(v => v.organizeId === orgRole.organizeId);
          treeData[index].children[childIndex].disabled = !orgRole.disabled;
        } else if (orgRole.orgRoleGroupId) {
          // 停用分组
          treeData[index].disabled = !orgRole.disabled;
          if (treeData[index].children && treeData[index].children.length) {
            treeData[index].children = treeData[index].children.map(v => ({
              ...v,
              disabled: !orgRole.disabled,
            }));
          }
        }
        this.setState({ treeData });
        alert(orgRole.disabled ? _l('恢复成功') : _l('停用成功'));
      } else {
        alert(orgRole.disabled ? _l('恢复失败', 2) : _l('停用失败', 2));
      }
    });
  };

  render() {
    const { roleList = [], currentRole = {}, projectId, isImportRole, searchValue, authority } = this.props;
    let {
      showRoleDialog,
      filed,
      roleFolderDialog,
      treeData,
      loading,
      expandedKeys,
      popupVisible,
      showDisabledOrgRole,
    } = this.state;
    const hasRoleAuth = hasPermission(authority, PERMISSION_ENUM.ROLE_MENAGE);

    if (isImportRole) {
      return this.renderImportInfo();
    }

    return (
      <div className="roleManageContainer">
        <AdminTitle prefix={_l('角色')} />
        <div className="roleManageLeft">
          <div className="Bold Font17 mBottom20 pLeft24 mTop24">{_l('角色')}</div>
          <RoleSearchBox
            projectId={projectId}
            updateSearchValue={this.props.updateSearchValue}
            handleSearch={this.handleSearch}
            handleClear={this.handleClear}
            updateIsRequestList={this.props.updateIsRequestList}
          />
          <input type="text" style={{ width: 0, height: 0, border: 0 }} />

          {hasRoleAuth && (
            <div className="actBox flexRow">
              <span className="creatRole Hand mRight12 ellipsis" onClick={() => this.createAndEdit('create')}>
                <Icon icon="add" className="Font18 Bold TxtMiddle" />
                {_l('角色')}
              </span>
              <span
                className="creatRole Hand ellipsis"
                onClick={() => this.setState({ roleFolderDialog: { visible: true, id: undefined } })}
              >
                <Icon icon="add" className="Font18 Bold TxtMiddle" />
                {_l('角色组')}
              </span>
              <div className="flex"></div>
              <Trigger
                action={['click']}
                popupAlign={{
                  points: ['tl', 'bl'],
                  offset: [0, 0],
                  overflow: { adjustX: true, adjustY: true },
                }}
                popupVisible={popupVisible}
                onPopupVisibleChange={popupVisible => this.setState({ popupVisible })}
                popup={
                  <Menu className="importExportAction">
                    <MenuItem onClick={this.handleShowDisabledOrgRole}>
                      <Checkbox text={_l('显示停用角色')} checked={showDisabledOrgRole} />
                    </MenuItem>
                    <MenuItem
                      key="0"
                      onClick={() => {
                        this.setState({ popupVisible: false });
                        this.props.updateIsImportRole(true);
                      }}
                    >
                      {_l('导入角色')}
                    </MenuItem>
                    <MenuItem key="1" className="mBottom4" onClick={this.exportRoleList}>
                      {_l('导出角色')}
                    </MenuItem>
                  </Menu>
                }
              >
                <i
                  className="icon icon-moreop ant-dropdown-trigger Gray_9e Hand Font20 iconHover LineHeight28"
                  onClick={() => this.setState({ popupVisible: true })}
                />
              </Trigger>
            </div>
          )}

          <div className="roleList">
            <ScrollView className="h100" onScrollEnd={this.onScrollEnd}>
              {loading ? (
                <LoadDiv />
              ) : searchValue ? (
                this.renderSearchList()
              ) : (
                <TreeWrap
                  allowDrop={({ dropNode }) => !dropNode.disabled}
                  treeData={treeData}
                  expandedKeys={expandedKeys}
                  selectedKeys={currentRole.organizeId ? [currentRole.organizeId] : []}
                  draggable={treeNode => {
                    if (!hasRoleAuth || (!treeNode.isLeaf && treeNode.key === 'defaultGroup')) return false;
                    return {
                      icon: <Icon icon="indicator" className="dragIcon Gray_9e" />,
                    };
                  }}
                  showIcon
                  switcherIcon={null}
                  icon={l => {
                    if (!l.isLeaf || l.data.key === 'isMore') return null;
                    return (
                      <Icon
                        icon={l.disabled ? 'person_off_a' : 'person_new'}
                        className={`Gray_9e Font18 LineHeight24 ${l.disabled ? 'disabledIcon' : ''}`}
                      />
                    );
                  }}
                  titleRender={this.titleRender}
                  loadData={this.loadData}
                  onDrop={this.onDrop}
                  onExpand={this.onExpand}
                />
              )}
              {!loading && !searchValue && !treeData.length && (
                <div className="searchList">
                  <div className="Gray_9e Font13 mLeft24">{_l('暂无结果')}</div>
                </div>
              )}
            </ScrollView>
          </div>
        </div>
        <div className="roleManageRight flexColumn">
          {_.isEmpty(currentRole) && !searchValue ? (
            <EmptyStatus
              tipTxt={_l('可以根据成员属性去创建角色，如，技术、生产、销售设置后应用可以直接选择角色')}
              icon="Empty_Noposition"
            />
          ) : (
            <RoleManageContent />
          )}
        </div>
        {showRoleDialog && (
          <DialogCreateAndEditRole
            showRoleDialog={showRoleDialog}
            filed={filed}
            roleList={roleList}
            treeData={treeData[0] && treeData[0].key === DefaultGroup.key ? treeData : [DefaultGroup].concat(treeData)}
            projectId={projectId}
            currentRole={currentRole}
            searchValue={searchValue}
            updateChildren={this.updateChildren}
            updateCurrentRole={this.props.updateCurrentRole}
            updateIsRequestList={this.props.updateIsRequestList}
            onCancel={() => {
              this.setState({ showRoleDialog: false });
            }}
          />
        )}
        {roleFolderDialog.visible && (
          <EditRoleFolderDialog
            projectId={projectId}
            info={roleFolderDialog}
            visible={roleFolderDialog.visible}
            onClose={this.closeRoleFolderDialog}
            refresh={() => this.init(true)}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => {
    const { roleList, isLoading, currentRole, projectId, isImportRole, rolePageInfo, searchValue } =
      state.orgManagePage.roleManage;
    return { roleList, isLoading, currentRole, projectId, isImportRole, rolePageInfo, searchValue };
  },
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, [
          'updateProjectId',
          'updateCurrentRole',
          'getUserList',
          'updateUserPageIndex',
          'updateSelectUserIds',
          'updateSearchValue',
          'updateIsImportRole',
          'updateIsRequestList',
          'updateUserLoading',
        ]),
      },
      dispatch,
    ),
)(RoleManage);
