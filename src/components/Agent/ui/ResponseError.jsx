import React, { useState } from 'react';
import styled from 'styled-components';

// 错误码 → 主操作形态：
//  - insufficient_credit（后端 AgentErrorCodes.InsufficientCredit）：信用点不足 → 充值；
//  - quota_exhausted：组织版本配额（工作表/应用数）不足 → 升级（待后端发该码后自动生效）；
//  - 其它：可重试 → 重试。
const ERROR_CODE_INSUFFICIENT_CREDIT = 'insufficient_credit';
const ERROR_CODE_QUOTA_EXHAUSTED = 'quota_exhausted';

// 数值对齐设计稿（Pixso 拦截提示 矩形22176）：卡片 #F0F0F0 圆角 5、1px #DDDDDD 描边、文案 13px；
// 按钮 50x26 圆角 5、字号 13 粗体(700)、间距 10、右对齐；关闭=白底无描边、主按钮 #1677FF 白字。贴在输入框上方。
const Card = styled.div`
  margin: 0 0 8px;
  max-width: 100%;
  padding: 16px;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-tertiary);
  border-radius: 5px;
  .interceptMsg {
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-primary);
    word-break: break-word;
  }
  .interceptActions {
    margin-top: 14px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  .btn {
    height: 26px;
    min-width: 50px;
    padding: 0 12px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    user-select: none;
  }
  .btn-close {
    background: var(--color-background-card);
    color: var(--color-text-primary);
    &:hover {
      background: var(--color-background-hover);
    }
  }
  .btn-primary {
    background: #1677ff;
    color: #fff;
    &:hover {
      background: #0e5fd6;
    }
  }
`;

/**
 * Agent 执行错误 / 拦截提示卡。按 errorCode 分态决定主操作：
 *  - insufficient_credit：信用点不足 → "充值"（onRecharge）；
 *  - quota_exhausted：版本配额不足 → "升级"（onUpgrade）；
 *  - 其它（服务异常等）：可重试 → "重试"（onRetry）。
 * "关闭"默认本地消隐；父级传 onClose 时受控隐藏（贴底拦截卡走此路）。
 *
 * @param {string} [errorCode] 后端 error 事件 errorCode；缺省按"可重试"渲染。
 * @param {() => void} [onRetry] 重试回调（可重试态）。
 * @param {() => void} [onRecharge] 充值弹窗回调（信用点不足态）。
 * @param {() => void} [onUpgrade] 升级弹窗回调（版本配额不足态）。
 * @param {() => void} [onClose] 关闭回调（父级受控隐藏，如贴底拦截卡）；不传则本地消隐。
 */
export function ResponseError({ className, error, errorCode, onRetry, onRecharge, onUpgrade, onClose }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const message = (error && (error.errorMsg || error.message)) || error || _l('请求失败');
  const isCreditExhausted = errorCode === ERROR_CODE_INSUFFICIENT_CREDIT;
  const isQuotaExhausted = errorCode === ERROR_CODE_QUOTA_EXHAUSTED;
  const handleClose = () => (onClose ? onClose() : setDismissed(true));

  // 主操作按钮：信用点不足→充值；配额不足→升级；其它→重试。
  let primaryAction = null;

  if (isCreditExhausted) {
    primaryAction = { label: _l('充值'), onClick: onRecharge };
  } else if (isQuotaExhausted) {
    primaryAction = { label: _l('升级'), onClick: onUpgrade };
  } else if (onRetry) {
    primaryAction = { label: _l('重试'), onClick: onRetry };
  }

  return (
    <Card className={className}>
      <div className="interceptMsg">{message}</div>
      <div className="interceptActions">
        <span className="btn btn-close" onClick={handleClose}>
          {_l('关闭')}
        </span>
        {primaryAction && primaryAction.onClick && (
          <span className="btn btn-primary" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </span>
        )}
      </div>
    </Card>
  );
}
