import React, { Component } from 'react';
import { Table, Spin, ConfigProvider } from 'antd';
import { LoadDiv, Icon } from 'ming-ui';
import workSiteController from 'src/api/workSite';
import CreateOrEditDialog from '../modules/CreateOrEditDialog';
import MergeDialog from '../modules/MergeDialog';
import EditMemberDialog from '../modules/EditMemberDialog';
import Config from '../../config';
import Empty from 'src/pages/Admin/common/TableEmpty';
import './index.less';

export default class WorkPlace extends Component {
  constructor() {
    super();
    this.state = {
      keywords: '',
      data: [],
      selectedRowKeys: [],
      siteVisible: false,
      mergeVisible: false,
      memberVisible: false,
      workSiteName: '',
      workSiteId: '',
      pageIndex: 1,
      pageSize: 50,
    };
    this.columns = [
      {
        title: _l('名称'),
        dataIndex: 'workSiteName',
      },
      {
        title: _l('成员数'),
        dataIndex: 'userCount',
      },
      {
        title: _l('操作'),
        dataIndex: 'workSiteId',
        key: 'workSiteId',
        render: (text, record) => {
          return (
            <div className="ThemeColor3">
              <button
                type="button"
                className="ming Button Button--link ThemeColor3 adminHoverColor"
                onClick={this.showSiteDialog.bind(this, record)}
              >
                {_l('编辑')}
              </button>
              <button
                type="button"
                className="ming Button Button--link ThemeColor3 mLeft24 mRight24 adminHoverColor"
                onClick={this.showMemberDialog.bind(this, record)}
              >
                {_l('添加成员')}
              </button>
              <button
                type="button"
                className="ming Button Button--link ThemeColor3 adminHoverColor"
                onClick={this.deleteSite.bind(this, record.workSiteId)}
              >
                {_l('删除')}
              </button>
            </div>
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    let { pageIndex, pageSize } = this.state;
    this.setState({ loading: true });
    const reqData = {
      projectId: Config.projectId,
      keywords: this.state.keywords,
      pageIndex,
      pageSize,
    };
    workSiteController.getWorkSites(reqData).then(data => {
      if (data) {
        this.setState({
          data: data.list,
          loading: false,
          allCount: data.allCount,
        });
      } else {
        alert(_l('加载失败'), 3);
      }
    });
  }

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  showSiteDialog({ workSiteName, workSiteId }) {
    this.setState({
      siteVisible: true,
      workSiteName,
      workSiteId,
    });
  }

  showMergeDialog() {
    if (this.state.selectedRowKeys.length > 1) {
      this.setState({
        mergeVisible: true,
      });
    } else {
      alert(_l('请至少选择2个要合并的工作地点'), 3, 1000);
    }
  }

  closeMergeDialog(value) {
    this.setState(
      {
        mergeVisible: false,
        selectedRowKeys: value ? [] : this.state.selectedRowKeys,
      },
      () => {
        value && this.getData();
      },
    );
  }

  deleteSite(ids) {
    const reqData = {
      workSiteIds: $.isArray(ids) ? ids : [ids],
      projectId: Config.projectId,
    };
    if (reqData.workSiteIds.length > 0) {
      if (confirm(_l(`确认删除所选择的工作地点？`))) {
        workSiteController.deleteWorkSites(reqData).then(data => {
          if (data) {
            alert(_l('删除成功'));
            this.setState(
              {
                selectedRowKeys: [],
              },
              () => this.getData(),
            );
          } else alert(_l('删除失败'), 2);
        });
      }
    }
  }

  showMemberDialog(record) {
    this.setState({
      memberVisible: true,
      workSiteId: record.workSiteId,
      userCount: record.userCount,
    });
  }

  closeMenberDialog() {
    this.setState({
      memberVisible: false,
      workSiteId: '',
    });
  }

  updateValue(value) {
    this.setState({
      siteVisible: false,
      workSiteName: '',
      workSiteId: '',
    });
    if (value) {
      this.getData();
    }
  }

  handleKeyDown(e) {
    if (e.nativeEvent.keyCode === 13) {
      this.getData();
    }
  }

  handleChange(e) {
    this.setState({
      keywords: $.trim(e.target.value),
    });
  }

  handleClear() {
    this.setState(
      {
        keywords: '',
      },
      () => {
        this.getData();
      },
    );
  }

  render() {
    const {
      keywords,
      loading,
      selectedRowKeys,
      data,
      siteVisible,
      workSiteId,
      workSiteName,
      mergeVisible,
      memberVisible,
      userCount = 0,
      pageSize,
      pageIndex = 1,
      allCount = 0,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const detail = {
      icon: 'icon-map',
      desc: _l('无工作地点'),
    };
    const WorkPlaceEmpty = () => <Empty detail={detail} />;
    return (
      <div className="system-set-box">
        <div className="system-set-header">
          <Icon
            icon="backspace"
            className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
            onClick={() => this.props.setLevel(1)}
          ></Icon>
          <span className="Font17">{_l('工作地点')}</span>
        </div>
        <div className="system-set-content">
          <div className="itemMain userManageWorkSite">
            <CreateOrEditDialog
              visible={siteVisible}
              projectId={Config.projectId}
              workSiteId={workSiteId}
              workSiteName={workSiteName}
              updateValue={this.updateValue.bind(this)}
            />
            <MergeDialog
              visible={mergeVisible}
              selectedRowKeys={selectedRowKeys}
              options={data}
              workSiteId={selectedRowKeys}
              projectId={Config.projectId}
              closeMergeDialog={this.closeMergeDialog.bind(this)}
            />
            <EditMemberDialog
              visible={memberVisible}
              workSiteId={workSiteId}
              userCount={userCount}
              projectId={Config.projectId}
              closeMenberDialog={this.closeMenberDialog.bind(this)}
              getData={this.getData.bind(this)}
            />
            <div className="clearfix pBottom35 pTop25 pLeft25 pRight25">
              <div className="Left">
                {selectedRowKeys.length ? (
                  <div className="workSiteToolbox">
                    <span className="Font16">{_l(`已选择 %0 条`, selectedRowKeys.length)}</span>
                    <div
                      className="iconText ThemeColor3 mLeft32 adminHoverColor"
                      onClick={this.showMergeDialog.bind(this)}
                    >
                      <span className="icon icon-sp_filter_none_white"></span>
                      <span>{_l('合并')}</span>
                    </div>
                    <div
                      className="iconText mLeft24 adminHoverDeleteColor"
                      onClick={this.deleteSite.bind(this, selectedRowKeys)}
                    >
                      <span className="icon icon-delete2"></span>
                      <span>{_l('删除')}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    className="ming Button Button--primary Button--small itemCreate"
                    onClick={this.showSiteDialog.bind(this)}
                  >
                    {_l('新建')}
                  </button>
                )}
              </div>
              <div className="searchContainer Right Relative" ref={box => (this.box = box)}>
                <span
                  className="icon-search btnSearch ThemeColor9"
                  title={_l('搜索')}
                  onClick={this.handleKeyDown.bind(this)}
                />
                <input
                  value={keywords}
                  onKeyDown={this.handleKeyDown.bind(this)}
                  onChange={e => this.handleChange(e)}
                  type="text"
                  className="searchInput ThemeColor10"
                  placeholder={_l('搜索')}
                />
                {keywords && (
                  <span
                    className="Font14 icon-closeelement-bg-circle Gray_c Hand Absolute"
                    style={{
                      top: '8px',
                      right: '8px',
                    }}
                    onClick={() => this.handleClear()}
                  />
                )}
              </div>
            </div>
            <div className="dataView">
              <ConfigProvider renderEmpty={WorkPlaceEmpty}>
                <Spin indicator={<LoadDiv />} spinning={loading}>
                  <Table
                    rowSelection={rowSelection}
                    rowKey={record => record.workSiteId}
                    columns={this.columns}
                    dataSource={data}
                    pagination={
                      allCount > pageSize
                        ? {
                            position: ['bottomCenters'],
                            pageSize,
                            total: allCount,
                            current: pageIndex,
                            onChange: pageIndex => {
                              this.setState({ pageIndex }, () => {
                                this.getData();
                              });
                            },
                            itemRender: (current, type, originalElement) => {
                              if (type === 'prev') {
                                return <a className="page">{_l('上一页')}</a>;
                              }
                              if (type === 'next') {
                                return <a className="page">{_l('下一页')}</a>;
                              }
                              return originalElement;
                            },
                          }
                        : false
                    }
                    scroll={{ y: 'calc(100vh - 345px)' }}
                  />
                </Spin>
              </ConfigProvider>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
