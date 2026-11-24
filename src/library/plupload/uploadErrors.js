import { getUploadError } from 'src/utils/services/file/uploadError';

// 提示集中在上传器中，Error 回调仍逐文件执行，供调用方清理队列、复位 loading。
// uploadErrorHandled 仅表示提示由此处负责，不能据此跳过调用方的失败收尾。
export default function bindUploadErrors(uploader) {
  const securityErrors = new Map();

  const flush = () => {
    if (!securityErrors.size) return;
    const message =
      securityErrors.size === 1
        ? securityErrors.values().next().value
        : _l('%0 个文件检测到安全风险，无法上传', securityErrors.size);
    securityErrors.clear();
    alert(message, 2);
  };

  uploader.bind(
    'Error',
    (up, error) => {
      const uploadError = getUploadError(error.response, error.file?.name);
      if (!uploadError) return;

      error.uploadErrorHandled = true;
      error.uploadErrorMessage = uploadError.message;
      if (uploadError.isSecurityError) {
        securityErrors.set(error.file?.id || error.file || error, uploadError.message);
        if (up.state === plupload.STOPPED) flush();
      } else {
        alert(uploadError.message, 2);
      }
    },
    null,
    100,
  );
  // 在业务 UploadComplete 回调可能销毁上传器前展示本批次汇总。
  uploader.bind('UploadComplete', flush, null, 100);
  uploader.bind('StateChanged', up => {
    if (up.state === plupload.STOPPED) flush();
  });
  uploader.bind('Destroy', flush, null, 100);
}
