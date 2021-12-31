import React from 'react';
import { connect } from 'react-redux';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { loadUsers, getFullTree, deleteDepartment, loadDepartments, loadAllUsers } from '../../actions/entities';
import { removeCursor, updateCursor, updateTypeCursor } from '../../actions/current';
import './index.less';

const EditDialog = require('../../modules/dialogCreateEditDept');
const CreateDialog = require('../../modules/dialogCreateEditDept');

const handleDialogCallback = (dispatch, payload) => {
  const { response = {}, pageIndex, type, expandedKeys, projectId } = payload;
  const { departmentId = '', parentDepartmentId = '' } = response;
  switch (type) {
    case 'EDIT': {
      dispatch(getFullTree({ departmentId, expandedKeys }));
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
        dispatch(deleteDepartment({ departmentId, parentId: parentDepartmentId }));
        dispatch(updateCursor(parentDepartmentId));
        dispatch(getFullTree({ departmentId: parentDepartmentId, expandedKeys }));
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
    CreateDialog({
      type: 'create',
      projectId,
      departmentId: departmentId,
      callback(payload) {
        const {
          response: { departmentId },
        } = payload;
        dispatch(
          getFullTree({
            departmentId,
            isGetAll: true,
            expandedKeys,
            afterRequest() {
              dispatch(updateCursor(departmentId));
              dispatch(loadUsers(departmentId));
              $.publish('SCROLL_TO_DEPARTMENT', departmentId);
            },
          }),
        );
      },
    });
  };

  openSettingDialog = () => {
    const { departmentId, projectId, pageIndex, expandedKeys, dispatch } = this.props;
    EditDialog({
      type: 'edit',
      projectId,
      departmentId,
      callback(payload) {
        handleDialogCallback(dispatch, {
          ...payload,
          projectId,
          pageIndex,
          expandedKeys,
        });
      },
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
        <li
          onClick={() => {
            this.handleClick();
          }}
        >
          {_l('添加子部门')}
        </li>
        <li
          // style={{ borderBottom: '1px solid #eaeaea' }}
          onClick={() => {
            this.openSettingDialog();
          }}
        >
          {_l('编辑部门')}
        </li>
        {/* <li className='' onClick={() => { }}>{_l('查看全部层级成员')}</li> */}
        {/* <li className='mTop5'>{_l('仅看本级')}</li> */}
      </ul>
    );
  }
}

const mapStateToProps = state => {
  const {
    current,
    pagination: { userList },
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
  };
};

const connectedDiaActionTree = connect(mapStateToProps)(DiaActionTree);

export default connectedDiaActionTree;
