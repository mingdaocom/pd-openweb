import React from 'react';
import { connect } from 'react-redux';
import TreeView from '../departmentView';
import CreateBtn from '../departmentView/createBtn';
import { Icon } from 'ming-ui';
import { Dropdown, Menu } from 'antd';
import {
  loadAllUsers,
  loadDepartments,
  loadUsers,
  loadInactiveUsers,
  loadApprovalUsers,
  updateShowExport,
  updateImportType,
} from '../../actions/entities';
import { updateCursor, updateTypeCursor, fetchInActive, fetchApproval } from '../../actions/current';
import projectSettingAjax from 'src/api/projectSetting';
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
    const { projectId, fetchInActive = () => {}, fetchApproval = () => {} } = props;
    this.state = {
      showPositionDialog: false,
      isNew: true,
    };
    fetchInActive(projectId);
    fetchApproval(projectId);
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
    localStorage.removeItem('columnsInfoData');
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

  // 刷新缓存
  clearCache = () => {
    const { projectId } = this.props;
    Promise.all([
      projectSettingAjax.projectClearCache({ projectId, processType: 10 }),
      projectSettingAjax.projectClearCache({ projectId, processType: 20 }),
    ]).then(([data1, data2]) => {
      if (data1 && data2) {
        alert(_l('刷新成功'));
      } else {
        alert(_l('刷新失败'), 2);
      }
    });
  };

  render() {
    const { typeCursor = 0, approveNumber, inActiveNumber, root, cursor } = this.props;
    return (
      <React.Fragment>
        <div className="departmentTop mRight24">
          <ul>
            <li className={cx('Hand flexRow', { current: cursor === root && (typeCursor === 1 || typeCursor === 0) })}>
              <div
                className="flex"
                onClick={() => {
                  this.handleClick(0);
                }}
              >
                <Icon className={cx('Font16 Gray_9e listName mRight10')} icon="person" />
                <span>{_l('全组织')}</span>
              </div>
              <Dropdown
                overlayStyle={{ width: 150 }}
                trigger={['click']}
                placement="bottomLeft"
                overlay={
                  <Menu>
                    <Menu.Item key="0" onClick={this.clearCache}>
                      {_l('刷新所有成员信息')}
                    </Menu.Item>
                  </Menu>
                }
              >
                <div style={{ width: 24 }} onClick={e => e.stopPropagation()}>
                  <Icon icon="moreop" />
                </div>
              </Dropdown>
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
  fetchApproval,
  updateImportType,
})(TabList);
