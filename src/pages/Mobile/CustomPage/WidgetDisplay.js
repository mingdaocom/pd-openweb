import React from 'react';
import styled from 'styled-components';
import { ButtonList } from 'src/pages/customPage/components/WidgetContent/ButtonList';
import PreviewContent from './PreviewContent';
import CarouselPreview from 'src/pages/customPage/components/editWidget/carousel/Carousel';
import { StateChartContent } from './ChartContent';
import ViewContent from './ViewContent';
import Filter from './FilterContent';
import Ai from './AiContent';
import { RichText } from 'ming-ui';

const WidgetContent = styled.div`
  flex: 1;
  box-sizing: border-box;
  padding: 8px 15px;
  background-color: #fff;
  height: 100%;
  &.button {
    display: flex;
  }
  &.mobileEmbedUrl, &.mobileView, &.mobileFilter, &.mobileCarousel {
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
  img {
    max-width: 100%;
  }
  .mdEditorContent {
    overflow: initial !important;
  }
`;

const fistLetterUpper = str => str.charAt(0).toUpperCase() + str.slice(1);

function WidgetDisplay(props) {
  const { ids, widget, apk, pageComponents, pageConfig, themeColor, componentType } = props;
  const { type, value, name, button, param = [], config = {} } = widget;

  const renderContent = () => {
    if (componentType === 'embedUrl') return <PreviewContent value={value} param={param} config={config} />;
    if (componentType === 'richText')
      return <RichText data={value || ''} className={'mdEditorContent'} disabled={true} backGroundColor={'#fff'} />;
    if (componentType === 'button')
      return (
        <ButtonList
          editable={false}
          button={button}
          info={{
            ...ids,
            projectId: apk.projectId,
            itemId: ids.worksheetId
          }}
          layoutType="mobile"
          addRecord={data => {}}
        />
      );
    if (componentType === 'analysis') {
      return (
        <StateChartContent
          widget={widget}
          reportId={value}
          name={name}
          pageComponents={pageComponents.filter(p => p.type === 1)}
          pageConfig={pageConfig}
          themeColor={apk.iconColor}
          projectId={apk.projectId}
        />
      )
    };
    if (componentType === 'view') {
      return (
        <ViewContent appId={ids.appId} setting={widget} />
      );
    }
    if (componentType === 'filter') {
      return (
        <Filter ids={ids} apk={apk} widget={widget} />
      );
    }
    if (componentType === 'carousel') {
      const { config, componentConfig } = widget;
      return (
        <CarouselPreview config={config} componentConfig={componentConfig} />
      );
    }
    if (componentType === 'ai') {
      return (
        <Ai widget={widget}/>
      );
    }
  };

  return (
    <WidgetContent className={`mobile${fistLetterUpper(componentType)} ${componentType}-${widget.id} flexColumn `}>
      {renderContent()}
    </WidgetContent>
  );
}

export default WidgetDisplay;
