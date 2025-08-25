/**
 * h5看板、日历视图配置错误提示页
 */
import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const ViewErrorPageContainer = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  .errorIcon {
    font-size: 72px;
  }
  .errorTitle {
    color: #151515;
    font-size: 16px;
    margin: 16px 0px 28px;
  }
  .errorInfo {
    color: #757575;
    font-size: 14px;
  }
  .setViewBtn {
    width: 110px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    border: 1px solid #1677ff;
    margin-top: 30px;
    color: #1677ff;
  }
`;

export default function ViewErrorPage(props) {
  const { icon, viewName, color } = props;
  return (
    <ViewErrorPageContainer className="flexColumn valignWrapper">
      <Icon className="errorIcon" icon={icon} style={{ color }} />
      <div className="errorTitle">{viewName}</div>
      <div className="errorInfo">{_l('视图配置错误，请联系管理员')}</div>
    </ViewErrorPageContainer>
  );
}
