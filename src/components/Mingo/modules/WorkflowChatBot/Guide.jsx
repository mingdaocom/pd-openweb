import React from 'react';
import styled from 'styled-components';
import chatBotDefaultIcon from 'src/pages/Chatbot/assets/profile.png';

const GuideWrap = styled.div`
  padding: 0 16px;
  height: 50px;
  background: #ffffff;
  box-shadow: 0px 4px 8px 1px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  img {
    width: 20px;
    margin-right: 6px;
  }
`;

export default ({ style }) => {
  return (
    <GuideWrap className="t-inline-flex t-items-center" style={style}>
      <img src={chatBotDefaultIcon} alt="chatBotDefaultIcon" />
      <span>{_l('配置完成，现在可以直接和机器人对话啦～ 若需进一步修改，请前往流程配置')}</span>
    </GuideWrap>
  );
};
