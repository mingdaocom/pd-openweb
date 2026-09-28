import React, { useEffect } from 'react';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import './css/userCard.less';

const IMAGE_MODAL_STYLES = {
  content: {
    background: 'transparent',
    boxShadow: 'none',
  },
  container: {
    background: 'transparent',
    boxShadow: 'none',
  },
  body: {
    padding: 0,
    overflow: 'unset',
    height: 400,
  },
};

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
    <Modal
      open
      width={400}
      closable={false}
      onCancel={onCancel}
      footer={null}
      mask={{ closable: true }}
      styles={IMAGE_MODAL_STYLES}
    >
      <img src={imgUrl} className="w100 h100" />
    </Modal>
  );
}

export default function useEnlargeImage() {
  return useFunctionWrapComponent(EnlargeImage);
}
