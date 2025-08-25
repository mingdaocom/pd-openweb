import React, { forwardRef, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import MobileFilter from 'mobile/CustomPage/FilterContent';
import MobileView from 'mobile/CustomPage/ViewContent';
import { reportTypes } from 'statistics/Charts/common';
import { getTranslateInfo } from 'src/utils/app';
import { browserIsMobile } from 'src/utils/common';
import { getEnumType } from '../../util';
import CarouselPreview from '../editWidget/carousel/Carousel';
import FiltersGroupPreview from '../editWidget/filter/FiltersGroupPreview';
import Image from '../editWidget/Image';
import RichText from '../editWidget/richText';
import Tabs from '../editWidget/tabs';
import PreviewWraper from '../previewContent';
import ButtonList from './ButtonList';
import ChartDisplay from './ChartDisplay';
import ViewDisplay from './ViewDisplay';

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
  &.richText {
    padding: 0 !important;
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
    .header .reportDesc {
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
`;

const WidgetDisplay = forwardRef((props, $cardRef) => {
  const { layoutType, isFullscreen, editable, ids, projectId, widget, editingWidget, isCharge, ...rest } = props;
  const { type, param = [], value, needUpdate, button, name, config = {} } = widget;
  const { worksheetId, appId } = ids;
  const componentType = getEnumType(type);
  const ref = useRef(null);
  const renderContent = () => {
    if (componentType === 'embedUrl') {
      const { newTab = false, reload = false } = config;
      return <PreviewWraper reload={reload} newTab={newTab} value={value} param={param} />;
    }
    if (componentType === 'richText') {
      const translateInfo = getTranslateInfo(ids.appId, null, widget.id);
      return <RichText editable={editable} widget={widget} value={translateInfo.description || value || ''} />;
    }
    if (componentType === 'button') {
      return (
        <ButtonList
          editable={editable}
          button={button}
          ids={ids}
          layoutType={layoutType}
          widget={widget}
          customPageConfig={rest.config || {}}
          {...rest}
        />
      );
    }
    if (componentType === 'analysis') {
      return (
        <ChartDisplay
          widget={widget}
          $cardRef={$cardRef}
          needEnlarge={!(isFullscreen || editable || layoutType === 'mobile')}
          needRefresh={!editable}
          pageEditable={editable}
          isCharge={isCharge}
          className={cx({ disableChart: editable && widget.reportType === reportTypes.NumberChart })}
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
      );
    }
    if (componentType === 'view') {
      if (browserIsMobile()) {
        return <MobileView appId={ids.appId} setting={widget} />;
      }

      return (
        editingWidget.viewId !== widget.viewId && (
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
        )
      );
    }
    if (componentType === 'tabs' || componentType === 'card') {
      return (
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
        />
      );
    }
    if (componentType === 'image') {
      return (
        <Image themeColor={props.themeColor} widget={widget} editable={editable} customPageConfig={rest.config || {}} />
      );
    }
  };
  if (componentType === 'filter') {
    if (layoutType === 'mobile') {
      return <MobileFilter ids={ids} widget={widget} className={cx({ disableFiltersGroup: editable })} />;
    } else {
      return (
        <FiltersGroupPreview
          className={cx({ disableFiltersGroup: editable })}
          appId={ids.appId}
          projectId={projectId}
          widget={widget}
        />
      );
    }
  }
  if (componentType === 'carousel') {
    const { config, componentConfig } = widget;
    return (
      <CarouselPreview
        editable={editable}
        config={config}
        componentConfig={componentConfig}
        customPageConfig={rest.config || {}}
      />
    );
  }

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
    </WidgetContent>
  );
});

export default WidgetDisplay;
