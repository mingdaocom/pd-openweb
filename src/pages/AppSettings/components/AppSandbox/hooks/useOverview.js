import { useCallback, useEffect, useRef, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { OVERVIEW_DIALOG_TYPE, REVIEW_MODE } from '../constants';
import { normalizeReviewMode } from '../version';

const isRequestSuccess = result => result === true || result?.code === 1;

/** 获取概览数据，并统一处理审核规则修改与关闭应用两个互斥写操作。 */
export default function useOverview({ appId, loadSummary, onDisabled }) {
  const [reviewState, setReviewState] = useState({ appId: '', value: REVIEW_MODE.ADMIN });
  const [summaryState, setSummaryState] = useState({ appId: '', value: {} });
  const [submitting, setSubmitting] = useState(false);
  const requestRef = useRef(null);
  const reviewLoading = reviewState.appId !== appId;
  const summaryLoading = loadSummary && summaryState.appId !== appId;
  const reviewRule = reviewLoading ? REVIEW_MODE.ADMIN : reviewState.value;
  const summary = summaryLoading ? {} : summaryState.value;

  useEffect(() => {
    // 审核规则在生产、沙盒两端都需要展示。
    let canceled = false;
    const request = appSandboxAjax.getReviewConfig({ appId });

    request
      .then(result => {
        if (!canceled) setReviewState({ appId, value: normalizeReviewMode(result) });
      })
      .catch(() => {
        if (!canceled) setReviewState({ appId, value: REVIEW_MODE.ADMIN });
      });

    return () => {
      canceled = true;
      request?.abort?.();
    };
  }, [appId]);

  useEffect(() => {
    // 当前运行版本只属于生产环境，沙盒端跳过该请求。
    if (!loadSummary) return;

    let canceled = false;
    const request = appSandboxAjax.getAppSummary({ appId });

    request
      .then(result => {
        // GetAppSummary 返回 { code, data }，概览卡片直接消费 data 中的后端字段。
        if (!canceled) setSummaryState({ appId, value: result?.data || {} });
      })
      .catch(() => {
        if (!canceled) setSummaryState({ appId, value: {} });
      });

    return () => {
      canceled = true;
      request?.abort?.();
    };
  }, [appId, loadSummary]);

  useEffect(() => {
    return () => {
      const request = requestRef.current;

      requestRef.current = null;
      request?.abort?.();
    };
  }, []);

  const submit = useCallback(
    async ({ type, reviewMode }) => {
      // 两个确认弹层共享一个请求锁，防止快速切换弹层造成并行写入。
      if (requestRef.current) return false;

      const isReviewRule = type === OVERVIEW_DIALOG_TYPE.REVIEW_RULE;
      const errorMessage = isReviewRule ? _l('设置审核规则失败，请稍后重试') : _l('关闭应用沙盒失败，请稍后重试');
      const request = isReviewRule
        ? appSandboxAjax.setReviewConfig({ appId, reviewMode }, { silent: true })
        : appSandboxAjax.disable({ appId }, { silent: true });

      requestRef.current = request;
      setSubmitting(true);

      try {
        const result = await request;

        if (requestRef.current !== request || !isRequestSuccess(result)) {
          if (requestRef.current === request) alert(errorMessage, 2);
          return false;
        }

        if (isReviewRule) {
          setReviewState({ appId, value: reviewMode });
        } else {
          onDisabled();
        }

        return true;
      } catch (requestError) {
        if (requestRef.current === request) alertIfNotUnauthorized(requestError, errorMessage, 2);
        return false;
      } finally {
        if (requestRef.current === request) {
          requestRef.current = null;
          setSubmitting(false);
        }
      }
    },
    [appId, onDisabled],
  );

  return { loading: reviewLoading || summaryLoading, reviewRule, summary, submitting, submit };
}
