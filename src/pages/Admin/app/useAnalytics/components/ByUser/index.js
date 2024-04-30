import React, { Component, Fragment } from 'react';
import { Icon, Tooltip, UserHead } from 'ming-ui';
import { Select } from 'antd';
import TableCom from '../TableCom';
import { dialogSelectUser } from 'ming-ui/functions';
import appManagementAjax from 'src/api/appManagement';
import departmentAjax from 'src/api/department';
import styled from 'styled-components';
import { selectDateList, formatter } from '../../util';
import { formatFileSize } from 'src/util';
import cx from 'classnames';
import _ from 'lodash';

const { Option } = Select;

const ByUserWrap = styled.div`
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .searchWrap {
    .ant-select {
      height: 36px;
      .ant-select-selector {
        height: 36px;
        border: 1px solid #eaeaea;
        .ant-select-selection-placeholder,
        .ant-select-selection-item {
          line-height: 32px;
        }
      }
      .ant-select-arrow {
        margin-top: -9px;
        top: 50%;
        width: 18px;
        height: 18px;
      }
      &.userSelect {
        .ant-select-arrow {
          right: 12px;
          width: 18px;
          height: 18px;
        }
        .ant-select-clear {
          width: 18px;
          height: 18px;
        }
      }
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
              <span className="mLeft10">{user.fullname || ''}</span>
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
                    .map((it, i) => {
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

  updateState = () => {};
  // 筛选登录人
  handleSleelctUser = () => {
    const { projectId } = this.props;
    dialogSelectUser({
      fromAdmin: true,
      SelectUserSettings: {
        projectId,
        dataRange: 2,
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        unique: true,
        callback: data => {
          this.setState({ userInfo: data, pageIndex: 1 }, () => {
            this.getList();
          });
        },
      },
    });
  };
  getList = () => {
    const { projectId, appId } = this.props;
    const { pageIndex, sorterInfo = {}, keyword, selectedDate, userInfo = [] } = this.state;
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
      keyword: userInfo.map(item => item.accountId).join(''),
    });
    this.ajaxRequst
      .then(({ list, allCount }) => {
        this.setState({
          list,
          total: allCount,
          loading: false,
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
        });
      });
  };
  dealSorter = sorterInfo => {
    this.setState({ sorterInfo, pageIndex: 1 }, () => {
      this.getList();
    });
  };
  render() {
    let { selectedDate, list = [], loading, pageIndex, userInfo = [], total } = this.state;
    return (
      <ByUserWrap>
        <div className="searchWrap flexRow">
          <Select
            className="userSelect mdAntSelect"
            style={{ width: '200px' }}
            value={userInfo.map(item => item.fullname).join(',') || undefined}
            placeholder={_l('搜索成员')}
            dropdownRender={null}
            allowClear
            open={false}
            onFocus={this.handleSleelctUser}
            suffixIcon={<Icon icon="person" className="Font18" />}
            onChange={() => {
              this.setState(
                {
                  userInfo: [],
                  pageIndex: 1,
                },
                () => {
                  this.getList();
                },
              );
            }}
          />
          <Select
            className="mLeft16 mdAntSelect"
            style={{ width: '200px' }}
            placeholder={_l('最近30天')}
            suffixIcon={<Icon icon="arrow-down-border" className="Font18" />}
            value={selectedDate}
            onChange={value => {
              this.setState({ selectedDate: value, pageIndex: 1 }, () => {
                this.getList();
              });
            }}
          >
            {selectDateList.map(item => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
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
