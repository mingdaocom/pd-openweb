import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';
import { Dialog, Menu, MenuItem } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import DisabledDepartmentAndRoleName from 'src/components/DisabledDepartmentAndRoleName';
import {
  deleteDepartment,
  disabledAndEnabledDepartments,
  editDepartment,
  getFullTree,
  loadUsers,
} from '../../actions/entities';
import { getParentsId } from '../../modules/util';
import { createEditDeptDialog } from '../CreateEditDeptDialog';
import './departmentTree.less';

const handleDialogCallback = (dispatch, payload) => {
  const { response = {}, pageIndex, type, expandedKeys } = payload;
  const { departmentId = '', newDepartments = [] } = response;

  switch (type) {
    case 'EDIT': {
      dispatch(editDepartment({ newDepartments, expandedKeys }));
      dispatch(loadUsers(departmentId, pageIndex));
      break;
    }
    default:
      break;
  }
};
@withClickAway
class DiaActionTree extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.departmentTreeBox').addClass('actinNow');
  }

  componentWillUnmount() {
    $('.departmentTreeBox').removeClass('actinNow');
  }

  handleClick = () => {
    const { departmentId, projectId, dispatch } = this.props;
    this.props.closeAction();
    createEditDeptDialog({
      type: 'create',
      projectId,
      departmentId,
      isLevel0: false,
      callback: (departmentInfo, parentId) => {
        dispatch(getFullTree({ departmentId: departmentInfo.departmentId, parentId, isGetAll: true }));
      },
    });
  };

  openSettingDialog = () => {
    const { departmentId, projectId, pageIndex, expandedKeys, dispatch, newDepartments } = this.props;
    this.props.closeAction();
    createEditDeptDialog({
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

  // 删除部门
  deleteCurrentDepartment = department => {
    const { dispatch, users = [] } = this.props;
    this.props.closeAction();

    // 如果部门有子部门和用户，还是保持以往交互，先tost 提示用户调整。
    if (department.haveSubDepartment || users.length) {
      dispatch(deleteDepartment(department.departmentId));
      return;
    }
    Dialog.confirm({
      className: 'disabledDepartmentDialog',
      okText: _l('删除'),
      title: _l('删除“%0”', department.departmentName),
      buttonType: 'danger',
      description: <div className="Red">{_l('删除后将无法恢复，请谨慎操作')}</div>,
      onOk: () => {
        dispatch(deleteDepartment(department.departmentId));
      },
    });
  };

  // 停用部门二次确认
  handleDisableDepartmentConfirm = department => {
    this.props.closeAction();
    Dialog.confirm({
      className: 'disabledDepartmentDialog',
      okText: _l('停用'),
      title: _l('停用“%0”', department.departmentName),
      description: (
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
  };

  // 停用/启用部门
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
    const { item } = this.props;

    return (
      <Menu className="Static">
        {item.disabled ? null : (
          <Fragment>
            <MenuItem onClick={this.handleClick}>{_l('添加子部门')}</MenuItem>
            <MenuItem onClick={this.openSettingDialog}>{_l('编辑')}</MenuItem>
          </Fragment>
        )}
        <MenuItem
          onClick={() => {
            copy(this.props.departmentId);
            alert(_l('复制成功'));
          }}
        >
          {_l('复制ID')}
        </MenuItem>
        <MenuItem
          onClick={() =>
            !item.disabled ? this.handleDisableDepartmentConfirm(item) : this.handleDisableDepartment(item)
          }
        >
          {item.disabled ? _l('恢复使用') : _l('停用')}
        </MenuItem>
        <MenuItem onClick={() => this.deleteCurrentDepartment(item)} style={{ color: '#f51744' }}>
          {_l('删除')}
        </MenuItem>
      </Menu>
    );
  }
}

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

export default connectedDiaActionTree;
