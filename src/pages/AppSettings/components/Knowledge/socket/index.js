import React from 'react';
import filterXSS from 'xss';
import { antNotification, Icon } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import { KNOWLEDGE_STATUS } from '../core/config';

const getAction = status => {
  switch (status) {
    case KNOWLEDGE_STATUS.INITIALIZING:
    case KNOWLEDGE_STATUS.CHUNKING:
    case KNOWLEDGE_STATUS.CHUNK_SUCCESS:
    case KNOWLEDGE_STATUS.VECTORIZING:
    case KNOWLEDGE_STATUS.VECTOR_FAILED:
      return 'info';
    case KNOWLEDGE_STATUS.VECTOR_SUCCESS:
      return 'success';
    default:
      return 'info';
  }
};

const getContent = ({ knowledgeName, knowledgeStatus, chunkCount }) => {
  switch (knowledgeStatus) {
    case KNOWLEDGE_STATUS.INITIALIZING:
    case KNOWLEDGE_STATUS.CHUNKING:
      return {
        title: _l('正在计算知识库分块数量...'),
        description: _l('正在计算 “%0” 分块数量，计算成功后会给您发送通知', knowledgeName),
      };
    case KNOWLEDGE_STATUS.CHUNK_SUCCESS:
    case KNOWLEDGE_STATUS.CHUNK_FAILED:
      return {
        title: _l('知识库分块计算完成'),
        description: _l('“%0” 分块成功，共 %1 个分块。确认后，进行向量化入库', knowledgeName, chunkCount || 0),
      };
    case KNOWLEDGE_STATUS.VECTORIZING:
      return {
        title: _l('知识库向量化入库中...'),
        description: _l('“%0” 向量化入库中...', knowledgeName),
      };
    case KNOWLEDGE_STATUS.VECTOR_SUCCESS:
    case KNOWLEDGE_STATUS.VECTOR_FAILED:
      return {
        title: _l('知识库向量化入库完成'),
        description: _l('“%0” 向量化入库完成', knowledgeName),
      };
    default:
      return {
        title: '',
        description: '',
      };
  }
};

const getCommon = ({ knowledgeId, knowledgeName, knowledgeStatus, chunkCount }) => {
  const { title, description } = getContent({ knowledgeName, knowledgeStatus, chunkCount });

  return {
    key: knowledgeId,
    className: 'customNotification',
    closeIcon: <Icon icon="close" className="Font20 textTertiary ThemeHoverColor3" />,
    duration: 5,
    message: title,
    description: <div dangerouslySetInnerHTML={{ __html: filterXSS(description) }} />,
    loading: [KNOWLEDGE_STATUS.CHUNKING, KNOWLEDGE_STATUS.VECTORIZING].includes(knowledgeStatus),
  };
};

export default () => {
  if (!window.IM) return;
  IM.socket.on('knowledge', data => {
    const { apkId: appId, knowledgeId, knowledgeStatus } = data;
    let action = getAction(knowledgeStatus);
    const baseUrl = `/app/${appId}/settings/knowledge`;
    const targetUrl = `${baseUrl}#kid=${knowledgeId}`;

    antNotification[action]({
      ...getCommon(data),
      btn: [
        KNOWLEDGE_STATUS.CHUNK_SUCCESS,
        KNOWLEDGE_STATUS.CHUNK_FAILED,
        KNOWLEDGE_STATUS.VECTOR_SUCCESS,
        KNOWLEDGE_STATUS.VECTOR_FAILED,
      ].includes(knowledgeStatus) ? (
        <span
          className="Hand colorPrimary"
          onClick={() => {
            navigateTo(targetUrl);
          }}
        >
          {_l('查看')}
        </span>
      ) : undefined,
      onBtnClick: () => {
        antNotification.close(knowledgeId);
      },
    });
  });
};
