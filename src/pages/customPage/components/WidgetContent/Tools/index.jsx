import React, { Fragment, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import { getEnumType } from 'src/utils/domain/customPage/model';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';
import CardSetting from './CardSetting';
import ChangeFontSize from './ChangeFontSize';
import ContainerSetting from './ContainerSetting';
import Delete from './Delete';
import ImageTool from './Image';
import MobileFilter from './MobileFilter';
import useMoveMenuItems from './Move';
import RichTextTool from './RichText';

const WEB_CONTENT_TOOLS = [
  { type: 'setting', icon: 'settings', tip: _l('设置') },
  { type: 'cardSetting', icon: 'card_style', tip: _l('卡片样式') },
  { type: 'insertTitle', icon: 'title', tip: _l('插入标题行') },
  { type: 'copy', icon: 'copy_custom', tip: _l('复制') },
  { type: 'move', icon: 'swap_horiz', tip: _l('移动') },
  { type: 'del', icon: 'recycle', tip: _l('删除') },
];

const MOBILE_CONTENT_TOOLS = [
  { type: 'filter', icon: 'tune' },
  { type: 'insertTitle', icon: 'title', tip: _l('插入标题行') },
  { type: 'switchButtonDisplay', icon: 'looks_one', tip: _l('一行一个') },
  { type: 'changeFontSize', icon: 'text_bold2' },
  { type: 'hideMobile', icon: 'visibility_off', tip: _l('隐藏组件') },
];

const TOOLS_BY_LAYOUT_TYPE = {
  web: WEB_CONTENT_TOOLS,
  mobile: MOBILE_CONTENT_TOOLS,
};

const INTERACTIVE_MENU_TOOL_TYPES = ['cardSetting', 'del'];
const MENU_STYLE = { minWidth: 180 };
const SUB_MENU_POPUP_STYLE = { minWidth: 180 };

const ToolsWrap = styled.div`
  position: absolute;
  z-index: 12;
  top: ${props => (props.$titleVisible ? '40px' : '0')};
  left: auto;
  right: 0px;
  display: flex;
  align-items: center;
  padding: 6px 0;
  background-color: var(--color-background-primary);
  border-radius: 0 0 6px 6px;
  box-shadow: var(--shadow-sm);
  &.tabs,
  &.card,
  &.image,
  &.richText {
    top: 1px;
  }
  .toolItem {
    line-height: 20px;
    padding: 0 8px;
    cursor: pointer;
    color: var(--color-text-secondary);
    &:hover {
      color: var(--color-primary);
    }
    &.del:hover {
      color: var(--color-error);
    }
    &.highlight {
      color: var(--color-primary);
      &.del {
        color: var(--color-error);
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
      border-right: 1px solid var(--color-text-tertiary);
    }
  }
  .changeFontSizePopover {
    width: 250px;
    .hap-input {
      width: 60px;
    }
  }
`;

const getTools = ({ widget, widgetType, layoutType, reportType, containerComponents }) => {
  if (layoutType === 'mobile') {
    const BASE_TOOL = ['insertTitle', 'hideMobile'];
    const TOOL_WHITELIST = {
      analysis: ({ reportType }) =>
        reportTypes.NumberChart === reportType ? BASE_TOOL.concat('switchButtonDisplay', 'changeFontSize') : BASE_TOOL,
      button: () => BASE_TOOL.concat('switchButtonDisplay'),
      tabs: () => ['hideMobile'],
      subsection: () => ['hideMobile'],
      filter: () => BASE_TOOL.concat('filter'),
      '*': () => BASE_TOOL,
    };

    function getAllowedTypes(widgetType, ctx) {
      const rule = TOOL_WHITELIST[widgetType] || TOOL_WHITELIST['*'];
      const list = typeof rule === 'function' ? rule(ctx) : rule;
      return new Set(list);
    }

    function getMobileTools(widget, widgetType, reportType) {
      const ctx = { widget, widgetType, reportType };
      const allowedTypes = getAllowedTypes(widgetType, ctx);
      return MOBILE_CONTENT_TOOLS.filter(item => {
        if (!allowedTypes.has(item.type)) return false;
        if (widget.sectionId && item.type === 'insertTitle') return false;
        return true;
      });
    }

    return getMobileTools(widget, widgetType, reportType);
  } else {
    let pcTools = TOOLS_BY_LAYOUT_TYPE[layoutType].filter(item =>
      widget.sectionId ? item.type !== 'insertTitle' : true,
    );

    if (!['view', 'analysis'].includes(widgetType)) {
      pcTools = pcTools.filter(item => !['cardSetting'].includes(item.type));
    }

    if (['view', 'filter'].includes(widgetType)) {
      const res = containerComponents.length ? ['copy'] : ['move', 'copy'];
      pcTools = pcTools.filter(item => !res.includes(item.type));
    }

    if (['tabs', 'card', 'subsection'].includes(widgetType)) {
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

  const handleUpdateDropdownVisible = (visible, info) => {
    if (info?.source === 'menu') return;
    setDropdownVisible(visible);
  };

  const { items: moveMenuItems, holder: moveMenuHolder } = useMoveMenuItems({
    ..._.pick(props, ['appId', 'pageId', 'updatePageInfo']),
    widgetType,
    widget,
    allComponents,
    handleToolClick,
    handleUpdateDropdownVisible,
  });

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

    if (renderType === 'item') {
      return (
        <div key={type}>
          <Tooltip title={getTip(type, tip)} placement="bottom">
            <div
              className={cx('toolItem', type, { switchButton: isSwitchButton(type) })}
              onClick={() => {
                if (onClick) {
                  onClick();
                } else {
                  handleToolClick(type);
                }
              }}
            >
              <i className={`icon-${getIcon(type, icon)} Font18 current`}></i>
              {isSwitchButton(type) && <i className={`icon-${getIcon(type, icon, true)} Font18 next`}></i>}
            </div>
          </Tooltip>
        </div>
      );
    } else {
      return (
        <div
          key={type}
          className={`flexRow valignWrapper toolItem-${type}`}
          onClick={() => {
            if (onClick) {
              onClick();
            } else {
              handleToolClick(type);
            }
          }}
        >
          <span>{tip}</span>
        </div>
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

    if (type === 'setting' && ['subsection'].includes(widgetType)) {
      return (
        <div
          className="toolItem setting"
          onClick={() => {
            updateWidget({
              widget,
              edit: true,
            });
          }}
        >
          <Icon icon="edit" className="Font18" />
        </div>
      );
    }

    if (type === 'filter' && ['filter'].includes(widgetType)) {
      return <MobileFilter {...itemProps} />;
    }

    if (type === 'cardSetting') {
      const { getChartData, setChartData } = props;
      return <CardSetting {...itemProps} getChartData={getChartData} setChartData={setChartData} />;
    }

    return itemProps.renderItem();
  };

  const menuItems = TOOLS.filter(item => item.type !== 'setting').map(item => {
    if (item.type === 'move') {
      return {
        key: item.type,
        icon: <Icon className="Font18" icon={item.icon} />,
        label: item.tip,
        popupStyle: SUB_MENU_POPUP_STYLE,
        children: moveMenuItems,
      };
    }

    if (INTERACTIVE_MENU_TOOL_TYPES.includes(item.type)) {
      return {
        key: item.type,
        danger: item.type === 'del',
        icon: <Icon className="Font18" icon={item.icon} />,
        label: renderTool({ ...item, renderType: 'menu' }),
      };
    }

    return {
      key: item.type,
      icon: <Icon className="Font18" icon={item.icon} />,
      label: item.tip,
      onClick: () => {
        handleToolClick(item.type);
        setDropdownVisible(false);
      },
    };
  });

  return (
    <Fragment>
      <ToolsWrap
        ref={ref}
        $titleVisible={titleVisible}
        className={cx(
          'widgetContentTools disableDrag',
          { show: (activeContainerInfo.sectionId && activeContainerInfo.sectionId === objectId) || dropdownVisible },
          widgetType,
        )}
      >
        {layoutType === 'web' ? (
          <Fragment>
            {renderTool({ ..._.find(WEB_CONTENT_TOOLS, { type: 'setting' }), renderType: 'item' })}
            {menuItems.length > 1 ? (
              <Dropdown
                trigger={['hover']}
                placement="bottomRight"
                open={dropdownVisible}
                onOpenChange={handleUpdateDropdownVisible}
                menu={{ subMenuOpenDelay: 0.2, items: menuItems, style: MENU_STYLE }}
              >
                <div className="toolItem more">
                  <Icon icon="more_horiz" className="Font18 current" />
                </div>
              </Dropdown>
            ) : (
              renderTool({ ..._.find(WEB_CONTENT_TOOLS, { type: 'del' }), renderType: 'item' })
            )}
          </Fragment>
        ) : (
          TOOLS.map(item => renderTool({ ...item, renderType: 'item' }))
        )}
      </ToolsWrap>
      {moveMenuHolder}
    </Fragment>
  );
}
