import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import { formatControlToServer } from 'src/components/Form/core/utils';
import { getPssId } from 'src/utils/platform/auth/pssId';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { accountResultAction, setAutoLoginKey, statusList } from './util';

const Wrap = styled.div`
  .Hide {
    display: none;
  }
  img {
    max-width: 100%;
    object-fit: contain;
  }
  overflow: auto;
  padding: 64px 48px;
  box-sizing: border-box;
  width: 50%;
  max-width: 840px;
  min-width: 360px;
  height: 100%;
  background: var(--color-background-primary);
  .logoImageUrlIcon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    div {
      height: 28px;
    }
  }
  p {
    margin: 0;
    padding: 0;
  }
  .messageConBox {
    // max-width: 600px;
    margin: 0 auto;
  }
  &.isCenterCon {
    padding: 24px 32px;
    border-radius: 4px;
    margin: 32px auto;
    min-width: 800px;
    background: var(--color-background-primary);
    height: auto;
    box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.16);
    overflow: auto;
    .messageConBox {
      // max-width: 600px;
    }
  }
  &.isR {
    margin: 0 0 0 auto;
  }
  &.isM {
    position: relative;
    margin: 10px auto;
    border-radius: 4px;
    width: 95%;
    min-width: 95%;
    padding: 48px 24px 23px;
    .messageConBox {
      margin: 0 auto;
    }
  }
  .send {
    background: var(--color-primary);
    height: 40px;
    border-radius: 6px;
    line-height: 40px;
    color: var(--color-text-inverse);
    max-width: 120px;
    margin: 0 auto;
    &:hover {
      background: var(--color-primary-dark);
    }
    &:active {
      background: var(--color-primary-dark);
    }
  }
`;

// 登录及重新验证前移除表单临时分享上下文，避免把旧 clientId 带入下一次身份验证。
function clearCollectionClientId() {
  window.clientId = '';
  sessionStorage.removeItem('clientId');
}

/* 只恢复本次提交移除的匿名表单身份，不能覆盖新凭证或与已登录账号混用。 */
function captureCollectionContext(state) {
  if (
    window.clientId !== state ||
    sessionStorage.getItem('clientId') !== state ||
    getPssId() ||
    _.get(window.md, 'global.Account.accountId')
  )
    return null;
  return {
    state,
    shareState: window.shareState,
    isPublicForm: window.shareState.isPublicForm,
    isPublicFormPreview: window.shareState.isPublicFormPreview,
  };
}

function getCollectionContextRestorer(context) {
  if (
    !context ||
    window.clientId ||
    sessionStorage.getItem('clientId') ||
    getPssId() ||
    _.get(window.md, 'global.Account.accountId') ||
    window.shareState !== context.shareState ||
    window.shareState.isPublicForm !== context.isPublicForm ||
    window.shareState.isPublicFormPreview !== context.isPublicFormPreview
  )
    return null;
  // 业务结果会同步调用 setAutoLoginKey 清空分享标记；在调用前确认所有权，随后同步恢复。
  return () => {
    window.clientId = context.state;
    sessionStorage.setItem('clientId', context.state);
    window.shareState.isPublicForm = context.isPublicForm;
    window.shareState.isPublicFormPreview = context.isPublicFormPreview;
  };
}

const LoadableForm = lazy(() => import('src/components/Form'));

