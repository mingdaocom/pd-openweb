import React, { Fragment, useEffect, useState } from 'react';
import { Icon } from 'ming-ui';
import { Button, Tooltip } from 'ming-ui/antd-components';
import agentAjax from 'src/api/agent';
import billingAjax from 'src/api/billing';
import { formatNumberThousand } from 'src/utils/domain/control/number';
import { pathCompletion } from 'src/utils/platform/navigation/path';

export default function BalanceHeader({ projectId }) {
  const [hideBalance, setHideBalance] = useState(true);
  const [balance, setBalance] = useState();
  const [quota, setQuota] = useState({});
  const { giftRemaining, monthlyRemaining } = quota;

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    const getBalance = async () => {
      try {
        const res = await billingAjax.getCreditPointBalance({ projectId });
        return res.balance;
      } catch {
        return undefined;
      }
    };

    const getQuota = async () => {
      try {
        const res = await agentAjax.getAgentBillingFreeQuota({ projectId });
        return res.data || {};
      } catch {
        return {};
      }
    };

    Promise.all([getBalance(), getQuota()]).then(([balanceValue, quotaValue]) => {
      if (cancelled) return;

      setBalance(balanceValue);
      setQuota(quotaValue);
    });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="accountInfo">
      <i className="icon-sp_account_balance_wallet_white Font24" />
      <span>{_l('信用点')}</span>
      <span className="balance Font24">
        {balance === undefined ? '-' : hideBalance ? '*****' : formatNumberThousand(balance)}
      </span>
      <Icon
        icon={hideBalance ? 'eye_off' : 'eye'}
        className="textTertiary eyeIcon pointer mRight8"
        onClick={() => setHideBalance(!hideBalance)}
      />
      <Button
        type="primary"
        size="small"
        className="Bold"
        onClick={() => location.assign(pathCompletion(`/admin/valueaddservice/${projectId}`))}
      >
        {_l('充值')}
      </Button>
      <div className="aiWelfarePoint Font14 mLeft20 flexRow alignItemsCenter">
        <span>{_l('AI 福利点:')}</span>
        <span className="Bold mLeft8">
          {giftRemaining > 0 && (
            <Fragment>
              <span>{formatNumberThousand(giftRemaining)}</span>
              <span className="textTertiary mLeft4 mRight4">+</span>
            </Fragment>
          )}
          <span className="monthlyRemaining colorPrimary">
            {monthlyRemaining === undefined ? '-' : formatNumberThousand(monthlyRemaining)}
          </span>
        </span>
        <Tooltip
          title={_l(
            '「AI 福利点」为平台赠送额度（1福利点=1个信用点），仅抵扣 Mingo AI 功能费用；使用时会优先消耗 AI 福利点，额度用尽后再从通用信用点扣费。',
          )}
          placement="bottom"
        >
          <Icon icon="help" className="Font14 mLeft6 textDisabled hoverColorPrimary" />
        </Tooltip>
      </div>
    </div>
  );
}
