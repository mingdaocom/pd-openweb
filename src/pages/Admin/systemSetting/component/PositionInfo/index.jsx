import React, { Component } from 'react';
import { Icon, ScrollView, LoadDiv } from 'ming-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Dropdown, Menu } from 'antd';
import DialogCreateAndEditPosition from './components/DialogCreateAndEditPosition';
import PositionContent from './components/PositionContent';
import ImportDeptAndRole from 'src/pages/Admin/components/ImportDeptAndRole';
import EmptyStatus from './components/EmptyStatus';
import * as actions from '../../../redux/position/action';
import jobAjax from 'src/api/job';
import { getPssId } from 'src/util/pssId';
import Config from '../../../config';
import { getCurrentProject } from 'src/util';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';
import moment from 'moment';

class PositionInfo extends Component {
  constructor(props) {
    super(props);
    this.state = { showRoleDialog: false };
    this.ajaxObj = null;
  }
  componentDidMount() {
    this.props.updatePositionPageInfo({ pageIndex: 1, isMore: false });
    this.props.updateProjectId(Config.projectId);
    this.props.getPositionList();
  }
  componentWillUnmount() {
    this.props.updateUserloading(true);
  }
  // 导出职位列表
  exportJobList = () => {
    const { projectId } = this.props;
    let projectName = getCurrentProject(projectId, true).companyName || '';
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
        let date = moment().format('YYYYMMDDHHmmss');
        const fileName = `${projectName}_${_l('职位')}_${date}` + '.xlsx';
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      });
  };
  onScrollEnd = () => {
    const { positionPageInfo = {}, isLoading, searchValue } = this.props;
    const { isMore } = positionPageInfo;
    if (!isMore || isLoading) return;
    this.props.updatePositionPageInfo({ pageIndex: positionPageInfo.pageIndex + 1, isMore: false });
    if (searchValue) {
      this.handleSearch(searchValue);
    } else {
      this.props.getPositionList();
    }
  };
  // 新增编辑职位
  createAndEdit = filed => {
    this.setState({ showRoleDialog: true, filed });
  };
  handleSearch = _.throttle(value => {
    const { projectId, positionPageInfo = {}, positionList = [] } = this.props;
    const { pageIndex = 1 } = positionPageInfo;
    if (!value) {
      this.props.updatePositionPageInfo({ ...positionPageInfo, pageIndex: 1 });
      this.props.getPositionList();
      return;
    }
    this.props.updateSearchValue(value);
    this.ajaxObj = jobAjax.getJobs({ projectId, keywords: value, pageIndex, pageSize: 50 });
    this.ajaxObj.then(res => {
      let currentPosition = (res.list && !_.isEmpty(res.list) && res.list[0]) || {};
      let copyPositionPageInfo = { ...positionPageInfo };
      let list = pageIndex > 1 ? positionList.concat(res.list) : res.list;
      copyPositionPageInfo.isMore = res.list && res.list.length >= 50;
      this.props.updateIsLoading(false);
      this.props.updatePositionPageInfo({ ...positionPageInfo, isMore: res.list && res.list.length >= 50 });
      this.props.updatePositionList(list);
      if (pageIndex === 1) {
        this.props.updateCurrentPosition(currentPosition);
        this.props.getUserList({ jobId: currentPosition.jobId });
      }
    });
  });
  renderImportInfo = () => {
    return (
      <div className="importPositionWrap">
        <ImportDeptAndRole
          importType="position"
          txt={_l('职位')}
          clickBackList={() => {
            this.props.updateIsImportRole(false);
          }}
          downLoadUrl={'/staticfiles/template/positionImport.xlsx'}
          updateList={() => {
            this.props.updatePositionPageInfo({ pageIndex: 1, isMore: false });
            this.props.getPositionList();
          }}
        />
      </div>
    );
  };
  render() {
    const { positionList = [], isLoading = false, currentPosition, projectId, isImportRole, searchValue } = this.props;
    let { showRoleDialog, filed } = this.state;
    if (isImportRole) {
      return this.renderImportInfo();
    }
    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader justifyContentLeft">
          <Icon
            icon="backspace"
            className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
            onClick={() => this.props.setLevel(1)}
          ></Icon>
          <span className="Font17">{_l('职位')}</span>
        </div>
        <div className="system-set-content">
          <div className="itemMain positionContent">
            <div className="PositionL">
              <div className="searchContainer">
                <Icon icon="search" className=" btnSearch ThemeColor9" />
                <input
                  defaultValue={searchValue}
                  ref={input => (this.input = input)}
                  onChange={e => {
                    this.props.updateSearchValue(e.target.value);
                    if (this.ajaxObj && this.ajaxObj.state() === 'pending' && this.ajaxObj.abort) {
                      this.ajaxObj.abort();
                      this.ajaxObj = null;
                    }
                    this.props.updateIsLoading(true);
                    this.handleSearch(e.target.value);
                  }}
                  onFocus={() => {
                    this.props.updatePositionPageInfo({ ...this.props.positionPageInfo, pageIndex: 1 });
                  }}
                  type="text"
                  className="searchInput ThemeColor10 w100"
                  placeholder={_l('搜索')}
                />
                {searchValue ? (
                  <span
                    className="Font14 icon-closeelement-bg-circle Gray_c Hand Absolute"
                    style={{
                      top: '8px',
                      right: '8px',
                    }}
                    onClick={this.handleClear}
                  />
                ) : null}
              </div>
              <input type="text" style={{ width: 0, height: 0, border: 0 }} />
              <div className="actBox flexRow">
                <span className="creatRole themeColor Hand" onClick={() => this.createAndEdit('create')}>
                  <Icon icon="add" className="Font20 TxtMiddle mRight10" />
                  {_l('创建职位')}
                </span>
                <Dropdown
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
                        {_l('导入职位')}
                      </Menu.Item>
                      <Menu.Item key="1" disabled={_.isEmpty(positionList)} onClick={this.exportJobList}>
                        {_l('导出职位')}
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Icon icon="moreop" className="Gray_75 Hand Font20 TxtMiddle iconHover" />
                </Dropdown>
              </div>
              <div className="positionList">
                <ScrollView onScrollEnd={this.onScrollEnd}>
                  {isLoading ? (
                    <LoadDiv />
                  ) : !_.isEmpty(positionList) ? (
                    positionList.map(item => {
                      return (
                        <div
                          key={item.jobId}
                          className={cx('positionItem', { current: currentPosition.jobId === item.jobId })}
                          onClick={() => {
                            if (item.jobId !== currentPosition.jobId) {
                              this.props.updateUserPageIndex(1);
                              this.props.updateCurrentPosition(item);
                              this.props.updateSelectUserIds([]);
                              this.props.getUserList({ jobId: item.jobId });
                            }
                          }}
                        >
                          <Icon className="Font16 Gray_9e mRight10" icon="limit-principal" />
                          <span className={cx('overflow_ellipsis WordBreak jobName')}>{item.jobName}</span>
                          <Icon
                            className="Font16 Gray_9e Right editIcon"
                            icon="edit_17"
                            onClick={e => {
                              this.createAndEdit('edit');
                              if (item.jobId !== currentPosition.jobId) {
                                this.props.updateUserPageIndex(1);
                                this.props.updateCurrentPosition(item);
                                this.props.updateSelectUserIds([]);
                                this.props.getUserList({ jobId: item.jobId });
                              }
                            }}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="Gray_9e pLeft24 mTop16">
                      {_l('暂无职位，可')}
                      <span
                        className="Hand"
                        style={{ color: '#2196F3' }}
                        onClick={() => {
                          this.props.updateIsImportRole(true);
                        }}
                      >
                        {_l('批量导入')}
                      </span>
                    </div>
                  )}
                </ScrollView>
              </div>
            </div>
            <div className="PositionR">
              {!_.isEmpty(positionList) ? (
                <PositionContent />
              ) : (
                <EmptyStatus
                  tipTxt={_l('可以根据成员属性去创建职位，如，技术、生产、销售设置后应用和工作流可以直接选择职位')}
                  icon="Empty_Noposition"
                />
              )}
            </div>
            {showRoleDialog && (
              <DialogCreateAndEditPosition
                showRoleDialog={showRoleDialog}
                filed={filed}
                onCancel={() => {
                  this.setState({ showRoleDialog: false });
                }}
                updateCurrentPosition={this.props.updateCurrentPosition}
                positionList={positionList}
                projectId={projectId}
                currentPosition={currentPosition}
                getPositionList={this.props.getPositionList}
                updatePositionList={this.props.updatePositionList}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    const { positionList, isLoading, currentPosition, projectId, isImportRole, positionPageInfo, searchValue } =
      state.orgManagePage.position;
    return {
      positionList,
      isLoading,
      currentPosition,
      projectId,
      isImportRole,
      positionPageInfo,
      searchValue,
    };
  },
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, [
          'updateProjectId',
          'getPositionList',
          'updateCurrentPosition',
          'getUserList',
          'updateUserPageIndex',
          'updateSelectUserIds',
          'updateSearchValue',
          'updateIsImportRole',
          'updatePositionPageInfo',
          'updatePositionList',
          'updateIsLoading',
          'updateUserloading',
        ]),
      },
      dispatch,
    ),
)(PositionInfo);
