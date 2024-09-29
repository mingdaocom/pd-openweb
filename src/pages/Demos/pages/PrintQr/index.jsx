import React, { useCallback, useEffect, useRef } from 'react';
import PDFObject from 'pdfobject';
import styled from 'styled-components';
import Label from 'src/pages/worksheet/common/PrintQrBarCode/vectorLabel';
import {
  QR_LAYOUT,
  PORTRAIT_QR_CODE_SIZE,
  LANDSCAPE_QR_CODE_SIZE,
} from '../../../worksheet/common/PrintQrBarCode/enum';

const Con = styled.div`
  padding: 20px;
  height: 100vh;
  .preview {
    width: 100%;
    height: 100%;
  }
`;
export default function Qr(props) {
  const embedRef = useRef();
  const init = useCallback(async () => {
    const label = new Label({
      size: (config.layout === QR_LAYOUT.PORTRAIT ? PORTRAIT_QR_CODE_SIZE : LANDSCAPE_QR_CODE_SIZE).shorts[
        Number(PORTRAIT_QR_CODE_SIZE.HUGE)
      ],
    });
    await label.init();
    await label.render();
    const blobUrl = await label.getBlobUrl();
    PDFObject.embed(blobUrl, embedRef.current);
  }, []);
  useEffect(() => {
    init();
  }, []);
  return (
    <Con>
      <div className="preview" ref={embedRef}></div>
    </Con>
  );
}
