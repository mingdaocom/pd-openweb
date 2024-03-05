import React from 'react';
import styled from 'styled-components';
import { Menu, MenuItem } from 'ming-ui';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import cx from 'classnames';

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
    &.cur {
      .Item-content,
      .Item-content:not(.disabled):hover {
        background-color: #1e88e5 !important;
        color: #fff !important;
      }
    }
    .Item-content:not(.disabled):hover {
      background: #f5f5f5 !important;
      color: #2196f3 !important;
    }
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
        color: #2196f3;
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
`;
export default function DropOption(props) {
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
        offset: [0, 10],
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
          {props.list.map(({ text, value, disabled }) => (
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
              <span className="viewName">{text}</span>
            </MenuItem>
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
