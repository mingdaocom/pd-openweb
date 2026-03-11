import React from 'react';
import { createRoot } from 'react-dom/client';

const previewAttachments = function (options, extra) {
  import('src/pages/kc/common/AttachmentsPreview').then(AttachmentsPreview => {
    AttachmentsPreview = AttachmentsPreview.default;
    const rootContainer = document.createElement('div');
    document.body.appendChild(rootContainer);
    const root = createRoot(rootContainer);

    root.render(
      <AttachmentsPreview
        extra={extra || {}}
        options={options}
        onClose={() => {
          try {
            root.unmount();
          } catch (err) {
            console.error(err);
          }
          if (rootContainer) {
            document.body.removeChild(rootContainer);
          }
          if (typeof options.closeCallback === 'function') {
            options.closeCallback();
          }
        }}
      />,
    );
  });
};

export default previewAttachments;

export const transformQiniuUrl = (file, options = {}) => {
  options = {
    index: 0,
    attachments: [],
    showThumbnail: true,
    hideFunctions: options.disableDownload ? ['editFileName', 'download', 'share', 'saveToKnowlege'] : ['editFileName'],
    ...options,
  };

  if (typeof file === 'string') {
    options.attachments = [
      {
        previewAttachmentType: 'QINIU',
        name: options.name || _l('图片预览'),
        path: file,
        privateDownloadUrl: file,
        ext: options.ext || (file.match(/\.(\w+)$/) || '')[1],
      },
    ];
  } else if (typeof file === 'object' && file.length) {
    options.attachments = file.map(f => ({
      previewAttachmentType: 'QINIU',
      name: _l('图片预览') + ((f.match(/\.(\w+)$/) || '')[1] || ''),
      path: f,
      ext: options.ext || (f.match(/\.(\w+)$/) || '')[1],
    }));
  }

  return options;
};
