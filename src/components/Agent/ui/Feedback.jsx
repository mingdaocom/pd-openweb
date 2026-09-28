import React, { useEffect, useRef, useState } from 'react';
import { Popup } from 'antd-mobile';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import agentAjax from 'src/api/agent';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { isUnauthorizedError } from 'src/utils/services/request/error';

// 嵌入态参数：去掉表单自身的背景 / 页头 / 页脚，提交按钮右对齐并收窄底部间距（弹层自身已贴边），
// 同时开启 Command/Ctrl + Enter 提交。地址与其上的 traceId / orgId 均由服务端拼好，
// 这里只补渲染与交互相关参数，不改动上下文参数。
const FEEDBACK_FORM_DISPLAY_PARAMS = {
  bg: 'no',
  header: 'no',
  footer: 'no',
  submit: 'right',
  submitbottom: 20,
  hotkey: 'yes',
};
// 提交完成广播：由 src/pages/PublicWorksheet/PublicWorksheet.jsx 的 notifyParentSubmitted 发出，
// 两端类型串必须一致。来源 origin 取自服务端下发的地址，跨域时 postMessage 同样可达。
const PUBLIC_WORKSHEET_SUBMITTED = 'PUBLIC_WORKSHEET_SUBMITTED';

function withDisplayParams(url) {
  const parsed = new URL(url);

  Object.entries(FEEDBACK_FORM_DISPLAY_PARAMS).forEach(([key, value]) => parsed.searchParams.set(key, value));

  return parsed.toString();
}

// 接口错误码 → 用户可理解的提示；401 由请求层统一引导登录，不走这里。
function getFeedbackErrorText(error) {
  switch (error && error.data && error.data.errorCode) {
    case 'feedback_form_not_found':
      return _l('反馈入口暂未开放');
    case 'trace_not_found':
    case 'invalid_request':
      return _l('当前请求暂不可反馈');
    case 'feedback_form_invalid':
      return _l('反馈服务暂不可用，请稍后重试');
    default:
      return _l('打开反馈页面失败，请稍后重试');
  }
}

// 表单首屏有自己的骨架屏，这里不再叠加 loading，只负责撑出嵌入区域的高度
const FormFrame = styled.iframe`
  display: block;
  width: 100%;
  height: ${props => props.$height};
  border: 0;
`;

// 取地址期间与失败态的占位，高度与 iframe 保持一致，避免弹层高度跳动。
// 占位态与表单态共用同一套弹层样式，body 被上移的那段由占位自己用 padding-top 补回来，
// 内容才不会被标题栏盖住；高度按 border-box 计算，两态外框高度仍然一致。
const FeedbackHint = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding-top: ${props => props.$paddingTop}px;
  height: ${props => props.$height};
  color: var(--color-text-tertiary);
`;

// 弹层内边距在 .hap-modal-container 上，body 用负 margin 抵消掉，让嵌入的表单与弹层连成一体：
// 右侧铺满使表单自身的滚动条贴在弹层右缘，左侧留 8px 让字段与标题对齐，上下则贴近标题与弹层底边。
// body 上移后会盖住标题栏，header 提一层 z-index 保证标题与关闭按钮仍可见可点；
// container 收 overflow 是因为 body 已被负 margin 撑出容器，不裁掉会溢出弹层圆角。
const FEEDBACK_BODY_MARGIN_TOP = -38;
const FEEDBACK_MODAL_STYLES = {
  container: { overflow: 'hidden', paddingBottom: 0 },
  body: { marginRight: -24, marginLeft: -16, marginTop: FEEDBACK_BODY_MARGIN_TOP, marginBottom: 0 },
  header: { zIndex: 2 },
};

// Popup 没有 Modal 那套标题 chrome，移动端需要自己补标题栏与关闭入口
const MobileFeedbackBody = styled.div`
  color: var(--color-text-primary);

  .feedbackHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    font-size: 17px;
    font-weight: 600;
    line-height: 24px;
  }

  .feedbackClose {
    color: var(--color-text-tertiary);
    cursor: pointer;
  }
`;

function AgentFeedback({ onClose, traceId, projectId }) {
  const isMobile = browserIsMobile();
  const frameRef = useRef(null);
  const [formUrl, setFormUrl] = useState('');
  const [errorText, setErrorText] = useState('');
  const frameHeight = isMobile ? '70vh' : 'min(553px, 70vh)';
  // 移动端 Popup 自带标题栏，body 没有上移，占位不需要补这段间距
  const hintPaddingTop = isMobile ? 0 : -FEEDBACK_BODY_MARGIN_TOP;

  // 表单地址由服务端下发：服务端校验 traceId 归属当前账号后，把 traceId / projectId 编码进地址
  // （projectId 映射为 orgId），前端直接使用返回值，不再自行拼接上下文参数。
  useEffect(() => {
    let aborted = false;

    agentAjax
      .getAgentFeedbackFormUrl({ traceId, projectId }, { silent: true })
      .then(res => {
        if (aborted) return;

        const url = res && res.data && res.data.url;

        if (!url) {
          setErrorText(getFeedbackErrorText());
          return;
        }

        setFormUrl(withDisplayParams(url));
      })
      .catch(error => {
        if (aborted) return;

        // 401 由请求层统一引导登录，这里不再重复提示
        if (isUnauthorizedError(error)) return;

        setErrorText(getFeedbackErrorText(error));
      });

    return () => {
      aborted = true;
    };
  }, [traceId, projectId]);

  // 表单提交完成后自行关闭弹层。消息来自 iframe 内的公开表单，属于外部输入：必须同时校验来源 origin
  // （取自服务端下发的地址）、发送窗口是本弹层这个 iframe、以及消息类型，任一不符都忽略。
  useEffect(() => {
    if (!formUrl) return;

    const formOrigin = new URL(formUrl).origin;

    const onMessage = event => {
      if (event.origin !== formOrigin) return;

      if (event.source !== frameRef.current?.contentWindow) return;

      if (!event.data || event.data.type !== PUBLIC_WORKSHEET_SUBMITTED) return;

      onClose();
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [formUrl, onClose]);

  const content = errorText ? (
    <FeedbackHint $height={frameHeight} $paddingTop={hintPaddingTop}>
      {errorText}
    </FeedbackHint>
  ) : formUrl ? (
    <FormFrame ref={frameRef} src={formUrl} title={_l('反馈')} $height={frameHeight} />
  ) : (
    <FeedbackHint $height={frameHeight} $paddingTop={hintPaddingTop}>
      <LoadDiv />
    </FeedbackHint>
  );

  return isMobile ? (
    <Popup visible className="mobileModal topRadius" onMaskClick={onClose}>
      <MobileFeedbackBody>
        <div className="feedbackHeader">
          <span>{_l('反馈')}</span>
          <Icon className="feedbackClose Font20" icon="close" onClick={onClose} />
        </div>
        {content}
      </MobileFeedbackBody>
    </Popup>
  ) : (
    <Modal
      open
      width={640}
      title={_l('反馈')}
      keyboard
      mask={{ closable: true }}
      footer={null}
      styles={FEEDBACK_MODAL_STYLES}
      onCancel={onClose}
    >
      {content}
    </Modal>
  );
}

export default function useAgentFeedback() {
  return useFunctionWrapComponent(AgentFeedback);
}
