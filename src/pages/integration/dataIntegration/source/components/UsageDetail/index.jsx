import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import syncTaskApi from '../../../../api/syncTask';
import { formatDate } from '../../../../config';
import { TASK_STATUS_TYPE } from '../../../constant';

const UsageDetailWrapper = styled.div`
  background: var(--color-background-primary);
  min-height: 100%;
  padding: 40px 80px;
  .headTr,
  .dataItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 15px 0;
    border-bottom: 1px solid var(--color-border-secondary);

    .titleColumn {
      min-width: 124px;
    }
    .arrowIcon {
      transform: rotate(-90deg);
      margin-right: 8px;
      color: var(--color-border-primary);
      font-size: 20px;
    }
    .ant-switch-checked {
      background-color: rgba(40, 202, 131, 1);
    }
  }

  .optionIcon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--color-text-tertiary);
    background-color: var(--color-background-primary);

    &:hover {
      color: var(--color-primary);
      background-color: var(--color-background-hover);
    }
  }

  .taskStatus {
    flex: 1;

    .running {
      color: var(--color-success);
    }
    .error {
      color: var(--color-error);
    }
  }
  .taskName {
    flex: 3;
    width: 0;
  }
  .source,
  .dest,
  .createTime {
    flex: 2;
  }
  .creatorName {
    flex: 1;
  }
`;

const NoDataWrapper = styled.div`
  text-align: center !important;
  .iconCon {
    width: 130px;
    height: 130px;
    line-height: 130px;
    background: var(--color-background-secondary);
    border-radius: 50%;
    margin: 64px auto 0;
    color: var(--color-text-tertiary);
  }
`;

const TaskIcon = styled.div`
  display: inline-flex;
  position: relative;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 8px;
  font-size: 22px;
  background: var(--color-background-primary);
  box-shadow:
    rgba(0, 0, 0, 0.16) 0px 0px 1px,
    rgba(0, 0, 0, 0.06) 0px 1px 3px;

  .svg-icon {
    width: 24px;
    height: 24px;
  }
  .sourceNum {
    position: absolute;
    text-align: center;
    top: -5px;
    right: -5px;
    width: 19px;
    height: 19px;
    line-height: 17px;
    border: 1px solid var(--color-white);
    border-radius: 50%;
    background: var(--color-background-inverse);
    color: var(--color-white);
    font-size: 12px;
    font-weight: 600;
  }
`;

export default function UsageDetail({ projectId, sourceId }) {
  const [detailTaskList, setDetailTaskList] = useState([]);
  const [loadingState, setLoadingState] = useSetState({ loading: false, pageNo: 0, noMore: false });

  useEffect(() => {
    //获取数据源使用详情列表
    setLoadingState({ loading: true });

    syncTaskApi
      .datasourceUseDetails({
        projectId,
        datasourceId: sourceId,
        pageNo: loadingState.pageNo,
        pageSize: 20,
      })
      .then(res => {
        if (res) {
          setDetailTaskList(loadingState.pageNo === 0 ? res.content : detailTaskList.concat(res.content));
          setLoadingState({ loading: false, noMore: res.content.length < 10 });
        }
      });
  }, [loadingState.pageNo]);

  const onScrollEnd = () => {
    if (loadingState.loading || loadingState.noMore) return;
    setLoadingState({ loading: true, pageNo: loadingState.pageNo + 1 });
  };

  const columns = [
    {
      dataIndex: 'taskName',
      title: _l('任务'),
      render: item => {
        return (
          <div className="flexRow alignItemsCenter pRight8">
            <div className="flexRow alignItemsCenter pLeft8 titleColumn">
              <Tooltip title={item.sourceTypeName}>
                <TaskIcon>
                  <svg className="icon svg-icon" aria-hidden="true">
                    <use xlinkHref={`#icon${item.sourceClassName}`} />
                  </svg>
                  {item.sourceNum > 1 && <div className="sourceNum">{item.sourceNum}</div>}
                </TaskIcon>
              </Tooltip>
              <Icon icon="arrow_down" className="arrowIcon" />
              <Tooltip title={item.destTypeName}>
                <TaskIcon>
                  <svg className="icon svg-icon" aria-hidden="true">
                    <use xlinkHref={`#icon${item.destClassName}`} />
                  </svg>
                </TaskIcon>
              </Tooltip>
            </div>
            <span title={item.taskName} className="Font14 textPrimary overflow_ellipsis">
              {item.taskName}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'source',
      title: _l('作为源'),
      render: item => {
        return item.sourceTables.length > 0
          ? item.sourceTables.map((table, index) => {
              return (
                <p key={index} className="mBottom0">
                  {table}
                </p>
              );
            })
          : '-';
      },
    },
    {
      dataIndex: 'dest',
      title: _l('作为目的地'),
      render: item => {
        return item.destTables.length > 0
          ? item.destTables.map((table, index) => {
              return (
                <p key={index} className="mBottom0">
                  {table}
                </p>
              );
            })
          : '-';
      },
    },
    {
      dataIndex: 'taskStatus',
      title: _l('任务状态'),
      render: item => {
        switch (item.taskStatus) {
          case TASK_STATUS_TYPE.RUNNING:
            return <span className="running">{_l('运行中')}</span>;
          case TASK_STATUS_TYPE.STOP:
            return <span className="textTertiary">{_l('已停止')}</span>;
          case TASK_STATUS_TYPE.UN_PUBLIC:
            return <span className="textTertiary">{_l('未发布')}</span>;
          case TASK_STATUS_TYPE.ERROR:
            return <span className="error">{_l('错误')}</span>;
          default:
            return '';
        }
      },
    },
    {
      dataIndex: 'creatorName',
      title: _l('创建人'),
    },
    {
      dataIndex: 'createTime',
      title: _l('创建时间'),
      render: item => {
        return <span>{formatDate(item.createTime)}</span>;
      },
    },
  ];

  return (
    <ScrollView onScrollEnd={onScrollEnd}>
      <UsageDetailWrapper>
        <p className="Font17 textPrimary bold mBottom0">{_l('使用详情')}</p>

        <div className="headTr">
          {columns.map((item, index) => {
            return (
              <div key={index} className={`${item.dataIndex}`}>
                {item.renderTitle ? item.renderTitle() : item.title}
              </div>
            );
          })}
        </div>

        {loadingState.loading && loadingState.pageNo === 0 ? (
          <LoadDiv />
        ) : detailTaskList.length > 0 ? (
          detailTaskList.map((sourceItem, i) => {
            return (
              <div key={i} className="dataItem">
                {columns.map((item, j) => {
                  return (
                    <div key={`${i}-${j}`} className={`${item.dataIndex}`}>
                      {item.render ? item.render(sourceItem) : sourceItem[item.dataIndex]}
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <NoDataWrapper>
            <span className="iconCon InlineBlock TxtCenter ">
              <i className="icon-storage Font64 TxtMiddle" />
            </span>
            <p className="textTertiary mTop20 mBottom0">{_l('无同步任务使用此数据源')}</p>
          </NoDataWrapper>
        )}
      </UsageDetailWrapper>
    </ScrollView>
  );
}
