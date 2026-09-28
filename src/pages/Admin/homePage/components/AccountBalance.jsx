import React, { Fragment, useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Modal, Tooltip } from 'ming-ui/antd-components';
import agentAjax from 'src/api/agent.js';
import certificationApi from 'src/api/certification.js';
import projectSettingAjax from 'src/api/projectSetting';
import PurchaseExpandPack from 'src/pages/Admin/components/PurchaseExpandPack.jsx';
import { useSelectCertification } from 'src/pages/certification/components/SelectCertification';
import { useEarlyWarningDialog } from 'src/pages/workflow/WorkflowList/components/WorkflowMonitor/EarlyWarningDialog';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { formatNumberThousand } from 'src/utils/domain/control/number';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { pathCompletion } from 'src/utils/platform/navigation/path';

const AccountBalanceHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const DashedText = styled.span`
  cursor: pointer;
  text-decoration-line: underline;
  text-decoration-style: dashed;
  text-decoration-color: transparent;
  text-underline-offset: 4px;

  &:hover {
    text-decoration-color: currentColor;
  }
`;

const AIWelfarePointLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 22px;
`;

const AIWelfarePointValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .monthlyRemaining {
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
  }
`;

const PRIMARY_ROUND_BUTTON_PROPS = { type: 'primary', shape: 'round' };

