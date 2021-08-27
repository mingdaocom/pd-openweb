import React, { useState, memo, useRef, useEffect, Fragment, useLayoutEffect } from 'react';
import { string } from 'prop-types';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import styled from 'styled-components';
import cx from 'classnames';
import reportConfig from 'src/pages/worksheet/common/Statistics/api/reportConfig';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import update from 'immutability-helper';
import { get, max, throttle } from 'lodash';
import * as actions from '../../redux/action';
import WidgetDisplay from './WidgetDisplay';
import { getEnumType, getDefaultLayout, reportCountLimit } from '../../util';
import Tools from './Tools';
import WidthProvider from './widthProvider';
import { COLUMN_HEIGHT } from '../../config';

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
    border-radius: 3px;
    overflow: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
    &.analysis {
      overflow: visible;
    }
    &:hover {
      box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.25);
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
    }
  }
  .iframeNoneEvent iframe {
    pointer-events: none;
  }
  .componentTitle {
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
  .componentsWrap {
    padding: 0 0 4px 0;
    height: 100%;
  }
`;
const LAYOUT_CONFIG = {
  web: {
    rowHeight: COLUMN_HEIGHT,
    margin: [10, 10],
    cols: 12,
  },
  mobile: {
    rowHeight: COLUMN_HEIGHT,
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
    setWidget,
    isFullscreen = false,
    scrollTop = 0,
    adjustScreen,
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

  useEffect(() => {
    const $inputDom = $input.current;
    if (!$inputDom) return;
    $inputDom.style.width = `${$inputDom.value.length * 16}px`;
    const handler = e => {
      $inputDom.style.width = `${e.target.value.length * 16}px`;
    };
    $inputDom.addEventListener('keydown', handler);
    return () => $inputDom.removeEventListener('keydown', handler);
  }, [$input.current]);

  const handleToolClick = (clickType, { widget, index }) => {
    switch (clickType) {
      case 'setting':
        setWidget(widget);
        break;
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
            .then(data => copyWidget({ ..._.omit(widget, ['id', 'uuid']), value: data.reportId, layoutType }))
            .always(() => setLoading(false));
        } else {
          copyWidget({ ..._.omit(widget, ['id', 'uuid']), layoutType });
        }
        alert(_l('复制成功'));
        break;
      case 'hideMobile':
        updateWidgetVisible({ widget, layoutType });
        break;
      case 'switchButtonDisplay':
        updateWidget({
          widget,
          button: update(widget.button, { mobileCount: { $apply: item => (item === 1 ? 2 : 1) } }),
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
    return { ...config, rowHeight: ($wrap.offsetHeight - 64) / maxH - 10 };
  };
  return (
    <Fragment>
      <AutoWidthGridLayout
        className="layout"
        chatVisible={chatVisible}
        sheetListVisible={sheetListVisible}
        cols={12}
        rowHeight={40}
        margin={[16, 16]}
        isDraggable={editable}
        isResizable={editable}
        isFullscreen={isFullscreen}
        draggableCancel=".componentTitle"
        onResizeStop={(layout, oldItem) => {
          const index = _.findIndex(layout, { i: oldItem.i });
          const getData = _.get(displayRefs[index], ['getData']);
          if (getData && typeof getData === 'function') {
            const reportId = _.get(displayRefs[index], ['props', 'report', 'id']);
            if (reportId) {
              getData(reportId);
            }
          }
        }}
        // draggableHandle=".customPageDraggableHandle"
        layout={getLayout(components)}
        onLayoutChange={layouts => updateLayout({ layouts, layoutType, components })}
        {...getLayoutConfig()}>
        {components.map((widget, index) => {
          const { id, type } = widget;
          const { title, titleVisible } = widget[layoutType] || {};
          const enumType = getEnumType(type);
          return (
            <LayoutContent key={`${id || index}`} className="resizableWrap">
              {titleVisible && (
                <div className="componentTitle overflow_ellipsis">
                  {editable || isEdit ? (
                    <input
                      ref={$input}
                      value={title}
                      placeholder={_l('标题')}
                      onBlur={() => setEdit(false)}
                      onChange={e => updateWidget({ widget, title: e.target.value, layoutType })}></input>
                  ) : (
                    title
                  )}
                </div>
              )}
              <div
                className={cx('widgetContent', enumType, {
                  haveTitle: titleVisible,
                  iframeNoneEvent: enumType === 'embedUrl' && editable,
                })}>
                <WidgetDisplay
                  {..._.pick(widget, ['type', 'param', 'value', 'needUpdate', 'button'])}
                  ids={ids}
                  ref={el => {
                    displayRefs[index] = el;
                  }}
                  editable={editable}
                  layoutType={layoutType}
                  isFullscreen={isFullscreen}
                  scrollTop={scrollTop}
                  addRecord={addRecord}
                />
                {editable && (
                  <Tools
                    widget={widget}
                    layoutType={layoutType}
                    titleVisible={titleVisible}
                    handleToolClick={clickType => handleToolClick(clickType, { widget, index })}
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
    state => ({ chatVisible: state.chat.visible, sheetListVisible: state.sheetList.isUnfold }),
    dispatch => bindActionCreators(actions, dispatch),
  )(WidgetContent),
);
