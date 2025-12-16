import React, { useState } from 'react';
import { get } from 'lodash';
import styled from 'styled-components';
import aiServiceAjax from 'src/api/aIService';

const Con = styled.div`
  max-width: 100%;
  overflow: hidden;
  margin-top: 10px;
  height: 40px;
  font-size: 13px;
  color: #f44336;
  padding: 0 12px;
  background: rgba(244, 67, 54, 0.04);
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  .errorIcon {
    font-size: 16px;
    color: #f44336;
    margin-right: 8px;
  }
  .errorIcon {
    font-size: 16px;
    color: #f44336;
    margin-right: 8px;
  }
  .retry {
    margin-left: 20px;
    font-size: 13px;
    color: #151515;
    cursor: pointer;
    .icon {
      font-size: 16px;
      color: #757575;
      margin-right: 2px;
    }
  }
  .feedback {
    margin-left: 10px;
    font-size: 13px;
    flex-shrink: 0;
  }
`;

export default function ResponseError({
  className,
  aiFeatureType,
  style = {},
  error,
  showRetry = false,
  onRetry,
  showFeedback = false,
}) {
  const [isFeedBacking, setIsFeedBacking] = useState(false);
  return (
    <Con className={className} style={style}>
      <i className="errorIcon icon icon-error" />
      <div className="ellipsis">{error?.errorMsg || error}</div>
      {showRetry && (
        <span className="t-flex t-items-center t-justify-center retry">
          <i className="icon icon-task-later" onClick={onRetry}></i>
          {_l('重试')}
        </span>
      )}
      {showFeedback && !!get(md, 'global.SysSettings.enableAIErrorPush') && (
        <a
          className="feedback"
          disabled={isFeedBacking}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (isFeedBacking) return;
            setIsFeedBacking(true);
            aiServiceAjax
              .sendAIServiceErrorMsg({
                feature: aiFeatureType,
                errMsg: error?.sourceData || error,
              })
              .then(() => {
                alert(_l('反馈成功，平台将尽快解决'));
              })
              .finally(() => {
                // setTimeout(() => {
                //   setIsFeedBacking(false);
                // }, 3000);
              });
          }}
        >
          {_l('点击向平台反馈')}
        </a>
      )}
    </Con>
  );
}
