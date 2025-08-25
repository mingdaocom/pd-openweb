import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import placeholderIcon from './assets/ai-messages.svg';
import { getDefaultPrompt } from './util';

const Con = styled.div`
  position: absolute;
  background-color: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .genBtn {
    padding: 0 12px;
    background-color: #fff;
    border-radius: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #151515;
    font-size: 13px;
    border: 1px solid #ddd;
    margin-top: 12px;
    cursor: pointer;
  }
  .enterEditor {
    font-size: 13px;
    color: #1677ff;
    cursor: pointer;
    margin-top: 30px;
  }
`;

export default function EmptyHolder({ control, onBeginWithMessage, onEnterEditor }) {
  const defaultPrompt = getDefaultPrompt(control);
  return (
    <Con>
      <img src={placeholderIcon} alt="placeholder" />
      <div className="Gray_75 Font15" style={{ marginTop: 16 }}>
        {_l('与 AI 对话生成代码，创建一个完全自定义样式与交互的字段')}
      </div>
      <div className="Gray_9e Font13" style={{ marginTop: 28 }}>
        {_l('试一试')}
      </div>
      {!md.global.SysSettings.hideAIBasicFun && (
        <div className="genBtn" onClick={() => onBeginWithMessage(defaultPrompt.content)}>
          {defaultPrompt.title + '......'}
        </div>
      )}
      <div className="enterEditor" onClick={onEnterEditor}>
        {_l('进入代码编辑器')}
      </div>
    </Con>
  );
}

EmptyHolder.propTypes = {
  control: PropTypes.shape({}),
  onBeginWithMessage: PropTypes.func,
  onEnterEditor: PropTypes.func,
};
