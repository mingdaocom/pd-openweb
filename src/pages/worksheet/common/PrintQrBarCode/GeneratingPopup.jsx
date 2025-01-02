import React, { useEffect, useRef, useState } from 'react';
import PDFObject, { embed } from 'pdfobject';
import styled from 'styled-components';
import { FlexCenter, rotate } from 'worksheet/components/Basics';

const Con = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const Header = styled.div`
  position: relative;
  display: flex;
  height: 50px;
  padding: 0 10px 0 20px;
  background-color: #fff;
  justify-content: space-between;
  box-shadow: 0px 1px 3px #00000029;
  z-index: 2;
  align-items: center;
  .name {
    font-size: 17px;
    line-height: 50px;
    font-weight: bold;
    color: #151515;
    max-width: 100%;
  }
  .close {
    cursor: pointer;
    font-size: 24px;
    line-height: 50px;
    padding: 0 10px;
    color: #444;
    &:hover {
      color: #222;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  font-size: 13px;
  color #151515;
  align-items: center;
  .info {
    margin-right: 8px;
  }
  .switchBtn {
    width: 24px;
    height: 24px;
    font-size: 16px;
    border-radius: 3px;
    cursor: pointer;
    margin-right: 8px;
    &:not(.disabled):hover {
      color: #2196F3;
      background: #F5F5F5;
    }
    &.disabled {
      cursor: not-allowed;
      color: #BDBDBD;
    }
  }
`;

const PrintButton = styled.div`
  position: absolute;
  right: 40px;
  top: 70px;
  background: #151515639;
  color: #f1f1f1;
  font-size: 20px;
  border-radius: 3px;
  padding: 5px 10px;
  cursor: pointer;
  &:hover {
    background: #434649;
  }
`;

const Body = styled(FlexCenter)`
  flex: 1;
  background: #eaeaea;
`;

const Loading = styled.div`
  text-align: center;
  color: #9e9e9e;
  .icon {
    display: inline-block;
    font-size: 24px;
    animation: ${rotate} 0.6s infinite linear;
  }
  p {
    font-size: 14px;
    margin-top: 5px;
  }
`;

const Embed = styled.div`
  width: 100%;
  height: 100%;
  ${({ loading }) => (loading ? 'display: none;' : '')}
`;

export default function GeneratingPopup(props) {
  const {
    name = _l('打印'),
    loading,
    loadingText = _l('正在生成打印文件···'),
    embedUrl,
    allowLoadMore,
    pageIndex = 1,
    pageSize = 200,
    count = 0,
    onPrev = () => {},
    onNext = () => {},
    onClose = () => {},
  } = props;
  const disabledPrev = loading || pageIndex <= 1;
  const disabledNext = loading || pageIndex >= Math.ceil(count / pageSize);
  const embedRef = useRef();
  useEffect(() => {
    if (embedUrl) {
      PDFObject.embed(embedUrl, embedRef.current);
    }
  }, [loading]);
  function handleKeyDown(e) {
    e.stopPropagation();
    if (e.keyCode === 27) {
      onClose();
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return (
    <Con className="doNotTriggerClickAway" style={props.zIndex ? { zIndex: props.zIndex } : {}}>
      <Header>
        <span className="name ellipsis">{name}</span>
        {allowLoadMore && (
          <Pagination>
            <span className="info">
              {_l(
                '第 %0-%1 个，共 %2 个',
                (pageIndex - 1) * pageSize + 1,
                pageIndex * pageSize > count ? count : pageIndex * pageSize,
                count,
              )}
            </span>
            <FlexCenter
              className={`switchBtn prev ${disabledPrev ? 'disabled' : ''}`}
              onClick={() => !disabledPrev && onPrev()}
            >
              <i className="icon icon-arrow-left-border"></i>
            </FlexCenter>
            <FlexCenter
              className={`switchBtn next ${disabledNext ? 'disabled' : ''}`}
              onClick={() => !disabledNext && onNext()}
            >
              <i className="icon icon-arrow-right-border"></i>
            </FlexCenter>
          </Pagination>
        )}
        {window.isSafari && !loading && (
          <PrintButton
            onClick={() => {
              try {
                embedRef.current.querySelector('iframe').contentWindow.print();
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <i className="icon icon-print"></i>
          </PrintButton>
        )}
        <i className="icon icon-close close" onClick={onClose}></i>
      </Header>
      <Body>
        {loading && (
          <Loading>
            <i className="icon icon-loading_button"></i>
            <p>{loadingText}</p>
          </Loading>
        )}
        <Embed loading={loading} ref={embedRef} />
      </Body>
    </Con>
  );
}
