import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Select } from 'antd';
import TableCom from '../TableCom';
import 'dialogSelectUser';
import { usageStatisticsForDimension } from 'src/api/appManagement';
import UserHead from 'src/pages/feed/components/userHead';
import styled from 'styled-components';
import { selectDateList, formatter } from '../../util';
import { formatFileSize } from 'src/util';

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
      isMore: false,
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
                lazy={'false'}
                size={32}
              />
              <span className="mLeft10">{user.fullname || ''}</span>
            </div>
          );
        },
      },
      {
        dataIndex: 'appAccess',
        title: _l('访问次数'),
        className: 'width150',
        sorter: true,
        render: item => {
          return formatter(item.appAccess);
        },
      },
      {
        dataIndex: 'addRow',
        title: _l('记录创建次数'),
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
  updateState = () => {};
  // 筛选登录人
  handleSleelctUser = () => {
    const { projectId } = this.props;
    $({}).dialogSelectUser({
      title: _l('添加人员'),
      showMoreInvite: false,
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
    const { pageIndex, loading, isMore, sorterInfo = {}, keyword, selectedDate, userInfo = [] } = this.state;
    const { sortFiled, order } = sorterInfo;

    // 加载更多
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }

    this.setState({ loading: true });

    if (this.ajaxRequst) {
      this.ajaxRequst.abort();
    }
    this.ajaxRequst = usageStatisticsForDimension({
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
          list: pageIndex === 1 ? list : this.state.list.concat(list),
          pageIndex: pageIndex + 1,
          total: allCount,
          loading: false,
          isMore: list.length,
        });
      })
      .fail(err => {
        this.setState({
          loading: false,
          isMore: false,
        });
      });
  };
  dealSorter = sorterInfo => {
    this.setState({ sorterInfo, pageIndex: 1 }, () => {
      this.getList();
    });
  };
  render() {
    let { selectedDate, list = [], loading, pageIndex, userInfo = [] } = this.state;
    return (
      <ByUserWrap>
        <div className="searchWrap flexRow">
          <Select
            className="userSelect"
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
            className="mLeft16"
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
          loading={loading && pageIndex === 1}
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
        />
      </ByUserWrap>
    );
  }
}
