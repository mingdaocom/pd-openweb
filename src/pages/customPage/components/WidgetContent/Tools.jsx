import React, { useRef } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { useToggle } from 'react-use';
import { getEnumType } from '../../util';

const WEB_CONTENT_TOOLS = [
  { type: 'setting', icon: 'settings', tip: _l('设置') },
  { type: 'insertTitle', icon: 'task_custom_text-box', tip: _l('插入标题行') },
  { type: 'copy', icon: 'copy_custom', tip: _l('复制') },
  { type: 'del', icon: 'custom_-page_delete', tip: _l('删除') },
];

const MOBILE_CONTENT_TOOLS = [
  { type: 'insertTitle', icon: 'task_custom_text-box', tip: _l('插入标题行') },
  { type: 'hideMobile', icon: 'visibility_off', tip: _l('隐藏组件') },
];

const MOBILE_BUTTON_TOOLS = [
  { type: 'insertTitle', icon: 'task_custom_text-box', tip: _l('插入标题行') },
  { type: 'switchButtonDisplay', icon: 'looks_one', tip: _l('一行一个') },
  { type: 'hideMobile', icon: 'visibility_off', tip: _l('隐藏组件') },
];

const TOOLS_BY_LAYOUT_TYPE = {
  web: WEB_CONTENT_TOOLS,
  mobile: MOBILE_CONTENT_TOOLS,
};

const ToolsWrap = styled.ul`
  position: fixed;
  top: ${props => (props.titleVisible ? '40px' : '0')};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  padding: 6px 0;
  background-color: #fff;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.24);
  li {
    line-height: 20px;
    padding: 0 8px;
    cursor: pointer;
    color: #757575;
    &:hover {
      color: #2196f3;
    }
    &.del:hover {
      color: #f44336;
    }
    &.highlight {
      color: #2196f3;
      &.del {
        color: #f44336;
      }
    }
    &:first-child {
      border-right: 1px solid #bdbdbd;
    }
  }
`;

const DelVerify = styled.div`
  box-sizing: border-box;
  width: 240px;
  background-color: #fff;
  padding: 16px;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  p {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
  }
  .delComponent {
    margin-top: 20px;
    text-align: right;
    color: #f44336;
    cursor: pointer;
  }
  .btnGroup {
    text-align: right;
    margin-top: 16px;
    cursor: pointer;
    span {
      color: #9e9e9e;
    }
    .cancel {
    }
    .del {
      margin-left: 12px;
      background-color: #f44336;
      color: #fff;
      padding: 6px 12px;
      border-radius: 3px;
      text-align: center;
      line-height: 36px;
      &:hover {
        background-color: #ba160a;
      }
    }
  }
`;

const getTools = ({ widgetType, layoutType }) => {
  if (layoutType === 'mobile' && widgetType === 'button') return MOBILE_BUTTON_TOOLS;
  return TOOLS_BY_LAYOUT_TYPE[layoutType];
};
export default function Tools({ widget, layoutType, handleToolClick, titleVisible }) {
  const [visible, toggle] = useToggle(false);
  const widgetType = getEnumType(widget.type);
  const ref = useRef(null);
  const isHighlight = type => {
    if (visible && type === 'del') return true;
    if (type === 'insertTitle' && titleVisible) return true;
    return false;
  };
  const isSwitchButton = type => {
    return widgetType === 'button' && type === 'switchButtonDisplay';
  };
  const TOOLS = getTools({ widgetType, layoutType });
  const getTip = (type, tip) => {
    if (type === 'insertTitle' && titleVisible) return _l('取消标题行');
    if (isSwitchButton(type)) return _.get(widget, ['button', 'mobileCount']) === 2 ? _l('一行一个') : _l('一行两个');
    return tip;
  };
  const getIcon = (type, icon) => {
    if (isSwitchButton(type)) return _.get(widget, ['button', 'mobileCount']) === 2 ? 'looks_two' : 'looks_one';
    return icon;
  };
  return (
    <ToolsWrap ref={ref} titleVisible={titleVisible} className="widgetContentTools">
      {TOOLS.map(({ icon, type, tip }) =>
        type === 'del' ? (
          <Trigger
            key={type}
            popupVisible={visible}
            action={['click']}
            onPopupVisibleChange={visible => toggle(visible)}
            getPopupContainer={() => document.body}
            popupAlign={{
              points: ['tc', 'bc'],
              offset: [-40, 10],
              overflow: { adjustX: true, adjustY: true },
            }}
            popup={
              <DelVerify>
                <p>{_l('确定要删除此组件')}</p>
                <div className="btnGroup">
                  <span className="cancel" onClick={() => toggle(false)}>
                    {_l('取消')}
                  </span>
                  <span className="del" onClick={() => handleToolClick('del')}>
                    {_l('删除')}
                  </span>
                </div>
              </DelVerify>
            }
          >
            <li
              className={cx(type, { highlight: isHighlight(type) })}
              key={type}
              data-tip={tip}
              onClick={e => {
                toggle(true);
              }}
            >
              <i className={`icon-${icon} Font18`}></i>
            </li>
          </Trigger>
        ) : (
          <li
            className={cx(type, { highlight: isHighlight(type) })}
            key={type}
            data-tip={getTip(type, tip)}
            onClick={e => {
              handleToolClick(type);
            }}
          >
            <i className={`icon-${getIcon(type, icon)} Font18`}></i>
          </li>
        )
      )}
    </ToolsWrap>
  );
}
