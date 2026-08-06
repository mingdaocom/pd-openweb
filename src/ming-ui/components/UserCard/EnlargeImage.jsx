import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Dialog, FunctionWrap } from 'ming-ui';
import './css/userCard.less';

const EnlargeImageWrap = styled(Dialog)`
  width: 400px !important;
  height: 400px !important;
  background: transparent !important;
  box-shadow: none !important;
  .mui-dialog-header {
    display: none;
  }
  .mui-dialog-body {
    padding: 0 !important;
    overflow: unset !important;
  }
`;

export function EnlargeImage(props) {
  const { url, visible = true, onCancel } = props;

  useEffect(() => {
    if (!url || !visible) return;

    const handleKeyDown = event => {
      if (event.key !== 'Escape' && event.keyCode !== 27) return;

      event.stopPropagation();
      if (event.stopImmediatePropagation) {
        event.stopImmediatePropagation();
      }

      if (typeof onCancel === 'function') {
        onCancel(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [url, visible, onCancel]);

  if (!url || !visible) {
    return null;
  }

  const imgUrl =
    url.indexOf('imageView2') > -1
      ? url.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/w/400')
      : url + `${url.includes('?') ? '&' : '?'}imageView2/2/w/400`;

  return (
    <EnlargeImageWrap dialogClasses="enlargeImageDialog" visible closable={false} onCancel={onCancel} footer={null}>
      <img src={imgUrl} className="w100 h100" />
    </EnlargeImageWrap>
  );
}

export default props => FunctionWrap(EnlargeImage, props);