export default function Info(props) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const {
    pageMode = 3,
    logoImageUrl,
    logoHeight,
    appId,
    state = '',
    setStatus,
    onRestart,
    isAutoLogin,
    autoLogin,
    registerMode = {},
  } = props;
  const [pendingIdentity, setPendingIdentity] = useState(null);
  const [submitFailed, setSubmitFailed] = useState(false);

  const requestIdentity = useMemo(() => ({ appId, state, attempt }), [appId, state, attempt]);
  const pending = useRef(false);
  const requestScope = useRef(null);
  const sending = pendingIdentity === requestIdentity;
  const loading = result?.identity !== requestIdentity;
  const cells = loading ? [] : result.cells;
  const failed = !loading && result.failed;
  const customwidget = useRef(null);
  useEffect(() => {
    const { appId, state } = requestIdentity;
    const scope = { active: true, identity: requestIdentity };
    requestScope.current = scope;
    pending.current = false;
    // 补资料页必须显式携带凭证，缺少时不能降级成可提交的匿名空表单。
    const request = state
      ? externalPortalAjax.getUserCollect({
          appId,
          state,
          lang: getCurrentLangCode(),
        })
      : Promise.reject(new Error('Missing collection state'));
    request
      .then(res => {
        res = (res || []).map(o => {
          if (o.type === 36) {
            //检查框默认值处理
            let defsource = _.get(o, ['advancedSetting', 'defsource']);

            try {
              defsource = safeParse(defsource, 'array')[0] || {};
            } catch (error) {
              console.log(error);
              defsource = {};
            }

            let { staticValue = '' } = defsource;
            return { ...o, value: staticValue || o.value };
          } else if (o.type === 29) {
            return { ...o, enumDefault2: 1 };
          } else {
            return o;
          }
        });
        if (scope.active) setResult({ identity: requestIdentity, cells: res, failed: false });
      })
      .catch(() => {
        if (scope.active) setResult({ identity: requestIdentity, cells: [], failed: true });
      });
    // 账号/凭证变化或卸载后，旧响应不能覆盖新主体的表单。
    return () => {
      scope.active = false;
    };
  }, [requestIdentity]);

  const onLogin = async data => {
    if (pending.current || loading || failed) return;
    const scope = requestScope.current;
    if (!scope?.active || scope.identity !== requestIdentity) return;
    pending.current = true;
    setPendingIdentity(requestIdentity);
    setSubmitFailed(false);
    let collectionContext;

    try {
      const receiveControls = data.map(c => formatControlToServer(c, { isNewRecord: true }));
      collectionContext = captureCollectionContext(state);
      clearCollectionClientId();
      const res = await externalPortalAjax.infoLogin(
        {
          state,
          receiveControls,
          autoLogin: autoLogin && isAutoLogin,
        },
        props.customLink ? { ajaxOptions: { header: { 'Ex-custom-link-path': props.customLink } } } : {},
      );
      // 凭证已切换或页面已离开时，旧提交不可写入自动登录信息、修改父页面状态或触发跳转。
      if (!scope.active) return;
      const { accountResult } = res;
      const editable = accountResult !== 1 && accountResult !== 5 && !statusList.includes(accountResult);
      const restoreContext = getCollectionContextRestorer(collectionContext);
      // 可恢复失败不能清理新的全局身份；成功认证仍沿用原有会话落地流程。
      if (editable && collectionContext && !restoreContext) return;
      setAutoLoginKey({ ...res, appId });
      if (editable && restoreContext) restoreContext();

      // 后端 AccountError（5）表示凭证无效，不能继续留在可提交的表单中。
      if (accountResult === 5) {
        setResult({ identity: requestIdentity, cells: [], failed: true });
      } else if (statusList.includes(accountResult)) {
        setStatus(accountResult);
      } else if (accountResult === 20) {
        alert(
          registerMode.email && registerMode.phone
            ? _l('手机号/邮箱或者验证码错误！')
            : registerMode.phone
              ? _l('手机号或者验证码错误')
              : _l('邮箱或者验证码错误'),
          3,
        );
      } else {
        accountResultAction(res, props.customLink);
      }
    } catch {
      // 网络失败保留用户已填写的表单，只释放在途状态，避免重试时丢失输入。
      if (scope.active) {
        const restoreContext = getCollectionContextRestorer(collectionContext);
        restoreContext && restoreContext();
        setSubmitFailed(true);
      }
    } finally {
      if (scope.active) {
        pending.current = false;
        setPendingIdentity(null);
      }
    }
  };

  return (
    <Wrap
      className={cx('infoCon', {
        isCenterCon: pageMode === 3,
        isR: pageMode === 6 && !browserIsMobile(),
        isM: browserIsMobile(),
      })}
    >
      {loading ? (
        <LoadDiv
          className=""
          style={{
            margin: '50px auto',
          }}
        />
      ) : failed ? (
        <div className="TxtCenter">
          <p>{_l('无法获取补充资料，请重试或重新验证身份')}</p>
          <button type="button" className="mTop16 mRight16" onClick={() => setAttempt(value => value + 1)}>
            {_l('重试')}
          </button>
          <button
            type="button"
            className="mTop16"
            onClick={() => {
              clearCollectionClientId();
              onRestart();
            }}
          >
            {_l('重新验证')}
          </button>
        </div>
      ) : (
        <React.Fragment>
          {logoImageUrl ? <img src={logoImageUrl} height={logoHeight || 40} /> : ''}
          <h6 className="Font28 Bold textPrimary mTop20">{_l('请继续完善信息')}</h6>
          {submitFailed && <p role="alert">{_l('提交失败，请稍后重试')}</p>}
          <div className="messageConBox">
            <Suspense fallback={<LoadDiv className="mTop10" />}>
              <LoadableForm data={cells} ref={customwidget} disableRules />
            </Suspense>
          </div>
          <div
            className={cx('send mTop32 TxtCenter Hand')}
            onClick={() => {
              if (sending || !customwidget.current) {
                return;
              }

              let { data = [], hasError } = customwidget.current.getSubmitData();

              if (data.find(o => o.type === 29 && safeParse(o.value, 'array').length > 5)) {
                alert(_l('最多只能关联 5 条记录'), 3);
                return;
              }

              if (hasError) {
                return;
              }

              onLogin(data);
            }}
          >
            {_l('提交')}
            {sending ? '...' : ''}
          </div>
        </React.Fragment>
      )}
    </Wrap>
  );
}
