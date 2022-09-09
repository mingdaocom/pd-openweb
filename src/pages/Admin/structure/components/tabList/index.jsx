import React from 'react';
import { connect } from 'react-redux';
import TreeView from '../departmentView';
import CreateBtn from '../departmentView/createBtn';
import { Icon } from 'ming-ui';
import {
  loadAllUsers,
  loadDepartments,
  loadUsers,
  loadInactiveUsers,
  loadApprovalUsers,
  updateShowExport,
  updateImportType,
} from '../../actions/entities';
import { updateCursor, updateTypeCursor, fetchInActive } from '../../actions/current';
import './index.less';
import cx from 'classnames';

const shouldLoadDepartments = props => {
  const { haveSubDepartment, subDepartments, isLoading, isExpired } = props;
  if (isLoading) return false;
  return isExpired || (haveSubDepartment && !subDepartments.length);
};
class TabList extends React.Component {
  constructor(props) {
    super(props);
    const { projectId, fetchInActive = () => {} } = props;
    this.state = {
      showPositionDialog: false,
      isNew: true,
    };
    fetchInActive(projectId);
  }

  handleClick = typeCursor => {
    const {
      projectId,
      updateCursor = () => {},
      updateTypeCursor = () => {},
      loadAllUsers = () => {},
      loadDepartments = () => {},
      loadUsers = () => {},
      loadInactiveUsers = () => {},
      loadApprovalUsers = () => {},
    } = this.props;
    updateCursor('');
    updateTypeCursor(typeCursor);
    switch (typeCursor) {
      case 0:
        loadAllUsers(projectId, 1);
        break;
      case 1:
        if (shouldLoadDepartments(this.props)) {
          loadDepartments('', 1);
        }
        loadUsers('');
        break;
      case 2:
        loadInactiveUsers(projectId, 1);
        break;
      case 3:
        loadApprovalUsers(projectId, 1);
        break;
    }
  };

  render() {
    const { typeCursor = 0, approveNumber, inActiveNumber, root, cursor } = this.props;
    return (
      <React.Fragment>
        <div className="departmentTop mRight24">
          <ul>
            <li
              onClick={() => {
                this.handleClick(0);
              }}
              className={cx('Hand', { current: cursor === root && (typeCursor === 1 || typeCursor === 0) })}
            >
              <Icon className={cx('Font16 Gray_9e listName mRight10')} icon="person" />
              <span>{_l('全组织')}</span>
            </li>
            <li
              onClick={() => {
                this.handleClick(2);
              }}
              className={cx('Hand', { current: cursor === root && typeCursor === 2 })}
            >
              <Icon className="Font16 Gray_9e listName mRight10" icon="check_circle" />
              <span>
                {_l('未激活')}
                {inActiveNumber > 0 && typeCursor !== 2 && (
                  <span className="numTag">{inActiveNumber > 99 ? '99+' : inActiveNumber}</span>
                )}
              </span>
            </li>
            <li
              onClick={() => {
                this.handleClick(3);
              }}
              className={cx('Hand', { current: cursor === root && typeCursor === 3 })}
            >
              <Icon className="Font16 Gray_9e listName mRight10" icon="access_time_filled" />
              <span>
                {_l('待审核')}
                {approveNumber > 0 && typeCursor !== 3 && (
                  <span className="numTag">{approveNumber > 99 ? '99+' : approveNumber}</span>
                )}
              </span>
            </li>
          </ul>
        </div>
        <CreateBtn />
        <div
          className="w100 flex"
          style={{
            position: 'relative',
            zIndex: 0,
            minHeight: 0,
          }}
        >
          <TreeView />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const {
    current: {
      departmentId,
      projectId,
      selectedAccountIds,
      approveNumber,
      inActiveNumber,
      isSearch,
      typeNum,
      typeCursor,
      root,
    },
    pagination,
  } = state;
  const { departments, isLoading } = state.entities;
  const department = departments[''];
  return {
    pagination,
    projectId,
    departmentId,
    selectedAccountIds,
    selectCount: selectedAccountIds.length,
    approveNumber,
    inActiveNumber,
    isSearch,
    typeNum,
    typeCursor,
    root,
    cursor: departmentId,
    departmentName: department ? department.departmentName : '',
    isLoading,
  };
};

export default connect(mapStateToProps, {
  loadAllUsers,
  loadDepartments,
  loadUsers,
  loadInactiveUsers,
  loadApprovalUsers,
  updateShowExport,
  updateCursor,
  updateTypeCursor,
  fetchInActive,
  updateImportType,
})(TabList);
