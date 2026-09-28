import React, { Fragment, lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Input } from 'ming-ui/antd-components';
import { getTranslateInfo } from 'src/utils/services/app';
import { containerWidgets } from '../../enum';
import * as actions from '../../redux/action';
import { componentCountLimit } from '../../util';

const Tools = lazy(() => import('./Tools'));

const WidgetTools = props => {
  const {
    ids,
    enumType,
    editable,
    iconColor,
    layoutType,
    widget,
    components,
    allComponents,
    activeContainerInfo = {},
  } = props;
  const {
    updateWidget,
    updateWidgetVisible,
    updatePageInfo,
    setWidget,
    insertTitle,
    copyWidget,
    getChartData,
    setChartData,
  } = props;
  const widgetLayout = widget[layoutType] || {};
  const { title } = widgetLayout;
  const titleVisible = widget.sectionId ? false : widgetLayout.titleVisible;
  const translateInfo = getTranslateInfo(ids.appId, null, enumType === 'analysis' ? widget.value : widget.id);
  const [isEdit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToolClick = (clickType, { widget, result }) => {
    switch (clickType) {
      case 'setting':
        if (containerWidgets[enumType] || ['image', 'richText'].includes(enumType)) {
          updateWidget({
            widget,
            ...result,
          });
          return;
        }

        setWidget(widget);
        break;
      case 'move':
      case 'del':
        props.delWidget(widget);
        break;
      case 'delTabsWidget':
        props.delTabsWidget(widget);
        break;
      case 'delWidgetTab':
        props.delWidgetTab(result);
        break;
      case 'insertTitle':
        insertTitle({ widget, visible: !widget[layoutType].titleVisible, layoutType });
        setEdit(!widget[layoutType].titleVisible);
        break;
      case 'copy':
        // 限制单个页面添加组件数量
        if (!componentCountLimit(components)) return;
        if (enumType === 'analysis') {
          setLoading(true);
          if (loading) return;
          import('statistics/api/reportConfig')
            .then(({ default: reportConfig }) => reportConfig.copyReport({ reportId: widget.value, sourceType: 1 }))
            .then(data =>
              copyWidget({
                ..._.omit(widget, ['id', 'uuid']),
                value: data.reportId,
                layoutType,
                sourceValue: widget.value,
                needUpdate: Date.now(),
                config: {
                  objectId: uuidv4(),
                  ..._.pick(_.get(widget, 'config'), ['showTitle', 'showType', 'name', 'desc']),
                },
              }),
            )
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
          const mobileCount = widget.config.mobileCount === undefined ? 1 : widget.config.mobileCount;
          updateWidget({
            widget,
            config: {
              ...widget.config,
              mobileCount: mobileCount === 6 ? 1 : mobileCount + 1,
            },
          });
        } else {
          const { btnType, direction } = _.get(widget, 'button.config') || {};
          const mobileCount = widget.button.mobileCount;
          updateWidget({
            widget,
            button: {
              ...widget.button,
              // 图形按钮，上下结构
              mobileCount:
                btnType === 2 && direction === 1
                  ? mobileCount === 4
                    ? 1
                    : mobileCount + 1
                  : mobileCount === 1
                    ? 2
                    : 1,
            },
          });
        }

        break;
      case 'changeFontSize':
      case 'moveIn':
      case 'moveOut':
      case 'updateWidget':
        updateWidget({
          widget,
          ...result,
        });
        break;
      default:
        break;
    }
  };

  return (
    <Fragment>
      {titleVisible && (
        <div className="componentTitle flexRow alignItemsCenter disableDrag bold" title={title}>
          {editable || isEdit ? (
            <Fragment>
              <div className="titleSign" style={{ backgroundColor: iconColor }} />
              <Input
                variant="underlined"
                value={title}
                className="bold"
                placeholder={_l('标题')}
                onBlur={() => setEdit(false)}
                onChange={e => updateWidget({ widget, title: e.target.value, layoutType })}
              />
            </Fragment>
          ) : (
            <Fragment>
              {title && <div className="titleSign" style={{ backgroundColor: iconColor }} />}
              <span className="flex overflow_ellipsis">{title ? translateInfo.title || title : ''}</span>
            </Fragment>
          )}
        </div>
      )}
      {editable && (
        <Suspense fallback={null}>
          <Tools
            appId={ids.appId}
            pageId={ids.worksheetId}
            widget={widget}
            updateWidget={updateWidget}
            layoutType={layoutType}
            titleVisible={titleVisible}
            allComponents={allComponents}
            handleToolClick={(clickType, result) => handleToolClick(clickType, { widget, result })}
            updatePageInfo={updatePageInfo}
            getChartData={getChartData}
            setChartData={setChartData}
            activeContainerInfo={activeContainerInfo}
          />
        </Suspense>
      )}
    </Fragment>
  );
};

export default connect(
  state => ({
    allComponents: state.customPage.components,
    activeContainerInfo: state.customPage.activeContainerInfo,
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(WidgetTools);
