import React, { lazy, Suspense, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import useFunctionWrapComponent, { openFunctionWrapComponent } from 'ming-ui/hooks/useFunctionWrapComponent';
import AntdConfigProvider from 'src/common/providers/theme/AntdConfigProvider';

const LoadableAttachmentsPreview = lazy(() => import('src/pages/kc/common/AttachmentsPreview'));

const getPreviewAttachmentsProps = ({ options, extra }) => ({
  extra: extra || {},
  options,
  onClose: options?.closeCallback,
});

function AttachmentsPreviewHolder(props) {
  return (
    <Suspense fallback={null}>
      <LoadableAttachmentsPreview {...props} />
    </Suspense>
  );
}

export function openPreviewAttachments(open, options, extra) {
  return openFunctionWrapComponent(open, AttachmentsPreviewHolder, { options, extra }, getPreviewAttachmentsProps);
}

export function usePreviewAttachments() {
  const { open, holder } = useFunctionWrapComponent(AttachmentsPreviewHolder, getPreviewAttachmentsProps);
  const openPreviewAttachments = useCallback((options, extra) => open({ options, extra }), [open]);

  return { open: openPreviewAttachments, holder };
}

const previewAttachments = function (options, extra) {
  import('src/pages/kc/common/AttachmentsPreview').then(AttachmentsPreview => {
    AttachmentsPreview = AttachmentsPreview.default;
    const rootContainer = document.createElement('div');
    document.body.appendChild(rootContainer);
    const root = createRoot(rootContainer);

    root.render(
      <AntdConfigProvider>
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
              rootContainer.remove();
            }

            if (typeof options.closeCallback === 'function') {
              options.closeCallback();
            }
          }}
        />
      </AntdConfigProvider>,
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
