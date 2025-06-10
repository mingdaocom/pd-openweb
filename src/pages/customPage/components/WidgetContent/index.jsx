import React, { useState, useRef, Fragment, useLayoutEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import styled from 'styled-components';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { get, max, throttle } from 'lodash';
import * as actions from '../../redux/action';
import WidgetDisplay from './WidgetDisplay';
import { getEnumType, getLayout } from '../../util';
import WidgetTools from './WidgetTools';
import WidthProvider from './widthProvider';
import { COLUMN_HEIGHT } from '../../config';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';

const AutoWidthGridLayout = WidthProvider(GridLayout);

export const LayoutContent = styled.div`
  &:hover {
    z-index: 1;
    >.widgetContentTools {
      visibility: visible;
    }
  }
  &[richText-offset-top] {
    top: 25px;
  }
  .widgetContentTools, &.resizing .widgetContentTools {
    visibility: hidden;
  }
  .widgetContent {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 6px;
    overflow: auto;
    transition: box-shadow 0.2s;
    // box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    &.richText {
      overflow: inherit;
      background: transparent !important;
      .editorNull {
        border: none;
      }
    }
    &.analysis, &.embedUrl {
      // overflow: visible;
    }
    &.filter {
      justify-content: center;
      padding: 0 10px;
    }
    &.view.widgetIsDark {
      .SingleViewHeader {
        border-color: transparent;
      }
      .customWidgetIframe {
        border: none;
      }
    }
    &.filter.mobile {
      background-color: transparent;
      box-shadow: none;
      padding: 0;
      +span.react-resizable-handle {
        display: none;
      }
    }
    &.tabs, &.image {
      background: transparent !important;
      >div {
        padding: 0;
      }
    }
    &.card {
      box-shadow: none !important;
      .card {
        border-radius: 0 !important;
        background-color: transparent !important;
      }
      >div {
        padding: 0;
      }
    }
    &:hover {
      // box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.20);
    }
    &.haveTitle {
      height: calc(100% - 40px);
    }
    .g2-tooltip {
      position: fixed !important;
      z-index: 10 !important;
    }
  }
  .iframeNoneEvent iframe {
    pointer-events: none;
  }
  .componentTitle {
    color: var(--title-color);
    width: 100%;
    height: 32px;
    line-height: 32px;
    margin-bottom: 8px;
    font-size: 16px;
    input {
      border: none;
      height: 32px;
      line-height: 32px;
      background: transparent;
      min-width: 60px;
      max-width: 100%;
      width: 100%;
      box-sizing: border-box;
      transition: width border-bottom 0.2s;
      padding-right: 16px;
      font-size: 16px;
      &::placeholder {
        color: #bdbdbd;
      }
      &:focus {
        border-bottom: 2px solid #2196f3;
      }
    }
  }
  .titleSign {
    width: 5px;
    height: 24px;
    margin: 0 10px 0 0;
    border-radius: 3px;
  }
  .componentsWrap {
    padding: 0 0 4px 0;
    height: 100%;
  }
  .react-resizable-handle {
    z-index: 1;
  }
`;

export const LAYOUT_CONFIG = {
  web: {
    rowHeight: COLUMN_HEIGHT,
    margin: [10, 10],
    cols: 48,
  },
  mobile: {
    rowHeight: 40,
    margin: [10, 10],
    cols: 2,
  },
};

function WidgetContent(props) {
  const {
    layoutType = 'web',
    ids = {},
    editable = true,
    chatVisible = false,
    sheetListVisible = false,
    updateLayout = _.noop,
    addRecord = _.noop,
    editingWidget = {},
    config = {},
    setWidget = _.noop,
    isFullscreen = false,
    adjustScreen,
    widgetIsDark,
    apk,
    isCharge,
    appPkg
  } = props;
  const components = props.components.filter(c => !c.sectionId);
  const [windowHeight, setHeight] = useState(window.innerHeight);
  const displayRefs = [];

  useLayoutEffect(() => {
    const handle = () => {
      const height = window.innerHeight;
      if (Math.abs(height - windowHeight) >= COLUMN_HEIGHT) {
        setHeight(height);
      }
    };
    window.addEventListener('resize', throttle(handle));
  }, []);

  const getLayoutConfig = () => {
    const config = LAYOUT_CONFIG[layoutType];
    const $wrap = document.getElementById('componentsWrap');
    if (layoutType !== 'web' || !adjustScreen || !$wrap) return config;
    const maxH = max(components.map(item => get(item, ['web', 'layout'])).map(layout => layout.h + layout.y));
    return { ...config, rowHeight: ((isFullscreen ? window.screen.height : $wrap.offsetHeight) - 10) / maxH - 10 };
  };

  const layout = getLayout(components, layoutType);

  return (
    <Fragment>
      <AutoWidthGridLayout
        className="layout"
        chatVisible={chatVisible}
        sheetListVisible={sheetListVisible}
        isDraggable={editable}
        isResizable={editable}
        isFullscreen={isFullscreen}
        layoutType={layoutType}
        draggableCancel=".disableDrag,.chartWrapper .drag"
        onResizeStop={(layout, oldItem = {}, newItem = {}) => {
          const index = _.findIndex(layout, { i: oldItem.i });
          const getData = _.get(displayRefs[index], ['getData']);
          if (getData && typeof getData === 'function') {
            getData();
          }
        }}
        layout={layout}
        onLayoutChange={layouts => {
          setTimeout(() => updateLayout({ layouts, layoutType, components, adjustScreen }))
        }}
        {...getLayoutConfig()}
      >
        {components.map((widget, index) => {
          const { id, type } = widget;
          const { titleVisible } = widget[layoutType] || {};
          const enumType = getEnumType(type);
          const iconColor = appPkg.iconColor || apk.iconColor;
          return (
            <LayoutContent key={`${id || index}`} className="resizableWrap">
              <WidgetTools
                ids={ids}
                enumType={enumType}
                editable={editable}
                layoutType={layoutType}
                iconColor={iconColor}
                components={components}
                widget={widget}
                setWidget={setWidget}
              />
              <div
                className={cx('widgetContent', enumType, layoutType, {
                  haveTitle: titleVisible,
                  iframeNoneEvent: enumType === 'embedUrl' && editable,
                  widgetIsDark
                })}
                style={{
                  backgroundColor: config.widgetBgColor
                }}
              >
                <WidgetDisplay
                  widget={widget}
                  setWidget={setWidget}
                  editingWidget={editingWidget}
                  ids={ids}
                  isCharge={isCharge && !(appPkg.isLock || appPkg.permissionType === APP_ROLE_TYPE.RUNNER_ROLE)}
                  config={config}
                  themeColor={iconColor}
                  isLock={appPkg.isLock}
                  permissionType={appPkg.permissionType}
                  projectId={appPkg.projectId || apk.projectId}
                  ref={el => {
                    displayRefs[index] = el;
                  }}
                  editable={editable}
                  layoutType={layoutType}
                  isFullscreen={isFullscreen}
                  addRecord={addRecord}
                />
              </div>
            </LayoutContent>
          );
        })}
      </AutoWidthGridLayout>
    </Fragment>
  );
}

export default errorBoundary(
  connect(
    state => ({
      chatVisible: state.chat.visible,
      sheetListVisible: state.sheetList.isUnfold,
      isCharge: state.sheet.isCharge || state.appPkg.permissionType === 2,
      appPkg: state.appPkg,
    }),
    dispatch => bindActionCreators(actions, dispatch),
  )(WidgetContent),
);
