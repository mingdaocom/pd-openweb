import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import syncTaskApi from '../../../../api/syncTask';

const StatisticContent = styled.div`
  margin-top: 16px;

  .statisticPanel {
    display: flex;
    justify-content: space-between;

    .itemPanel,
    .firstItemPanel {
      display: flex;
      align-items: center;
      height: 88px;
      padding: 0 24px;
      background: #fafafa;
      border-radius: 4px;

      .titleText {
        color: #757575;
        font-weight: 600;
      }
      .dataText {
        color: #333;
        font-size: 28px;
        font-weight: 600;
        line-height: 32px;

        &.running {
          color: #01ca83;
        }
        &.error {
          color: #f44336;
        }
      }
    }

    .firstItemPanel {
      flex: 4;
      display: flex;
      align-items: center;
    }

    .flex3 {
      flex: 3;
    }
  }
`;

let ajaxPromise;
export default ({ projectId, flag }) => {
  const [statisticData, setStatisticData] = useState({});

  useEffect(() => {
    if (ajaxPromise) ajaxPromise.abort();
    ajaxPromise = syncTaskApi.getStatistics({ projectId: projectId });
    ajaxPromise.then(res => {
      if (res) {
        setStatisticData(res);
        ajaxPromise = null;
      }
    });
  }, [flag]);

  return (
    <StatisticContent>
      <div className="statisticPanel">
        <div className="firstItemPanel mRight16">
          <div className="flex">
            <div className="titleText">{_l('运行中')}</div>
            <div className="dataText running">{statisticData.running || 0}</div>
          </div>
          <div className="flex">
            <div className="titleText">{_l('已停止')}</div>
            <div className="dataText">{statisticData.stopped || 0}</div>
          </div>
          <div className="flex">
            <div className="titleText">{_l('同步错误')}</div>
            <div className="dataText error">{statisticData.error || 0}</div>
          </div>
        </div>
        <div className="itemPanel flex3 mRight16">
          <div>
            <div className="titleText">{_l('今日读取记录行数')}</div>
            <div className="dataText">{statisticData.toDayReadRecord || 0}</div>
          </div>
        </div>
        <div className="itemPanel flex3">
          <div>
            <div className="titleText">{_l('今日写入记录行数')}</div>
            <div className="dataText">{statisticData.toDayWriteRecord || 0}</div>
          </div>
        </div>
      </div>
    </StatisticContent>
  );
};
