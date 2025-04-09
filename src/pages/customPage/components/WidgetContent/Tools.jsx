import React, { useRef, useState, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { Tooltip, Popover, Slider, Input, Switch, Dropdown, Menu, Checkbox, Divider } from 'antd';
import { Icon, SortableList } from 'ming-ui';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import { useToggle } from 'react-use';
import { getEnumType } from '../../util';
import { reportTypes } from 'statistics/Charts/common';
import PageMove from 'statistics/components/PageMove';
import { formatNumberFromInput } from 'src/util';
import { v4 as uuidv4 } from 'uuid';
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
  z-index: 2;
  top: ${props => props.titleVisible ? '40px' : '0'};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  padding: 6px 0;
  background-color: #fff;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.24);
  &.tabs, &.card {
    left: auto;
    right: ${props => props.layoutType === 'web' ? '-30px' : '-40px'};
  }
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

const TabsSettingPopover = styled.div`
  width: 300px;
  .ant-input {
    height: 36px;
    border-radius: 4px !important;
    box-shadow: none !important;
  }
  .typeSelect {
    font-size: 13px;
    border-radius: 3px;
    width: max-content;
    padding: 3px;
    background-color: #eff0f0;
    >div {
      height: 25px;
      line-height: 25px;
      padding: 0 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .active {
      color: #2196F3 !important;
      border-radius: 3px;
      font-weight: bold;
      background-color: #fff;
    }
  }
  .icon-delete2:hover {
    color: #f44336 !important;
  }
`;

const getTools = ({ widget, widgetType, layoutType, reportType, containerComponents }) => {
  if (layoutType === 'mobile') {
    let mobileTools = _.cloneDeep(MOBILE_BUTTON_TOOLS).filter(item => widget.sectionId ? item.type !== 'insertTitle' : true);;
    if (['button'].includes(widgetType) || (widgetType === 'analysis' && [reportTypes.NumberChart, reportTypes.ProgressChart].includes(reportType))) {
      if (reportTypes.NumberChart !== reportType) {
        mobileTools = mobileTools.filter(n => n.type !== 'changeFontSize');
      }
    } else if (['tabs', 'card'].includes(widgetType)) {
      mobileTools = mobileTools.filter(n => n.type !== 'insertTitle');
    }
    return mobileTools;
  } else {
    let pcTools = _.cloneDeep(TOOLS_BY_LAYOUT_TYPE[layoutType]).filter(item => widget.sectionId ? item.type !== 'insertTitle' : true);
    if (['view', 'filter'].includes(widgetType)) {
      const res = containerComponents.length ? ['copy'] : ['move', 'copy'];
      pcTools = pcTools.filter(item => !res.includes(item.type));
    };
    if (['tabs', 'card'].includes(widgetType)) {
      pcTools = pcTools.filter(item => !['move', 'copy', 'insertTitle'].includes(item.type));
    };
    if (widgetType !== 'analysis' && !containerComponents.length) {
      pcTools = pcTools.filter(item => item.type !== 'move');
    };
    return pcTools;
  }
};

let isEdit = false;
export default function Tools({ appId, pageId, widget, layoutType, handleToolClick, titleVisible, allComponents, updatePageInfo }) {
  const { reportType, config = {} } = widget;
  const [visible, toggle] = useToggle(false);
  const [moveVisible, setMoveVisible] = useState(false);
  const [tabNames, setTabNames] = useState({});
  const [fontSize, setFontSize] = useState(config.mobileFontSize || 15);
  const [popoverVisible, setPopoverVisible] = useState(false);
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
  const containerComponents = allComponents.filter(c => [9, 10, 'tabs', 'card'].includes(c.type));
  const TOOLS = getTools({ widget, widgetType, layoutType, reportType, containerComponents });
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
  const renderTool = ({ icon, type, tip }) => {
    if (type === 'del') {
      if (['tabs', 'card'].includes(widgetType)) {
        const { componentConfig = {} } = widget;
        const handleDeleteConfirm = () => {
          const relevance = allComponents.filter(c => c.sectionId === _.get(widget, 'config.objectId'));
          const name = ['tabs'].includes(widgetType) ? _l('标签') : _l('容器');
          if (!relevance.length) {
            handleToolClick('delTabsWidget');
            return;
          }
          DeleteConfirm({
            clickOmitText: true,
            title: (
              <div className="Bold">{_l('删除 “%0”', componentConfig.name)}</div>
            ),
            description: (
              <div>
                <span style={{ color: '#151515', fontWeight: 'bold' }}>
                  {_l('注意:%0下所有配置和数据将被删除。', name)}
                </span>
                {_l('请务必确认所有应用成员都不再需要此%0后, 再执行此操作。', name)}
              </div>
            ),
            data: [{ text: _l('我确认删除%0和所有数据', name), value: 1 }],
            onOk: () => {
              handleToolClick('delTabsWidget');
            },
          });
        }
        return (
          <Tooltip title={tip} placement="bottom">
            <li
              className={cx(type, { highlight: isHighlight(type) })}
              key={type}
              onClick={e => {
                toggle(true);
                handleDeleteConfirm();
              }}
            >
              <i className={`icon-${icon} Font18`}></i>
            </li>
          </Tooltip>
        );
      } else {
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
                  handleToolClick(type, {
                    config: {
                      ...config,
                      mobileFontSize: value
                    }
                  });
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
                  handleToolClick(type, {
                    config: {
                      ...config,
                      mobileFontSize: value
                    }
                  });
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
    if (type === 'setting' && ['tabs', 'card'].includes(widgetType)) {
      const { componentConfig = {} } = widget;
      const { name, tabs = [], showType = 1, showBorder = true, showName = true } = componentConfig;
      const handleChangeConfig = data => {
        handleToolClick(type, {
          componentConfig: {
            ...componentConfig,
            ...data
          }
        });
      }
      const handleDeleteConfirm = tab => {
        const relevance = allComponents.filter(c => c.tabId === tab.id);
        const name = _l('标签');
        const onOk = () => {
          handleToolClick('delWidgetTab', { tabId: tab.id });
          handleChangeConfig({
            tabs: tabs.filter(n => n.id !== tab.id)
          });
        }
        if (!relevance.length) {
          onOk();
          return;
        }
        DeleteConfirm({
          clickOmitText: true,
          title: (
            <div className="Bold">{_l('删除 “%0”', tab.name)}</div>
          ),
          description: (
            <div>
              <span style={{ color: '#151515', fontWeight: 'bold' }}>
                {_l('注意:%0下所有配置和数据将被删除。', name)}
              </span>
              {_l('请务必确认所有应用成员都不再需要此%0后, 再执行此操作。', name)}
            </div>
          ),
          data: [{ text: _l('我确认删除%0和所有数据', name), value: 1 }],
          onOk
        });
      }
      const renderSortableTab = ({ item, DragHandle, index }) => {
        const handleChangeName = name => {
          handleChangeConfig({
            tabs: tabs.map(n => {
              if (n.id === item.id) {
                return {
                  ...n,
                  name
                }
              }
              return n;
            })
          });
        }
        return (
          <div className="flexRow valignWrapper mTop10 mBottom5" key={item.id}>
            <DragHandle>
              <Icon icon="drag" className="Gray_bd Font20 pointer hoverText" />
            </DragHandle>
            <Input
              className={cx('flex mLeft5 mRight5', `tabInput-${item.id}`)}
              value={tabNames[item.id] || item.name}
              onChange={event => {
                const name = event.target.value.trim().slice(0, 20);
                setTabNames({ [item.id]: name });
                handleChangeName(name);
              }}
              onFocus={() => {
                isEdit = true;
              }}
              onBlur={event => {
                isEdit = false;
                if (!event.target.value) {
                  const name = (widgetType === 'tabs' ? _l('标签页') : _l('卡片')) + (index + 1);
                  handleChangeName(name);
                }
              }}
            />
            {tabs.length > 1 && (
              <Icon
                icon="delete2"
                className="Gray_bd Font20 pointer"
                onClick={() => {
                  handleDeleteConfirm(item);
                }}
              />
            )}
          </div>
        );
      }
      return (
        <Popover
          zIndex={1000}
          placement="bottomLeft"
          overlayClassName="tabsSettingPopover"
          arrowPointAtCenter={true}
          mouseLeaveDelay={0.3}
          overlayInnerStyle={{
            padding: 24
          }}
          visible={popoverVisible}
          onVisibleChange={visible => {
            if (isEdit) return;
            setPopoverVisible(visible);
          }}
          content={(
            <TabsSettingPopover className="flexColumn disableDrag">
              <div className="flexRow valignWrapper mBottom10">
                <div className="bold flex">{_l('名称')}</div>
                {['card'].includes(widgetType) && (
                  <Checkbox checked={showName} onChange={e => handleChangeConfig({ showName: e.target.checked })}>
                    {_l('显示')}
                  </Checkbox>
                )}
              </div>
              <Input
                value={name}
                onChange={e => handleChangeConfig({ name: e.target.value.trim().slice(0, 20) })}
                onFocus={() => {
                  isEdit = true;
                }}
                onBlur={e => {
                  isEdit = false;
                  if (!e.target.value) {
                    handleChangeConfig({ name: widgetType === 'tabs' ? _l('标签页') : _l('卡片') });
                  }
                }}
              />
              {['tabs'].includes(widgetType) && (
                <div className="flexRow valignWrapper mTop15 mBottom20">
                  <div className="bold mRight10">{_l('显示方式')}</div>
                  <div className="typeSelect flex flexRow valignWrapper">
                    <div className={cx('centerAlign flex pointer Gray_75', { active: showType === 1 })} onClick={() => handleChangeConfig({ showType: 1 })}>{_l('透明')}</div>
                    <div className={cx('centerAlign flex pointer Gray_75', { active: showType === 2 })} onClick={() => handleChangeConfig({ showType: 2 })}>{_l('卡片')}</div>
                  </div>
                </div>
              )}
              {showType === 2 && (
                <div className={cx('flexRow valignWrapper', { mTop15: ['card'].includes(widgetType), mBottom20: ['tabs'].includes(widgetType) })}>
                  <div className="bold flex">{_l('显示组件边框')}</div>
                  <div className="mLeft10">
                    <Switch checked={showBorder} onChange={value => handleChangeConfig({ showBorder: value })} />
                  </div>
                </div>
              )}
              {['tabs'].includes(widgetType) && (
                <Fragment>
                  <div className="bold mBottom3">{_l('标签页设置')}</div>
                  <SortableList
                    useDragHandle
                    items={tabs}
                    itemKey="id"
                    renderItem={(options) => renderSortableTab({ ...options })}
                    onSortEnd={newItems => {
                      handleChangeConfig({
                        tabs: newItems
                      });
                    }}
                  />
                  {tabs.length < 5 && (
                    <div
                      className="flexRow valignWrapper pointer ThemeColor mTop5"
                      onClick={() => {
                        handleChangeConfig({
                          tabs: tabs.concat({
                            id: uuidv4(),
                            name: _l('标签页%0', tabs.length + 1)
                          })
                        });
                      }}
                    >
                      <Icon icon="add" />
                      {_l('添加标签页')}
                    </div>
                  )}
                </Fragment>
              )}
            </TabsSettingPopover>
          )}
          getPopupContainer={() => document.body}
        >
          <li
            className={cx(type, { highlight: isHighlight(type) })}
            key={type}
          >
            <i className={`icon-${icon} Font18`}></i>
          </li>
        </Popover>
      );
    }
    if (type === 'move') {
      const tabsComponents = allComponents.filter(c => [9, 'tabs'].includes(c.type));
      const cardComponents = allComponents.filter(c => [10, 'card'].includes(c.type));
      const showContainer = !!(tabsComponents.length + cardComponents.length);
      return (
        <Dropdown
          trigger={['click']}
          placement="bottomLeft"
          overlay={(
            <Menu className="chartMenu chartOperate" expandIcon={<Icon icon="arrow-right-tip" />} subMenuOpenDelay={0.2} style={{ width: 180 }}>
              {showContainer && (
                <Menu.Item
                  key="tabLabel"
                  disabled={true}
                  className="pLeft16 Gray_9e cursorDefault"
                >
                  {_l('移入容器')}
                </Menu.Item>
              )}
              {tabsComponents.map(c => (
                <Menu.SubMenu
                  key={c.id || c.uuid}
                  style={{ width: 180 }}
                  popupClassName="chartMenu"
                  title={_.get(c, 'componentConfig.name')}
                  icon={<Icon className="Gray_9e Font18 mRight5" icon="tab_page" />}
                  popupOffset={[0, 0]}
                >
                  {(_.get(c, 'componentConfig.tabs')).map(tab => (
                    <Menu.Item
                      key={tab.id}
                      style={{ width: 180 }}
                      className="pLeft10"
                      onClick={() => {
                        if (tab.id === widget.tabId) {
                          return;
                        }
                        handleToolClick('moveIn', {
                          sectionId: _.get(c, 'config.objectId'),
                          tabId: tab.id,
                        });
                      }}
                    >
                      <div className="flexRow valignWrapper">
                        <span className={cx('flex', { ThemeColor: tab.id === widget.tabId })}>{tab.name}</span>
                        {tab.id === widget.tabId && <Icon icon="done" className="Font20 ThemeColor" />}
                      </div>
                    </Menu.Item>
                  ))}
                </Menu.SubMenu>
              ))}
              {cardComponents.map(c => (
                <Menu.Item
                  key={c.id || c.uuid}
                  style={{ width: 180 }}
                  className="pLeft10 pRight10"
                  onClick={() => {
                    handleToolClick('moveIn', {
                      sectionId: _.get(c, 'config.objectId'),
                      tabId: undefined,
                    });
                  }}
                >
                  <div className="flexRow valignWrapper pLeft5">
                    <Icon className={cx('Font18 mRight5', _.get(c, 'config.objectId') === widget.sectionId ? 'ThemeColor' : 'Gray_9e')} icon="page_card" />
                    <span className={cx('flex', { ThemeColor: _.get(c, 'config.objectId') === widget.sectionId })}>{_.get(c, 'componentConfig.name')}</span>
                    {_.get(c, 'config.objectId') === widget.sectionId && <Icon icon="done" className="Font20 ThemeColor" />}
                  </div>
                </Menu.Item>
              ))}
              {(showContainer ? widget.sectionId || widgetType === 'analysis' : showContainer) && (
                <Divider className="mTop5 mBottom5" />
              )}
              {widget.sectionId && (
                <Menu.Item
                  key="moveOut"
                  data-event="setting"
                  className="pLeft10"
                  onClick={() => {
                    handleToolClick('moveOut', {
                      sectionId: undefined,
                      tabId: undefined,
                    });
                    setTimeout(() => {
                      const wrap = document.querySelector('#componentsWrap');
                      wrap.scrollTop = wrap.scrollTop + 1;
                    }, 100);
                  }}
                >
                  <div className="flexRow valignWrapper">
                    <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="move_out" />
                    <span>{_l('移出容器')}</span>
                  </div>
                </Menu.Item>
              )}
              {widgetType === 'analysis' && (
                <Menu.Item
                  key="movePage"
                  className="pLeft10"
                  onClick={() => {
                    setMoveVisible(true);
                  }}
                >
                  <div className="flexRow valignWrapper">
                    <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="swap_horiz" />
                    <span>{_l('移入其他页面')}</span>
                  </div>
                </Menu.Item>
              )}
            </Menu>
          )}
        >
          <Tooltip title={tip} placement="bottom">
            <li
              className={cx(type, { highlight: isHighlight(type) })}
              key={type}
            >
              <i className={`icon-${icon} Font18`}></i>
            </li>
          </Tooltip>
        </Dropdown>
      );
    }
    return (
      <Tooltip title={getTip(type, tip)} placement="bottom">
        <li
          className={cx(type, { highlight: isHighlight(type), switchButton: isSwitchButton(type) })}
          key={type}
          onClick={e => {
            handleToolClick(type);
          }}
        >
          <i className={`icon-${getIcon(type, icon)} Font18 current`}></i>
          {isSwitchButton(type) && <i className={`icon-${getIcon(type, icon, true)} Font18 next`}></i>}
        </li>
      </Tooltip>
    );
  };

  useEffect(() => {
    const app = document.querySelector('#app');
    const checkVisible = event => {
      if (event.target.classList.contains('icon-settings')) {
        return;
      }
      setPopoverVisible(false);
    }
    app.addEventListener('click', checkVisible, false);
    return () => {
      app.removeEventListener('click', checkVisible, false);
    }
  }, []);

  return (
    <ToolsWrap ref={ref} titleVisible={titleVisible} layoutType={layoutType} className={cx('widgetContentTools disableDrag', widgetType)}>
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
