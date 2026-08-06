import React, { forwardRef, lazy, Suspense, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { getTranslateInfo } from 'src/utils/app';
import { browserIsMobile } from 'src/utils/common';
import { getEnumType } from '../../util';
import Image from '../editWidget/Image';
import RichText from '../editWidget/richText';
import Subsection from '../editWidget/subsection';
import PreviewWraper from '../previewContent';

const ButtonList = lazy(() => import('./ButtonList'));
const ChartDisplay = lazy(() => import('./ChartDisplay'));
const CarouselPreview = lazy(() => import('../editWidget/carousel/Carousel'));
const FiltersGroupPreview = lazy(() => import('../editWidget/filter/FiltersGroupPreview'));
const Tabs = lazy(() => import('../editWidget/tabs'));
const ViewDisplay = lazy(() => import('./ViewDisplay'));
const MobileFilter = lazy(() => import('mobile/CustomPage/FilterContent'));
const MobileView = lazy(() => import('mobile/CustomPage/ViewContent'));
const NUMBER_CHART_REPORT_TYPE = 10;

const LazyDisplayFallback = () => (
  <div className="w100 h100 flexRow alignItemsCenter justifyContentCenter">
    <LoadDiv />
  </div>
);

const WidgetContent = styled.div`
  flex: 1;
  box-sizing: border-box;
  padding: 12px;
  height: 100%;
  &.button {
    display: flex;
    .display .nameWrap {
      color: var(--widget-title-color) !important;
    }
  }
  &.embedUrl {
    color: var(--widget-title-color);
  }
  &.embedUrl,
  &.view,
  &.richText,
  &.carousel,
  &.filter {
    padding: 0 !important;
  }
  &.filter {
    align-items: center;
    display: flex;
  }
  &.analysis {
    padding: 0;
    .statisticsCard {
      background-color: transparent !important;
    }
    .summaryWrap,
    .reportName,
    .oneNumber .contentWrapper .name {
      color: var(--widget-title-color);
    }
    .hideNumberChartName {
      .iconItem .icon {
        background-color: var(--widget-color) !important;
      }
      .header {
        background-color: transparent !important;
      }
      .header {
        background: none !important;
        border: none !important;
      }
      .content {
        padding: 0;
      }
    }
    .numberChart {
      .minorWrap,
      .minorWrap .name {
        color: var(--widget-title-color) !important;
      }
    }
    .numberChart {
      .contentWrapper .name {
        color: var(--widget-title-color);
      }
    }
    .fixedLoading {
      background-color: var(--widget-color) !important;
    }
    .header .iconItem,
    .header .reportDesc,
    .header .filterCriteriaIcon .icon {
      color: var(--widget-icon-color) !important;
      &:hover {
        color: var(--widget-icon-hover-color) !important;
      }
    }
  }
  img {
    max-width: 100%;
  }
  .mdEditorContent {
    overflow: initial !important;
  }
  .layoutInfo {
    color: var(--color-white);
    background: #2d3239;
    padding: 5px 10px;
    position: absolute;
    right: 10px;
    bottom: 10px;
    border-radius: 4px;
    z-index: 10;
    display: none;
  }
`;

const WidgetDisplay = forwardRef((props, $cardRef) => {
  const { layoutType, isFullscreen, editable, ids, projectId, widget, editingWidget, isCharge, ...rest } = props;
  const { type, param = [], value, needUpdate, button, name, config = {} } = widget;
  const { worksheetId, appId } = ids;
  const componentType = getEnumType(type);
  const ref = useRef(null);
  const layoutInfo = _.get(widget[layoutType], 'layout') || {};

  const renderContent = () => {
    if (componentType === 'embedUrl') {
      const { newTab = false, reload = false } = config;
      return <PreviewWraper reload={reload} newTab={newTab} value={value} param={param} />;
    }

    if (componentType === 'richText') {
      const translateInfo = getTranslateInfo(ids.appId, null, widget.id);
      return (
        <RichText editable={editable} widget={widget} value={value ? translateInfo.description || value || '' : ''} />
      );
    }

    if (componentType === 'button') {
      return (
        <Suspense fallback={<LazyDisplayFallback />}>
          <ButtonList
            editable={editable}
            button={button}
            ids={ids}
            layoutType={layoutType}
            widget={widget}
            customPageConfig={rest.config || {}}
            {...rest}
          />
        </Suspense>
      );
    }

    if (componentType === 'analysis') {
      return (
        <Suspense fallback={<LazyDisplayFallback />}>
          <ChartDisplay
            widget={widget}
            $cardRef={$cardRef}
            needEnlarge={!(isFullscreen || editable || layoutType === 'mobile')}
            needRefresh={!editable}
            pageEditable={editable}
            isCharge={isCharge}
            className={cx({ disableChart: editable && widget.reportType === NUMBER_CHART_REPORT_TYPE })}
            customPageConfig={rest.config || {}}
            themeColor={rest.themeColor}
            isLock={rest.isLock}
            permissionType={rest.permissionType}
            appId={ids.appId}
            pageId={worksheetId}
            report={{ id: value, name }}
            sourceType={1}
            needUpdate={needUpdate}
            worksheetId={ids.worksheetId}
            projectId={projectId}
            layoutType={layoutType}
            mobileCount={_.get(widget, 'config.mobileCount')}
            mobileFontSize={_.get(widget, 'config.mobileFontSize')}
          />
        </Suspense>
      );
    }

    if (componentType === 'view') {
      if (browserIsMobile()) {
        return (
          <Suspense fallback={<LazyDisplayFallback />}>
            <MobileView appId={ids.appId} setting={widget} />
          </Suspense>
        );
      }

      return (
        editingWidget.viewId !== widget.viewId && (
          <Suspense fallback={<LazyDisplayFallback />}>
            <ViewDisplay
              themeColor={rest.themeColor}
              layoutType={layoutType}
              className={cx({ disableSingleView: editable })}
              appId={ids.appId}
              setting={{
                ...widget,
                config: {
                  ...widget.config,
                  refresh: _.get(rest.config, 'refresh'),
                  printCharge: appId === widget.apkId ? isCharge : false,
                },
              }}
            />
          </Suspense>
        )
      );
    }

    if (componentType === 'tabs' || componentType === 'card') {
      return (
        <Suspense fallback={<LazyDisplayFallback />}>
          <Tabs
            ids={ids}
            themeColor={props.themeColor}
            widget={widget}
            setWidget={props.setWidget}
            editable={editable}
            layoutType={layoutType}
            customPageConfig={rest.config || {}}
            projectId={projectId}
            isCharge={isCharge}
            isLock={props.isLock}
            permissionType={props.permissionType}
            editingWidget={props.editingWidget}
            addRecord={props.addRecord}
          />
        </Suspense>
      );
    }

    if (componentType === 'image') {
      return (
        <Image themeColor={props.themeColor} widget={widget} editable={editable} customPageConfig={rest.config || {}} />
      );
    }

    if (componentType === 'carousel') {
      const { config, componentConfig } = widget;
      return (
        <Suspense fallback={<LazyDisplayFallback />}>
          <CarouselPreview
            editable={editable}
            config={config}
            componentConfig={componentConfig}
            customPageConfig={rest.config || {}}
          />
        </Suspense>
      );
    }

    if (componentType === 'filter') {
      if (layoutType === 'mobile') {
        return (
          <Suspense fallback={<LazyDisplayFallback />}>
            <MobileFilter ids={ids} widget={widget} className={cx({ disableFiltersGroup: editable })} />
          </Suspense>
        );
      } else {
        return (
          <Suspense fallback={<LazyDisplayFallback />}>
            <FiltersGroupPreview
              className={cx({ disableFiltersGroup: editable })}
              appId={ids.appId}
              projectId={projectId}
              widget={widget}
            />
          </Suspense>
        );
      }
    }

    if (componentType === 'subsection') {
      return <Subsection editable={editable} widget={widget} />;
    }
  };

  return (
    <WidgetContent
      className={cx(
        componentType,
        `${componentType}-${
          ['tabs', 'card'].includes(componentType) ? _.get(widget, 'config.objectId') : widget.id || widget.uuid
        }`,
      )}
      ref={ref}
    >
      {renderContent()}
      {editable && (
        <div className="layoutInfo">
          <div>{_l('宽：%0格', layoutInfo.w)}</div>
          <div>{_l('高：%0格', layoutInfo.h)}</div>
        </div>
      )}
    </WidgetContent>
  );
});

export default WidgetDisplay;
