import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GridLayout from 'react-grid-layout';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { defaultTitleStyles, replaceTitleStyle } from 'src/pages/customPage/components/ConfigSideWrap/util';
import { updateComponents, updatePageInfo } from 'src/pages/customPage/redux/action';
import { getEnumType, getLayout } from 'src/pages/customPage/util';
import { LAYOUT_CONFIG, LayoutContent } from '../../WidgetContent';
import WidgetTools from '../../WidgetContent/WidgetTools';

const ContentWrap = styled.div`
  &.cardStyleWrap {
    border-radius: 6px;
    border: 1px solid var(--widget-color, #fff);
    background-color: var(--widget-color, #fff);
    .tabsHeader {
      position: relative;
      top: -1px;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -1px;
        width: 100%;
        height: 1px;
        background: var(--bg-color, #e6e6e6);
      }
    }
  }
  &.lucencyStyleWrap {
  }
  &.editableWrap {
    border-radius: 6px;
    border: 1px dashed var(--border-color);
    .tabsHeader {
      position: relative;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -1px;
        width: 100%;
        height: 0;
        border-bottom: 1px dashed var(--border-color);
      }
    }
  }
  &.activeWrap {
    border-color: #1677ff;
    // overflow: hidden;
  }
  .tabsHeader {
    padding: 0 12px 0;
    margin: 0 0 5px 0;
    overflow-x: auto;
    overflow-y: hidden;
    .tab {
      color: var(--widget-title-color);
      padding: 12px 10px 6px;
      margin-right: 10px;
      white-space: pre;
      &.active,
      &:hover {
        position: relative;
        margin-bottom: 3px;
        &::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -3px;
          width: 100%;
          height: 3px;
          background: var(--app-primary-color) !important;
        }
      }
      &.active {
        color: var(--app-primary-color);
        &::after {
          opacity: 1 !important;
        }
      }
      &:hover {
        &::after {
          opacity: 0.4;
        }
      }
    }
    .cardName {
      color: var(--widget-title-color);
    }
  }
  .cardsHeader {
    margin: 0;
    padding-top: 12px;
    &::after {
      content: none !important;
    }
  }
  .tabsBody {
    position: relative;
    .overflowHidden {
      overflow: hidden;
    }
    .overflowYAuto {
      overflow-y: auto;
    }
    .bodyContent {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
  .widgetContent {
    &.richText > .flex {
      height: 100%;
    }
    &.solidBorder {
      border: 1px solid var(--bg-color, #e6e6e6);
    }
    &.dashedBorder {
      border: 1px dashed var(--bg-color, #e6e6e6);
    }
  }
`;

