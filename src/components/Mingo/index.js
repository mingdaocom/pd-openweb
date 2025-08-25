import React, { useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import MingoContent from './ChatBot/Content';

const MingoWrap = styled.div`
  height: 100%;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
  .header {
    padding: 11px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .chattingTitle {
      cursor: pointer;
      .backIcon:hover {
        color: #151515 !important;
      }
    }
    .chattingTitleText {
      margin-left: 8px;
      font-size: 15px;
      color: #151515;
      font-weight: bold;
    }
  }
`;

export default function Mingo(props) {
  const { mingoFixing, onFixing, onClose, drawerVisible } = props;
  const [currentChatId, setCurrentChatId] = useState(null);
  const contentRef = useRef(null);
  const [isChatting, setIsChatting] = useState(false);
  if (!drawerVisible && !mingoFixing) {
    return null;
  }
  return (
    <MingoWrap>
      <div className={cx('header')}>
        {!isChatting && (
          <BgIconButton
            tooltip={mingoFixing ? _l('取消固定') : _l('固定')}
            iconStyle={mingoFixing ? { color: '#515151' } : { color: '#cccccc' }}
            icon="set_top"
            onClick={onFixing}
          />
        )}
        {isChatting && (
          <div className="chattingTitle t-flex t-flex-row t-items-center">
            <BgIconButton
              icon="backspace"
              onClick={() => {
                contentRef.current?.destroy();
              }}
            />
            <div className="chattingTitleText">{_l('使用帮助')}</div>
          </div>
        )}
        <BgIconButton.Group gap={6}>
          <BgIconButton
            tooltip={_l('新窗口打开')}
            icon="launch"
            onClick={() => {
              window.open(isChatting && currentChatId ? `/mingo/chat/${currentChatId}` : '/mingo', '_blank');
            }}
          />
          <BgIconButton
            icon="close"
            onClick={() => {
              contentRef.current?.destroy();
              onClose();
            }}
          />
        </BgIconButton.Group>
      </div>
      <MingoContent allowEdit ref={contentRef} updateIsChatting={setIsChatting} onUpdateChatId={setCurrentChatId} />
    </MingoWrap>
  );
}

Mingo.propTypes = {
  mingoFixing: PropTypes.bool,
  onFixing: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
