import React, { Component, Fragment } from 'react';
import { Input, Table, Spin, ConfigProvider } from 'antd';
import { LoadDiv } from 'ming-ui';
import Empty from '../../common/TableEmpty';
import Config from '../../config';
import groupController from 'src/api/group';
import PaginationWrap from '../../components/PaginationWrap';
import './index.less';
import Confirm from 'ming-ui/components/Dialog/Confirm';

const { Search } = Input;

export default class MemberList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      pageSize: 20,
      keywords: '',
      count: 0,
      list: [],
      selectKeys: [],
      loading: false,
    };
    this.columns = [
      {
        title: _l('姓名'),
        dataIndex: 'fullname',
        render: (text, record) => {
          return (
            <div className="nameBox">
              <img src={record.avatar} alt="avatar" />
              <span className="mRight5 ellipsis">{text}</span>
              {record.groupUserRole === 1 ? <i class="TxtMiddle icon-limit-othermember color_y Font10"></i> : ''}
            </div>
          );
        },
      },
      {
        title: _l('部门'),
        dataIndex: 'department',
      },
      {
        title: _l('电子邮件地址'),
        dataIndex: 'email',
      },
      {
        title: _l('操作'),
        dataIndex: 'option',
        render: (text, record) => {
          return (
            <div
              className="Hand ThemeColor3 Font13 adminHoverColor"
              onClick={() =>
                record.groupUserRole === 1
                  ? this.handleDelete(record.accountId, record.fullname)
                  : this.handleSet(record.accountId)
              }
            >
              {record.groupUserRole === 1 ? _l('移除管理员') : _l('设为管理员')}
            </div>
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.getGroupsList();
  }

  changePage = page => {
    this.setState(
      {
        pageIndex: page,
        selectKeys: [],
      },
      () => this.getGroupsList(),
    );
  };

  getGroupsList() {
    this.setState({ loading: true });
    const reqData = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      groupId: this.props.groupId,
      keywords: this.state.keyword,
      type: 1,
      projectId: Config.projectId,
    };

    groupController.getGroupUsers(reqData).then(res => {
      this.setState({
        count: res.groupMemberCount,
        list: res.groupUsers || [],
        loading: false,
      });
    });
  }

  //搜索框筛选
  handleInputChange(keywords) {
    this.setState(
      {
        keywords,
        pageIndex: 1,
      },
      () => {
        this.getGroupsList();
      },
    );
  }

  handleSet = id => {
    Confirm({
      title: _l('设置管理员'),
      description: _l('确认将所选择人员设置为管理员?'),
      onOk: () => {
        groupController
          .addAdmin({
            accountIds: id ? [id] : this.state.selectKeys,
            groupId: this.props.groupId,
          })
          .then(data => {
            if (data) {
              alert(_l('设置成功'));
              this.getGroupsList();
            } else alert(_l('设置失败'), 2);
          });
      },
    });
  };

  handleDelete(id, name) {
    Confirm({
      title: _l('移除管理员'),
      description: _l('确认移除%0的管理员权限？', name),
      onOk: () => {
        groupController
          .removeAdmin({
            accountId: id,
            groupId: this.props.groupId,
          })
          .then(data => {
            if (data == 1) {
              alert(_l('移除%0的管理员权限成功', name));
              this.getGroupsList();
            } else if (data == 2) {
              alert(_l('当前群组还有其他成员但只有你一个管理员，移出请先设置一位管理员'), 3);
            } else alert(_l('移除%0的管理员权限失败', name), 2);
          });
      },
    });
  }

  onSelectChange = selectKeys => {
    this.setState({ selectKeys });
  };

  render() {
    const { selectKeys, pageSize, count, pageIndex, list, loading } = this.state;
    const rowSelection = {
      selectKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => {
        if (record.groupUserRole === 1) {
          return { disabled: true };
        } else {
          return null;
        }
      },
    };
    const detail = {
      icon: 'icon-myUpload',
      desc: _l('无成员'),
    };
    const MemberEmpty = () => <Empty detail={detail} />;
    return (
      <div className="groupsList">
        <div className="groupTool">
          <div className="groupItem">
            {selectKeys.length ? (
              <Fragment>
                <span className="Font16 color_b Bold">{_l(`已选择%0条`, selectKeys.length)}</span>
                <div className="ThemeColor3 mLeft30 Hand" onClick={() => this.handleSet()}>
                  <span className="icon icon-sp_filter_none_white"></span>
                  <span>{_l('设置为管理员')}</span>
                </div>
              </Fragment>
            ) : (
              <Search
                allowClear
                placeholder={_l('搜索')}
                onSearch={_.debounce(value => this.handleInputChange(value), 500)}
              />
            )}
          </div>
        </div>
        <div className="tableList">
          <ConfigProvider renderEmpty={MemberEmpty}>
            <Spin indicator={<LoadDiv />} spinning={loading}>
              <Table
                rowSelection={rowSelection}
                rowKey={record => record.accountId}
                columns={this.columns}
                dataSource={list}
                pagination={false}
                scroll={count == 0 ? {} : { y: count > pageSize ? 'calc(100vh - 300px)' : 'calc(100vh - 260px)' }}
              />
              {count > pageSize && (
                <PaginationWrap total={count} pageIndex={pageIndex} pageSize={pageSize} onChange={this.changePage} />
              )}
            </Spin>
          </ConfigProvider>
        </div>
      </div>
    );
  }
}
