import React, { useEffect, useRef, useState, memo } from 'react';
import styled from 'styled-components';
import BraftEditor from 'src/components/braftEditor/braftEditor';
import ButtonList from 'src/pages/customPage/components/WidgetContent/ButtonList';
import { getEnumType } from 'src/pages/customPage/util';
import { addRecord } from 'src/pages/customPage/redux/action';
import PreviewContent from './PreviewContent';
import ChartContent from './ChartContent';

const WidgetContent = styled.div`
  flex: 1;
  box-sizing: border-box;
  padding: ${props => (props.componentType === 'embedUrl' ? 0 : '8px 15px')};
  background-color: #fff;
  height: 100%;
  &.button {
    display: flex;
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
  const { type, value, name, button, ids } = props;
  const componentType = getEnumType(type);
  const [ dimensions, setDimensions ] = useState({ width: 0, height: 0 });
  const ref = useRef(null);

  useEffect(() => {
    if (componentType !== 'analysis') return;
    const { width, height } = ref.current.getBoundingClientRect();
    // WidgetContent style padding
    const paddingHorizontal = 15 * 2;
    const paddingVertical = 8 * 2;
    setDimensions({ width: width - paddingHorizontal, height: height - paddingVertical });
  }, []);

  const renderContent = () => {
    if (componentType === 'embedUrl') return <PreviewContent value={value} />;
    if (componentType === 'richText') return <BraftEditor summary={value} isEditing={false} />;
    if (componentType === 'button') return <ButtonList editable={false} button={button} ids={ids} layoutType="mobile" addRecord={(data) => { addRecord(data)(); }} />;
    if (componentType === 'analysis') return <ChartContent reportId={value} name={name} dimensions={dimensions} />;
  };

  return (
    <WidgetContent className={`mobile${fistLetterUpper(componentType)} flexColumn`} ref={ref} componentType={componentType}>
      {renderContent()}
    </WidgetContent>
  );
}

export default WidgetDisplay;
