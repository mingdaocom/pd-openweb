import React, { useState, useEffect } from 'react';
import { number, string } from 'prop-types';
import genQr from 'src/pages/worksheet/common/PrintQrCode/genQrDataurl';

export default function Qr(props) {
  const { content, width = 100, height = 100, gap = 0, correctLevel } = props;
  const [url, setUrl] = useState();
  useEffect(() => {
    const data = genQr({
      value: String(content),
      width: width * 2,
      height: height * 2,
      gap: gap * 2,
      correctLevel: correctLevel || 0,
    });
    setUrl(data);
  }, [content]);
  return url ? <img style={{ width, height }} src={url} alt={content} /> : <span></span>;
}

Qr.propTypes = {
  content: string,
  width: number,
  height: number,
  gap: number,
};
