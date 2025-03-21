import React, { useState, memo, useRef, useEffect, Fragment, useLayoutEffect } from 'react';
import { string } from 'prop-types';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import styled from 'styled-components';
import cx from 'classnames';
import reportConfig from 'statistics/api/reportConfig';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import update from 'immutability-helper';
import { get, max, throttle } from 'lodash';
import * as actions from '../../redux/action';
import WidgetDisplay from './WidgetDisplay';
import { getEnumType, getDefaultLayout, reportCountLimit } from '../../util';
import { getTranslateInfo } from 'src/util';
import Tools from './Tools';
import WidthProvider from './widthProvider';
import { COLUMN_HEIGHT } from '../../config';
import { v4 as uuidv4 } from 'uuid';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';

const AutoWidthGridLayout = WidthProvider(GridLayout);

const LayoutContent = styled.div`
  &:hover {
    z-index: 1;
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
    &.filter.mobile {
      background-color: transparent;
      box-shadow: none;
      padding: 0;
      +span.react-resizable-handle {
        display: none;
      }
    }
    &:hover {
      // box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.20);
    }
    &.haveTitle {
      height: calc(100% - 40px);
    }
    .widgetContentTools {
      visibility: hidden;
    }
    &:hover {
      .widgetContentTools {
        visibility: visible;
      }
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

const LAYOUT_CONFIG = {
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
    components = [],
    copyWidget = _.noop,
    delWidget = _.noop,
    updateWidgetVisible = _.noop,
    updateWidget = _.noop,
    updateLayout = _.noop,
    insertTitle = _.noop,
    addRecord = _.noop,
    updatePageInfo = _.noop,
    editingWidget = {},
    config = {},
    setWidget = _.noop,
    isFullscreen = false,
    adjustScreen,
    apk,
    isCharge,
    appPkg
  } = props;
  const [loading, setLoading] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [windowHeight, setHeight] = useState(window.innerHeight);
  const $input = useRef(null);
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

  const handleToolClick = (clickType, { widget, index, result }) => {
    switch (clickType) {
      case 'setting':
        setWidget(widget);
        break;
      case 'move':
      case 'del':
        delWidget(widget);
        break;
      case 'insertTitle':
        insertTitle({ widget, visible: !widget[layoutType].titleVisible, layoutType });
        setEdit(!widget[layoutType].titleVisible);
        break;
      case 'copy':
        if (getEnumType(widget.type) === 'analysis') {
          // 限制单个页面添加报表数量
          if (!reportCountLimit(components)) return;

          setLoading(true);
          if (loading) return;
          reportConfig
            .copyReport({ reportId: widget.value, sourceType: 1 })
            .then(data => copyWidget({
              ..._.omit(widget, ['id', 'uuid']),
              value: data.reportId,
              layoutType,
              sourceValue: widget.value,
              needUpdate: Date.now(),
              config: {
                objectId: uuidv4()
              }
            }))
            .finally(() => setLoading(false));
        } else {
          copyWidget({ ..._.omit(widget, ['id', 'uuid']), layoutType });
        }
        alert(_l('复制成功'));
        break;
      case 'hideMobile':
        updateWidgetVisible({ widget, layoutType });
        break;
      case 'switchButtonDisplay':
        if (widget.type === 1) {
          updateWidget({
            widget,
            config: update(widget.config, {
              mobileCount: {
                $apply: (item = 1) => {
                  return item === 6 ? 1 : (item + 1);
                }
              }
            })
          });
        } else {
          const { btnType, direction } = _.get(widget, 'button.config') || {};
          updateWidget({
            widget,
            button: update(widget.button, {
              mobileCount: {
                $apply: item => {
                  // 图形按钮，上下结构
                  if (btnType === 2 && direction === 1) {
                    return item === 4 ? 1 : (item + 1);
                  } else {
                    return item === 1 ? 2 : 1;
                  }
                }
              }
            }),
          });
        }
        break;
      case 'changeFontSize':
          updateWidget({
            widget,
            config: update(widget.config, {
              mobileFontSize: {
                $apply: (item) => {
                  return result;
                }
              }
            })
          });
      break;
      default:
        break;
    }
  };

  // 获取layout布局, 如果没有设置好的layout,则生成一个默认的
  const getLayout = components =>
    components.map((item = {}, index) => {
      const { id } = item;
      const { layout, titleVisible } = item[layoutType] || {};
      return layout
        ? { ...layout, i: `${id || index}` }
        : { ...getDefaultLayout({ components, index, layoutType, titleVisible }), i: `${id || index}` };
    });

  const getLayoutConfig = () => {
    const config = LAYOUT_CONFIG[layoutType];
    const $wrap = document.getElementById('componentsWrap');
    if (layoutType !== 'web' || !adjustScreen || !$wrap) return config;
    const maxH = max(components.map(item => get(item, ['web', 'layout'])).map(layout => layout.h + layout.y));
    return { ...config, rowHeight: ((isFullscreen ? window.screen.height : $wrap.offsetHeight) - 10) / maxH - 10 };
  };

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
        onResizeStop={(layout, oldItem = {}) => {
          const index = _.findIndex(layout, { i: oldItem.i });
          const getData = _.get(displayRefs[index], ['getData']);
          if (getData && typeof getData === 'function') {
            getData();
          }
        }}
        // draggableHandle=".customPageDraggableHandle"
        layout={getLayout(components)}
        onLayoutChange={layouts => updateLayout({ layouts, layoutType, components, adjustScreen })}
        {...getLayoutConfig()}
      >
        {components.map((widget, index) => {
          const { id, type, value } = widget;
          const { title, titleVisible } = widget[layoutType] || {};
          const enumType = getEnumType(type);
          const translateInfo = getTranslateInfo(ids.appId, null, enumType === 'analysis' ? value : id);
          return (
            <LayoutContent key={`${id || index}`} className="resizableWrap">
              {titleVisible && (
                <div className="componentTitle flexRow alignItemsCenter disableDrag bold" title={title}>
                  {editable || isEdit ? (
                    <input
                      ref={$input}
                      value={title}
                      placeholder={_l('标题')}
                      onBlur={() => setEdit(false)}
                      onChange={e => updateWidget({ widget, title: e.target.value, layoutType })}
                    ></input>
                  ) : (
                    <Fragment>
                      {title && <div className="titleSign" style={{ backgroundColor: appPkg.iconColor || apk.iconColor }} />}
                      <span className="flex overflow_ellipsis">{translateInfo.title || title}</span>
                    </Fragment>
                  )}
                </div>
              )}
              <div
                className={cx('widgetContent', enumType, layoutType, {
                  haveTitle: titleVisible,
                  iframeNoneEvent: enumType === 'embedUrl' && editable,
                })}
                style={{
                  backgroundColor: layoutType === 'web' ? config.widgetBgColor : undefined
                }}
              >
                <WidgetDisplay
                  widget={widget}
                  editingWidget={editingWidget}
                  ids={ids}
                  isCharge={isCharge && !(appPkg.isLock || appPkg.permissionType === APP_ROLE_TYPE.RUNNER_ROLE)}
                  config={config}
                  themeColor={appPkg.iconColor || apk.iconColor}
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
                {editable && (
                  <Tools
                    appId={ids.appId}
                    pageId={ids.worksheetId}
                    widget={widget}
                    layoutType={layoutType}
                    titleVisible={titleVisible}
                    handleToolClick={(clickType, result) => handleToolClick(clickType, { widget, index, result })}
                    updatePageInfo={updatePageInfo}
                  />
                )}
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
