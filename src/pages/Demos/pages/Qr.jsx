import React, { useEffect, useState } from 'react';
import { Qr } from 'ming-ui';
import GeneratingPopup from 'worksheet/common/PrintQrBarCode/GeneratingPopup';

export default function D(props) {
  const [content, setContent] = useState();
  useEffect(() => {
    setTimeout(() => {
      setContent('/');
    }, 3000);
  }, []);
  return <GeneratingPopup loading={!content} embedUrl={content} />;
}
