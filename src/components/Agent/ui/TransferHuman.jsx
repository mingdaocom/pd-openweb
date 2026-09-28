import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, Support } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import ShareUrl from 'worksheet/components/ShareUrl';
import { SHARE_SCOPE, updatePublicShareStatus } from 'src/pages/worksheet/components/Share/controller';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { emitter } from 'src/utils/platform/browser/dom';
import { createSessionShare, SESSION_SHARE_SCOPE } from '../agentService';

// 打开人工客服（对齐老帮助中心 handleCallHelp）：明道 APP 内走原生客服桥（可把会话链接直接带进客服消息），
// 其余环境先收起 Mingo 抽屉，再打开网易七鱼（脚本就绪后由 src/common/runtime/ga.js 挂载 mdCustomerServiceOpen）
export function openCustomerService(url) {
  if (window.md_js && window.md_js.customerService) {
    window.md_js.customerService(url ? { message: url } : {});
    return;
  }

  emitter.emit('SET_MINGO_VISIBLE', { mingoVisible: false });
  if (window.mdCustomerServiceOpen) {
    window.mdCustomerServiceOpen();
  }
}

// 开启帮助会话的公开分享并取链接（对齐老帮助中心：无条件置为开启）；复用 mingoHistory 实体分享（sourceType 73）。
// 智能客服转人工的分享必须是「公开」范围：外部人工客服无需登录 / 组织成员即可打开。为此显式传 scope=PUBLIC，
// 并按两步流程在 agent 侧以 public scope 建分享实体（不指定 scope 时后端会落到组织内范围，外部客服打不开）。
export function fetchHelpSessionShareUrl(sessionId) {
  return updatePublicShareStatus({
    from: 'mingoHistory',
    sourceId: sessionId,
    isPublic: true,
    scope: SHARE_SCOPE.PUBLIC,
    createShareSource: () => createSessionShare({ sessionId, scope: SESSION_SHARE_SCOPE.PUBLIC }),
  }).then(res => (res && res.shareLink) || '');
}

const BarWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

// 帮助会话输入框上方常驻栏（对齐老帮助中心 sendHeader）：左「帮助文档」跳帮助站点，右「人工客服」转人工。
// 首页（无会话）与对话态共用；转人工的具体行为（取链接弹分享层 / 直接开客服窗口）由调用方决定。
export function HelpComposerBar({ onTransfer = () => {} }) {
  return (
    <BarWrap>
      <Support href="https://help.mingdao.com">
        <BgIconButton icon="book" text={_l('帮助文档')} />
      </Support>
      <BgIconButton icon="support_agent" tooltip={_l('人工客服')} popupPlacement="top" onClick={() => onTransfer()} />
    </BarWrap>
  );
}

HelpComposerBar.propTypes = {
  onTransfer: PropTypes.func,
};

// 转人工分享弹层（对齐老帮助中心）：展示会话公开链接，点「复制」即关闭弹层并打开人工客服，
// 复制动作与「复制成功」提示由 ShareUrl 完成；APP 内经原生桥把链接直接带进客服消息
export function TransferHumanDialog({ url, onClose = () => {} }) {
  return (
    <Modal open width={660} title={_l('分享')} mask={{ closable: true }} keyboard onCancel={onClose}>
      <div className="mBottom10 textTertiary">{_l('将当前会话链接分享给人工客服')}</div>
      <ShareUrl
        theme="light"
        copyShowText
        url={url}
        copyText={browserIsMobile() ? _l('复制并前往') : _l('复制')}
        qrVisible={false}
        allowSendToChat={false}
        getCopyContent={copyUrl => {
          onClose();
          openCustomerService(copyUrl);
          return copyUrl;
        }}
      />
    </Modal>
  );
}

TransferHumanDialog.propTypes = {
  url: PropTypes.string,
  onClose: PropTypes.func,
};
