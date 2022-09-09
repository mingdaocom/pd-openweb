import React, { Component, createRef } from 'react';
import { Select, Table, Tooltip, Pagination, Button } from 'antd';
import { Icon, LoadDiv, DatePicker } from 'ming-ui';
import Config from '../../config';
import { getActionLogs } from 'src/api/actionLog';
import { exportLoginLog } from 'src/api/download';
import 'dialogSelectUser';
import moment from 'moment';
import './index.less';

const seachdateList = [
  { value: 0, label: _l('今天') },
  { value: 1, label: _l('昨天') },
  { value: 2, label: _l('本周') },
  { value: 3, label: _l('上周') },
  { value: 4, label: _l('本月') },
  { value: 5, label: _l('上月') },
  { value: 6, label: _l('最近7天') },
  { value: 7, label: _l('最近30天') },
  { value: 8, label: _l('半年') },
];

const columns = [
  {
    title: _l('登录用户'),
    dataIndex: 'accountId',
    render: (text, record) => {
      let { log = {} } = record;
      return (
        <div>
          {log.avatar && <img className="loginerIcon" src={log.avatar} />}
          {log.fullname || ''}
        </div>
      );
    },
  },
  {
    title: _l('登录方式'),
    dataIndex: 'loginVenue',
    render: (text, record) => {
      let { log = {} } = record;
      return <div>{log.title || ''}</div>;
    },
  },
  {
    title: _l('登录时间'),
    dataIndex: 'date',
  },
  {
    title: _l('登录地'),
    dataIndex: 'geoCity',
    render: (t, record) => {
      let { log = {} } = record;
      return <div>{log.geoCity || ''}</div>;
    },
  },
  {
    title: _l('IP'),
    dataIndex: 'ip',
    render: (text, record) => {
      let { log = {} } = record;
      return <div>{log.ip || ''}</div>;
    },
  },
];

