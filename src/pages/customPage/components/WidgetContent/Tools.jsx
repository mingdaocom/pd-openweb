import React, { useRef, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { useToggle } from 'react-use';
import { getEnumType } from '../../util';
import PageMove from 'worksheet/common/Statistics/components/PageMove';

const WEB_CONTENT_TOOLS = [
  { type: 'setting', icon: 'settings', tip: _l('设置') },
  { type: 'insertTitle', icon: 'task_custom_text-box', tip: _l('插入标题行') },
  { type: 'copy', icon: 'copy_custom', tip: _l('复制') },
  { type: 'move', icon: 'swap_horiz', tip: _l('移动') },
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
  z-index: 1;
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
    &.switchButton {
      .next {
        display: none;
        position: relative;
        top: -1px;
      }
      &:hover {
        .current {
          display: none;
        }
        .next {
          display: block;
        }
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
  if (widgetType === 'view') {
    if (layoutType === 'mobile') {
      return MOBILE_CONTENT_TOOLS;
    } else {
      return WEB_CONTENT_TOOLS.filter(item => !['move', 'copy'].includes(item.type));
    }
  };
  if (widgetType !== 'analysis') return WEB_CONTENT_TOOLS.filter(item => item.type !== 'move');
  return TOOLS_BY_LAYOUT_TYPE[layoutType];
};
export default function Tools({ appId, pageId, widget, layoutType, handleToolClick, titleVisible, updatePageInfo }) {
  const [visible, toggle] = useToggle(false);
  const [moveVisible, setMoveVisible] = useState(false);
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
    if (isSwitchButton(type)) {
      const value = _.get(widget, ['button', 'mobileCount']);
      const { direction } = _.get(widget, ['button', 'config']) || {};
      if (direction === 1) {
        if (value === 1) return _l('一行两个');
        if (value === 2) return _l('一行三个');
        if (value === 3) return _l('一行四个');
        if (value === 4) return _l('一行一个');
      } else {
        if (value === 1) return _l('一行两个');
        if (value === 2) return _l('一行一个');
      }
    };
    return tip;
  };
  const getIcon = (type, icon, next) => {
    if (isSwitchButton(type)) {
      const value = _.get(widget, ['button', 'mobileCount']);
      if (next) {
        const { direction } = _.get(widget, ['button', 'config']) || {};
        if (direction === 1) {
          if (value === 1) return 'looks_two';
          if (value === 2) return 'looks_three';
          if (value === 3) return 'looks_four';
          if (value === 4) return 'looks_one';
        } else {
          if (value === 1) return 'looks_two';
          if (value === 2) return 'looks_one';
        }
      } else {
        if (value === 1) return 'looks_one';
        if (value === 2) return 'looks_two';
        if (value === 3) return 'looks_three';
        if (value === 4) return 'looks_four';
      }
    }
    return icon;
  };
  return (
    <ToolsWrap ref={ref} titleVisible={titleVisible} className="widgetContentTools disableDrag">
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
              <DelVerify className="disableDrag">
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
            className={cx(type, { highlight: isHighlight(type), switchButton: isSwitchButton(type) })}
            key={type}
            data-tip={getTip(type, tip)}
            onClick={e => {
              if (type === 'move') {
                setMoveVisible(true);
              } else {
                handleToolClick(type);
              }
            }}
          >
            <i className={`icon-${getIcon(type, icon)} Font18 current`}></i>
            {isSwitchButton(type) && <i className={`icon-${getIcon(type, icon, true)} Font18 next`}></i>}
          </li>
        )
      )}
      {moveVisible && (
        <PageMove
          dialogClasses="disableDrag"
          appId={appId}
          pageId={pageId}
          reportId={widget.value}
          onSucceed={(version) => {
            updatePageInfo({ version });
            handleToolClick('move');
          }}
          onCancel={() => {
            setMoveVisible(false);
          }}
        />
      )}
    </ToolsWrap>
  );
}
