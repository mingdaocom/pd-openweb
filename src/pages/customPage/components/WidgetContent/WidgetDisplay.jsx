import React, { useEffect, useRef, useState, memo, forwardRef } from 'react';
import Card from 'statistics/Card';
import cx from 'classnames';
import styled from 'styled-components';
import { getEnumType, parseLink } from '../../util';
import ButtonList from './ButtonList';
import PreviewWraper from '../previewContent';
import { View } from '../editWidget/view/Preview';
import { RichText } from 'ming-ui';

const WidgetContent = styled.div`
  flex: 1;
  box-sizing: border-box;
  padding: 8px 15px 16px;
  background-color: #fff;
  height: 100%;
  &.button {
    display: flex;
  }
  &.embedUrl, &.view {
    padding: 0 !important;
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
        <Card
          ref={$cardRef}
          needEnlarge={!(isFullscreen || editable || layoutType === 'mobile')}
          needRefresh={!editable}
          isCharge={isCharge}
          appId={ids.appId}
          report={{ id: value, name }}
          sourceType={1}
          needUpdate={needUpdate}
          worksheetId={ids.worksheetId}
          projectId={projectId}
        />
      );
    }
    if (componentType === 'view') {
      return (
        editingWidget.viewId !== widget.viewId && (
          <View
            layoutType={layoutType}
            className={cx({ disableSingleView: editable })}
            appId={ids.appId}
            setting={widget}
          />
        )
      );
    }
  };
  return (
    <WidgetContent className={componentType} ref={ref}>
      {renderContent()}
    </WidgetContent>
  );
});

export default WidgetDisplay;
