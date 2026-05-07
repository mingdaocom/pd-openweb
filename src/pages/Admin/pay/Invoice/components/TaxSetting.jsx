import React, { Fragment, useState } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import { Dialog, FunctionWrap, Icon, Switch } from 'ming-ui';
import { dialogSelectApp } from 'ming-ui/functions';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import AuthAppList from 'src/pages/Admin/components/AuthAppList';

const REMARK_OPTIONS = [
  { label: _l('销方银行信息'), value: 0 },
  { label: _l('销方地址和电话'), value: 1 },
];

function TaxSetting(props) {
  const { onCancel, projectId, taxInfo = {}, onSaveSuccess = () => {} } = props;
  const [isOpenAppAuth, setIsOpenAppAuth] = useState(taxInfo.isOpenAppAuth);
  const [authApps, setAuthApps] = useState(taxInfo.authAppInfos || []);
  const [hasChanged, setHasChanged] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isOpenRemark, setIsOpenRemark] = useState(taxInfo.isOpenRemark);
  const [remarks, setRemarks] = useState(taxInfo.invoiceRemarkTypes || []);

  const SETTING_CONFIG = [
    {
      key: 'remark',
      title: _l('发票备注'),
      switchText: _l('发票备注销方信息'),
      desc: _l(
        '开启后，支付订单及工作流开票的发票备注中将自动附加销方相关信息；需在百望云-基础-配置管理的销方信息页面完善销方信息。',
      ),
      checked: isOpenRemark,
    },
    {
      key: 'invoiceNodeAuth',
      title: _l('自动开票配置'),
      switchText: _l('电子开票节点授权'),
      desc: _l(
        '开启后，当前开票税号可在所授权应用的工作流【电子开票】节点中使用，由系统自动开具发票，无需管理员人工审核；未授权应用的工作流电子开票节点将无法使用当前开票税号。',
      ),
      checked: isOpenAppAuth,
    },
  ];

  const handleSave = () => {
    setSaveLoading(true);
    merchantInvoiceApi
      .setAppAuth({
        projectId,
        taxNo: taxInfo.taxNo,
        isOpenAppAuth,
        authAppIds: authApps.map(app => app.appId),
        isOpenRemark,
        invoiceRemarkTypes: remarks,
      })
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
    if (isOpenRemark && !remarks.length) {
      alert(_l('请选择发票备注信息'), 3);
      return;
    }

    if (isOpenAppAuth && !authApps.length) {
      alert(_l('请添加授权应用'), 3);
      return;
    }

    if ((taxInfo.isOpenAppAuth && !isOpenAppAuth) || !_.isEqual(taxInfo.authAppInfos, authApps)) {
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
      width={800}
      title={_l('设置')}
      okDisabled={!hasChanged || saveLoading}
      onCancel={onCancel}
      onOk={onOk}
    >
      {SETTING_CONFIG.map(item => {
        return (
          <div key={item.key} className={item.key === 'remark' ? 'mBottom24' : ''}>
            <div className="bold Font15 mTop8">{item.title}</div>
            <div className="flexRow alignItemsCenter mTop20">
              <Switch
                checked={item.checked}
                onClick={() => {
                  item.key === 'remark' ? setIsOpenRemark(!isOpenRemark) : setIsOpenAppAuth(!isOpenAppAuth);
                  setHasChanged(true);
                }}
                size="small"
              />
              <span className="mLeft8">{item.switchText}</span>
            </div>
            <div className="textTertiary mTop10 pLeft42">{item.desc}</div>

            {item.key === 'remark' && isOpenRemark && (
              <div className="pLeft42 mTop10">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder={_l('请选择')}
                  className="w100 mdAntSelect"
                  options={REMARK_OPTIONS}
                  value={remarks}
                  onChange={value => {
                    setRemarks(value);
                    setHasChanged(true);
                  }}
                />
              </div>
            )}

            {item.key === 'invoiceNodeAuth' && isOpenAppAuth && (
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
          </div>
        );
      })}
    </Dialog>
  );
}

export const TaxSettingDialog = props => FunctionWrap(TaxSetting, { ...props });
