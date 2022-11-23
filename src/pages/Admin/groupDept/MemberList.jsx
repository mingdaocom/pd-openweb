import React, { Component, Fragment } from 'react';
import { Input, Table, Spin, ConfigProvider } from 'antd';
import { LoadDiv } from 'ming-ui';
import Empty from '../common/TableEmpty';
import Config from '../config';
import DialogLayer from 'src/components/mdDialog/dialog';
import ReactDom from 'react-dom';
import groupController from 'src/api/group';
import './index.less';
import 'src/components/pager/pager';

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

  setPager() {
    const _this = this;
    $('#divPager')
      .show()
      .Pager({
        pageIndex: _this.state.pageIndex,
        pageSize: _this.state.pageSize,
        count: _this.state.count,
        changePage: function (pIndex) {
          _this.setState(
            {
              pageIndex: pIndex,
              selectKeys: [],
            },
            () => {
              _this.getGroupsList();
            },
          );
        },
      });
  }

  getGroupsList() {
    console.log(this.props);
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
      this.setState(
        {
          count: res.groupUsers && res.groupUsers.length,
          list: res.groupUsers || [],
          loading: false,
        },
        () => {
          if (this.state.count > this.state.pageSize) {
            this.setPager();
          } else {
            $('#divPager').hide();
          }
        },
      );
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

  handleSet(id) {
    const reqData = {
      accountIds: [id] || this.state.selectKeys,
      groupId: this.props.groupId,
    };
    const _this = this;
    const options = {
      container: {
        content: _l('确认将所选择人员设置为管理员?'),
        yesText: _l('确认'),
        noText: _l('取消'),
        header: _l('设置管理员'),
        yesFn: () => {
          groupController.addAdmin(reqData).then(function (data) {
            if (data) {
              alert(_l('设置成功'));
              _this.getGroupsList();
            } else alert(_l('设置失败'), 2);
          });
        },
      },
      dialogBoxID: 'setDialogId',
      width: '480',
      height: '150',
    };
    ReactDom.render(<DialogLayer {...options} />, document.createElement('div'));
  }

  handleDelete(id, name) {
    const reqData = {
      accountId: id,
      groupId: this.props.groupId,
    };
    const _this = this;
    const options = {
      container: {
        content: _l('确认移除%0的管理员权限？', name),
        yesText: _l('确认'),
        noText: _l('取消'),
        header: _l('移除管理员'),
        yesFn: () => {
          groupController.removeAdmin(reqData).then(function (data) {
            if (data == 1) {
              alert(_l('移除%0的管理员权限成功', name));
              _this.getGroupsList();
            } else if (data == 2) {
              alert(_l('当前群组还有其他成员但只有你一个管理员，移出请先设置一位管理员'), 3);
            } else alert(_l('移除%0的管理员权限失败', name), 2);
          });
        },
      },
      dialogBoxID: 'removeDialogId',
      width: '480',
      height: '150',
    };
    ReactDom.render(<DialogLayer {...options} />, document.createElement('div'));
  }

  onSelectChange = selectKeys => {
    this.setState({ selectKeys });
  };

  render() {
    const { selectKeys, pageSize, count, list, loading } = this.state;
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
                <div className="ThemeColor3 mLeft30 Hand" onClick={this.handleSet.bind(this)}>
                  <span className="icon icon-sp_filter_none_white"></span>
                  <span>{_l('设置为管理员')}</span>
                </div>
              </Fragment>
            ) : (
              <Search allowClear placeholder={_l('搜索')} onSearch={value => this.handleInputChange(value)} />
            )}
          </div>
        </div>
        <div className="tableList Relative">
          <ConfigProvider renderEmpty={MemberEmpty}>
            <Spin indicator={<LoadDiv />} spinning={loading}>
              <Table
                rowSelection={rowSelection}
                rowKey={record => record.accountId}
                columns={this.columns}
                dataSource={list}
                pagination={false}
                scroll={{ y: count > pageSize ? 'calc(100vh - 330px)' : 'calc(100vh - 280px)' }}
              />
              <div id="divPager"></div>
            </Spin>
          </ConfigProvider>
        </div>
      </div>
    );
  }
}
