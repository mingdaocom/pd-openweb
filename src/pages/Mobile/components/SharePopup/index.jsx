import React, { useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { PopupWrapper } from 'ming-ui/antd-mobile-components';
import { getCurrentProjectId } from 'src/pages/globalSearch/utils';
import { getPublicShare, SHARE_SCOPE, updatePublicShareStatus } from 'src/pages/worksheet/components/Share/controller';
import { copyTextToClipboard } from 'src/utils/platform/browser/clipboard';
import { compatibleMDJS } from 'src/utils/services/project';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

const NOOP = () => {};

const POPUP_STOP_PROPAGATION_EVENTS = ['click', 'touchstart'];

const ScopeList = styled.div`
  padding: 0 20px 16px;
  background: var(--color-background-card);

  .scopeItem {
    min-height: 72px;
    display: flex;
    align-items: center;
    cursor: pointer;

    & + .scopeItem {
      border-top: 1px solid var(--color-border-secondary);
    }

    &.disabled {
      cursor: default;
      opacity: 0.5;
    }
  }

  .scopeContent {
    flex: 1;
    min-width: 0;
  }

  .scopeName {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .scopeDescription {
    margin-top: 4px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .scopeArrow {
    flex-shrink: 0;
    margin-left: 12px;
    font-size: 18px;
    color: var(--color-text-tertiary);
  }
`;

const SCOPE_OPTIONS = [
  {
    scope: SHARE_SCOPE.PUBLIC,
    name: _l('公开分享'),
    description: _l('获得链接的所有人都可以查看'),
  },
  {
    scope: SHARE_SCOPE.PROJECT,
    name: _l('内部成员访问'),
    description: _l('仅限内部成员登录系统后根据权限访问'),
  },
];

async function getShareLink({ from, params, scope, onUpdate }) {
  const requestParams = { from, isPublic: true, ...params };
  const currentShare = await getPublicShare(requestParams);

  if (currentShare?.shareLink && currentShare.scope === scope) return currentShare.shareLink;

  const result = await updatePublicShareStatus({
    ...requestParams,
    scope,
    projectId: params.projectId || getCurrentProjectId(),
    pageTitle: params.title,
    onUpdate,
  });
  let shareLink = result?.shareLink;

  // 工作表、视图开启分享时只返回状态，需再次查询才能得到真实链接。
  if (!shareLink?.trim()) {
    const latestShare = await getPublicShare(requestParams);
    shareLink = latestShare?.shareLink;
  }

  if (!shareLink) throw new Error('create share failed');

  return shareLink;
}

export default function SharePopup({
  from,
  title,
  params = {},
  supportProjectScope = false,
  onUpdate = NOOP,
  onShared = NOOP,
  onClose,
}) {
  const [submitting, setSubmitting] = useState(false);
  const options = supportProjectScope ? SCOPE_OPTIONS : SCOPE_OPTIONS.slice(0, 1);

  const submit = async scope => {
    if (submitting) return;
    setSubmitting(true);

    const isMDApp = window.isMingDaoApp;
    const shareUrlPromise = getShareLink({ from, params, scope, onUpdate });
    // 链接要等接口创建完才有，而剪贴板写入必须发生在本次点击的手势里——等 await 拿到链接再复制，
    // 手势早已失效，移动端只会弹出浏览器原生 prompt。这里在同步栈内就把「未来的链接」交给剪贴板。
    const copiedPromise = isMDApp ? null : copyTextToClipboard(shareUrlPromise);

    try {
      const shareUrl = await shareUrlPromise;

      if (isMDApp) {
        compatibleMDJS('shareContent', {
          type: 1,
          title: params.title || title || _l('未命名'),
          url: shareUrl,
        });
      } else {
        const copied = await copiedPromise;

        alert(copied ? _l('链接已复制') : _l('复制失败'), copied ? 1 : 2);
      }

      onClose();

      try {
        onShared({ scope, shareUrl });
      } catch (error) {
        console.error('[share-popup] onShared failed', error);
      }
    } catch (error) {
      setSubmitting(false);
      console.error('[share-popup] share failed', error);
      alertIfNotUnauthorized(error, _l('分享失败'), 2);
    }
  };

  return (
    <PopupWrapper
      visible
      title={title}
      headerType="withIcon"
      headerTitleAlign="left"
      stopPropagation={POPUP_STOP_PROPAGATION_EVENTS}
      onClose={onClose}
    >
      <ScopeList>
        {options.map(item => (
          <div
            key={item.scope}
            className={cx('scopeItem', { disabled: submitting })}
            onClick={() => submit(item.scope)}
          >
            <div className="scopeContent">
              <div className="scopeName">{item.name}</div>
              <div className="scopeDescription">{item.description}</div>
            </div>
            <Icon className="scopeArrow" icon="arrow-right-border" />
          </div>
        ))}
      </ScopeList>
    </PopupWrapper>
  );
}

SharePopup.propTypes = {
  from: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  params: PropTypes.object,
  supportProjectScope: PropTypes.bool,
  onUpdate: PropTypes.func,
  onShared: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
