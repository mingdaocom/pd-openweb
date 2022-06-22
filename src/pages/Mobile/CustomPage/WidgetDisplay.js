import React from 'react';
import styled from 'styled-components';
import { ButtonList } from 'src/pages/customPage/components/WidgetContent/ButtonList';
import { getEnumType } from 'src/pages/customPage/util';
import PreviewContent from './PreviewContent';
import ChartContent from './ChartContent';
import { View } from 'src/pages/customPage/components/editWidget/view/Preview.jsx';
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
  &.mobileEmbedUrl, &.mobileView {
    padding: 0 !important;
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
  const { ids, widget, apk, pageComponents } = props;
  const { type, value, name, button, param = [], config = {} } = widget;
  const componentType = getEnumType(type);
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
    if (componentType === 'analysis') return <ChartContent pageComponents={pageComponents.filter(p => p.type === 1)} reportId={value} name={name} />;
    if (componentType === 'view') {
      return (
        <View appId={ids.appId} setting={widget} />
      );
    }
  };

  return (
    <WidgetContent className={`mobile${fistLetterUpper(componentType)} flexColumn`}>
      {renderContent()}
    </WidgetContent>
  );
}

export default WidgetDisplay;
