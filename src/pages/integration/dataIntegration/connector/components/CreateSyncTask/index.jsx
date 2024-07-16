import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Radio } from 'ming-ui';
import _ from 'lodash';
import { DATABASE_TYPE, SYNC_TYPE } from '../../../constant';
import OnlySyncStep from '../OnlySyncStep';
import { v4 as uuidv4 } from 'uuid';
import taskFlowApi from 'src/pages/integration/api/taskFlow';
import { navigateTo } from 'src/router/navigateTo';
import onlySyncBg from 'staticfiles/images/onlySync.png';
import syncWithDealBg from 'staticfiles/images/syncWithDeal.png';

const SyncTaskWrapper = styled.div`
  display: flex;
  height: 100%;
  background-color: #fff;
  overflow: auto;
  .selectCreateType {
    margin: 0 auto;
    .titleText {
      font-size: 17px;
      font-weight: 600;
      margin-top: 32px;
    }
  }

  .selectItem {
    width: 100% !important;
    font-size: 13px;
    .ant-select-selector {
      min-height: 36px;
      padding: 2px 11px !important;
      border: 1px solid #ccc !important;
      border-radius: 3px !important;
      box-shadow: none !important;
    }
    &.ant-select-focused {
      .ant-select-selector {
        border-color: #1e88e5 !important;
      }
    }
    &.disabled {
      .ant-select-selector {
        border: 0;
      }
    }
  }
  .tabNav {
    height: 32px;
    width: fit-content;
    border: 2px solid #f2f2f2;
    border-radius: 12px;
    padding: 0 16px;
    cursor: pointer;
    span {
      font-weight: 600;
      line-height: 28px;
    }
    &:hover {
      border-color: #2196f3;
    }
  }
  .titleItem {
    display: inline-flex;
    height: 24px;
    .iconWrapper {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 24px;
      margin-right: 8px;
      border-radius: 6px;
      background: #ecf4f9;
      .svg-icon {
        width: 16px;
        height: 16px;
      }
    }
    span {
      font-size: 14px;
      font-weight: 600;
      line-height: 24px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const CardWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 800px;
  height: 200px;
  background: #fff;
  border: 2px solid #f2f2f2;
  border-radius: 12px;
  padding: 32px;
  margin-top: 16px;
  cursor: pointer;

  .Radio-text {
    font-size: 17px;
    font-weight: 500;
  }
  &:hover {
    border-color: #2196f3;
  }
`;

export default function CreateSyncTask(props) {
  const { currentProjectId, source, dest } = props;
  const [syncType, setSyncType] = useState(SYNC_TYPE.NO_SELECT);

  const onInitTaskFlow = () => {
    const extraConfig =
      source.type === DATABASE_TYPE.KAFKA
        ? {
            dbName: _.get(source, ['formData', 'extraParams', 'topic']),
            tableName: _.get(source, ['formData', 'extraParams', 'topic']),
          }
        : {};
    const data = {
      projectId: currentProjectId,
      owner: md.global.Account.accountId,
      sourceNode: {
        nodeId: uuidv4(),
        name: _l('源表节点'),
        nodeType: 'SOURCE_TABLE',
        config: {
          datasourceId: source.id,
          appId: source.type === DATABASE_TYPE.APPLICATION_WORKSHEET ? source.id : undefined,
          dsType: source.type,
          className: source.className,
          iconBgColor: source.iconBgColor,
          ...extraConfig,
        },
      },
      destNode: {
        nodeId: uuidv4(),
        name: _l('目的地节点'),
        nodeType: 'DEST_TABLE',
        config: {
          dataDestId: dest.id,
          appId: dest.type === DATABASE_TYPE.APPLICATION_WORKSHEET ? dest.id : undefined,
          dsType: dest.type,
          className: dest.className,
          iconBgColor: dest.iconBgColor,
        },
      },
    };
    taskFlowApi.initEmpty(data).then(res => {
      if (res.id) {
        navigateTo(`/integration/taskCon/${res.id}`);
      }
    });
  };

  return (
    <SyncTaskWrapper>
      {syncType === SYNC_TYPE.NO_SELECT && (
        <div className="selectCreateType">
          <p className="titleText">{_l('选择创建方式')}</p>
          <CardWrapper onClick={() => setSyncType(SYNC_TYPE.ONLY_SYNC)}>
            <div>
              <Radio text={_l('仅同步数据')} checked={syncType === 'onlySync'} />
              <div className="Gray_9e mTop8 mLeft30">
                {_l('批量创建同步任务，(后续可在任务列表中添加数据处理步骤）')}
              </div>
            </div>
            <img src={onlySyncBg} width={330} />
          </CardWrapper>
          <CardWrapper onClick={() => onInitTaskFlow()}>
            <div>
              <Radio text={_l('同步时需要对数据进行处理')} checked={syncType === SYNC_TYPE.SYNC_WITH_DEAL} />
              <div className="Gray_9e mTop8 mLeft30">{_l('创建单个同步任务，并立即对其添加数据处理步骤')}</div>
            </div>
            <img src={syncWithDealBg} width={330} />
          </CardWrapper>
        </div>
      )}
      {syncType === SYNC_TYPE.ONLY_SYNC && <OnlySyncStep {...props} onClose={() => setSyncType(SYNC_TYPE.NO_SELECT)} />}
      {/* {syncType === SYNC_TYPE.SYNC_WITH_DEAL && (
        <SyncWithDeal {...props} onClose={() => setSyncType(SYNC_TYPE.NO_SELECT)} />
      )} */}
    </SyncTaskWrapper>
  );
}
