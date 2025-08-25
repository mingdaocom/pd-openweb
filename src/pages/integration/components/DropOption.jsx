import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Menu, MenuItem } from 'ming-ui';

const MenuWrap = styled(Menu)`
  position: relative !important;
  padding: 6px 0 !important;
  width: 200px !important;
  .ming.MenuItem .Item-content {
    overflow: initial;
    position: relative;
  }
  .ming.MenuItem {
    z-index: 1;
  }
  .GroupTypeMenuWrap {
    position: absolute;
    left: 100%;
    width: 160px;
    bottom: 0;
    background: #ffffff;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.25) !important;
    opacity: 1;
    border-radius: 3px;
    padding: 6px 0;
    border-right: none;
    li {
      height: 36px;
      line-height: 36px;
      padding: 0 16px;
      &:hover {
        background: #f5f5f5;
        color: #1677ff;
      }
    }
  }
  .bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
  }
  .gray_75 {
    color: #757575;
  }
`;
export default function DropOption(props) {
  const { forGroup } = props;
  const [{ popupVisible }, setState] = useSetState({
    popupVisible: props.popupVisible,
  });
  return (
    <Trigger
      action={['click']}
      popupClassName="moOption"
      getPopupContainer={() => document.body}
      popupVisible={popupVisible}
      zIndex={1000}
      onPopupVisibleChange={popupVisible => {
        if (!props.value && !popupVisible) {
          return alert(_l('请选择类型'), 3);
        }
        setState({ popupVisible });
      }}
      popupAlign={{
        points: ['tr', 'br'],
        offset: forGroup ? [0, -100] : [0, 10],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={
        <MenuWrap>
          {!props.value && (
            <div
              className="bg"
              onClick={() => {
                return alert(_l('请选择类型'), 3);
              }}
            ></div>
          )}
          {props.list.map(({ text, value, disabled, getTime = () => {} }, i) => (
            <React.Fragment>
              {forGroup && i === 0 && <div className="Gray_75 mLeft12 LineHeight36">{_l('时间')}</div>}
              <MenuItem
                key={value}
                className={cx({ cur: value === props.value })}
                onClick={() => {
                  if (value !== props.value) {
                    props.handleChangeType(value);
                  }
                  setState({ popupVisible: false });
                }}
                disabled={disabled}
              >
                <div className="flexRow">
                  <span className="viewName flex">{text}</span>
                  {forGroup && <span className="gray_75">{getTime()}</span>}
                </div>
              </MenuItem>
              {forGroup && ['TIME', 'CUR_MINUTE'].includes(value) && (
                <React.Fragment>
                  <div className="mTop3 mBottom3" style={{ borderBottom: '1px solid #EAEAEA' }}></div>
                  <div className="Gray_75 mLeft12 LineHeight36">{_l('集合')}</div>
                </React.Fragment>
              )}
            </React.Fragment>
          ))}
          <div className="mTop3 mBottom3" style={{ borderBottom: '1px solid #EAEAEA' }}></div>
          <MenuItem
            onClick={e => {
              props.handleOpenChangeName();
              setState({ popupVisible: false });
              e.stopPropagation();
            }}
          >
            {_l('重命名')}
          </MenuItem>
        </MenuWrap>
      }
    >
      <i className="icon icon-expand_more InlineBlock Hand Font16 mLeft10"></i>
    </Trigger>
  );
}
