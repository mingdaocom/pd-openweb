import React from 'react';
import ReactDOM from 'react-dom';
import AttachmentsPreview from 'src/pages/kc/common/AttachmentsPreview';

var previewAttachments = function(options, extra) {
  const attachments = (
    <AttachmentsPreview
      extra={extra || {}}
      options={options}
      onClose={() => {
        ReactDOM.unmountComponentAtNode($('#attachemntsPreviewContainer')[0]);
        $('#attachemntsPreviewContainer').remove();
        if (typeof options.closeCallback === 'function') {
          options.closeCallback();
        }
      }}
    />
  );

  const $el = $('#attachemntsPreviewContainer');
  if ($el.length) {
    ReactDOM.render(attachments, $el[0]);
  } else {
    ReactDOM.render(attachments, $('<div id="attachemntsPreviewContainer"></div>').appendTo('body')[0]);
  }

  $(document).on('click', '#attachemntsPreviewContainer', function(e) {
    e.stopPropagation();
  });
};

export default previewAttachments;