export default class LoginLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchDateStr: undefined,
      logListData: [],
      pageIndex: 1, // 页码
      pageSize: 50, // 条数
      count: 0, // 数据总数
      startDate: undefined,
      endDate: undefined,
      loginerInfo: [],
    };
  }
  $ref = React.createRef();
  componentDidMount() {
    this.getLoglist();
  }
  changeFileds = item => {
    let startDate = moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate = moment().format('YYYY-MM-DD');
    switch (item.value) {
      case 0:
        startDate = moment().format('YYYY-MM-DD');
        break;
      case 1:
        startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        break;
      case 2:
        startDate = moment().startOf('week').format('YYYY-MM-DD');
        break;
      case 3:
        startDate = moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
        endDate = moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
        break;
      case 4:
        startDate = moment().startOf('months').format('YYYY-MM-DD');
        break;
      case 5:
        startDate = moment().subtract(1, 'months').startOf('months').format('YYYY-MM-DD');
        endDate = moment().subtract(1, 'months').endOf('months').format('YYYY-MM-DD');
        break;
      case 6:
        startDate = moment().subtract(1, 'week').format('YYYY-MM-DD');
        break;
      case 7:
        startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        break;
      case 8:
        startDate = moment().subtract(6, 'months').format('YYYY-MM-DD');
        break;
    }
    this.setState(
      {
        searchDateStr: item.label,
        startDate,
        endDate,
        pageIndex: 1,
      },
      () => {
        this.getLoglist();
      },
    );
  };
  // 导出
  exportListData = () => {
    let { startDate, endDate, loginerInfo } = this.state;
    let params = {
      projectId: Config.projectId,
      startDate: startDate ? startDate : moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate: endDate ? endDate : moment().format('YYYY-MM-DD'),
      logType: 1, // ogin=1 logout=2
    };
    let accountId = loginerInfo.map(item => item.accountId).join(' ');
    if (accountId) {
      params.accountId = accountId;
    }
    exportLoginLog(params);
  };
  // 筛选登录人
  handleLoginUser = () => {
    $({}).dialogSelectUser({
      title: _l('添加人员'),
      showMoreInvite: false,
      SelectUserSettings: {
        projectId: Config.projectId,
        dataRange: 2,
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        unique: true,
        callback: data => {
          this.setState({ loginerInfo: data, pageIndex: 1 }, () => {
            this.getLoglist();
          });
        },
      },
    });
  };
  getLoglist = () => {
    this.setState({ loading: true });
    let { startDate, endDate, loginerInfo } = this.state;
    let params = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      projectId: Config.projectId,
      startDate: startDate ? startDate : moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate: endDate ? endDate : moment().format('YYYY-MM-DD'),
      logType: 1, // ogin=1 logout=2
    };
    let accountId = loginerInfo.map(item => item.accountId).join(' ');
    if (accountId) {
      params.accountId = accountId;
    }
    getActionLogs(params).then(res => {
      this.setState({
        logListData: _.get(res, ['data', 'list']) || [],
        count: _.get(res, ['data', 'totalCount']) || 0,
        loading: false,
      });
    });
  };

  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a className="page">{_l('上一页')}</a>;
    }
    if (type === 'next') {
      return <a className="page">{_l('下一页')}</a>;
    }
    return originalElement;
  }

  // 分页
  changPage = page => {
    this.setState({ pageIndex: page }, () => {
      this.getLoglist();
    });
  };

  render() {
    let { logListData, loading = false, openDateSelect, searchDateStr, loginerInfo, count } = this.state;
    let that = this;
    return (
      <div className="loginLogContainer">
        <div className="top">
          <div className="searchInfo">
            <div className="seachSelectBox mRight10">
              <Select
                className="w240 searchSelect"
                value={loginerInfo.map(item => item.fullname).join(',') || undefined}
                placeholder={_l('登录用户')}
                dropdownRender={null}
                allowClear
                open={false}
                onFocus={this.handleLoginUser}
                suffixIcon={<Icon icon="person" className="Font16" />}
                onChange={() => {
                  this.setState(
                    {
                      loginerInfo: [],
                      pageIndex: 1,
                    },
                    () => {
                      this.getLoglist();
                    },
                  );
                }}
              />
            </div>
            <div className="seachSelectBox">
              <Select
                suffixIcon={<Icon icon="sidebar_calendar" className="Font16" />}
                dropdownClassName="serchDate"
                dropdownStyle={!openDateSelect ? { display: 'none' } : {}}
                className="w240 searchSelect"
                placeholder={_l('登录时间')}
                onChange={value => {
                  this.setState(
                    {
                      searchDateStr: undefined,
                      startDate: undefined,
                      endDate: undefined,
                      pageIndex: 1,
                    },
                    () => {
                      this.getLoglist();
                    },
                  );
                }}
                value={searchDateStr}
                allowClear
                onDropdownVisibleChange={open => {
                  if (open) {
                    that.setState({ openDateSelect: true });
                  }
                }}
                dropdownRender={() => (
                  <div ref={this.$ref} className="listContainer">
                    {(seachdateList || []).map(item => (
                      <div
                        className="listItem"
                        key={item.value}
                        value={item.value}
                        onClick={() => {
                          this.changeFileds(item);
                          that.setState({ openDateSelect: false });
                        }}
                      >
                        {item.label}
                      </div>
                    ))}
                    <DatePicker.RangePicker
                      popupParentNode={() => this.$ref.current}
                      offset={{ left: 240 }}
                      min={moment().subtract(6, 'months')}
                      onOk={date => {
                        that.setState(
                          {
                            openDateSelect: false,
                            searchDateStr:
                              date && date.length
                                ? `${date[0].format('YYYY-MM-DD')}~${date[1].format('YYYY-MM-DD')} `
                                : undefined,
                            startDate: (date && date[0] && date[0].format('YYYY-MM-DD')) || undefined,
                            endDate: (date && date[1] && date[1].format('YYYY-MM-DD')) || undefined,
                            pageIndex: 1,
                          },
                          () => {
                            this.getLoglist();
                          },
                        );
                      }}
                      onClear={() => {
                        that.setState({
                          openDateSelect: false,
                          searchDateStr: undefined,
                          startDate: undefined,
                          endDate: undefined,
                        });
                      }}
                      onSelect={() => {}}
                    >
                      <div className="listItem">{_l('自定义日期')}</div>
                    </DatePicker.RangePicker>
                  </div>
                )}
              ></Select>
            </div>
          </div>
          <div className="optInfo">
            <span className="tipInfo">
              {_l('保留最近6个月的登录日志')}
              <Tooltip
                title={_l('导出上限10万条，超出限制可以先筛选，再分次导出。')}
                placement="bottom"
              >
                <Icon icon="info" className="Font14 mLeft5 infoIcon" />
              </Tooltip>
            </span>
            <Button type="primary" className="export" onClick={this.exportListData}>
              {_l('导出')}
            </Button>
          </div>
        </div>
        <div className="logList">
          {loading ? (
            <LoadDiv />
          ) : (
            <Table
              columns={columns}
              dataSource={logListData}
              pagination={false}
              scroll={{ y: this.state.count > this.state.pageSize ? 'calc(100vh - 310px)' : 'calc(100vh - 280px)' }}
            />
          )}
          {_.isEmpty(logListData) && !loading && (
            <div className="flexColumn emptyBox">
              <div className="emptyIcon">
                <Icon icon="verify" className="Font40" />
              </div>
              {_l('无数据')}
            </div>
          )}
        </div>
        {count > this.state.pageSize && !loading && (
          <div className="pagination">
            <Pagination
              total={count}
              pageSize={this.state.pageSize}
              itemRender={this.itemRender}
              onChange={this.changPage}
              current={this.state.pageIndex}
            />
          </div>
        )}
      </div>
    );
  }
}
