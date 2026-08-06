import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import openAuthorAjax from 'src/api/openAuthor';
import ConnectAiDialog from './ConnectAiDialog';

const ConnectAiButton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 16px;
  margin-right: 12px;
  border-radius: 20px;
  border: 1px solid #6f00ff;
  cursor: pointer;
  color: var(--color-text-primary);

  .Icon {
    margin-right: 6px;
    font-size: 18px;
    color: #6f00ff;
  }

  .icon-loading_button {
    display: inline-block;
    animation: rotate 0.6s infinite linear;
  }

  &:hover {
    background: rgba(111, 0, 255, 0.12);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background: transparent;
    }
  }
`;

export default function ConnectAiEntry({ projectId }) {
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

  return (
    <>
      <ConnectAiButton className={cx({ disabled: loading })} aria-disabled={loading} onClick={handleOpen}>
        <Icon icon={loading ? 'loading_button' : 'workflow_c'} />
        <span className="bold">{_l('连接 AI')}</span>
      </ConnectAiButton>
      {visible && (
        <ConnectAiDialog
          visible={visible}
          projectId={projectId}
          initialPersonalTokens={initialPersonalTokens}
          onCancel={() => setVisible(false)}
        />
      )}
    </>
  );
}
