import React, { useEffect, useRef, useState } from 'react';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Drawer, Tooltip } from 'ming-ui/antd-components';
import agentAjax from 'src/api/agent';
import billingAjax from 'src/api/billing';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { getAITypeLabel } from '../config';
import { formatBillingDeduction, formatBillingNumber, getCreditTypeLabel } from './config';

const EMPTY_DETAIL = { cacheKey: '', loading: false, list: [] };
const LOADING_DETAIL = { loading: true, list: [] };

const getErrorMessage = error => error?.errorMessage || error?.data?.errorMessage || _l('获取扣费明细失败');

export default function BillingDetailDrawer({ projectId, detail, onClose = () => {} }) {
  const [detailData, setDetailData] = useState(EMPTY_DETAIL);
  const cacheRef = useRef(new Map());
  const { traceId, instanceId, amountType } = detail;
  const isInstanceDetail = Boolean(instanceId);
  const id = instanceId || traceId;
  const cacheKey = projectId && id ? `${isInstanceDetail ? 'instance' : 'trace'}_${projectId}_${id}` : '';

  useEffect(() => {
    if (!cacheKey) return;

    let cancelled = false;

    if (cacheRef.current.has(cacheKey)) {
      setDetailData({ cacheKey, loading: false, list: cacheRef.current.get(cacheKey) });
      return;
    }

    setDetailData({ cacheKey, loading: true, list: [] });
    const request = isInstanceDetail
      ? billingAjax.getCreditPointDetailsByInstanceId({ projectId, instanceId: id })
      : agentAjax.getAgentBillingTransactionsByTraceId({ projectId, traceId: id });

    request
      .then(res => {
        if (!isInstanceDetail && !res.success) throw res;

        const list = isInstanceDetail ? res.items : res.data.items;
        cacheRef.current.set(cacheKey, list);
        if (!cancelled) setDetailData({ cacheKey, loading: false, list });
      })
      .catch(error => {
        if (!isInstanceDetail) alertIfNotUnauthorized(error, getErrorMessage(error), 2);
        if (!cancelled) setDetailData({ cacheKey, loading: false, list: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, id, isInstanceDetail, projectId]);

  const { loading, list } = detailData.cacheKey === cacheKey ? detailData : LOADING_DETAIL;
  const isAIBenefit = amountType === 'aiBenefit';
  const idLabel = isInstanceDetail ? 'InstanceID' : 'TraceID';

  return (
    <Drawer
      className="billingAgentDetailDrawer"
      open
      width={980}
      destroyOnHidden
      placement="right"
      title={
        <div className="agentBillingDetailTitle flexRow alignItemsCenter">
          <span>{_l('扣费明细')}</span>
          <span className="traceIdText mLeft24 Font13 Normal ellipsis" title={id}>
            {idLabel}：{id}
          </span>
          <Tooltip title={_l('复制')} placement="top">
            <Icon
              icon="content-copy"
              className="Font16 textTertiary pointer hoverColorPrimary mLeft8"
              onClick={() => {
                copy(id);
                alert(_l('复制成功'));
              }}
            />
          </Tooltip>
        </div>
      }
      onClose={onClose}
    >
      {loading ? (
        <LoadDiv />
      ) : list.length ? (
        <div className="agentBillingDetailTable">
          {isInstanceDetail ? (
            <>
              <div className="agentBillingDetailRow agentBillingDetailHeader instanceBillingDetailRow">
                <div className="detailName">{_l('产品类型')}</div>
                <div className="credits">{_l('信用点')}</div>
                <div className="createTime">{_l('时间')}</div>
              </div>
              {list.map((item, index) => (
                <div className="agentBillingDetailRow instanceBillingDetailRow" key={item.id || `${id}_${index}`}>
                  <div className="detailName ellipsis" title={getCreditTypeLabel(item.businessType)}>
                    {getCreditTypeLabel(item.businessType)}
                  </div>
                  <div className="credits">{formatBillingNumber(item.amount)}</div>
                  <div className="createTime">{item.createTime}</div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="agentBillingDetailRow agentBillingDetailHeader">
                <div className="detailName">{_l('明细项')}</div>
                <div className="model">{_l('模型')}</div>
                <div className="credits">{isAIBenefit ? _l('AI 福利点') : _l('信用点')}</div>
                <div className="createTime">{_l('创建时间')}</div>
              </div>
              {list
                .filter(item => {
                  const value = isAIBenefit ? item.freeApplied : item.credits;
                  return _.isNil(value) || value === '' || !_.isFinite(Number(value)) || Number(value) !== 0;
                })
                .map((item, index) => {
                  const sceneLabel = item.scene ? getAITypeLabel(item.scene) : '';
                  const detailName =
                    sceneLabel && item.agentName
                      ? `${sceneLabel} · ${item.agentName}`
                      : sceneLabel || item.agentName || '-';
                  return (
                    <div className="agentBillingDetailRow" key={`${id}_${index}`}>
                      <div className="detailName">
                        <Tooltip title={detailName} placement="top">
                          <span className="InlineBlock wMax100 ellipsis cursorDefault">{detailName}</span>
                        </Tooltip>
                      </div>
                      <div className="model ellipsis" title={item.model}>
                        {item.model || '-'}
                      </div>
                      <div className="credits">
                        {formatBillingDeduction(isAIBenefit ? item.freeApplied : item.credits)}
                      </div>
                      <div className="createTime">{item.createTime}</div>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      ) : (
        <div className="emptyList">{_l('暂无扣费明细')}</div>
      )}
    </Drawer>
  );
}
