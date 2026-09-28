import React, { useEffect, useRef, useState } from 'react';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import openAuthorAjax from 'src/api/openAuthor';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import ConnectAiDialog from './ConnectAiDialog';

function ConnectAiEntry({ projectId }) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialPersonalTokens, setInitialPersonalTokens] = useState(null);
  const ajaxRef = useRef(null);

  useEffect(() => {
    return () => {
      ajaxRef.current?.abort?.();
      ajaxRef.current = null;
    };
  }, []);

  const handleOpen = () => {
    if (loading) return;

    if (!projectId || projectId === 'external') {
      setInitialPersonalTokens(null);
      setVisible(true);
      return;
    }

    ajaxRef.current?.abort?.();
    const request = openAuthorAjax.getPATsByProject({ status: 1, projectId });

    ajaxRef.current = request;
    setLoading(true);

    request
      .then(res => {
        setInitialPersonalTokens(res || []);
        setVisible(true);
      })
      .finally(() => {
        ajaxRef.current = null;
        setLoading(false);
      });
  };

  const handleOpenPersonalAccessTokenDrawer = () => {
    setVisible(false);

    if (typeof window.openSettingDrawer === 'function') {
      window.openSettingDrawer({ navType: 'auth', authTab: 'pat' });
      return;
    }

    location.href = pathCompletion('/dashboard');
  };

  return (
    <>
      <Button
        className="mRight12"
        color="var(--color-mingo)"
        style={{ border: '1px solid currentColor' }}
        variant="text"
        shape="round"
        loading={loading}
        icon={<Icon icon="workflow_c" className="Font18" />}
        aria-disabled={loading}
        onClick={handleOpen}
      >
        <span className="bold textPrimary">{_l('连接 AI')}</span>
      </Button>
      {visible && (
        <ConnectAiDialog
          visible={visible}
          projectId={projectId}
          initialPersonalTokens={initialPersonalTokens}
          onOpenPersonalAccessTokenDrawer={handleOpenPersonalAccessTokenDrawer}
          onCancel={() => setVisible(false)}
        />
      )}
    </>
  );
}

export default ConnectAiEntry;
