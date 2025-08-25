import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Tooltip, UserHead } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import departmentAjax from 'src/api/department';
import downloadAjax from 'src/api/download';
import CustomSelectDate from 'src/pages/Admin/components/CustomSelectDate';
import SelectUser from 'src/pages/Admin/components/SelectUser';
import { formatFileSize } from 'src/utils/common';
import { formatter, selectDateList } from '../../util';
import TableCom from '../TableCom';

const ByUserWrap = styled.div`
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .searchWrap {
    .w200 {
      width: 200px;
    }
    .export {
      margin-left: 26px;
      min-width: 76px;
      padding: 0 16px;
    }
  }
  .userInfo {
    line-height: 32px;
  }
`;

export default class ByUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: 1,
      list: [],
      loading: false,
      pageIndex: 1,
      fullDepartmentInfo: {},
      disabledExportBtn: true,
      startTime: moment().subtract(29, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    };
    this.columns = [
      {
        dataIndex: 'user',
        title: _l('姓名'),
        className: 'flex minWidth120 pLeft10',
        render: item => {
          const { user } = item;
          if (!user) return;
          return (
            <div className="flexRow userInfo">
              <UserHead
                className="circle"
                user={{
                  userHead: user.avatar,
                  accountId: item.id,
                }}
                size={32}
                projectId={props.projectId}
              />
              <span className="mLeft10 overflow_ellipsis">{user.fullname || ''}</span>
            </div>
          );
        },
      },
      {
        dataIndex: 'department',
        title: _l('部门'),
        className: 'flex pRight8 overflowHidden',
        render: item => {
          const { user = {} } = item;
          const { departments = [] } = user;
          return (
            <div className="ellipsis" onMouseEnter={() => this.getDepartmentFullName(departments)}>
              <Tooltip
                tooltipClass="departmentFullNametip"
                popupPlacement="bottom"
                autoCloseDelay={0}
                text={
                  <div>
                    {departments.map((v, depIndex) => {
                      const fullName = (this.state.fullDepartmentInfo[v.departmentId] || '').split('/');
                      return (
                        <div className={cx({ mBottom8: depIndex < departments.length - 1 })}>
                          {fullName.map((n, i) => (
                            <span>
                              {n}
                              {fullName.length - 1 > i && <span className="mLeft8 mRight8">/</span>}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                }
                mouseEnterDelay={0.5}
              >
                <span className="ellipsis InlineBlock wMax100 space">
                  {departments
                    .map(it => {
                      return `${it.departmentName}`;
                    })
                    .join(';')}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        dataIndex: 'appAccess',
        title: _l('应用访问次数'),
        explain: (
          <span>
            {_l('应用访问次数计数说明：')}
            <br />
            {_l('· 通过应用图标点击进入应用')}
            <br />
            {_l('· 通过系统消息打开了应用')}
            <br />
            {_l('· 通过超链接访问应用')}
          </span>
        ),
        className: 'width150',
        sorter: true,
        render: item => {
          return formatter(item.appAccess);
        },
      },
      {
        dataIndex: 'addRow',
        title: _l('记录创建次数'),
        explain: (
          <span>
            {_l('记录创建次数计数说明：')}
            <br />
            {_l('通过工作表表单页面创建的记录、不包含Excel导入、工作流创建、API调用的方式')}
          </span>
        ),
        className: 'width150',
        sorter: true,
        render: item => {
          return formatter(item.addRow);
        },
      },
      {
        dataIndex: 'attachmentUpload',
        title: _l('附件上传量'),
        className: 'width150',
        sorter: true,
        render: item => {
          return formatFileSize(item.attachmentUpload);
        },
      },
    ];
  }
  componentDidMount() {
    this.getList();
  }

  getDepartmentFullName = (departmentData = []) => {
    let { projectId } = this.props;
    let { fullDepartmentInfo = {} } = this.state;
    const departmentIds = departmentData.map(item => item.departmentId).filter(it => !fullDepartmentInfo[it]);
    if (_.isEmpty(departmentIds)) {
      return;
    }
    departmentAjax
      .getDepartmentFullNameByIds({
        projectId,
        departmentIds,
      })
      .then(res => {
        res.forEach(it => {
          fullDepartmentInfo[it.id] = it.name;
        });
        this.setState({ fullDepartmentInfo: fullDepartmentInfo });
      });
  };

  getList = () => {
    const { projectId, appId } = this.props;
    const { pageIndex, sorterInfo = {}, selectedDate, userInfo = [], startTime, endTime } = this.state;
    const { sortFiled, order } = sorterInfo;

    this.setState({ loading: true });

    if (this.ajaxRequst) {
      this.ajaxRequst.abort();
    }
    this.ajaxRequst = appManagementAjax.usageStatisticsForDimension({
      projectId,
      appId: appId ? appId : '',
      dayRange: selectedDate,
      pageIndex: pageIndex,
      pageSize: 50,
      dimension: appId ? 1 : 2,
      sortFiled: sortFiled || 'appAccess',
      sorted: order === 'asc' ? true : false,
      userIds: userInfo.map(item => item.accountId),
      startTime,
      endTime,
    });
    this.ajaxRequst
      .then(({ list, allCount }) => {
        this.setState({
          list,
          total: allCount,
          loading: false,
          disabledExportBtn: _.isEmpty(list),
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          list: [],
          total: 0,
          disabledExportBtn: true,
        });
      });
  };
  dealSorter = sorterInfo => {
    this.setState({ sorterInfo, pageIndex: 1 }, () => {
      this.getList();
    });
  };

  exportListData = () => {
    this.setState({ disabledExportBtn: true });

    const { projectId, appId } = this.props;
    const { pageIndex, sorterInfo = {}, selectedDate, userInfo = [], startTime, endTime } = this.state;
    const { sortFiled, order } = sorterInfo;

    const params = {
      projectId,
      appId: appId ? appId : '',
      dayRange: selectedDate,
      pageIndex: pageIndex,
      pageSize: 50,
      dimension: appId ? 1 : 2,
      sortFiled: sortFiled || 'appAccess',
      sorted: order === 'asc' ? true : false,
      userIds: userInfo.map(item => item.accountId),
      startTime,
      endTime,
    };

    downloadAjax
      .exportUsageStatisticsForDimensionLog(params)
      .then(() => {
        this.setState({ disabledExportBtn: false });
      })
      .catch(() => {
        this.setState({ disabledExportBtn: false });
      });
  };
  render() {
    const { projectId } = this.props;
    let { list = [], loading, pageIndex, userInfo = [], total, disabledExportBtn, dateInfo = {} } = this.state;
    return (
      <ByUserWrap>
        <div className="searchWrap flexRow">
          <SelectUser
            className="userSelect mdAntSelect"
            style={{ width: '200px' }}
            projectId={projectId}
            userInfo={userInfo}
            placeholder={_l('搜索成员')}
            maxCount={100}
            changeData={data => {
              this.setState({ userInfo: data, pageIndex: 1 }, () => {
                this.getList();
              });
            }}
          />
          <CustomSelectDate
            className="mdAntSelect mLeft16 w200"
            dateFormat={'YYYY-MM-DD HH:mm:ss'}
            searchDateList={selectDateList}
            dateInfo={dateInfo}
            min={moment().subtract(1, 'year')}
            changeDate={({ startDate, endDate, searchDateStr, dayRange }) => {
              this.setState(
                {
                  dateInfo: { startDate, endDate, searchDateStr },
                  selectedDate: dayRange,
                  startTime: startDate,
                  endTime: endDate,
                },
                this.getList,
              );
            }}
          />
          <div className="flex"></div>
          <Button
            type="primary"
            className="export"
            disabled={disabledExportBtn}
            onClick={() => {
              if (disabledExportBtn) return;
              this.exportListData();
            }}
          >
            {_l('导出')}
          </Button>
        </div>
        <TableCom
          dataSource={list}
          columns={this.columns}
          loadNextPage={this.getList}
          loading={loading}
          defaultSorter={{ sortFiled: 'appAccess', order: 'desc' }}
          dealSorter={this.dealSorter}
          emptyInfo={
            !_.isEmpty(userInfo)
              ? {
                  emptyContent: _l('没有搜索到'),
                  emptyDescription: _l('此列表仅显示产生过数据的成员'),
                }
              : {}
          }
          total={total}
          pageIndex={pageIndex}
          changePage={pageIndex => this.setState({ pageIndex }, this.getList)}
        />
      </ByUserWrap>
    );
  }
}
