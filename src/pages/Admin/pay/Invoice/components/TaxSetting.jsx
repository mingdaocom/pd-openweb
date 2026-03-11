import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { Dialog, FunctionWrap, Icon, Switch } from 'ming-ui';
import { dialogSelectApp } from 'ming-ui/functions';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import AuthAppList from 'src/pages/Admin/components/AuthAppList';

function TaxSetting(props) {
  const { onCancel, projectId, taxInfo = {}, onSaveSuccess = () => {} } = props;
  const [isOpenAppAuth, setIsOpenAppAuth] = useState(taxInfo.isOpenAppAuth);
  const [authApps, setAuthApps] = useState(taxInfo.authAppInfos || []);
  const [hasChanged, setHasChanged] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleSave = () => {
    setSaveLoading(true);
    merchantInvoiceApi
      .setAppAuth({ projectId, taxNo: taxInfo.taxNo, isOpenAppAuth, authAppIds: authApps.map(app => app.appId) })
      .then(res => {
        if (res) {
          alert(_l('设置成功'));
          onSaveSuccess();
          onCancel();
        } else {
          alert(_l('设置失败'), 2);
        }
      })
      .finally(() => {
        setSaveLoading(false);
      });
  };

  const onOk = () => {
    if (isOpenAppAuth && !authApps.length) {
      alert(_l('请添加授权应用'), 3);
      return;
    }

    if (taxInfo.isOpenAppAuth || !_.isEqual(taxInfo.authAppInfos, authApps)) {
      Dialog.confirm({
        title: <span className="Red">{_l('您确定要变更电子开票授权吗？')}</span>,
        description: _l(
          '关闭电子开票节点授权或调整授权范围后，未获授权应用中已配置电子开票节点的工作流将无法使用当前开票税号开具电子发票。',
        ),
        buttonType: 'danger',
        okDisabled: saveLoading,
        onOk: handleSave,
      });
    } else {
      handleSave();
    }
  };

  return (
    <Dialog
      visible
      width={600}
      title={_l('设置')}
      okDisabled={!hasChanged || saveLoading}
      onCancel={onCancel}
      onOk={onOk}
    >
      <div className="bold Font15 mTop8">{_l('自动开票配置')}</div>
      <div className="flexRow alignItemsCenter mTop20">
        <Switch
          checked={isOpenAppAuth}
          onClick={() => {
            setIsOpenAppAuth(!isOpenAppAuth);
            setHasChanged(true);
          }}
          size="small"
        />
        <span className="mLeft8">{_l('电子开票节点授权')}</span>
      </div>
      <div className="textTertiary mTop10">
        {_l(
          '开启后，当前开票税号可在所授权应用的工作流【电子开票】节点中使用，由系统自动开具发票，无需管理员人工审核；未授权应用的工作流电子开票节点将无法使用当前开票税号。',
        )}
      </div>

      {isOpenAppAuth && (
        <Fragment>
          <div className="flexRow alignItemsCenter Font14 mTop20 mBottom20">
            <div className="flex">{_l('授权应用')}</div>
            <div
              className="colorPrimary Hand"
              onClick={() => {
                dialogSelectApp({
                  projectId,
                  title: _l('添加应用'),
                  onOk: selectedApps => {
                    const newAuthApps = _.uniqBy(authApps.concat(selectedApps), 'appId');
                    setAuthApps(newAuthApps);
                    setHasChanged(true);
                  },
                });
              }}
            >
              <Icon icon="add" />
              <span className="bold mLeft4">{_l('添加应用')}</span>
            </div>
          </div>
          <AuthAppList
            authApps={authApps}
            onRemove={id => {
              setAuthApps(authApps.filter(app => app.appId !== id));
              setHasChanged(true);
            }}
          />
        </Fragment>
      )}
    </Dialog>
  );
}

export const TaxSettingDialog = props => FunctionWrap(TaxSetting, { ...props });
