import React from 'react';
import styled, { keyframes } from 'styled-components';

const GeneratingHeaderCon = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background-color: var(--color-background-primary);
  .worksheetName {
    position: absolute;
    left: 0;
    top: 0;
    font-size: 17px;
    font-weight: bold;
    color: var(--color-text-title);
  }
  .fixedCon {
    position: fixed;
    top: 31px;
    border-radius: 20px;
    background: var(--color-background-card);
  }
`;

const animation = keyframes`
    0% {
        background-position: 150%
    }
    100% {
        background-position: -50%
    }
`;

const StatusBar = styled.div`
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 20px;
  border: 1px solid var(--color-border-primary);
  box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.16);
  font-size: 13px;
  font-weight: bold;
  padding: 0 25px;
  color: var(--color-text-title);
  .icon {
    color: var(--color-mingo);
    margin-right: 5px;
    font-size: 18px;
  }
  .generated {
    color: var(--color-success);
  }
  &.unsaved {
    background: linear-gradient(
      90deg,
      var(--color-mingo) 10%,
      var(--color-border-secondary) 55%,
      var(--color-mingo) 80%
    );
    color: var(--color-text-primary);
    background-repeat: repeat-x;
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    animation-name: ${animation};
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    position: relative;
    animation-duration: 0.8s;
  }
`;

export default function GeneratingHeader({ globalSheetInfo, mingoIsCreatingWorksheetStatus }) {
  return (
    <GeneratingHeaderCon>
      <div className="worksheetName">{globalSheetInfo.name}</div>
      <div className="fixedCon">
        {mingoIsCreatingWorksheetStatus === 1 && (
          <StatusBar className="unsaved">
            <i className="icon icon-auto_awesome"></i>
            <div className="statusText">{_l('字段生成中')}</div>
          </StatusBar>
        )}
        {mingoIsCreatingWorksheetStatus === 2 && (
          <StatusBar>
            <i className="generated icon icon-ok"></i>
            <div className="statusText">{_l('已生成，请在对话中确认')}</div>
          </StatusBar>
        )}
      </div>
    </GeneratingHeaderCon>
  );
}
