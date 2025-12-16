import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { ConfigProvider, Drawer, Table } from 'antd';
import cx from 'classnames';
import moment from 'moment';
import styled from 'styled-components';
import { Dropdown, Icon, LoadDiv } from 'ming-ui';
import DateRangePicker from 'ming-ui/components/NewDateTimePicker/date-time-range';
import Oauth2Ajax from 'src/pages/workflow/api/oauth2';
import LogDialog from 'src/pages/integration/apiIntegration/ConnectWrap/content/TokenLog/LogDialog';
import { TableWrap } from 'src/pages/integration/apiIntegration/style';

const Wrap = styled.div`
  background: #ffffff;
  padding: 30px 24px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  .moreBtn {
    height: 36px;
    line-height: 36px;
    border: 1px solid #e8e8e8;
    border-radius: 20px;
    padding: 0 48px;
    color: #1677ff;
  }
  .noData {
    text-align: center;
    padding-bottom: 140px;
    .iconCon {
      width: 130px;
      height: 130px;
      line-height: 130px;
      background: #f5f5f5 !important;
      color: #9e9e9e;
      border-radius: 50%;
      margin: 80px auto 0;
    }
  }
  .ant-table {
    tr {
      display: flex;
    }
    td,
    th {
      padding: 15px 8px !important;
      flex: 1;
      .fromTxt a {
        color: #151515 !important;
      }
      &:nth-child(1) {
        flex: 3;
      }
      &:nth-child(4),
      &:nth-child(3) {
        flex: 2;
      }
    }
    tr:hover {
      td,
      th {
        .fromTxt {
          color: #1677ff !important;
          a {
            color: #1677ff !important;
          }
        }
      }
    }
  }
  .logSearch {
    width: 155px;
    input {
      width: 100%;
    }
  }
  .pickUser {
    border-width: 1px;
    border-style: solid;
    border-color: #ddd;
    height: 36px;
    width: 100px;
    box-sizing: border-box;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 8px;
    .activeCon {
      width: 20px;
      height: 100%;
    }
    .add,
    .closeIcon {
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .add {
      z-index: 1;
      opacity: 1;
    }
    .closeIcon {
      z-index: 0;
      opacity: 0;
    }
    &:hover {
      border-color: #1677ff;
    }
    &.hs {
      &:hover {
        .add {
          z-index: 0;
          opacity: 0;
        }
        .closeIcon {
          z-index: 1;
          opacity: 1;
        }
      }
    }
  }
  .filterTimeRange {
    width: 300;
    height: 36px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 170px;
    padding: 5px 8px;
    border: 1px solid #ddd;
    border-radius: 3px;
    &:hover {
      border: 1px solid #1677ff;
    }
  }
  .dropSearchType,
  .statusDropdown {
    width: 94px;
  }
`;
export default function (props) {
  const { showRefreshLog, onClose } = props;
  const [{ list, id, show, loading, pageIndex, isAll, keyWord, type, status, time, user }, setState] = useSetState({
    list: [],
    id: '',
    show: false,
    loading: false,
    pageIndex: 1,
    isAll: false,
    keyWord: '', //
    type: '', //日志类型
    status: '', //状态
    time: ['', ''],
    user: {},
  });

  const getRefreshClientCredentialsLogs = () => {
    if (isAll || loading) {
      return;
    }
    setState({ loading: true });
    let obj = {};
    if (time[0]) {
      obj.startDate = time[0].format('YYYY/MM/DD HH:mm');
    }
    if (time[1]) {
      obj.endDate = time[1].format('YYYY/MM/DD HH:mm');
    }
    Oauth2Ajax.getRefreshClientCredentialsLogs(
      {
        id: props.processId,
        pageSize: 50,
        pageIndex,
        title: keyWord,
        status,
        ...obj,
        type, //日志类型
        // createBy: user.accountId,
      },
      { isIntegration: true },
    ).then(res => {
      setState({
        list: pageIndex === 1 ? res : list.concat(...res),
        loading: false,
        isAll: res.length < 50,
      });
    });
  };
  useEffect(() => {
    getRefreshClientCredentialsLogs();
  }, [pageIndex, keyWord, type, status, time, user]);

  const columns = [
    {
      title: _l('来源'),
      dataIndex: 'title',
      render: () => {
        return <div className="Bold WordBreak Gray_75">{_l('获取token')}</div>;
      },
    },
    {
      title: _l('状态'),
      dataIndex: 'status',
      render: (text, record) => {
        return (
          <span className={cx({ Red: record.completeType !== 1 })}>
            {record.completeType === 1 ? _l('完成') : _l('未完成')}
          </span>
        );
      },
    },
    {
      title: _l('时间'),
      dataIndex: 'createDate',
      render: (text, record) => {
        return <span className="Gray_9e">{record.createdDate}</span>;
      },
    },
    {
      title: _l('耗时'),
      dataIndex: 'take',
      render: (text, record) => {
        if (!record.completeDate) {
          return '';
        }
        return `${moment(record.completeDate).diff(moment(record.createdDate), 'milliseconds')} ms`;
      },
    },
    {
      title: _l('详情'),
      dataIndex: 'option',
      render: (text, record) => {
        return (
          <div className="optionCon">
            <span
              className="ThemeColor3 Hand"
              onClick={() => {
                setState({
                  id: record.id,
                  show: true,
                });
              }}
            >
              {_l('查看详情')}
            </span>
          </div>
        );
      },
    },
  ];
  const noDataRender = () => {
    return (
      <div className="noData TxtCenter">
        <span className="iconCon InlineBlock TxtCenter ">
          <Icon icon="manage" className="icon InlineBlock Font64 TxtMiddle" />
        </span>
        <p className="Gray_9e mTop20 mBottom0">{_l('暂无相关日志记录')}</p>
      </div>
    );
  };
  const renderCon = () => {
    if (loading && pageIndex === 1) {
      return <LoadDiv />;
    }
    if (list.length <= 0) {
      return noDataRender();
    } else {
      return (
        <TableWrap className="mTop20">
          <ConfigProvider>
            <Table
              rowKey={record => record.groupId}
              columns={columns}
              dataSource={list}
              pagination={false}
              showSorterTooltip={false}
              size="small"
            />
            {loading ? (
              <LoadDiv />
            ) : (
              !isAll && (
                <div className="TxtCenter">
                  <span
                    className="moreBtn InlineBlock mTop45 Hand"
                    onClick={() => {
                      setState({ pageIndex: pageIndex + 1 });
                    }}
                  >
                    {_l('查看更多')}
                  </span>
                </div>
              )
            )}
          </ConfigProvider>
        </TableWrap>
      );
    }
  };

  const formatTime = time => time.map(item => item && moment(item).format('YYYY/MM/DD HH:mm'));

  const renderTimePlaceholder = () => {
    const [startTime, endTime] = formatTime(time);
    if (!startTime && !endTime) return <span className="placeholder">{_l('筛选时间范围')}</span>;
    return `${startTime} ~ ${endTime}`;
  };

  return (
    <Drawer
      onClose={onClose}
      visible={showRefreshLog}
      placement="right"
      className="asdasd"
      closable={false}
      mask={false}
      bodyStyle={{ padding: 0 }}
      width={800}
      title={
        <div className="flexRow">
          <span className="flex">{_l('查看日志')}</span>
          <Icon icon="close" className=" Font20 Gray_9e Hand" onClick={onClose} />
        </div>
      }
    >
      <Wrap className="213 h100">
        <div className="flexRow mTop12">
          <Dropdown
            value={status}
            className="statusDropdown mLeft10 Width200"
            onChange={value => {
              if (status !== value) {
                setState({
                  status: value,
                  pageIndex: 1,
                  isAll: false,
                });
              }
            }}
            border
            isAppendToBody
            data={[
              {
                text: _l('全部状态'),
                value: '',
              },
              {
                text: _l('完成'),
                value: 1,
              },
              {
                text: _l('失败'),
                value: 0,
              },
            ]}
          />
          <DateRangePicker
            mode="datetime"
            timeMode="minute"
            placeholder={_l('筛选时间范围')}
            min={moment().add(-6, 'M')}
            selectedValue={time}
            children={
              <div className="filterTimeRange mLeft10">
                <div className="timeContent">{renderTimePlaceholder()}</div>
                <Icon icon="bellSchedule" className="Gray_9e Font18" />
              </div>
            }
            onOk={time => setState({ time, pageIndex: 1, isAll: false })}
            onClear={() => setState({ time: ['', ''], pageIndex: 1, isAll: false })}
          />
        </div>
        {renderCon()}
        {show && <LogDialog logInfo={list.find(o => o.id === id) || {}} onCancel={() => setState({ show: false })} />}
      </Wrap>
    </Drawer>
  );
}
