import React, { Component, Fragment } from 'react';
import { ConfigProvider, Dropdown, Input, Select, Spin, Table } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { LoadDiv, VerifyPasswordConfirm } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import { dialogSelectDept } from 'ming-ui/functions';
import groupController from 'src/api/group';
import createGroup from 'src/pages/Group/createGroup';
import Empty from '../../common/TableEmpty';
import PaginationWrap from '../../components/PaginationWrap';
import Config from '../../config';
import './index.less';

const { Search } = Input;

const sortFieldTrans = {
  name: 0,
  isVerified: 8,
  status: 11,
  postCount: 2,
  groupMemberCount: 3,
  createTime: 0,
};

export default class GroupsList extends Component {
  constructor() {
    super();
    this.state = {
      count: 0,
      list: [],
      pageIndex: 1, //页码
      pageSize: 50, //条数
      selectKeys: [],
      keywords: '',
      status: undefined, //群组状态：open--1,close---0
      types: undefined, //群组类型：官方--1、普通--0
      sortField: 0, //排序的字段(名称：4，类型：8，状态：11，动态：2，成员：3，时间：0)
      sortType: 0, //升序1、降序0
      loading: false,
    };
    this.columns = [
      {
        title: _l('群组名称'),
        dataIndex: 'name',
        render: (text, record) => {
          return (
            <div className="nameBox">
              <img src={record.avatar} alt="avatar" />
              <a className="overflow_ellipsis" href={`/group/groupValidate?gID=${record.groupId}`} target="_blank">
                {text}
              </a>
            </div>
          );
        },
        width: 150,
        sorter: true,
      },
      {
        title: _l('类型'),
        dataIndex: 'isVerified',
        render: (text, record) => {
          return (
            <div className="typeBox">
              {text ? (
                <Tooltip placement="bottom" title={_l('关联部门：%0', record.mapDepartmentName)}>
                  <i className="TxtMiddle mRight5 icon-official-group Font10 color_y"></i>
                </Tooltip>
              ) : (
                <i className="TxtMiddle mRight5 icon-official-group Font10 transparentColor"></i>
              )}
              {text ? _l('官方') : _l('普通')}
            </div>
          );
        },
        sorter: true,
      },
      {
        title: _l('状态'),
        dataIndex: 'status',
        render: text => {
          return text ? (
            <span className="color_gr">{_l('正常')}</span>
          ) : (
            <span className="color_g">{_l('已关闭')}</span>
          );
        },
        sorter: true,
      },
      {
        title: _l('动态数'),
        dataIndex: 'postCount',
        sorter: true,
      },
      {
        title: _l('成员数'),
        dataIndex: 'groupMemberCount',
        sorter: true,
      },
      {
        title: _l('创建人'),
        dataIndex: 'createAccount',
        render: (text = {}) => {
          return (
            <div className="overflow_ellipsis" style={{ maxWidth: 150 }}>
              {text.fullname}
            </div>
          );
        },
      },
      {
        title: _l('创建时间'),
        dataIndex: 'createTime',
        render: text => {
          return <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>;
        },
        sorter: true,
      },
      {
        title: _l('操作'),
        dataIndex: 'option',
        width: 60,
        render: (text, record) => {
          const menu = (
            <div className="menuOption">
              {record.isVerified ? (
                <Fragment>
                  <div onClick={() => this.handleEditDept(record)}>{_l('修改关联部门')}</div>
                  <div onClick={() => this.hanldeDeleteDept(record)}>{_l('取消关联部门')}</div>
                </Fragment>
              ) : (
                <div onClick={() => this.handleSetDept(record)}>{_l('设置关联部门')}</div>
              )}
              <div onClick={() => this.props.setLevel('member', record.name, record.groupId)}>{_l('成员管理')}</div>
              <div
                onClick={() =>
                  record.status === 1 ? this.handleClose(record.groupId) : this.handleOpen(record.groupId)
                }
              >
                {record.status === 1 ? _l('关闭群组') : _l('开启群组')}
              </div>
              <div onClick={() => this.handleDissolve(record.groupId)}>{_l('解散群组')}</div>
            </div>
          );
          return (
            <Dropdown overlay={menu} trigger={['click']} placement="topLeft" autoAdjustOverflow>
              <span className="icon-moreop Font18 pointer Gray_9e"></span>
            </Dropdown>
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.getGroupsList();
  }

  changPage = page => {
    this.setState({ pageIndex: page, selectKeys: [] }, () => this.getGroupsList());
  };

  getGroupsList() {
    this.setState({ loading: true, selectKeys: [] });
    let reqData = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      keywords: _.trim(this.state.keywords),
      sortType: parseInt(this.state.sortType),
      sortFiled: parseInt(this.state.sortField),
      firstLetters: [],
      containHidden: true,
      withMapDepartment: true,
      projectId: Config.projectId,
    };
    if (!isNaN(this.state.status)) {
      reqData.status = this.state.status;
    }
    if (!isNaN(this.state.types)) {
      reqData.groupType = this.state.types;
    }
    groupController.getGroups(reqData).then(data => {
      this.setState({
        count: data.allCount,
        list: data.list,
        loading: false,
      });
    });
  }

  //排序
  handleChangeSort(pagination, filters, sorter) {
    const { field, order } = sorter;
    const sortType = order === 'ascend' ? 1 : 0;
    this.setState(
      {
        sortField: order ? sortFieldTrans[field] : 0,
        sortType,
      },
      () => {
        this.getGroupsList();
      },
    );
  }

  handleEditDept(record) {
    const _this = this;

    dialogSelectDept({
      projectId: Config.projectId,
      unique: true,
      selectFn: data => {
        _this.updateDeptMappingGroup(record.groupId, true, data && !_.isEmpty(data) ? data[0].departmentId : '');
      },
    });
  }

  hanldeDeleteDept(record) {
    Confirm({
      title: _l('关联部门'),
      description: _l('确认取消关联部门?'),
      onOk: () => {
        this.updateDeptMappingGroup(record.groupId, false, record.mapDepartmentId);
      },
    });
  }

  handleSetDept(record) {
    const _this = this;

    dialogSelectDept({
      projectId: Config.projectId,
      selectFn: function (data) {
        _this.updateDeptMappingGroup(record.groupId, true, data && !_.isEmpty(data) ? data[0].departmentId : '');
      },
    });
  }

  optionAlert = (title, type) => {
    alert({
      msg: title,
      type: type,
      key: 'updateGroupVerified',
    });
  };

  //更新关联部门
  updateDeptMappingGroup = (groupId, isVerified, departmentId) => {
    let reqData = {
      groupId: groupId,
      isVerified: isVerified,
      mapDepartmentId: departmentId,
    };

    if (!reqData.mapDepartmentId) {
      alert(_l('请选择关联部门'), 3);
      return;
    }

    this.optionAlert(_l('操作中，请稍候...'), 3);

    groupController.updateGroupVerified(reqData).then(data => {
      if (data) {
        this.optionAlert(_l('操作成功'));
        this.getGroupsList();
      } else {
        this.optionAlert(_l('操作失败'), 3);
      }
    });
  };

  handleOpen(id) {
    Confirm({
      title: _l('开启群组'),
      description: _l('确认开启所选择的群组?'),
      onOk: () => {
        groupController
          .openGroup({
            groupIds: id ? [id] : this.state.selectKeys,
          })
          .then(data => {
            if (data) {
              alert(_l('开启群组成功'));
              this.getGroupsList();
            } else {
              alert(_l('开启群组失败'), 2);
            }
          });
      },
    });
  }

  handleClose(id) {
    Confirm({
      title: _l('是否确认关闭群组？'),
      description: (
        <div>
          {_l('关闭群组后，群组将不能被访问')}
          <br />
          {_l('您可以在 组织管理-群组 中找到并重新开启这个群组')}
        </div>
      ),
      onOk: () => {
        VerifyPasswordConfirm.confirm({
          isRequired: true,
          onOk: () => {
            groupController
              .closeGroup({
                groupIds: id ? [id] : this.state.selectKeys,
              })
              .then(data => {
                if (data) {
                  alert(_l('关闭群组成功'));
                  this.getGroupsList();
                } else {
                  alert(_l('关闭群组失败'), 2);
                }
              });
          },
        });
      },
    });
  }

  handleDissolve(id) {
    Confirm({
      title: _l('是否确认解散？'),
      description: _l('群组解散后，将永久删除该群组。不可恢复'),
      onOk: () => {
        VerifyPasswordConfirm.confirm({
          isRequired: true,
          onOk: () => {
            groupController
              .removeGroup({
                groupIds: id ? [id] : this.state.selectKeys,
              })
              .then(data => {
                if (data) {
                  alert(_l('解散群组成功'));
                  this.getGroupsList();
                } else {
                  alert(_l('解散群组失败'), 2);
                }
              });
          },
        });
      },
    });
  }

  handleCreate() {
    const _this = this;
    createGroup({
      projectId: Config.projectId,
      callback: function () {
        _this.getGroupsList();
      },
    });
  }

  //下拉筛选
  handleSelectChange(value, key) {
    this.setState(
      {
        [key]: value,
        pageIndex: 1,
      },
      () => {
        this.getGroupsList();
      },
    );
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

  onSelectChange = selectKeys => {
    this.setState({ selectKeys });
  };

  render() {
    const { selectKeys, types, status, loading, list, count, pageSize, pageIndex } = this.state;
    const rowSelection = {
      selectedRowKeys: selectKeys,
      onChange: this.onSelectChange,
    };
    const detail = {
      icon: 'icon-myUpload',
      desc: _l('无群组'),
    };
    const GroupEmpty = () => <Empty detail={detail} />;
    return (
      <div className="groupsList">
        <div className="groupTool">
          <div className="groupItem">
            {selectKeys.length ? (
              <Fragment>
                <span className="Font16 color_b Bold LineHeight35">{_l(`已选择%0条`, selectKeys.length)}</span>
                <div className="mLeft32 Hand pTop3 itemIconBox" onClick={() => this.handleOpen()}>
                  <span className="icon Font14 icon-task-new-no-locked mRight5"></span>
                  <span className="LineHeight36">{_l('开启')}</span>
                </div>
                <div className="mLeft24 Hand pTop3 itemIconBox" onClick={() => this.handleClose()}>
                  <span className="icon Font14 icon-lock mRight5"></span>
                  <span className="LineHeight36">{_l('关闭')}</span>
                </div>
                <div className="mLeft24 Hand pTop3 itemIconBox" onClick={() => this.handleDissolve()}>
                  <span className="icon Font12 icon-workflow_cancel mRight5"></span>
                  <span className="LineHeight36">{_l('解散')}</span>
                </div>
              </Fragment>
            ) : (
              <button
                className="ming Button Button--primary Button--small itemCreate Bold"
                onClick={this.handleCreate.bind(this)}
              >
                {_l('新建群组')}
              </button>
            )}
          </div>
          <div className="groupItem">
            <Search allowClear placeholder={_l('搜索')} onSearch={value => this.handleInputChange(value)} />
            <Select
              allowClear
              className="mRight10 mLeft10"
              value={types}
              onChange={value => this.handleSelectChange(value, 'types')}
              placeholder={_l('全部类型')}
            >
              <Select.Option value={1}>{_l('官方群组')}</Select.Option>
              <Select.Option value={0}>{_l('普通群组')}</Select.Option>
            </Select>
            <Select
              allowClear
              value={status}
              onChange={value => this.handleSelectChange(value, 'status')}
              placeholder={_l('全部状态')}
            >
              <Select.Option value={1}>{_l('正常群组')}</Select.Option>
              <Select.Option value={0}>{_l('已关闭群组')}</Select.Option>
            </Select>
          </div>
        </div>
        <div className="tableList mdAntTable">
          <ConfigProvider renderEmpty={GroupEmpty}>
            <Spin indicator={<LoadDiv />} spinning={loading}>
              <Table
                rowSelection={rowSelection}
                rowKey={record => record.groupId}
                columns={this.columns}
                dataSource={list}
                pagination={false}
                showSorterTooltip={false}
                sortDirections={['descend', 'ascend']}
                onChange={this.handleChangeSort.bind(this)}
                scroll={count == 0 ? {} : { y: count > pageSize ? 'calc(100vh - 300px)' : 'calc(100vh - 260px)' }}
              />
              {count > pageSize && (
                <PaginationWrap total={count} pageIndex={pageIndex} pageSize={pageSize} onChange={this.changPage} />
              )}
            </Spin>
          </ConfigProvider>
        </div>
      </div>
    );
  }
}
