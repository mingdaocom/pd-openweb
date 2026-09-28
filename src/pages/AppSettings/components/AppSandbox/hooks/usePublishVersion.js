import { useCallback, useEffect, useRef, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';

/** 提交单应用版本，并保证同一时间最多存在一个发布请求。 */
export default function usePublishVersion({ appId, onSuccess }) {
  const [publishing, setPublishing] = useState(false);
  const requestRef = useRef(null);

  const publish = useCallback(
    version => {
      if (!version || requestRef.current) return;

      const request = appSandboxAjax.publish(
        {
          appId,
          versionNo: version.version,
          description: version.description.trim(),
          fileUrl: version.fileUrl || '',
        },
        { silent: true },
      );

      requestRef.current = request;
      setPublishing(true);

      return request
        .then(result => {
          if (requestRef.current !== request || !result) return;

          onSuccess();
        })
        .catch(() => undefined)
        .finally(() => {
          if (requestRef.current !== request) return;

          requestRef.current = null;
          setPublishing(false);
        });
    },
    [appId, onSuccess],
  );

  useEffect(() => {
    return () => {
      const request = requestRef.current;

      requestRef.current = null;
      request?.abort?.();
    };
  }, []);

  return { publish, publishing };
}
