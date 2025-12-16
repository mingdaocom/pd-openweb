import React, { Fragment } from 'react';
import _ from 'lodash';
import { Dialog, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import certificationApi from 'src/api/certification.js';
import projectSettingAjax from 'src/api/projectSetting';
import SelectCertification from 'src/pages/certification/SelectCertification';
import { settingEarlyWarning } from 'src/pages/workflow/WorkflowList/components/WorkflowMonitor/EarlyWarningDialog';
import { navigateTo } from 'src/router/navigateTo';
import { formatNumberThousand } from 'src/utils/control';
import { PERMISSION_ENUM } from '../../enum';

// 组织管理首页-账户信用点卡片
export default function AccountBalance(props) {
  const { projectId, data, isLocal, authority, isTrial, isFree, trialAuthenticate, updateData = () => {} } = props;
  const { balanceInfo } = data;
  const hasBalance = authority.includes(PERMISSION_ENUM.FINANCE);

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

    settingEarlyWarning({
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
    Dialog.confirm({
      title: _l('请先完成组织身份认证'),
      description: _l('需要完成组织身份认证后才能进行信用点充值'),
      okText: _l('前往认证'),
      onOk: () => {
        certificationApi.getCertInfoList({ certSource: 1, isUpgrade: false }).then(res => {
          if (res && !!res.length) {
            SelectCertification({
              certList: res,
              projectId,
              onUpdateCertStatus: authType => updateData({ authType }),
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
    location.assign(`/admin/valueaddservice/${projectId}`);
  };

  return (
    <div className="infoCard">
      <div>
        <div className="Font16 bold Gray mBottom6 valignWrapper mBottom6">
          {_l('信用点')}
          <Tooltip
            title={_l(
              '账户余额已升级为“信用点”；信用点用于系统中发送邮件、短信等计费服务自动扣费。为避免系统功能不可用，请确保账户信用点余额充足。',
            )}
            placement="bottom"
          >
            <Icon icon="help" className="mLeft6 Hover_21 helpIcon" />
          </Tooltip>
        </div>
        <div className="mBottom6 flexRow alignItemsCenter">
          <span className="Font28 Gray Bold Hand">
            {data.hideBalance ? '*****' : formatNumberThousand(data.balance)}
          </span>
          <Icon
            icon={data.hideBalance ? 'eye_off' : 'eye'}
            className="Gray_9e eyeIcon Hand"
            onClick={() => updateData({ hideBalance: !data.hideBalance })}
          />
        </div>
        {!_.isEmpty(balanceInfo) && hasBalance && (
          <div className="Font14">
            {!!balanceInfo.noticeEnabled && (
              <span className="Gray_70 mRight8">{_l('预警（<%0信用点）', balanceInfo.balanceLimit || 0)}</span>
            )}
            <span className="ThemeColor Hand hoverColor" onClick={setEarlyWarning}>
              {balanceInfo.noticeEnabled ? _l('设置') : _l('信用点余额预警')}
            </span>
          </div>
        )}
      </div>
      <div className="buttons">
        {trialAuthenticate ? (
          <span className="recharge trialAuthenticate" onClick={handleAuthenticate}>
            <Icon icon="gift" className="mRight5" />
            {_l('认证组织+10信用点')}
          </span>
        ) : (
          <Fragment>
            {!isLocal && ((isTrial && data.authType) || !isTrial) && (
              <span className="blueBtn Bold" onClick={handleClickRecherge}>
                {_l('充值')}
              </span>
            )}
            {hasBalance && (
              <Fragment>
                <span className="whiteBtn Bold" onClick={() => navigateTo(`/admin/billinfo/${projectId}/recharge`)}>
                  {_l('使用明细')}
                </span>
                {!isLocal && (
                  <span className="whiteBtn Bold" onClick={() => updateData({ balanceManageVisible: true })}>
                    {_l('管理')}
                  </span>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
}
