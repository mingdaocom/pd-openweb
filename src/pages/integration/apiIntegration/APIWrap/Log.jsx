import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv, Icon, Dropdown } from 'ming-ui';
import { useSetState } from 'react-use';
import { TableWrap } from 'src/pages/integration/apiIntegration/style';
import { Table, ConfigProvider } from 'antd';
import LogDialog from '../../components/LogDialog';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import moment from 'moment';
import { FLOW_STATUS } from 'src/pages/workflow/WorkflowSettings/History/config.js';
import Search from 'src/pages/workflow/components/Search/index.jsx';
import DateRangePicker from 'ming-ui/components/NewDateTimePicker/date-time-range';
import { dialogSelectUser } from 'ming-ui/functions';

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
        color: #333 !important;
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
    width: 262px;
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
`;
export default function Log(props) {
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

  const getHistoryListInfo = () => {
    if (isAll || loading) {
      return;
    }
    setState({ loading: true });
    let obj = {};
    if (!!time[0]) {
      obj.startDate = time[0].format('YYYY/MM/DD HH:mm');
    }
    if (!!time[1]) {
      obj.endDate = time[1].format('YYYY/MM/DD HH:mm');
    }
    if (!!status) {
      obj.status = status;
    }
    packageVersionAjax
      .getHistoryList(
        {
          processId: props.processId,
          pageSize: 50,
          pageIndex,
          title: keyWord,
          ...obj,
          type, //日志类型
          createBy: user.accountId,
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

  const selectUsers = evt => {
    evt.stopPropagation();
    dialogSelectUser({
      title: _l('选择人员'),
      showMoreInvite: false,
      SelectUserSettings: {
        selectedAccountIds: !user.accountId ? [] : [user.accountId],
        projectId: localStorage.getItem('currentProjectId'),
        dataRange: 2,
        unique: true,
        callback: users => {
          setState({ user: users[0], pageIndex: 1, isAll: false });
        },
      },
    });
  };
  const columns = [
    {
      title: _l('来源'),
      dataIndex: 'title',
      render: (text, record) => {
        // 来源有工作表和工作流，需要同时显示应用名称。显示为链接 ，点击可以跳转到对应的工作表和工作流；
        return (
          <div className="Bold WordBreak fromTxt">
            <a target="_blank" className="" href={`/app/${record.apkId}`}>
              {record.apkName}
            </a>
            {record.primaryName && record.apkName && `-`}
            <a
              target="_blank"
              className=""
              href={`/${record.type === 1 ? 'worksheet' : 'workflowedit'}/${record.primaryId}`}
            >
              {record.primaryName}
            </a>
            <br />
            <span className="Gray_bd Font13">{record.type === 1 ? _l('工作表') : _l('工作流')}</span>
          </div>
        );
      },
    },
    {
      title: _l('状态'),
      dataIndex: 'status',
      render: (text, record) => {
        return <span className={cx({ Red: record.status === 4 })}>{FLOW_STATUS[record.status].text}</span>;
      },
    },
    {
      title: _l('触发者'),
      dataIndex: 'user',
      width: 10,
      render: (text, record) => {
        return (record.createBy || {}).fullName;
      },
    },
    {
      title: _l('时间'),
      dataIndex: 'createDate',
      render: (text, record) => {
        return <span className="Gray_9e">{record.createDate}</span>;
      },
    },
    {
      title: _l('耗时'),
      dataIndex: 'take',
      render: (text, record) => {
        if (!record.completeDate) {
          return '';
        }
        return `${moment(record.completeDate).diff(moment(record.createDate), 'seconds')} 秒`;
      },
    },
    {
      title: _l('详情'),
      dataIndex: 'option',
      render: (text, record) => {
        // 非超级管理员和拥有者
        // 只能查看触发者是自己的日志详情
        if (
          !(
            props.hasManageAuth ||
            props.connectInfo.isOwner ||
            [record.createBy.accountId].includes(md.global.Account.accountId)
          )
        ) {
          return '';
        }
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
    <Wrap className="">
      <p className="Gray_9e">{_l('查看所有引用此 API 发送的请求日志')}</p>
      <div className="flexRow mTop12">
        <Search
          handleChange={keyWord => {
            setState({
              keyWord,
              pageIndex: 1,
              isAll: false,
            });
          }}
          className="logSearch"
          placeholder={_l('搜索来源名称')}
        />
        <Dropdown
          value={type}
          className="dropSearchType mLeft10"
          onChange={value => {
            if (type !== value) {
              setState({
                type: value,
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
              text: _l('工作表'),
              value: 1,
            },
            {
              text: _l('工作流'),
              value: 2,
            },
          ]}
        />
        <Dropdown
          value={status}
          className="statusDropdown mLeft10"
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
              value: '2',
            },
            {
              text: _l('失败'),
              value: '4',
            },
          ]}
        />
        <div className={cx('pickUser mLeft10 Hand flexRow alignItemsCenter', { hs: !!user.fullname })}>
          <div
            className="flex overflow_ellipsis"
            onClick={e => {
              selectUsers(e);
            }}
          >
            {user.fullname ? user.fullname : <span className="Gray_bd">{_l('触发者')}</span>}
          </div>
          <div className={cx('Relative activeCon')}>
            <Icon
              icon="person1"
              onClick={e => {
                selectUsers(e);
              }}
              className="Gray_bd Font18 ThemeHoverColor3 mLeft3 add Absolute"
            />
            <Icon
              icon="closeelement-bg-circle"
              className="Gray_bd Font18 ThemeHoverColor3 mLeft3 closeIcon Absolute"
              onClick={e => {
                setState({ user: {}, loading: false, isAll: false });
              }}
            />
          </div>
        </div>
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
      {show && <LogDialog info={list.find(o => o.id === id)} onCancel={() => setState({ show: false })} />}
    </Wrap>
  );
}
