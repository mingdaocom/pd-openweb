import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv, Icon, Dropdown } from 'ming-ui';
import { useSetState } from 'react-use';
import { TableWrap } from 'src/pages/integration/apiIntegration/style';
import { Table, ConfigProvider } from 'antd';
import LogDialog from './LogDialog.jsx';
import oauth2Ajax from 'src/pages/workflow/api/oauth2';
import moment from 'moment';
import DateRangePicker from 'ming-ui/components/NewDateTimePicker/date-time-range';

const Wrap = styled.div`
  width: 800px;
  height: 100%;
  position: fixed;
  z-index: 100;
  right: 0;
  top: 0;
  bottom: 0;
  box-shadow: 0 8px 36px rgb(0 0 0 / 24%);
  background: #ffffff;
  padding: 0 0 30px 24px;
  margin: 0 auto;
  .moreBtn {
    height: 36px;
    line-height: 36px;
    border: 1px solid #e8e8e8;
    border-radius: 20px;
    padding: 0 48px;
    color: #2196f3;
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
      &:nth-child(4) {
        flex: 2;
      }
    }
    tr:hover {
      td,
      th {
        .fromTxt {
          color: #2196f3 !important;
          a {
            color: #2196f3 !important;
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
      border-color: #2196f3;
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
    width: 300px;
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
      border: 1px solid #2196f3;
    }
  }
  .dropSearchType,
  .statusDropdown {
    width: 94px;
  }
  .logListCon {
    overflow-y: auto;
  }
`;
export default function Log(props) {
  const { logId } = props;
  const [{ list, id, show, loading, pageIndex, isAll, keyWord, type, status, time, user, logInfo }, setState] =
    useSetState({
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
      logInfo: null,
    });

  const getHistoryListInfo = () => {
    if (isAll || loading) {
      return;
    }
    setState({ loading: true });
    let obj = {};
    if (!!time[0]) {
      obj.startDate = time[0].format('YYYY-MM-DD HH:mm:ss');
    }
    if (!!time[1]) {
      obj.endDate = time[1].format('YYYY-MM-DD HH:mm:ss');
    }
    if (!!status) {
      obj.status = status;
    }
    oauth2Ajax
      .getRefreshTokenLogs(
        {
          ...obj,
          id: logId,
          pageSize: 50,
          pageIndex,
          keyword: keyWord,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({
          list: pageIndex === 1 ? res : list.concat(...res),
          loading: false,
          isAll: res.length < 50,
        });
      });
  };
  useEffect(() => {
    getHistoryListInfo();
  }, [pageIndex, keyWord, type, status, time, user]);

  const columns = [
    {
      title: _l('节点'),
      dataIndex: 'title',
      render: (text, record) => {
        // 来源有工作表和工作流，需要同时显示应用名称。显示为链接 ，点击可以跳转到对应的工作表和工作流；
        return (
          <div className="Bold WordBreak fromTxt">
            <span className="Gray_bd Font13">{_l('获取token')}</span>
          </div>
        );
      },
    },
    {
      title: _l('状态'),
      dataIndex: 'completeType',
      render: (text, record) => {
        return (
          <span className={cx({ Red: record.completeType === 0 })}>
            {record.completeType === 1 ? _l('完成') : _l('未完成')}
          </span>
        );
      },
    },
    {
      title: _l('时间'),
      dataIndex: 'createdDate',
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
        return `${moment(record.completeDate).diff(moment(record.createdDate), 'seconds')} 秒`;
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
                  logInfo: record,
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
        <p className="Gray_9e mTop20 mBottom0">{_l('暂无 API 请求记录')}</p>
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
        <TableWrap className="mTop20 flex">
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

  const formatTime = time => time.map(item => item && moment(item).format('YYYY-MM-DD HH:mm:ss'));

  const renderTimePlaceholder = () => {
    const [startTime, endTime] = formatTime(time);
    if (!startTime && !endTime) return <span className="placeholder">{_l('筛选时间范围')}</span>;
    return `${startTime} ~ ${endTime}`;
  };

  return (
    <Wrap className="flexColumn">
      <div className="flexRow mTop20 pRight24">
        <div className="Font16 Gray flex Bold">{_l('查看日志')}</div>
        <i
          className={'icon-close Font24 TxtMiddle Hand LineHeight35'}
          onClick={() => props.onCancel && props.onCancel()}
        />
      </div>
      <div className="flex logListCon pRight24">
        <div className="flexRow mTop12">
          <Dropdown
            value={status}
            className="dropSearchType mLeft10"
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
                text: _l('全部'),
                value: '',
              },
              {
                text: _l('完成'),
                value: '1',
              },
              {
                text: _l('未完成'),
                value: '0',
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
      </div>
      {show && (
        <LogDialog
          logInfo={logInfo}
          title={_l('查看日志详情')}
          onCancel={() => setState({ show: false, logInfo: null })}
        />
      )}
    </Wrap>
  );
}
