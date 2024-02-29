import React from 'react';
import { connect } from 'react-redux';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { loadUsers, getFullTree, deleteDepartment, loadAllUsers, editDepartment } from '../../actions/entities';
import { removeCursor, updateCursor, updateTypeCursor } from '../../actions/current';
import copy from 'copy-to-clipboard';
import './index.less';
import { createEditDeptDialog } from '../CreateEditDeptDialog';
import departmentController from 'src/api/department';

const handleDialogCallback = (dispatch, payload) => {
  const { response = {}, pageIndex, type, expandedKeys, projectId } = payload;
  const { departmentId = '', parentDepartmentId = '', newDepartments = [] } = response;

  switch (type) {
    case 'EDIT': {
      // dispatch(getFullTree({ departmentId, expandedKeys }));
      dispatch(editDepartment({ newDepartments, expandedKeys }));
      dispatch(loadUsers(departmentId, pageIndex));
      break;
    }
    case 'DELETE': {
      //跟部门不可删除
      if (parentDepartmentId === '') {
        dispatch(removeCursor());
        dispatch(deleteDepartment({ departmentId, parentId: parentDepartmentId }));
        // dispatch(loadDepartments(''));
        dispatch(updateTypeCursor(0));
        dispatch(loadAllUsers(projectId, 1));
      } else {
        dispatch(deleteDepartment({ departmentId, parentId: parentDepartmentId, expandedKeys }));
        dispatch(updateCursor(parentDepartmentId));
        // dispatch(getFullTree({ departmentId: parentDepartmentId, expandedKeys }));
        dispatch(loadUsers(parentDepartmentId, 1));
      }
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
    this.diaUl = null;
  }

  componentDidMount() {
    $('.departmentTreeBox').addClass('actinNow');
  }

  componentWillUnmount() {
    $('.departmentTreeBox').removeClass('actinNow');
  }

  handleClick = e => {
    const { departmentId, projectId, dispatch, expandedKeys } = this.props;
    this.props.closeAction();
    createEditDeptDialog({
      type: 'create',
      projectId,
      departmentId,
      isLevel0: false,
      callback: ({ response = {} }) => {
        const { departmentId } = response;
        dispatch(
          getFullTree({
            departmentId,
            isGetAll: true,
            expandedKeys,
            afterRequest() {
              dispatch(updateCursor(departmentId));
              dispatch(loadUsers(departmentId));
            },
          }),
        );
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
  deleteCurrentDepartment = () => {
    const { departmentId, projectId, pageIndex, expandedKeys, dispatch, newDepartments } = this.props;

    departmentController
      .deleteDepartments({
        projectId,
        departmentId,
      })
      .then(res => {
        this.props.closeAction();
        if (res === 1) {
          alert(_l('删除成功'));
          handleDialogCallback(dispatch, {
            type: 'DELETE',
            projectId,
            expandedKeys,
            response: {
              departmentId,
              newDepartments,
            },
          });
        } else if (res === 3) {
          alert(_l('部门存在成员，无法删除'), 3);
        } else if (res === 2) {
          return alert(_l('部门存在子部门，无法删除'), 3);
        } else {
          alert(_l('删除失败'), 2);
        }
      })
      .fail(err => {
        alert(_l('删除失败'), 2);
      });
  };

  render() {
    const { showAction } = this.props;
    if (!showAction) {
      return '';
    }
    return (
      <ul
        className="diaActionTree"
        ref={diaUl => (this.diaUl = diaUl)}
        style={{ left: this.props.dropData.left, top: this.props.dropData.top }}
      >
        <li onClick={this.handleClick}>{_l('添加子部门')}</li>
        <li onClick={this.openSettingDialog}>{_l('编辑部门')}</li>
        <li
          onClick={() => {
            this.props.closeAction();
            copy(this.props.departmentId);
            alert(_l('复制成功'));
          }}
        >
          {_l('复制ID')}
        </li>
        <li onClick={this.deleteCurrentDepartment} style={{ color: '#f51744' }}>
          {_l('删除')}
        </li>
      </ul>
    );
  }
}

const mapStateToProps = state => {
  const {
    current,
    pagination: { userList },
    entities,
  } = state;
  const { departmentId, root, projectId } = current;
  const isRoot = departmentId === root;
  const { departments, expandedKeys } = state.entities;
  const department = departments[departmentId];
  return {
    isRoot,
    expandedKeys,
    departmentId,
    projectId,
    isSearch: userList && userList.isSearchResult,
    allCount: userList && userList.allCount,
    pageIndex: userList && userList.pageIndex,
    departmentName: department ? department.departmentName : '',
    newDepartments: entities.newDepartments,
  };
};

const connectedDiaActionTree = connect(mapStateToProps)(DiaActionTree);

export default connectedDiaActionTree;
