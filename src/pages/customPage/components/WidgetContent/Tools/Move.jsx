import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import PageMove from 'statistics/components/PageMove';

const getComponentKey = component => component.id || component.uuid;

export default function useMoveMenuItems(props) {
  const { appId, pageId, updatePageInfo } = props;
  const { widgetType, widget, allComponents, handleToolClick, handleUpdateDropdownVisible } = props;
  const tabsComponents = allComponents.filter(c => [9, 'tabs'].includes(c.type));
  const cardComponents = allComponents.filter(c => [10, 'card'].includes(c.type));
  const showContainer = !!(tabsComponents.length + cardComponents.length);
  const [moveVisible, setMoveVisible] = useState(false);
  const items = [
    showContainer && {
      key: 'move-container-label',
      disabled: true,
      className: 'textTertiary cursorDefault',
      label: _l('移入容器'),
    },
    ...tabsComponents.map(c => ({
      key: `move-tabs-${getComponentKey(c)}`,
      label: _.get(c, 'componentConfig.name'),
      icon: <Icon className="Font18" icon="tab_page" />,
      popupOffset: [0, 0],
      children: _.get(c, 'componentConfig.tabs', []).map(tab => ({
        key: `move-tab-${getComponentKey(c)}-${tab.id}`,
        style: { minWidth: 180 },
        label: (
          <div className="flexRow valignWrapper">
            <span className={cx('flex', { colorPrimary: tab.id === widget.tabId })}>{tab.name}</span>
            {tab.id === widget.tabId && <Icon icon="done" className="Font20 colorPrimary" />}
          </div>
        ),
        onClick: () => {
          handleUpdateDropdownVisible(false);
          if (tab.id === widget.tabId) {
            return;
          }

          handleToolClick('moveIn', {
            sectionId: _.get(c, 'config.objectId'),
            tabId: tab.id,
          });
        },
      })),
    })),
    ...cardComponents.map(c => {
      const isCurrent = _.get(c, 'config.objectId') === widget.sectionId;

      return {
        key: `move-card-${getComponentKey(c)}`,
        icon: <Icon className={cx('Font18', { colorPrimary: isCurrent })} icon="page_card" />,
        label: (
          <div className="flexRow valignWrapper">
            <span className={cx('flex', { colorPrimary: _.get(c, 'config.objectId') === widget.sectionId })}>
              {_.get(c, 'componentConfig.name')}
            </span>
            {isCurrent && <Icon icon="done" className="Font20 colorPrimary" />}
          </div>
        ),
        onClick: () => {
          handleUpdateDropdownVisible(false);
          handleToolClick('moveIn', {
            sectionId: _.get(c, 'config.objectId'),
            tabId: undefined,
          });
        },
      };
    }),
    (showContainer ? widget.sectionId || widgetType === 'analysis' : showContainer) && {
      key: 'move-divider',
      type: 'divider',
      className: 'mTop5 mBottom5',
    },
    widget.sectionId && {
      key: 'move-out',
      icon: <Icon className="Font18" icon="move_out" />,
      label: _l('移出容器'),
      onClick: () => {
        handleUpdateDropdownVisible(false);
        handleToolClick('moveOut', {
          sectionId: undefined,
          tabId: undefined,
        });

        setTimeout(() => {
          const wrap = document.querySelector('#componentsWrap');

          if (wrap) {
            wrap.scrollTop += 1;
          }
        }, 100);
      },
    },
    widgetType === 'analysis' && {
      key: 'move-page',
      icon: <Icon className="Font18" icon="swap_horiz" />,
      label: _l('移入其他页面'),
      onClick: () => {
        setMoveVisible(true);
        handleUpdateDropdownVisible(false);
      },
    },
  ].filter(Boolean);

  const holder = moveVisible ? (
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
  ) : null;

  return { items, holder };
}