export const Tabs = props => {
  const { ids, editable, themeColor, adjustScreen = false, isMobile, widget, setWidget } = props;
  const { layoutType, components, customPageConfig = {}, activeContainerInfo = {} } = props;
  const { type, componentConfig = {}, config = {} } = widget;
  const { name, tabs = [], showType = 1, showBorder = true, showName = true } = componentConfig;
  const objectId = _.get(config, 'objectId');
  const [currentTab, setCurrentTab] = useState(_.get(tabs[0], 'id'));
  const isDark = customPageConfig.pageStyleType === 'dark';
  const titleStyles = customPageConfig.titleStyles || defaultTitleStyles;
  const isTabs = type === 9 || type === 'tabs';
  const isMobileLayout = isMobile || layoutType === 'mobile';
  const tabComponents = components
    .filter(c => c.sectionId === objectId && (isTabs ? c.tabId === currentTab : true))
    .filter(c => (isMobileLayout ? _.get(c, 'mobile.visible') : true));
  const displayRefs = [];
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [WidgetDisplay, setWidgetDisplay] = useState(null);

  useEffect(() => {
    if (isMobile) {
      import('mobile/CustomPage/WidgetDisplay').then(component => {
        setWidgetDisplay(component);
      });
    } else {
      import('../../WidgetContent/WidgetDisplay').then(component => {
        setWidgetDisplay(component);
      });
    }
  }, []);

  useEffect(() => {
    if (!_.find(tabs, { id: currentTab })) {
      setCurrentTab(_.get(tabs[0], 'id'));
    }
  }, [tabs]);

  useEffect(() => {
    if (isTabs) {
      const filterComponents = components.filter(c => c.type === 6);
      if (isMobile) {
        props.updateLoadFilterComponentCount(filterComponents.length);
      } else {
        props.updatePageInfo({
          loadFilterComponentCount: filterComponents.length,
        });
      }
    }
  }, [currentTab]);

  useEffect(() => {
    const handleResize = () => {
      if (elementRef.current) {
        setWidth(elementRef.current.offsetWidth);
      }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }
    return () => {
      if (elementRef.current) {
        resizeObserver.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    handleLayoutChange(getLayout(tabComponents, layoutType));
  }, [showName]);

  const getLayoutConfig = () => {
    const config = LAYOUT_CONFIG[layoutType];
    const wrap = isTabs
      ? document.querySelector(`.tabs-${objectId} .tabsBody`)
      : document.querySelector(`.card-${objectId} .tabsBody`);
    const data = {
      ...config,
      width: width || (wrap ? wrap.clientWidth : undefined),
    };
    if (adjustScreen) {
      const maxH = _.max(tabComponents.map(item => _.get(item, ['web', 'layout'])).map(layout => layout.h + layout.y));
      return {
        ...data,
        rowHeight: wrap ? (wrap.offsetHeight - 20) / maxH - 10 : undefined,
      };
    }
    return data;
  };

  const handleLayoutChange = layouts => {
    const res = tabComponents.map((c, index) => {
      const data = layouts[index];
      return {
        ...c,
        [layoutType]: {
          ...c[layoutType],
          layout: _.pick(data, ['x', 'y', 'w', 'h', 'minW', 'minH']),
        },
      };
    });
    const getThresholdValue = () => {
      if (layoutType === 'web') {
        if (isTabs) {
          return 3;
        } else {
          return showName ? 2.5 : 1;
        }
      } else {
        return 1.5;
      }
    };
    const maxH =
      _.max(res.map(item => _.get(item, [layoutType, 'layout'])).map(layout => layout.h + layout.y)) +
      getThresholdValue();
    const newComponents = components.map(c => {
      if (c.id === widget.id && [9, 10, 'tabs', 'card'].includes(c.type) && maxH) {
        if (layoutType === 'web' && c.web && c.web.layout) {
          c.web.layout.h = maxH;
          c.web.layout.minH = maxH;
          c.web.layout.maxH = maxH;
        }
        if (layoutType === 'mobile' && c.mobile && c.mobile.layout) {
          c.mobile.layout.h = maxH;
          c.mobile.layout.minH = maxH;
          c.mobile.layout.maxH = maxH;
        }
      }
      return (
        _.find(
          res,
          n => (isTabs ? n.tabId === c.tabId : n.sectionId === c.sectionId) && (n.id || n.uuid) === (c.id || c.uuid),
        ) || c
      );
    });
    props.updateComponents(newComponents);
  };

  const layout = getLayout(tabComponents, layoutType);

  return (
    <ContentWrap
      className={cx('flexColumn h100', {
        cardStyleWrap: showType === 2,
        lucencyStyleWrap: !editable && showType === 1,
        editableWrap: editable && showType === 1,
        activeWrap: editable && activeContainerInfo.sectionId === objectId,
      })}
      style={{
        '--app-primary-color': themeColor,
        '--border-color': isDark ? '#e6e6e633' : '#bdbdbd',
        '--hover-bg-color': isDark ? '#f5f5f533' : '#f5f5f5',
      }}
    >
      <div
        className={cx('tabsHeader flexRow', {
          cardsHeader: !isTabs,
          hide: !isTabs && !showName,
          justifyContentCenter: titleStyles.textAlign === 'center',
        })}
      >
        {tabs.length ? (
          tabs.map(tab => (
            <div
              className={cx('tab disableDrag Font15 bold pointer', `tab-${tab.id}`, { active: tab.id === currentTab })}
              onClick={() => {
                setCurrentTab(tab.id);
              }}
            >
              {tab.name}
            </div>
          ))
        ) : (
          <div
            className="cardName"
            style={{
              ...replaceTitleStyle(titleStyles, themeColor),
            }}
          >
            {name}
          </div>
        )}
      </div>
      <div
        className={cx('tabsBody flex', {
          overflowYAuto: adjustScreen ? true : isMobileLayout,
          // overflowHidden: adjustScreen ? false : !isMobileLayout,
          disableDrag: isTabs || (!isTabs && showName),
        })}
        ref={elementRef}
      >
        {!tabComponents.length && editable && (
          <div className="flexRow alignItemsCenter justifyContentCenter w100 h100 Font15 Gray_75">
            {_l('添加或移动组件')}
          </div>
        )}
        <div className="bodyContent">
          <GridLayout
            className="layout"
            layout={layout}
            isDraggable={editable}
            isResizable={editable}
            draggableCancel=".childrenDisableDrag,.chartWrapper .drag"
            onResizeStop={(layout, oldItem = {}) => {
              const index = _.findIndex(layout, { i: oldItem.i });
              const getData = _.get(displayRefs[index], ['getData']);
              if (getData && typeof getData === 'function') {
                getData();
              }
            }}
            onLayoutChange={handleLayoutChange}
            {...getLayoutConfig()}
          >
            {tabComponents.map((widget, index) => {
              const { type } = widget;
              const { titleVisible } = false;
              const enumType = getEnumType(type);
              return (
                <LayoutContent key={widget.id || index} className={cx('resizableWrap', { disableDrag: !isTabs })}>
                  <WidgetTools
                    ids={ids}
                    enumType={enumType}
                    editable={editable}
                    layoutType={layoutType}
                    iconColor={themeColor}
                    components={components}
                    widget={widget}
                    setWidget={setWidget}
                  />
                  <div
                    className={cx('widgetContent', enumType, layoutType, {
                      haveTitle: titleVisible,
                      iframeNoneEvent: enumType === 'embedUrl' && editable,
                      solidBorder: showType === 2 && showBorder,
                      dashedBorder: showType === 2 && !showBorder && editable,
                    })}
                    style={{
                      backgroundColor: customPageConfig.widgetBgColor,
                    }}
                  >
                    <div className="flex">
                      {WidgetDisplay &&
                        (isMobile ? (
                          <WidgetDisplay.default
                            ids={ids}
                            widget={widget}
                            pageConfig={customPageConfig}
                            pageComponents={components}
                            componentType={enumType}
                            apk={props.apk}
                          />
                        ) : (
                          <WidgetDisplay.default
                            ids={ids}
                            widget={widget}
                            setWidget={setWidget}
                            editingWidget={props.editingWidget}
                            isCharge={props.isCharge}
                            config={customPageConfig}
                            themeColor={themeColor}
                            isLock={props.isLock}
                            permissionType={props.permissionType}
                            projectId={props.projectId}
                            editable={editable}
                            layoutType={layoutType}
                            isFullscreen={false}
                            ref={el => {
                              displayRefs[index] = el;
                            }}
                          />
                        ))}
                    </div>
                  </div>
                </LayoutContent>
              );
            })}
          </GridLayout>
        </div>
      </div>
    </ContentWrap>
  );
};

export default connect(
  state => ({
    activeContainerInfo: state.customPage.activeContainerInfo,
    components: state.customPage.components,
    adjustScreen: state.customPage.adjustScreen,
  }),
  dispatch => bindActionCreators({ updateComponents, updatePageInfo }, dispatch),
)(Tabs);
