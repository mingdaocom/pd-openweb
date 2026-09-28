import React from 'react';
import styled from 'styled-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import PrintQrBarCode from './PrintQrBarCode';

const FullScreenCon = styled.div`
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 1000;
  background: var(--color-background-primary);
`;

function FullScreen(props = {}) {
  return (
    <FullScreenCon style={props.zIndex ? { zIndex: props.zIndex } : {}}>
      <PrintQrBarCode {...props} />
    </FullScreenCon>
  );
}

export default PrintQrBarCode;
export function usePrintQrBarCode() {
  return useFunctionWrapComponent(FullScreen);
}
