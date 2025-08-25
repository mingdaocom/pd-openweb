import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import CarouselPreview from 'src/pages/customPage/components/editWidget/carousel/Carousel';
import Image from 'src/pages/customPage/components/editWidget/Image';
import { EditRichText as RichText } from 'src/pages/customPage/components/editWidget/richText';
import { ButtonList } from 'src/pages/customPage/components/WidgetContent/ButtonList';
import { getTranslateInfo } from 'src/utils/app';
import { StateChartContent } from './ChartContent';
import Filter from './FilterContent';
import PreviewContent from './PreviewContent';
import TabsContent from './TabsContent';
import ViewContent from './ViewContent';

const WidgetContent = styled.div`
  flex: 1;
  box-sizing: border-box;
  padding: 8px 15px;
  height: 100%;
  &.button {
    display: flex;
  }
  &.mobileEmbedUrl,
  &.mobileView,
  &.mobileFilter,
  &.mobileCarousel,
  &.mobileRichText {
    padding: 0 !important;
  }
  &.mobileFilter {
    display: flex;
    justify-content: center;
    background-color: transparent;
  }
  &.mobileButton {
    padding: 8px 6px !important;
  }
  &.mobileTabs,
  &.mobileCard,
  &.mobileImage {
    padding: 0;
    box-shadow: none;
    background-color: transparent !important;
  }
  &.mobileAnalysis .name,
  &.mobileFilter .name {
    color: var(--widget-title-color);
  }
  &.mobileAnalysis .numberChart {
    border-radius: 20px;
  }
  img {
    max-width: 100%;
  }
  .mdEditorContent {
    overflow: initial !important;
  }
`;

const fistLetterUpper = str => str.charAt(0).toUpperCase() + str.slice(1);

function WidgetDisplay(props) {
  const { ids, widget, apk, pageComponents, pageConfig, componentType } = props;
  const { value, name, button, param = [], config = {} } = widget;

  const renderContent = () => {
    if (componentType === 'embedUrl') {
      return (
        <PreviewContent
          value={value}
          param={param}
          config={config}
          info={{
            ...ids,
            projectId: apk.projectId,
            itemId: ids.worksheetId,
          }}
        />
      );
    }
    if (componentType === 'richText') {
      const translateInfo = getTranslateInfo(ids.appId, null, widget.id);
      return <RichText editable={false} widget={widget} value={translateInfo.description || value || ''} />;
    }
    if (componentType === 'button')
      return (
        <ButtonList
          themeColor={apk.iconColor}
          customPageConfig={pageConfig}
          editable={false}
          widget={widget}
          button={button}
          ids={ids}
          info={{
            ...ids,
            projectId: apk.projectId,
            itemId: ids.worksheetId,
          }}
          layoutType="mobile"
          addRecord={() => {}}
        />
      );
    if (componentType === 'analysis') {
      return (
        <StateChartContent
          widget={widget}
          reportId={value}
          pageId={ids.worksheetId}
          name={name}
          pageComponents={pageComponents.filter(p => p.type === 1)}
          pageConfig={pageConfig}
          appId={apk.appId}
          themeColor={apk.iconColor}
          projectId={apk.projectId}
        />
      );
    }
    if (componentType === 'view') {
      return <ViewContent appId={ids.appId} setting={widget} />;
    }
    if (componentType === 'filter') {
      return <Filter ids={ids} apk={apk} widget={widget} />;
    }
    if (componentType === 'carousel') {
      const { config, componentConfig } = widget;
      return <CarouselPreview config={config} componentConfig={componentConfig} />;
    }
    if (['tabs', 'card'].includes(componentType)) {
      return (
        <TabsContent
          widget={widget}
          layoutType="mobile"
          isMobile={true}
          ids={ids}
          apk={apk}
          themeColor={apk.iconColor}
          editable={false}
          components={pageComponents}
          customPageConfig={pageConfig}
          updateComponents={props.updateComponents}
        />
      );
    }
    if (componentType === 'image') {
      return <Image themeColor={apk.iconColor} widget={widget} editable={false} customPageConfig={pageConfig} />;
    }
  };
  return (
    <WidgetContent
      className={`mobile${fistLetterUpper(componentType)} ${componentType}-${['tabs', 'card'].includes(componentType) ? _.get(widget, 'config.objectId') : widget.id} flexColumn`}
    >
      {renderContent()}
    </WidgetContent>
  );
}

export default WidgetDisplay;
