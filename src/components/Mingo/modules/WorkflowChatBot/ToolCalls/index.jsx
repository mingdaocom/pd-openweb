import React, { Fragment, useState } from 'react';
import JsonView from 'react-json-view';
import cx from 'classnames';
import { get } from 'lodash';
import styled from 'styled-components';
import { Button } from 'ming-ui';
import EmailCard from './EmailCard';
import NotificationCard from './NotificationCard';
import RecordCard from './RecordCard';

const TOOL_CALL_CARD_TYPES = {
  UPDATE_RECORD: 'update_record', // 更新记录
  CREATE_RECORD: 'create_record', // 创建记录
  API: 'wf_api_', // 集成 API
  PBP: 'wf_pbp_', // 封装业务流程
  SEND: 'wf_send_', // 发送站内通知
  EMAIL: 'wf_email_', // 发送邮件
};

const TOOL_CALL_CARD_CONFIG = {
  [TOOL_CALL_CARD_TYPES.UPDATE_RECORD]: {
    type: TOOL_CALL_CARD_TYPES.UPDATE_RECORD,
    name: '更新记录',
    icon: 'icon-workflow_update',
  },
  [TOOL_CALL_CARD_TYPES.CREATE_RECORD]: {
    type: TOOL_CALL_CARD_TYPES.CREATE_RECORD,
    name: '新增记录',
    icon: 'icon-playlist_add',
  },
  [TOOL_CALL_CARD_TYPES.API]: {
    type: TOOL_CALL_CARD_TYPES.API,
    name: '集成 API',
    icon: 'icon-api',
  },
  [TOOL_CALL_CARD_TYPES.PBP]: {
    type: TOOL_CALL_CARD_TYPES.PBP,
    name: '封装业务流程',
    icon: 'icon-pbc',
  },
  [TOOL_CALL_CARD_TYPES.SEND]: {
    type: TOOL_CALL_CARD_TYPES.SEND,
    name: '发送站内通知',
    icon: 'icon-notifications',
  },
  [TOOL_CALL_CARD_TYPES.EMAIL]: {
    type: TOOL_CALL_CARD_TYPES.EMAIL,
    name: '发送邮件',
    icon: 'icon-workflow_email',
  },
};

function getToolCallCardConfig(functionName) {
  for (const key in TOOL_CALL_CARD_CONFIG) {
    if (functionName?.includes(key)) {
      return TOOL_CALL_CARD_CONFIG[key];
    }
  }
  return null;
}

export function filterToolCalls(toolCalls = []) {
  return toolCalls
    .filter(item => {
      const config = getToolCallCardConfig(get(item, 'name') || get(item, 'function.name'));
      return config;
    })
    .filter(item => !!item);
}

const Con = styled.div`
  max-width: 100%;
  > div:first-child {
    margin-top: 8px;
  }
`;

const CardCon = styled.div`
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 12px;
  max-width: 100%;
  .card-header {
    height: 40px;
    border-bottom: 1px solid #eaeaea;
    padding: 0 16px 0 12px;
    .tool-icon {
      width: 24px;
      height: 24px;
      margin-right: 8px;
      font-size: 16px;
      color: #fff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9e6ff;
      color: #5b00a6;
    }
    .tool-name {
      font-size: 14px;
      font-weight: bold;
      color: #151515;
      max-width: 160px;
    }
    .secondary-tool-name {
      margin-left: 10px;
      font-size: 14px;
      color: #151515;
    }
  }
  .card-body {
  }
  &.folded {
    width: fit-content;
    border-radius: 40px;
    overflow: hidden;
    .card-header {
      border-bottom: none;
      &.needConfirm {
        cursor: pointer;
        &:hover {
          background: #f5f5f5;
        }
      }
    }
  }
`;

const JSONDataCon = styled.div`
  padding: 16px;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 10px 16px;
  .title {
    font-size: 12px;
    color: #9e9e9e;
    margin-bottom: 5px;
  }
`;

