import React, { Fragment, useState } from 'react';
import { Divider, Dropdown, Menu } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import PageMove from 'statistics/components/PageMove';

export default props => {
  const { appId, pageId, updatePageInfo } = props;
  const { widgetType, widget, allComponents, handleToolClick, handleUpdateDropdownVisible, renderItem } = props;
  const tabsComponents = allComponents.filter(c => [9, 'tabs'].includes(c.type));
  const cardComponents = allComponents.filter(c => [10, 'card'].includes(c.type));
  const showContainer = !!(tabsComponents.length + cardComponents.length);
  const [moveVisible, setMoveVisible] = useState(false);

  return (
    <Fragment>
      <Dropdown
        trigger={['hover']}
        placement="leftTop"
        overlay={
          <Menu
            className="chartMenu"
            expandIcon={<Icon icon="arrow-right-tip" />}
            subMenuOpenDelay={0.2}
            style={{ width: 180 }}
          >
            {showContainer && (
              <Menu.Item key="tabLabel" disabled={true} className="pLeft16 Gray_9e cursorDefault">
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
                {_.get(c, 'componentConfig.tabs').map(tab => (
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
                  <Icon
                    className={cx(
                      'Font18 mRight5',
                      _.get(c, 'config.objectId') === widget.sectionId ? 'ThemeColor' : 'Gray_9e',
                    )}
                    icon="page_card"
                  />
                  <span className={cx('flex', { ThemeColor: _.get(c, 'config.objectId') === widget.sectionId })}>
                    {_.get(c, 'componentConfig.name')}
                  </span>
                  {_.get(c, 'config.objectId') === widget.sectionId && (
                    <Icon icon="done" className="Font20 ThemeColor" />
                  )}
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
                  handleUpdateDropdownVisible(false);
                  document.querySelector('.widgetToolMenu .toolItem-move').click();
                }}
              >
                <div className="flexRow valignWrapper">
                  <Icon className="Gray_9e Font18 mLeft5 mRight5" icon="swap_horiz" />
                  <span>{_l('移入其他页面')}</span>
                </div>
              </Menu.Item>
            )}
          </Menu>
        }
      >
        {renderItem({ onClick: () => {} })}
      </Dropdown>
      {moveVisible && (
        <PageMove
          dialogClasses="disableDrag"
          appId={appId}
          pageId={pageId}
          reportId={widget.value}
          onSucceed={version => {
            updatePageInfo({ version });
            handleToolClick('move');
          }}
          onCancel={() => {
            setMoveVisible(false);
          }}
        />
      )}
    </Fragment>
  );
};
