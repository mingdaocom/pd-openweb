import React, { Fragment, useRef, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { reportTypes } from 'statistics/Charts/common';
import { getEnumType } from '../../../util';
import CardSetting from './CardSetting';
import ChangeFontSize from './ChangeFontSize';
import ContainerSetting from './ContainerSetting';
import Delete from './Delete';
import ImageTool from './Image';
import Move from './Move';
import RichTextTool from './RichText';
import 'rc-trigger/assets/index.css';

const WEB_CONTENT_TOOLS = [
  { type: 'setting', icon: 'settings', tip: _l('设置') },
  { type: 'cardSetting', icon: 'settings', tip: _l('卡片设置') },
  { type: 'insertTitle', icon: 'title', tip: _l('插入标题行') },
  { type: 'copy', icon: 'copy_custom', tip: _l('复制') },
  { type: 'move', icon: 'swap_horiz', tip: _l('移动') },
  { type: 'del', icon: 'recycle', tip: _l('删除') },
];

const MOBILE_CONTENT_TOOLS = [
  { type: 'insertTitle', icon: 'title', tip: _l('插入标题行') },
  { type: 'hideMobile', icon: 'visibility_off', tip: _l('隐藏组件') },
];

const MOBILE_BUTTON_TOOLS = [
  { type: 'insertTitle', icon: 'title', tip: _l('插入标题行') },
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
  z-index: 12;
  top: ${props => (props.titleVisible ? '40px' : '0')};
  left: auto;
  right: 0px;
  display: flex;
  align-items: center;
  padding: 6px 0;
  background-color: #fff;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.24);
  &.tabs,
  &.card,
  &.image,
  &.richText {
    top: 1px;
  }
  li {
    line-height: 20px;
    padding: 0 8px;
    cursor: pointer;
    color: #757575;
    &:hover {
      color: #1677ff;
    }
    &.del:hover {
      color: #f44336;
    }
    &.highlight {
      color: #1677ff;
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
    &.setting {
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

const getTools = ({ widget, widgetType, layoutType, reportType, containerComponents }) => {
  if (layoutType === 'mobile') {
    let mobileTools = _.cloneDeep(MOBILE_BUTTON_TOOLS).filter(item =>
      widget.sectionId ? item.type !== 'insertTitle' : true,
    );
    if (widgetType === 'analysis') {
      if (reportTypes.NumberChart !== reportType) {
        mobileTools = mobileTools.filter(n => !['changeFontSize', 'switchButtonDisplay'].includes(n.type));
      }
    } else if (['button'].includes(widgetType)) {
      mobileTools = mobileTools.filter(n => n.type !== 'changeFontSize');
    } else if (['tabs'].includes(widgetType)) {
      mobileTools = mobileTools.filter(n => !['insertTitle', 'changeFontSize', 'switchButtonDisplay'].includes(n.type));
    } else {
      mobileTools = mobileTools.filter(n => !['changeFontSize', 'switchButtonDisplay'].includes(n.type));
    }
    return mobileTools;
  } else {
    let pcTools = _.cloneDeep(TOOLS_BY_LAYOUT_TYPE[layoutType]).filter(item =>
      widget.sectionId ? item.type !== 'insertTitle' : true,
    );
    if (!['view', 'analysis'].includes(widgetType)) {
      pcTools = pcTools.filter(item => !['cardSetting'].includes(item.type));
    }
    if (['view', 'filter'].includes(widgetType)) {
      const res = containerComponents.length ? ['copy'] : ['move', 'copy'];
      pcTools = pcTools.filter(item => !res.includes(item.type));
    }
    if (['tabs', 'card'].includes(widgetType)) {
      pcTools = pcTools.filter(item => !['move', 'copy', 'insertTitle'].includes(item.type));
    }
    if (['image'].includes(widgetType)) {
      pcTools = pcTools.filter(item => !['copy', 'insertTitle'].includes(item.type));
    }
    if (widgetType !== 'analysis' && !containerComponents.length) {
      pcTools = pcTools.filter(item => item.type !== 'move');
    }
    return pcTools;
  }
};

export default function Tools(props) {
  const { widget, updateWidget } = props;
  const { layoutType, handleToolClick, titleVisible, allComponents, activeContainerInfo = {} } = props;
  const { reportType } = widget;
  const objectId = _.get(widget, 'config.objectId');
  const widgetType = getEnumType(widget.type);
  const [placement, setPlacement] = useState('bottomRight');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const ref = useRef(null);

  const isHighlight = type => {
    // if (type === 'del') return true;
    if (type === 'insertTitle' && titleVisible) return true;
    return false;
  };
  const isSwitchButton = type => {
    return (
      (widgetType === 'button' ||
        (widgetType === 'analysis' && [reportTypes.NumberChart, reportTypes.ProgressChart].includes(reportType))) &&
      type === 'switchButtonDisplay'
    );
  };
  const containerComponents = allComponents.filter(c => [9, 10, 'tabs', 'card'].includes(c.type));
  const TOOLS = getTools({ widget, widgetType, layoutType, reportType, containerComponents });

  const handleUpdateDropdownVisible = visible => {
    setDropdownVisible(visible);
    if (visible) {
      const className = `${widgetType}-${['tabs', 'card'].includes(widgetType) ? objectId : widget.id || widget.uuid}`;
      const container = document.querySelector('#componentsWrap');
      const card = _.get(
        document.querySelector(`.${className}`),
        widget.sectionId || widget.tabId ? 'parentNode.parentNode.parentNode' : 'parentNode.parentNode',
      );
      const moreIcon = card.querySelector('.widgetContentTools .icon-more_horiz');
      if (container && moreIcon) {
        const elementRect = moreIcon.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const elementBottomToContainerTop = elementRect.bottom - containerRect.top;
        const containerVisibleHeight = container.clientHeight;
        setPlacement(containerVisibleHeight - elementBottomToContainerTop < 200 ? 'topRight' : 'bottomRight');
      }
    }
  };

  const getTip = (type, tip) => {
    if (type === 'insertTitle' && titleVisible) return _l('取消标题行');
    if (isSwitchButton(type)) {
      const value =
        widgetType === 'button' ? _.get(widget, ['button', 'mobileCount']) : _.get(widget, ['config', 'mobileCount']);
      const { btnType, direction } = _.get(widget, ['button', 'config']) || {};
      if (widgetType === 'analysis') {
        if (value === 1) return _l('一行两个');
        if (value === 2) return _l('一行三个');
        if (value === 3) return _l('一行四个');
        if (value === 4) return _l('一行五个');
        if (value === 5) return _l('一行六个');
        if (value === 6) return _l('一行一个');
      } else if (btnType === 2 && direction === 1) {
        if (value === 1) return _l('一行两个');
        if (value === 2) return _l('一行三个');
        if (value === 3) return _l('一行四个');
        if (value === 4) return _l('一行一个');
      } else {
        if (value === 1) return _l('一行两个');
        if (value === 2) return _l('一行一个');
      }
    }
    return tip;
  };

  const getIcon = (type, icon, next) => {
    if (isSwitchButton(type)) {
      const value =
        widgetType === 'button' ? _.get(widget, ['button', 'mobileCount']) : _.get(widget, ['config', 'mobileCount']);
      if (next) {
        const { btnType, direction } = _.get(widget, ['button', 'config']) || {};
        if (widgetType === 'analysis') {
          if (value === 1) return 'looks_two';
          if (value === 2) return 'looks_three';
          if (value === 3) return 'looks_four';
          if (value === 4) return 'looks_five';
          if (value === 5) return 'looks_six';
          if (value === 6) return 'looks_one';
        } else if (btnType === 2 && direction === 1) {
          if (value === 1) return 'looks_two';
          if (value === 2) return 'looks_three';
          if (value === 3) return 'looks_four';
          if (value === 4) return 'looks_one';
        } else {
          if (value === 1) return 'looks_two';
          if (value === 2) return 'looks_one';
        }
      } else {
        if (widgetType === 'analysis') {
          if (value === 1) return 'looks_one';
          if (value === 2) return 'looks_two';
          if (value === 3) return 'looks_three';
          if (value === 4) return 'looks_four';
          if (value === 5) return 'looks_five';
          if (value === 6) return 'looks_six';
        } else {
          if (value === 1) return 'looks_one';
          if (value === 2) return 'looks_two';
          if (value === 3) return 'looks_three';
          if (value === 4) return 'looks_four';
        }
      }
    }
    return icon;
  };

  const renderItem = (toolItem, onClick) => {
    const { icon, type, tip, renderType } = toolItem;
    if (renderType == 'li') {
      return (
        <Tooltip title={getTip(type, tip)} placement="bottom">
          <li
            className={cx(type, { switchButton: isSwitchButton(type) })}
            key={type}
            onClick={() => {
              onClick && onClick();
              handleToolClick(type);
            }}
          >
            <i className={`icon-${getIcon(type, icon)} Font18 current`}></i>
            {isSwitchButton(type) && <i className={`icon-${getIcon(type, icon, true)} Font18 next`}></i>}
          </li>
        </Tooltip>
      );
    } else {
      return (
        <Menu.Item
          key={type}
          className={`toolItem-${type}`}
          onClick={() => {
            if (onClick) {
              onClick();
            } else {
              handleToolClick(type);
            }
          }}
        >
          <div className="flexRow valignWrapper">
            <Icon className="Gray_9e Font18 mLeft5 mRight5" icon={icon} />
            <span>{tip}</span>
          </div>
        </Menu.Item>
      );
    }
  };

  const renderTool = toolItem => {
    const { type } = toolItem;
    const highlight = isHighlight(type);
    const itemProps = {
      toolItem,
      widget,
      updateWidget,
      widgetType,
      highlight,
      allComponents,
      handleToolClick,
      renderItem: ({ onClick } = {}) => renderItem(toolItem, onClick),
      handleUpdateDropdownVisible,
    };
    if (type === 'del') {
      return <Delete {...itemProps} />;
    }
    if (type === 'changeFontSize') {
      return <ChangeFontSize toolsWrapRef={ref} {...itemProps} />;
    }
    if (type === 'setting' && ['image'].includes(widgetType)) {
      return <ImageTool {...itemProps} />;
    }
    if (type === 'setting' && ['richText'].includes(widgetType)) {
      return <RichTextTool {...itemProps} />;
    }
    if (type === 'setting' && ['tabs', 'card'].includes(widgetType)) {
      return <ContainerSetting {...itemProps} />;
    }
    if (type === 'cardSetting') {
      const { getChartData, setChartData } = props;
      return <CardSetting {...itemProps} getChartData={getChartData} setChartData={setChartData} />;
    }
    if (type === 'move') {
      return <Move {..._.pick(props, ['appId', 'pageId', 'updatePageInfo'])} {...itemProps} />;
    }
    return itemProps.renderItem();
  };

  return (
    <ToolsWrap
      ref={ref}
      titleVisible={titleVisible}
      layoutType={layoutType}
      className={cx(
        'widgetContentTools disableDrag',
        { show: (activeContainerInfo.sectionId && activeContainerInfo.sectionId === objectId) || dropdownVisible },
        widgetType,
      )}
    >
      {layoutType === 'web' ? (
        <Fragment>
          {renderTool({ ..._.find(WEB_CONTENT_TOOLS, { type: 'setting' }), renderType: 'li' })}
          <Dropdown
            trigger={['hover']}
            placement={placement}
            visible={dropdownVisible}
            onVisibleChange={handleUpdateDropdownVisible}
            overlay={
              <Menu className="chartMenu widgetToolMenu" style={{ width: 180 }}>
                {TOOLS.filter(n => n.type !== 'setting').map(item => renderTool({ ...item, renderType: 'menu' }))}
              </Menu>
            }
          >
            <li className="more">
              <Icon icon="more_horiz" className="Font18 current" />
            </li>
          </Dropdown>
        </Fragment>
      ) : (
        TOOLS.map(item => renderTool({ ...item, renderType: 'li' }))
      )}
    </ToolsWrap>
  );
}