function renderToolArguments({ chatbotId, conversationId, config, functionArguments, functionData }) {
  if (config.type === TOOL_CALL_CARD_TYPES.CREATE_RECORD || config.type === TOOL_CALL_CARD_TYPES.UPDATE_RECORD) {
    return (
      <RecordCard
        chatbotId={chatbotId}
        conversationId={conversationId}
        config={config}
        functionArguments={functionArguments}
        functionData={functionData}
      />
    );
  } else if (config.type === TOOL_CALL_CARD_TYPES.SEND) {
    return (
      <NotificationCard
        chatbotId={chatbotId}
        conversationId={conversationId}
        functionArguments={functionArguments}
        functionData={functionData}
      />
    );
  } else if (config.type === TOOL_CALL_CARD_TYPES.EMAIL) {
    return (
      <EmailCard
        chatbotId={chatbotId}
        conversationId={conversationId}
        functionArguments={functionArguments}
        functionData={functionData}
      />
    );
  }
  return null;
}

function JSONDataComp({ data }) {
  return (
    <JSONDataCon>
      <div className="title">json</div>
      <JsonView src={data} displayDataTypes={false} displayObjectSize={false} name={null} />
    </JSONDataCon>
  );
}

function FunctionCallCard(props) {
  const { chatbotId, conversationId, needConfirm, config, functionArguments, functionData } = props;
  const [isFolded, setIsFolded] = useState(!needConfirm);
  return (
    <CardCon color={config.color} className={isFolded ? 'folded' : ''}>
      <div
        className={cx('card-header t-flex t-flex-row t-items-center', { needConfirm })}
        onClick={() => {
          if (isFolded) {
            setIsFolded(false);
          }
        }}
      >
        <div className="tool-icon">
          <i className={`icon ${config.icon}`}></i>
        </div>
        <div className="tool-name ellipsis">{config.name}</div>
        {(config.type === TOOL_CALL_CARD_TYPES.CREATE_RECORD || config.type === TOOL_CALL_CARD_TYPES.UPDATE_RECORD) && (
          <RecordCard
            chatbotId={chatbotId}
            conversationId={conversationId}
            showAsTitle={true}
            config={config}
            functionArguments={functionArguments}
          />
        )}
        {!isFolded && (
          <Fragment>
            <div className="t-flex-1"></div>
            <div className="tool-calls-message-fold Gray_75 Font20 Hand" onClick={() => setIsFolded(true)}>
              <i className="icon icon-arrow-up-border1"></i>
            </div>
          </Fragment>
        )}
      </div>
      {!isFolded && (
        <div className="card-body">
          {renderToolArguments({
            chatbotId,
            conversationId,
            config,
            functionArguments,
            functionData,
          }) || <JSONDataComp data={functionArguments} />}
        </div>
      )}
    </CardCon>
  );
}

export function renderToolCalls(
  toolCalls = [],
  { chatbotId, conversationId, needConfirm = false, confirmToolCalls = () => {} } = {},
) {
  const toolCallsData = toolCalls
    .map(item => {
      const config = getToolCallCardConfig(get(item, 'function.name'));
      const functionArguments = safeParse(get(item, 'function.arguments'));
      const functionData = get(item, 'function');
      if (!config) {
        return null;
      }
      return {
        config,
        functionArguments,
        functionData,
        item,
      };
    })
    .filter(item => !!item);
  return (
    <Con>
      {toolCallsData.map(({ config, functionArguments, item, functionData }, index) => {
        return (
          <FunctionCallCard
            chatbotId={chatbotId}
            conversationId={conversationId}
            key={index}
            needConfirm={needConfirm}
            config={{
              ...config,
              name: item.toolName || config.name,
            }}
            functionArguments={functionArguments}
            item={item}
            functionData={functionData}
          />
        );
      })}
      {needConfirm && !!toolCallsData.length && (
        <Button
          type="primary"
          size="mdnormal"
          className="mTop2 mBottom10"
          onClick={() => {
            confirmToolCalls();
          }}
        >
          {_l('确定')}
        </Button>
      )}
    </Con>
  );
}

/**
 * 发送邮件
 *   原始数据
 *   （测试下来支持邮箱和明道用户id）
 *   {
  "subject": "温馨提醒",
  "content": "该吃饭了",
  "receiver": [
    "c12ad989-53f9-49ca-a4f7-676c33e683fa" // 也支持邮箱
  ]
}
 * 发送站内通知
{
  "users": [
    "c12ad989-53f9-49ca-a4f7-676c33e683fa"
  ],
  "message": "该吃饭了"
}
 * 封装业务流程
 * 集成 API
 */
