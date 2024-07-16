import React from 'react';
import { createRoot } from 'react-dom/client';

var previewAttachments = function (options, extra) {
  import('src/pages/kc/common/AttachmentsPreview').then(AttachmentsPreview => {
    AttachmentsPreview = AttachmentsPreview.default;

    const $el = $('#attachemntsPreviewContainer');
    const root = createRoot(
      $el.length ? $el[0] : $('<div id="attachemntsPreviewContainer"></div>').appendTo('html > body')[0],
    );

    root.render(
      <AttachmentsPreview
        extra={extra || {}}
        options={options}
        onClose={() => {
          root.unmount();
          $('#attachemntsPreviewContainer').remove();
          if (typeof options.closeCallback === 'function') {
            options.closeCallback();
          }
        }}
      />,
    );

    $(document).on('click', '#attachemntsPreviewContainer', function (e) {
      e.stopPropagation();
    });
  });
};

export default previewAttachments;
