import React from 'react';
import styled from 'styled-components';
import functionWrap from 'ming-ui/components/FunctionWrap';
import PrintQrBarCode from './PrintQrBarCode';
import GeneratingPdf from './GeneratingPdf';

const FullScreenCon = styled.div`
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 1000;
  background: #fff;
`;

function FullScreen(props = {}) {
  return (
    <FullScreenCon style={props.zIndex ? { zIndex: props.zIndex } : {}}>
      <PrintQrBarCode {...props} />
    </FullScreenCon>
  );
}

export default PrintQrBarCode;
export const printQrBarCode = props => functionWrap(FullScreen, props);
export const generatePdf = props => functionWrap(GeneratingPdf, props);
