import React, { useEffect, useRef, useState, memo, forwardRef } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { getEnumType, parseLink } from '../../util';
import ChartDisplay from './ChartDisplay';
import ViewDisplay from './ViewDisplay';
import ButtonList from './ButtonList';
import PreviewWraper from '../previewContent';
import { RichText } from 'ming-ui';
import FiltersGroupPreview from '../editWidget/filter/FiltersGroupPreview';
import CarouselPreview from '../editWidget/carousel/Carousel';
import MobileFilter from 'src/pages/Mobile/CustomPage/FilterContent';

const WidgetContent = styled.div`
  flex: 1;
  box-sizing: border-box;
  padding: 15px 16px;
  background-color: #fff;
  height: 100%;
  &.button {
    display: flex;
  }
  &.embedUrl, &.view {
    padding: 0 !important;
  }
  &.analysis .header {
    height: 20px;
    margin-bottom: 12px;
  }
  img {
    max-width: 100%;
  }
  .mdEditorContent {
    overflow: initial !important;
  }
`;

const WidgetDisplay = forwardRef((props, $cardRef) => {
  const {
    layoutType,
    isFullscreen,
    editable,
    ids,
    projectId,
    widget,
    editingWidget,
    isCharge,
    ...rest
  } = props;
  const { type, param = [], value, needUpdate, button, name, config = {} } = widget;
  const componentType = getEnumType(type);
  const ref = useRef(null);
  const renderContent = () => {
    if (componentType === 'embedUrl') {
      const { newTab = false, reload = false } = config;
      return (
        <PreviewWraper
          reload={reload}
          newTab={newTab}
          value={value}
          param={param}
        />
      );
    }
    if (componentType === 'richText')
      return <RichText data={value || ''} className={'mdEditorContent'} disabled={true} backGroundColor={'#fff'} />;
    if (componentType === 'button') {
      return <ButtonList editable={editable} button={button} ids={ids} layoutType={layoutType} {...rest} />;
    }
    if (componentType === 'analysis') {
      return (
        <ChartDisplay
          widget={widget}
          $cardRef={$cardRef}
          needEnlarge={!(isFullscreen || editable || layoutType === 'mobile')}
          needRefresh={!editable}
          isCharge={isCharge}
          permissionType={rest.permissionType}
          isLock={rest.isLock}
          appId={ids.appId}
          report={{ id: value, name }}
          sourceType={1}
          needUpdate={needUpdate}
          worksheetId={ids.worksheetId}
          projectId={projectId}
          layoutType={layoutType}
          mobileCount={_.get(widget, 'config.mobileCount')}
        />
      );
    }
    if (componentType === 'view') {
      return (
        editingWidget.viewId !== widget.viewId && (
          <ViewDisplay
            layoutType={layoutType}
            className={cx({ disableSingleView: editable })}
            appId={ids.appId}
            setting={widget}
          />
        )
      );
    }
  };
  if (componentType === 'filter') {
    if (layoutType === 'mobile') {
      return (
        <MobileFilter
          ids={ids}
          widget={widget}
          className={cx({ disableFiltersGroup: editable })}
        />
      );
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
      <CarouselPreview editable={editable} config={config} componentConfig={componentConfig} />
    );
  }
  return (
    <WidgetContent className={componentType} ref={ref}>
      {renderContent()}
    </WidgetContent>
  );
});

export default WidgetDisplay;
