import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Dialog, FunctionWrap, Radio } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import projectAjax from 'src/api/project';

const TextWrap = styled.div`
  display: inline-block;
  min-width: 300px;
  padding: 10px 16px;
  color: var(--color-text-tertiary);
  background: var(--color-background-secondary);
  border-radius: 3px;
  word-break: break-all;
  &.flexRow {
    display: flex;
  }
`;

function WeChatServiceAccountsDialog(props) {
  const { projectId, weChatServiceAccounts = [], onOk, onClose } = props;
  const [selectedAppId, setSelectedAppId] = useState(props.appId);

  const toLinkSystemService = () => {
    window.open(`/admin/weixin/${projectId}`);
  };

  return (
    <Dialog
      title={_l('设置微信服务号')}
      visible
      onCancel={onClose}
      footer={
        <div className="flexRow alignItemsCenter">
          {weChatServiceAccounts.length > 0 && (
            <div className="Hand colorPrimary hoverTextPrimaryLight" onClick={toLinkSystemService}>
              {_l('添加微信服务号')}
            </div>
          )}
          <div className="flex"></div>
          <Button type="link" onClick={onClose}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            className="mLeft10"
            onClick={() => {
              onClose();
              onOk(selectedAppId);
            }}
          >
            {_l('确定')}
          </Button>
        </div>
      }
    >
      <div className="textSecondary mBottom30">
        ⚠️：
        {_l(
          '更换微信服务号会导致已绑定的 openid 失效，可能出现模板消息发送失败、外部门户无法登录、公开表单微信信息获取异常。非必要请勿更换；如需更换，请提前做好数据与账号迁移。',
        )}
      </div>

      {!weChatServiceAccounts.length ? (
        <div className="LineHeight50 TxtCenter textTertiary">
          <span>{_l('暂无微信服务号,请先前往')}</span>
          <span className="colorPrimary hoverTextPrimaryLight" onClick={toLinkSystemService}>
            {_l('组织后台')}
          </span>
          <span>{_l('添加')}</span>
        </div>
      ) : (
        weChatServiceAccounts.map(item => {
          return (
            <div key={item.appId} className="mBottom10">
              <Radio
                checked={item.appId === selectedAppId}
                text={`${item.nickName} (${item.appId})`}
                onClick={() => setSelectedAppId(item.appId)}
              />
            </div>
          );
        })
      )}
    </Dialog>
  );
}

export const setWeChatServiceAccountsDialog = props => FunctionWrap(WeChatServiceAccountsDialog, { ...props });

export default function WeChatServiceAccount(props) {
  const { className, projectId, appId, unbindContent, noRequest = false, updateWeChatServiceInfo = () => {} } = props;
  const [loading, setLoading] = useState(true);
  const [weChatServiceAccounts, setWeChatServiceAccounts] = useState(props?.weChatServiceAccounts || []);
  const [selectedServiceAppId, setSelectedServiceAppId] = useState(props?.selectedServiceAppId);

  const handleChangeWeChatServiceAccount = () => {
    setWeChatServiceAccountsDialog({
      projectId,
      weChatServiceAccounts,
      appId: selectedServiceAppId,
      onOk: appId => {
        setSelectedServiceAppId(appId);
        updateWeChatServiceInfo({
          weChatServiceAccounts,
          appId,
          service: weChatServiceAccounts.find(item => item.appId === appId),
        });
      },
    });
  };

  useEffect(() => {
    setSelectedServiceAppId(props.selectedServiceAppId);
    updateWeChatServiceInfo({
      weChatServiceAccounts,
      service: selectedServiceAppId
        ? weChatServiceAccounts.find(item => item.appId === selectedServiceAppId) || { appId: selectedServiceAppId }
        : weChatServiceAccounts && weChatServiceAccounts.length === 1
          ? weChatServiceAccounts[0]
          : {},
    });
  }, [props.selectedServiceAppId, weChatServiceAccounts]);

  useEffect(() => {
    if (noRequest || (!projectId && !appId)) {
      return;
    }

    const request = appId
      ? appManagementAjax.getWeiXinBindingInfo({ projectId, appId })
      : projectAjax.getWeiXinBindingInfo({ projectId });

    request
      .then(res => {
        setWeChatServiceAccounts(res || []);
        setSelectedServiceAppId(
          selectedServiceAppId
            ? selectedServiceAppId
            : !selectedServiceAppId && res && res.length === 1
              ? res[0].appId
              : undefined,
        );
        setLoading(false);
        updateWeChatServiceInfo({
          weChatServiceAccounts: res || [],
          service: selectedServiceAppId
            ? res.find(item => item.appId === selectedServiceAppId) || { appId: selectedServiceAppId }
            : res && res.length === 1
              ? res[0]
              : {},
        });
      })
      .catch(() => {
        setLoading(false);
        updateWeChatServiceInfo({ weChatServiceAccounts: [], service: {} });
      });
  }, [projectId, appId]);

  if (loading && !noRequest) {
    return null;
  }

  if (weChatServiceAccounts.length === 0 && unbindContent) {
    return unbindContent;
  }

  return (
    <TextWrap
      className={`${className ? className : ''} ${
        weChatServiceAccounts.length > 1 ||
        (weChatServiceAccounts.length === 1 &&
          selectedServiceAppId &&
          !weChatServiceAccounts.find(item => item.appId === selectedServiceAppId))
          ? 'flexRow'
          : ''
      }`}
    >
      {weChatServiceAccounts.length === 0 ? (
        <Fragment>
          {_l('暂未绑定认证的服务号，')}
          <a href={`/admin/weixin/${projectId}`} className="colorPrimary hoverTextPrimaryLight">
            {_l('请前往组织后台')}
          </a>
          {_l('添加微信服务号')}
        </Fragment>
      ) : selectedServiceAppId ? (
        <Fragment>
          {_l('官方认证服务号')}
          {weChatServiceAccounts.findIndex(item => item.appId === selectedServiceAppId) !== -1 ? (
            <span className="mLeft5 Green">
              {weChatServiceAccounts.find(item => item.appId === selectedServiceAppId)?.nickName}
            </span>
          ) : (
            <span className="mLeft5 textError">{_l('已删除')}</span>
          )}

          <div className="flex"></div>
          {(weChatServiceAccounts.length > 1 ||
            (weChatServiceAccounts.length === 1 &&
              selectedServiceAppId &&
              !weChatServiceAccounts.find(item => item.appId === selectedServiceAppId))) && (
            <span className="colorPrimary hoverTextPrimaryLight mLeft5 Hand" onClick={handleChangeWeChatServiceAccount}>
              {_l('修改')}
            </span>
          )}
        </Fragment>
      ) : (
        <span className="colorPrimary hoverTextPrimaryLight Hand" onClick={handleChangeWeChatServiceAccount}>
          {_l('设置')}
        </span>
      )}
    </TextWrap>
  );
}
