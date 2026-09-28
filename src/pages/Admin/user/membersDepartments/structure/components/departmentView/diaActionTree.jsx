import React from 'react';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';
import { Dropdown, Modal } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import projectSettingAjax from 'src/api/projectSetting';
import DisabledDepartmentAndRoleName from 'src/components/DisabledDepartmentAndRoleName';
import { CLEAR_CACHE_PROCESS_TYPE } from 'src/pages/Admin/enum';
import {
  deleteDepartment,
  disabledAndEnabledDepartments,
  editDepartment,
  getFullTree,
  loadUsers,
} from '../../actions/entities';
import { getParentsId } from '../../modules/util';
import { useCreateEditDeptDialog } from '../CreateEditDeptDialog';
import './departmentTree.less';

const handleDialogCallback = (dispatch, payload) => {
  const { response = {}, pageIndex, type, expandedKeys } = payload;
  const { departmentId = '', newDepartments = [] } = response;

  switch (type) {
    case 'EDIT': {
      dispatch(
        editDepartment({
          newDepartments,
          expandedKeys,
        }),
      );
      dispatch(loadUsers(departmentId, pageIndex));
      break;
    }

    default:
      break;
  }
};

let DiaActionTree = class DiaActionTree extends React.Component {
  handleClick = () => {
    const { departmentId, projectId, dispatch } = this.props;
    this.props.closeAction();
    this.props.openCreateEditDeptDialog({
      type: 'create',
      projectId,
      departmentId,
      isLevel0: false,
      callback: (departmentInfo, parentId) => {
        dispatch(
          getFullTree({
            departmentId: departmentInfo.departmentId,
            parentId,
            isGetAll: true,
          }),
        );
      },
    });
  };
  openSettingDialog = () => {
    const { departmentId, projectId, pageIndex, expandedKeys, dispatch, newDepartments } = this.props;
    this.props.closeAction();
    this.props.openCreateEditDeptDialog({
      type: 'edit',
      projectId,
      departmentId,
      newDepartments,
      callback: ({ response = {} }) => {
        handleDialogCallback(dispatch, {
          response,
          type: 'EDIT',
          projectId,
          pageIndex,
          expandedKeys,
        });
      },
    });
  };

  clearDepartmentCache = () => {
    const { departmentId, projectId } = this.props;
    this.props.closeAction();
    projectSettingAjax
      .clearItemCache({ projectId, itemId: departmentId, processType: CLEAR_CACHE_PROCESS_TYPE.DEPARTMENT })
      .then(data => {
        if (data) {
          alert(_l('刷新中，请稍后查看'));
        } else {
          alert(_l('刷新失败'), 2);
        }
      });
  };

  // 删除部门

  deleteCurrentDepartment = department => {
    const { dispatch, users = [] } = this.props;
    this.props.closeAction(); // 如果部门有子部门和用户，还是保持以往交互，先tost 提示用户调整。

    if (department.haveSubDepartment || users.length) {
      dispatch(deleteDepartment(department.departmentId));
      return;
    }

    Modal.confirm({
      className: 'disabledDepartmentDialog',
      okText: _l('删除'),
      title: <span className="textError">{_l('删除“%0”', department.departmentName)}</span>,
      okButtonProps: {
        danger: true,
      },
      content: <div className="Red">{_l('删除后将无法恢复，请谨慎操作')}</div>,
      onOk: () => {
        dispatch(deleteDepartment(department.departmentId));
      },
    });
  }; // 停用部门二次确认

  handleDisableDepartmentConfirm = department => {
    this.props.closeAction();
    Modal.confirm({
      className: 'disabledDepartmentDialog',
      okText: _l('停用'),
      title: _l('停用“%0”', department.departmentName),
      content: (
        <div>
          <div>{_l('停用后，当前停用的部门将对用户隐藏，部门下的成员不会移除。')}</div>
          <div className="mBottom10">
            {_l('已停用的部门在记录中将呈现如下的停用状态：')}
            <div className="departmentStatusWrap">
              <DisabledDepartmentAndRoleName name={department.departmentName} disabled />
            </div>
          </div>
        </div>
      ),
      onOk: () => {
        this.handleDisableDepartment(department);
      },
    });
  }; // 停用/启用部门

  handleDisableDepartment = department => {
    const { departmentId, dispatch, newDepartments, parentData = {}, departments } = this.props;
    this.props.closeAction();

    if (department.disabled) {
      const allParentIds = getParentsId(newDepartments, departmentId).filter(id => id !== departmentId);
      const existDisabledDepartment = allParentIds.some(id => departments[id]?.disabled);

      if (existDisabledDepartment) {
        alert(_l('存在未恢复的上级部门，请先恢复'), 3);
        return;
      }
    }

    dispatch(disabledAndEnabledDepartments(departmentId, department.disabled, parentData.departmentId));
  };

  render() {
    const { children, item, hasDepartmentAuth, departmentId, open, onOpenChange } = this.props;

    const copyId = () => {
      copy(departmentId);
      alert(_l('复制成功'));
    };

    const commonItems = [
      { key: 'copyId', label: _l('复制 ID'), onClick: copyId },
      { key: 'refresh', label: _l('刷新部门成员信息'), onClick: this.clearDepartmentCache },
    ];
    const items = hasDepartmentAuth
      ? [
          ...(!item.disabled
            ? [
                { key: 'add', label: _l('添加子部门'), onClick: this.handleClick },
                { key: 'edit', label: _l('编辑'), onClick: this.openSettingDialog },
              ]
            : []),
          ...commonItems,
          {
            key: 'toggleStatus',
            label: item.disabled ? _l('恢复使用') : _l('停用'),
            onClick: () =>
              !item.disabled ? this.handleDisableDepartmentConfirm(item) : this.handleDisableDepartment(item),
          },
          {
            key: 'delete',
            danger: true,
            label: _l('删除'),
            onClick: () => this.deleteCurrentDepartment(item),
          },
        ]
      : commonItems;

    return (
      <Dropdown
        trigger={['click']}
        open={open}
        onOpenChange={onOpenChange}
        menu={{
          items,
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            this.props.closeAction();
          },
        }}
      >
        {children}
      </Dropdown>
    );
  }
};

const mapStateToProps = state => {
  const {
    current,
    entities,
    pagination: { userList = {} },
  } = state;
  const { departmentId, projectId } = current;
  const { expandedKeys, newDepartments, departments, users } = entities;
  return {
    expandedKeys,
    departmentId,
    projectId,
    pageIndex: userList?.pageIndex,
    newDepartments,
    departments,
    users,
  };
};

const connectedDiaActionTree = connect(mapStateToProps)(DiaActionTree);
export default withOpeners(connectedDiaActionTree, {
  openCreateEditDeptDialog: useCreateEditDeptDialog,
});
