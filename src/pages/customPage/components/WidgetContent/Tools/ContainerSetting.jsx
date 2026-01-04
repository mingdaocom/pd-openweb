import React, { Fragment, useEffect, useState } from 'react';
import { Checkbox, Input, Popover, Switch } from 'antd';
import cx from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import { Icon, SortableList } from 'ming-ui';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import { TabsSettingPopover } from './styled.js';

let isEdit = false;
export default props => {
  const { widgetType, highlight, widget, allComponents, toolItem, handleToolClick } = props;
  const { componentConfig = {} } = widget;
  const { type, icon } = toolItem;
  const { name, tabs = [], showType = 1, showBorder = true, showName = true } = componentConfig;
  const [tabNames, setTabNames] = useState({});
  const [popoverVisible, setPopoverVisible] = useState(false);

  const handleChangeConfig = data => {
    handleToolClick(type, {
      componentConfig: {
        ...componentConfig,
        ...data,
      },
    });
  };

  const handleDeleteConfirm = tab => {
    const relevance = allComponents.filter(c => c.tabId === tab.id);
    const name = _l('标签');
    const onOk = () => {
      handleToolClick('delWidgetTab', { tabId: tab.id });
      handleChangeConfig({
        tabs: tabs.filter(n => n.id !== tab.id),
      });
    };
    if (!relevance.length) {
      onOk();
      return;
    }
    DeleteConfirm({
      clickOmitText: true,
      title: <div className="Bold">{_l('删除 “%0”', tab.name)}</div>,
      description: (
        <div>
          <span style={{ color: '#151515', fontWeight: 'bold' }}>{_l('注意:%0下所有配置和数据将被删除。', name)}</span>
          {_l('请务必确认所有应用成员都不再需要此%0后, 再执行此操作。', name)}
        </div>
      ),
      data: [{ text: _l('我确认删除%0和所有数据', name), value: 1 }],
      onOk,
    });
  };

  const renderSortableTab = ({ item, DragHandle, index }) => {
    const handleChangeName = name => {
      handleChangeConfig({
        tabs: tabs.map(n => {
          if (n.id === item.id) {
            return {
              ...n,
              name,
            };
          }
          return n;
        }),
      });
    };
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
            icon="trash"
            className="Gray_bd Font20 pointer"
            onClick={() => {
              handleDeleteConfirm(item);
            }}
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    const app = document.querySelector('#app');
    const checkVisible = event => {
      if (event.target.classList.contains('icon-settings')) {
        return;
      }
      setPopoverVisible(false);
    };
    app.addEventListener('click', checkVisible, false);
    return () => {
      app.removeEventListener('click', checkVisible, false);
    };
  }, []);

  return (
    <Popover
      zIndex={1000}
      placement="bottomLeft"
      overlayClassName="tabsSettingPopover"
      arrowPointAtCenter={true}
      mouseLeaveDelay={0.3}
      overlayInnerStyle={{
        padding: 24,
      }}
      visible={popoverVisible}
      onVisibleChange={visible => {
        if (isEdit) return;
        setPopoverVisible(visible);
      }}
      content={
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
          <div className="flexRow valignWrapper mTop15 mBottom20">
            <div className="bold mRight10">{_l('显示方式')}</div>
            <div className="typeSelect flex flexRow valignWrapper">
              <div
                className={cx('centerAlign flex pointer Gray_75', { active: showType === 1 })}
                onClick={() => handleChangeConfig({ showType: 1 })}
              >
                {_l('透明')}
              </div>
              <div
                className={cx('centerAlign flex pointer Gray_75', { active: showType === 2 })}
                onClick={() => handleChangeConfig({ showType: 2 })}
              >
                {_l('卡片')}
              </div>
            </div>
          </div>
          {showType === 2 && (
            <div
              className={cx('flexRow valignWrapper', {
                mTop15: ['card'].includes(widgetType),
                mBottom20: ['tabs'].includes(widgetType),
              })}
            >
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
                renderItem={options => renderSortableTab({ ...options })}
                onSortEnd={newItems => {
                  handleChangeConfig({
                    tabs: newItems,
                  });
                }}
              />
              {tabs.length < 20 && (
                <div
                  className="flexRow valignWrapper pointer ThemeColor mTop5"
                  onClick={() => {
                    handleChangeConfig({
                      tabs: tabs.concat({
                        id: uuidv4(),
                        name: _l('标签页%0', tabs.length + 1),
                      }),
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
      }
      getPopupContainer={() => document.body}
    >
      <li className={cx(type, { highlight })} key={type}>
        <i className={`icon-${icon} Font18`}></i>
      </li>
    </Popover>
  );
};
