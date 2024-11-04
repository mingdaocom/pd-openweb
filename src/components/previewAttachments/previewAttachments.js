import React from 'react';
import { createRoot } from 'react-dom/client';

var previewAttachments = function (options, extra) {
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

    // $(document).on('click', '.attachmentsPreview', function (e) {
    //   e.stopPropagation();
    // });
  });
};

export default previewAttachments;
