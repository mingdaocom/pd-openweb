import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv, Icon } from 'ming-ui';
import { useSetState } from 'react-use';
import { TableWrap } from 'src/pages/integration/apiIntegration/style';
import { Table, ConfigProvider } from 'antd';
import LogDialog from '../../components/LogDialog';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import moment from 'moment';
import { FLOW_STATUS } from 'src/pages/workflow/WorkflowSettings/History/config.js';
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
`;
export default function Log(props) {
  const [{ list, id, show, loading, pageIndex, isAll }, setState] = useSetState({
    list: [],
    id: '',
    show: false,
    loading: false,
    pageIndex: 1,
    isAll: false,
  });

  const getHistoryListInfo = () => {
    if (isAll || loading) {
      return;
    }
    setState({ loading: true });
    packageVersionAjax.getHistoryList(
      {
        processId: props.processId,
        pageSize: 50,
        pageIndex,
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
    getHistoryListInfo();
  }, [pageIndex]);

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
            props.isSuperAdmin ||
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
  return (
    <Wrap className="">
      <p className="Gray_9e">{_l('查看所有引用此 API 发送的请求日志')}</p>
      {renderCon()}
      {show && <LogDialog info={list.find(o => o.id === id)} onCancel={() => setState({ show: false })} />}
    </Wrap>
  );
}
