import React, { useRef, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Tooltip, Popover, Slider, Input } from 'antd';
import 'rc-trigger/assets/index.css';
import { useToggle } from 'react-use';
import { getEnumType } from '../../util';
import { reportTypes } from 'statistics/Charts/common';
import PageMove from 'statistics/components/PageMove';
import { formatNumberFromInput } from 'src/util';
import _ from 'lodash';

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
  { type: 'changeFontSize', icon: 'text_bold2' },
  { type: 'hideMobile', icon: 'visibility_off', tip: _l('隐藏组件') },
];

const TOOLS_BY_LAYOUT_TYPE = {
  web: WEB_CONTENT_TOOLS,
  mobile: MOBILE_CONTENT_TOOLS,
};

const ToolsWrap = styled.ul`
  position: absolute;
  z-index: 1;
  top: 0;
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
  .changeFontSizePopover {
    width: 250px;
    .ant-input {
      width: 60px;
      border-radius: 4px !important;
      box-shadow: none !important;
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

const getTools = ({ widgetType, layoutType, reportType }) => {
  if (layoutType === 'mobile') {
    if (['button'].includes(widgetType) || (widgetType === 'analysis' && [reportTypes.NumberChart, reportTypes.ProgressChart].includes(reportType))) {
      if (reportTypes.NumberChart === reportType) {
        return MOBILE_BUTTON_TOOLS;
      } else {
        return MOBILE_BUTTON_TOOLS.filter(n => n.type !== 'changeFontSize');
      }
    } else {
      return MOBILE_CONTENT_TOOLS;
    }
  };
  if (['view', 'filter'].includes(widgetType)) {
    return WEB_CONTENT_TOOLS.filter(item => !['move', 'copy'].includes(item.type));
  };
  if ('ai' === widgetType) {
    return WEB_CONTENT_TOOLS.filter(item => !['move', 'copy', 'setting'].includes(item.type));
  }
  if (widgetType !== 'analysis') {
    return WEB_CONTENT_TOOLS.filter(item => item.type !== 'move');
  };
  return TOOLS_BY_LAYOUT_TYPE[layoutType];
};
export default function Tools({ appId, pageId, widget, layoutType, handleToolClick, titleVisible, updatePageInfo }) {
  const { reportType, config = {} } = widget;
  const [visible, toggle] = useToggle(false);
  const [moveVisible, setMoveVisible] = useState(false);
  const [fontSize, setFontSize] = useState(config.mobileFontSize || 15);
  const widgetType = getEnumType(widget.type);
  const ref = useRef(null);
  const isHighlight = type => {
    if (visible && type === 'del') return true;
    if (type === 'insertTitle' && titleVisible) return true;
    return false;
  };
  const isSwitchButton = type => {
    return (widgetType === 'button' || (widgetType === 'analysis' && [reportTypes.NumberChart, reportTypes.ProgressChart].includes(reportType))) && type === 'switchButtonDisplay';
  };
  const TOOLS = getTools({ widgetType, layoutType, reportType });
  const getTip = (type, tip) => {
    if (type === 'insertTitle' && titleVisible) return _l('取消标题行');
    if (isSwitchButton(type)) {
      const value = widgetType === 'button' ? _.get(widget, ['button', 'mobileCount']) : _.get(widget, ['config', 'mobileCount']);
      const { direction } = _.get(widget, ['button', 'config']) || {};
      if (widgetType === 'analysis') {
        if (value === 1) return _l('一行两个');
        if (value === 2) return _l('一行三个');
        if (value === 3) return _l('一行四个');
        if (value === 4) return _l('一行五个');
        if (value === 5) return _l('一行六个');
        if (value === 6) return _l('一行一个');
      } else if (direction === 1) {
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
      const value = widgetType === 'button' ? _.get(widget, ['button', 'mobileCount']) : _.get(widget, ['config', 'mobileCount']);
      if (next) {
        const { direction } = _.get(widget, ['button', 'config']) || {};
        if (widgetType === 'analysis') {
          if (value === 1) return 'looks_two';
          if (value === 2) return 'looks_three';
          if (value === 3) return 'looks_four';
          if (value === 4) return 'looks_five';
          if (value === 5) return 'looks_six';
          if (value === 6) return 'looks_one';
        } else if (direction === 1) {
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
  const renderTool = ({ icon, type, tip }) => {
    if (type === 'del') {
      return (
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
                <span
                  className="del"
                  onClick={() => {
                    handleToolClick('del');
                    toggle(false);
                  }}
                >
                  {_l('删除')}
                </span>
              </div>
            </DelVerify>
          }
        >
          <Tooltip title={tip} placement="bottom">
            <li
              className={cx(type, { highlight: isHighlight(type) })}
              key={type}
              onClick={e => {
                toggle(true);
              }}
            >
              <i className={`icon-${icon} Font18`}></i>
            </li>
          </Tooltip>
        </Trigger>
      );
    }
    if (type === 'changeFontSize') {
      return (
        <Popover
          placement="bottom"
          arrowPointAtCenter={true}
          content={(
            <div className="changeFontSizePopover flexRow">
              <Slider
                className="flex"
                value={fontSize}
                min={12}
                max={28}
                onChange={value => {
                  setFontSize(value);
                  handleToolClick(type, value);
                }}
              />
              <Input
                className="mLeft10"
                value={fontSize}
                onChange={event => {
                  const value = Number(formatNumberFromInput(event.target.value, false) || 0);
                  setFontSize(value);
                }}
                onBlur={() => {
                  let value = fontSize;
                  if (value <= 12) {
                    value = 12;
                  }
                  if (value >= 28) {
                    value = 28;
                  }
                  setFontSize(value);
                  handleToolClick(type, value);
                }}
              />
            </div>
          )}
          getPopupContainer={() => ref.current || document.body}
        >
          <li
            className={cx(type, { highlight: isHighlight(type) })}
            key={type}
            onClick={e => {
              toggle(true);
            }}
          >
            <i className={`icon-${icon} Font18`}></i>
          </li>
        </Popover>
      );
    }
    return (
      <Tooltip title={getTip(type, tip)} placement="bottom">
        <li
          className={cx(type, { highlight: isHighlight(type), switchButton: isSwitchButton(type) })}
          key={type}
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
      </Tooltip>
    );
  }
  return (
    <ToolsWrap ref={ref} titleVisible={titleVisible} className="widgetContentTools disableDrag">
      {TOOLS.map(item => renderTool(item))}
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