// 组织管理首页-账户信用点卡片
export default function AccountBalance(props) {
  const { projectId, data, authority, isTrial, isFree, trialAuthenticate, refreshFlag, updateData = () => {} } = props;
  const isSaas = !window.platformENV.isLocal;
  const [agentBillingFreeQuota, setAgentBillingFreeQuota] = useState({});
  const { open: openSelectCertification, holder: selectCertificationHolder } = useSelectCertification();
  const { open: openEarlyWarningDialog, holder: earlyWarningDialogHolder } = useEarlyWarningDialog();
  const { balanceInfo } = data;
  const hasBalance = authority.includes(PERMISSION_ENUM.FINANCE);
  const hasBalanceInfo = !_.isEmpty(balanceInfo) && hasBalance;
  const { grantedMonthlyCredits = 0 } = agentBillingFreeQuota;

  const renderAIWelfarePointValue = () => {
    if (isFree) {
      return <span className="Bold">{formatNumberThousand(agentBillingFreeQuota.remainingCredits)}</span>;
    }

    const { giftRemaining = 0, monthlyRemaining = 0 } = agentBillingFreeQuota;
    const monthlyRemainingNode = (
      <Tooltip
        title={_l('每月1日00:00自动刷新为 %0 福利点，不累加', formatNumberThousand(grantedMonthlyCredits))}
        placement="bottom"
      >
        <span className="monthlyRemaining">{formatNumberThousand(monthlyRemaining)}</span>
      </Tooltip>
    );

    return (
      <AIWelfarePointValue className="Bold">
        {giftRemaining > 0 && (
          <Fragment>
            <span>{formatNumberThousand(giftRemaining)}</span>
            <span className="textTertiary">+</span>
          </Fragment>
        )}
        {monthlyRemainingNode}
      </AIWelfarePointValue>
    );
  };

  const getAgentBillingFreeQuota = useCallback(() => {
    if (!projectId || !isSaas) return;

    agentAjax
      .getAgentBillingFreeQuota({ projectId }, { silent: true })
      .then(res => {
        setAgentBillingFreeQuota(res.data || {});
      })
      .catch(() => {
        setAgentBillingFreeQuota({});
      });
  }, [isSaas, projectId]);

  // 设置信用点警告提醒
  const setBalanceLimitNotice = ({ noticeEnabled, balanceLimit, notifiers, noticeTypes, closeDialog = () => {} }) => {
    projectSettingAjax
      .setBalanceLimitNotice({
        projectId,
        noticeEnabled,
        balanceLimit,
        accountIds: notifiers.map(v => v.accountId),
        noticeTypes: _.uniq(noticeTypes),
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          closeDialog();
          updateData({
            balanceInfo: {
              ...data.balanceInfo,
              noticeEnabled,
              balanceLimit,
              noticeAccounts: notifiers,
              noticeTypes,
            },
          });
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  };

  const setEarlyWarning = () => {
    const { balanceInfo = {} } = data;

    openEarlyWarningDialog({
      type: 'balance',
      projectId,
      warningValue: balanceInfo.balanceLimit,
      isWarning: balanceInfo.noticeEnabled,
      notifiers: balanceInfo.noticeAccounts,
      noticeTypes: balanceInfo.noticeTypes,
      onOk: (warningValue, notifiers, noticeTypes, closeDialog) => {
        setBalanceLimitNotice({
          noticeEnabled: true,
          balanceLimit: warningValue,
          notifiers,
          noticeTypes,
          closeDialog,
        });
      },
      closeWarning: (warningValue, notifiers, noticeTypes, closeDialog) => {
        setBalanceLimitNotice({
          noticeEnabled: false,
          balanceLimit: 0,
          notifiers,
          noticeTypes,
          closeDialog,
        });
      },
    });
  };

  // 身份认证
  const handleAuthenticate = () => {
    Modal.confirm({
      title: _l('请先完成组织身份认证'),
      content: _l('需要完成组织身份认证后才能进行信用点充值'),
      okText: _l('前往认证'),
      onOk: () => {
        certificationApi
          .getCertInfoList({
            certSource: 1,
            isUpgrade: false,
          })
          .then(res => {
            if (res && !!res.length) {
              openSelectCertification({
                certList: res,
                projectId,
                onUpdateCertStatus: authType =>
                  updateData({
                    authType,
                  }),
              });
            } else {
              navigateTo(`/certification/project/${projectId}?returnUrl=${encodeURIComponent(location.href)}`);
            }
          });
      },
    });
  };

  const handleClickRecherge = () => {
    if (isFree && !data.authType) {
      handleAuthenticate();
      return;
    }

    location.assign(pathCompletion(`/admin/valueaddservice/${projectId}`));
  };

  useEffect(() => {
    getAgentBillingFreeQuota();
  }, [getAgentBillingFreeQuota, refreshFlag]);

  return (
    <div className="infoCard">
      {selectCertificationHolder}
      {earlyWarningDialogHolder}
      <div>
        <AccountBalanceHeader className="mBottom6">
          <div className="Font16 bold textPrimary valignWrapper">
            {_l('信用点')}
            <Tooltip
              title={
                <div>
                  {isSaas ? (
                    <Fragment>
                      <div>
                        {_l(
                          '「信用点」用于系统中Mingo AI功能、发送邮件、短信等计费服务自动扣费。为避免系统功能不可用，请确保账户信用点余额充足。',
                        )}
                      </div>
                      <div className="mTop12">
                        {_l(
                          '其中「AI 福利点」为平台赠送额度（1福利点=1个信用点），仅抵扣 Mingo AI功能费用；使用时会优先消耗 AI 福利点，额度用尽后再从通用信用点扣费。',
                        )}
                      </div>
                    </Fragment>
                  ) : (
                    <div>
                      {_l(
                        '「信用点」用于发送邮件、短信等计费服务自动扣费。为避免系统功能不可用，请确保账户信用点余额充足。',
                      )}
                    </div>
                  )}
                  <div className="mTop12">{_l('在「管理」中可查看扣费标准，或关闭自动扣费。')}</div>
                </div>
              }
              placement="bottom"
            >
              <Icon icon="help" className="mLeft6 hoverColorPrimary helpIcon" />
            </Tooltip>
          </div>
          {hasBalanceInfo && (
            <DashedText className="Font13 textSecondary" onClick={setEarlyWarning}>
              {balanceInfo.noticeEnabled ? _l('预警（<%0）', balanceInfo.balanceLimit || 0) : _l('信用点余额预警')}
            </DashedText>
          )}
        </AccountBalanceHeader>
        <div className="mBottom6 flexRow alignItemsCenter">
          <span className="Font28 textPrimary Bold Hand">
            {data.hideBalance ? '*****' : formatNumberThousand(data.balance)}
          </span>
          <Icon
            icon={data.hideBalance ? 'eye_off' : 'eye'}
            className="textTertiary eyeIcon Hand"
            onClick={() => updateData({ hideBalance: !data.hideBalance })}
          />
        </div>
        {isSaas && (
          <AIWelfarePointLine className="Font14">
            <span>{_l('AI 福利点:')}</span>
            {renderAIWelfarePointValue()}
          </AIWelfarePointLine>
        )}
      </div>
      <div className="buttons">
        {trialAuthenticate ? (
          <Button
            color="orange"
            variant="filled"
            shape="round"
            icon={<Icon icon="gift" />}
            onClick={handleAuthenticate}
          >
            {_l('认证组织+10信用点')}
          </Button>
        ) : (
          <Fragment>
            {!window.platformENV.isLocal &&
              (window.platformENV.isOverseas ? (
                <PurchaseExpandPack
                  buttonProps={PRIMARY_ROUND_BUTTON_PROPS}
                  text={_l('充值')}
                  type="recharge"
                  projectId={projectId}
                />
              ) : (
                (data.authType || !isTrial) && (
                  <Button type="primary" shape="round" onClick={handleClickRecherge}>
                    {_l('充值')}
                  </Button>
                )
              ))}
            {hasBalance && (
              <Fragment>
                <Button shape="round" onClick={() => navigateTo(`/admin/billinfo/${projectId}/recharge`)}>
                  {_l('使用明细')}
                </Button>
                {isSaas && (
                  <Button shape="round" onClick={() => updateData({ balanceManageVisible: true })}>
                    {_l('管理')}
                  </Button>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
}
