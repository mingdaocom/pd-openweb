import React, { Component, Fragment } from 'react';
import { Input, Table, Spin, ConfigProvider } from 'antd';
import { LoadDiv } from 'ming-ui'
import cx from 'classnames';
import './index.less';
import transferController from 'src/api/transfer';
import Config from '../config';
import DetailDialog from './DetailDialog';
import DialogLayer from 'src/components/mdDialog/dialog';
import ReactDom from 'react-dom';
import Empty from '../common/TableEmpty';
import PaginationWrap from '../components/PaginationWrap';

const { Search } = Input;

export default class OthersList extends Component {
  constructor() {
    super();
    this.state = {
      count: 0,
      list: [],
      pageIndex: 1, //页码
      pageSize: 20, //条数
      selectKeys: [],
      keywords: '',
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
              <span className="overflow_ellipsis">{text}</span>
            </div>
          );
        },
        width: 150,
      },
      {
        title: _l('组织'),
        dataIndex: 'companyName',
        render: text => {
          return <div className="overflow_ellipsis">{text}</div>;
        },
        width: 200,
      },
      {
        title: _l('群组'),
        dataIndex: 'groupCount',
        render: (text, record) => {
          return (
            <div
              className={cx(text ? 'adminHoverGreenColor' : 'color_b')}
              onClick={this.handleView.bind(this, text, 3, record.accountId)}>
              {text}
            </div>
          );
        },
      },
      {
        title: _l('任务'),
        dataIndex: 'taskCount',
        render: (text, record) => {
          return (
            <div
              className={cx(text ? 'adminHoverGreenColor' : 'color_b')}
              onClick={this.handleView.bind(this, text, 2, record.accountId)}>
              {text}
            </div>
          );
        },
      },
      {
        title: _l('项目'),
        dataIndex: 'folderCount',
        render: (text, record) => {
          return (
            <div
              className={cx(text ? 'adminHoverGreenColor' : 'color_b')}
              onClick={this.handleView.bind(this, text, 1, record.accountId)}>
              {text}
            </div>
          );
        },
      },
      {
        title: _l('共享文件'),
        dataIndex: 'kcCount',
        render: (text, record) => {
          return (
            <div
              className={cx(text ? 'adminHoverGreenColor' : 'color_b')}
              onClick={this.handleView.bind(this, text, 4, record.accountId)}>
              {text}
            </div>
          );
        },
      },
      {
        title: _l('操作'),
        dataIndex: 'option',
        render: (text, record) => {
          return (
            <div className="adminHoverDeleteColor" onClick={this.handleDelete.bind(this, record.accountId)}>
              {_l('移除')}
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
    this.setState({ pageIndex: page, selectKeys: [] }, () => this.getGroupsList());
  };

  getGroupsList() {
    this.setState({ loading: true });
    transferController
      .getRelationStatistics({
        pageIndex: this.state.pageIndex,
        pageSize: this.state.pageSize,
        projectId: Config.projectId,
        keyWords: this.state.keywords,
      })
      .then(res => {
        this.setState({
          list: res.list,
          count: res.allCount,
          loading: false,
        });
      });
  }

  //移除成员
  handleDelete(accountId) {
    const _this = this;
    const options = {
      container: {
        content: _l('您选择的成员可能有任务负责人/群组管理员，移除后相关负责人将替换为企业小秘书（企业小秘书作为暂时接管相关模块的负责人，后续成员可根据自己的需求随时进行替换）'),
        yesText: _l('确认'),
        noText: _l('取消'),
        header: _l('您确定要将成员从各个模块移除吗?'),
        yesFn: () => {
          transferController
            .exitAllRelation({
              projectId: Config.projectId,
              accountIds: [accountId] || _this.state.selectKeys,
            })
            .then(function(data) {
              if (data.length > 0) {
                _this.setState(
                  {
                    pageIndex: 1,
                    selectKeys: [],
                  },
                  () => {
                    _this.getGroupsList();
                  },
                );
              } else {
                alert(_l('移除成员失败'), 2);
              }
            });
        },
      },
      dialogBoxID: 'deleteOtherDialogId',
      width: '480',
      height: '150',
    };
    ReactDom.render(<DialogLayer {...options} />, document.createElement('div'));
  }

  handleView(text, type, accountId) {
    if (Number(text) <= 0) {
      return;
    }
    // type = Number(type);
    transferController
      .getRelationDetailByAid({
        projectId: Config.projectId,
        type,
        pageSize: 1000,
        accountId,
      })
      .then(data => {
        let typeName = _l('项目');
        let url = '';
        let urlDetail = '';
        switch (type) {
          case 1:
            typeName = _l('项目');
            url = '/apps/task/folder_';
            urlDetail = '#detail';
            break;
          case 2:
            typeName = _l('任务');
            url = '/apps/task/task_';
            break;
          case 3:
            typeName = _l('群组');
            url = '/group/groupValidate?gID=';
            break;
          default:
            typeName = _l('共享文件夹');
            url = '/apps/kc/';
        }
        const options = {
          container: {
            content: '',
            noText: null,
            yesText: null,
          },
          dialogBoxID: 'dialogGroupList',
          width: '480',
        };
        ReactDom.render(
          <DialogLayer {...options}>
            <DetailDialog data={data.list} typeName={typeName} url={url} urlDetail={urlDetail} />
          </DialogLayer>,
          document.createElement('div'),
        );
      });
  }

  onSelectChange = selectKeys => {
    this.setState({ selectKeys });
  };

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

  render() {
    const { selectKeys, count, pageSize, pageIndex, loading, list } = this.state;
    const rowSelection = {
      selectKeys,
      onChange: this.onSelectChange,
    };
    const detail = {
      icon: 'icon-myUpload',
      desc: _l('无外协人员')
    }
    const OtherEmpty = () => <Empty detail={detail} />
    return (
      <div className="groupsList">
        <div className="groupTool">
          <div className="groupItem">
            {selectKeys.length ? (
              <Fragment>
                <span className="Font16 color_b Bold">{_l(`已选择%0条`, selectKeys.length)}</span>
                <div className="ThemeColor3 mLeft30 Hand pTop3" onClick={this.handleDelete.bind(this)}>
                  <span className="icon icon-sp_filter_none_white"></span>
                  <span>{_l('移除')}</span>
                </div>
              </Fragment>
            ) : (
              <div className="color_b Font13">
                <div>{_l('Ta们被邀请加入各个模块与本组织协作')}</div>
                <div>{_l('但不是本组织成员称为“外协人员”')}</div>
              </div>
            )}
          </div>
          <div className="groupItem">
            <Search allowClear placeholder={_l('搜索姓名/职位/组织')} onSearch={value => this.handleInputChange(value)} />
          </div>
        </div>
        <div className="tableList Relative">
          <ConfigProvider renderEmpty={OtherEmpty}>
            <Spin indicator={<LoadDiv />} spinning={loading}>
              <Table
                rowSelection={rowSelection}
                rowKey={record => record.accountId}
                columns={this.columns}
                dataSource={list}
                pagination={false}
                scroll={{ y: count > pageSize ? 'calc(100vh - 330px)' : 'calc(100vh - 280px)' }}
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
