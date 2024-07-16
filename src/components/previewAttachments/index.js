import React from 'react';
import { createRoot } from 'react-dom/client';

function callPreview(options = {}, extra = {}) {
  const div = document.createElement('div');

  document.body.appendChild(div);

  const root = createRoot(div);

  function destory() {
    root.unmount();
    document.body.removeChild(div);
  }

  import('src/pages/kc/common/AttachmentsPreview').then(AttachmentsPreview => {
    AttachmentsPreview = AttachmentsPreview.default;
    root.render(<AttachmentsPreview extra={extra} options={options} onClose={destory} />);
  });
}

export function previewQiniuUrl(file, options = {}) {
  let hideFunctions = ['editFileName'];
  if (options.disableDownload) {
    hideFunctions = hideFunctions.concat(['download', 'share', 'saveToKnowlege']);
  }
  options = Object.assign(
    {},
    {
      index: 0,
      attachments: [],
      showThumbnail: true,
      hideFunctions,
    },
    options,
  );
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
  callPreview(options);
}
