import React, { Component } from 'react';
import { Icon, ScrollView, LoadDiv, Tooltip, Button } from 'ming-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Dropdown, Menu } from 'antd';
import Trigger from 'rc-trigger';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import RoleSearchBox from './components/RoleSearchBox';
import DialogCreateAndEditRole from './components/DialogCreateAndEditRole';
import RoleManageContent from './components/RoleManageContent';
import ImportDeptAndRole from '../components/ImportDeptAndRole';
import EmptyStatus from './components/EmptyStatus';
import * as actions from '../redux/roleManage/action';
import { getPssId } from 'src/util/pssId';
import organizeAjax from 'src/api/organize.js';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';
import moment from 'moment';

class RoleManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRoleDialog: false,
    };
  }
  componentDidMount() {
    const { match } = this.props;
    const { params = {} } = match;
    this.props.updateIsRequestList(true);
    this.props.updateRolePageInfo({ pageIndex: 1, isMore: false });
    this.props.updateProjectId(params.projectId);
    this.props.updateSearchValue('');
    this.props.getRoleList();
  }
  componentWillUnmount() {
    this.props.updateUserLoading(true);
  }
  // 导出角色列表
  exportJobList = () => {
    const { projectId } = this.props;
    let projectName = (md.global.Account.projects || []).filter(item => item.projectId === projectId).length
      ? (md.global.Account.projects || []).filter(item => item.projectId === projectId)[0].companyName
      : '';
    fetch(`${md.global.Config.AjaxApiUrl}download/exportProjectJobList`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `md_pss_id ${getPssId()}`,
      },
      body: JSON.stringify({
        userStatus: '1',
        projectId,
      }),
    })
      .then(response => response.blob())
      .then(blob => {
        let date = moment(new Date()).format('YYYYMMDDHHmmss');
        const fileName = `${projectName}_${_l('职位')}_${date}` + '.xlsx';
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      });
  };
  onScrollEnd = () => {
    const { rolePageInfo = {}, isLoading } = this.props;
    const { isMore } = rolePageInfo;
    if (!isMore || isLoading) return;
    this.props.updateRolePageInfo({ pageIndex: rolePageInfo.pageIndex + 1, isMore: false });
    this.props.getRoleList();
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
          downLoadUrl={'/staticfiles/template/positionImport.xlsx'}
          updateList={() => {
            this.props.updateRolePageInfo({ pageIndex: 1, isMore: false });
            this.props.getRoleList();
          }}
        />
      </div>
    );
  };
  delCurrentRole = item => {
    const { projectId } = this.props;
    organizeAjax.deleteOrganizes({
      organizeIds: [item.organizeId],
      projectId,
    }).then(res => {
      this.setState({ popupVisible: false, showDeleteId: '' });
      if (res === 1) {
        alert(_l('删除成功'));
        this.props.getRoleList();
      } else if (res === 24004) {
        alert(_l('角色存在成员，无法删除'), 3);
      } else {
        alert(_l('删除失败'), 2);
      }
    });
  };
  render() {
    const { roleList = [], isLoading = false, currentRole, projectId, isImportRole, searchValue } = this.props;
    let { showRoleDialog, filed, showDeleteId = '', popupVisible } = this.state;
    if (isImportRole) {
      return this.renderImportInfo();
    }
    return (
      <div className="roleManageContainer">
        <AdminTitle prefix={_l('组织角色')} />
        <div className="roleManageLeft">
          <div className="Bold Font15 mBottom20 pLeft24">{_l('组织角色')}</div>
          <RoleSearchBox
            projectId={projectId}
            updateSearchValue={this.props.updateSearchValue}
            getRoleList={this.props.getRoleList}
            updateIsRequestList={this.props.updateIsRequestList}
            updateRolePageInfo={this.props.updateRolePageInfo}
          />
          <input type="text" style={{ width: 0, height: 0, border: 0 }} />
          <div className="actBox flexRow">
            <span className="creatRole themeColor Hand" onClick={() => this.createAndEdit('create')}>
              <Icon icon="add" className="Font20 TxtMiddle" />
              {_l('创建角色')}
            </span>
            {/* <Dropdown
              overlayClassName="createMoreDropDown"
              trigger={['click']}
              placement="bottomLeft"
              overlay={
                <Menu>
                  <Menu.Item
                    key="0"
                    onClick={() => {
                      this.props.updateIsImportRole(true);
                    }}
                  >
                    {_l('导入角色')}
                  </Menu.Item>
                  <Menu.Item key="1" disabled={_.isEmpty(roleList)} onClick={this.exportJobList}>
                    {_l('导出角色')}
                  </Menu.Item>
                </Menu>
              }
            >
              <Icon icon="moreop" className="Gray_75 Hand Font20 TxtMiddle iconHover" />
            </Dropdown> */}
          </div>
          <div className="roleList">
            <ScrollView onScrollEnd={this.onScrollEnd}>
              {isLoading ? (
                <LoadDiv />
              ) : !_.isEmpty(roleList) ? (
                roleList.map(item => {
                  return (
                    <div
                      key={item.organizeId}
                      className={cx('roleItem Relative', { current: currentRole.organizeId === item.organizeId })}
                      onClick={() => {
                        if (item.organizeId !== currentRole.organizeId) {
                          this.props.updateUserPageIndex(1);
                          this.props.updateCurrentRole(item);
                          this.props.updateSelectUserIds([]);
                          this.props.getUserList({ roleId: item.organizeId });
                        }
                      }}
                    >
                      <span className={cx('overflow_ellipsis WordBreak roleName')}>{item.organizeName}</span>
                      {item.remark && item.organizeId !== showDeleteId && (
                        <Tooltip popupPlacement={'rightTop'} offset={[0, -15]} text={<span>{item.remark}</span>}>
                          <Icon icon="info_outline" className="remarkTooptip" />
                        </Tooltip>
                      )}
                      {item.organizeId !== showDeleteId && (
                        <Dropdown
                          overlayClassName="actRoleDrop"
                          trigger={['click']}
                          placement="bottomLeft"
                          overlay={
                            <Menu>
                              <Menu.Item
                                key="0"
                                onClick={() => {
                                  this.createAndEdit('edit');
                                  this.props.updateUserPageIndex(1);
                                  this.props.updateCurrentRole(item);
                                  this.props.updateSelectUserIds([]);
                                  this.props.getUserList({ roleId: item.organizeId });
                                }}
                              >
                                {_l('编辑')}
                              </Menu.Item>
                              <Menu.Item
                                key="1"
                                disabled={_.isEmpty(roleList)}
                                className="delRole"
                                onClick={() => {
                                  this.setState({ showDeleteId: item.organizeId, popupVisible: true });
                                }}
                              >
                                {_l('删除')}
                              </Menu.Item>
                            </Menu>
                          }
                        >
                          <Icon icon="more_horiz" className="Font16 Gray_9e Right editIcon" />
                        </Dropdown>
                      )}
                      {item.organizeId === showDeleteId && (
                        <Trigger
                          popupAlign={{ points: ['tl', 'cr'], offset: [0, 0] }}
                          popupVisible={item.organizeId === showDeleteId}
                          popupVisible={popupVisible}
                          popup={
                            <div className="delConfirmWrap">
                              <div className="Gray Bold Font15 mBootom20">{_l('确定要删除此角色？')}</div>
                              <div className="Gray_9e Font13">{_l('删除后无法恢复')}</div>
                              <div className="delFooter">
                                <Button
                                  type="link"
                                  onClick={() => {
                                    this.setState({ popupVisible: false, showDeleteId: '' });
                                  }}
                                >
                                  {_l('取消')}
                                </Button>
                                <Button type="danger" onClick={() => this.delCurrentRole(item)}>
                                  {_l('确认')}
                                </Button>
                              </div>
                            </div>
                          }
                        >
                          <Icon icon="more_horiz" className="delIcon" />
                        </Trigger>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="Gray_9e pLeft24 mTop16">
                  {/* {_l('暂无角色，可')}
                  <span
                    className="Hand"
                    style={{ color: '#2196F3' }}
                    onClick={() => {
                      this.props.updateIsImportRole(true);
                    }}
                  >
                    {_l('批量导入')}
                  </span> */}
                </div>
              )}
            </ScrollView>
          </div>
        </div>
        <div className="roleManageRight">
          {_.isEmpty(roleList) && !searchValue ? (
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
            onCancel={() => {
              this.setState({ showRoleDialog: false });
            }}
            updateCurrentRole={this.props.updateCurrentRole}
            roleList={roleList}
            projectId={projectId}
            currentRole={currentRole}
            getRoleList={this.props.getRoleList}
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
          'getRoleList',
          'updateCurrentRole',
          'getUserList',
          'updateUserPageIndex',
          'updateSelectUserIds',
          'updateSearchValue',
          'updateIsImportRole',
          'updateRolePageInfo',
          'updateIsRequestList',
          'updateUserLoading',
        ]),
      },
      dispatch,
    ),
)(RoleManage);
