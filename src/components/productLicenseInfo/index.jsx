import React, { useState } from 'react';
import cx from 'classnames';
import { Dialog, Input, LoadDiv, Tooltip } from 'ming-ui';
import marketplaceApi from 'src/api/marketplace';
import marketplacePaymentApi from 'src/api/marketplacePayment';
import './index.less';

const planTypes = { 0: _l('免费'), 1: _l('试用'), 2: _l('固定价格'), 3: _l('按使用人数订阅') };

export default function ProductLicenseInfo(props) {
  const { children, popupAlign = {}, license = {}, data = {}, type = 'app' } = props;
  const { endTime, projectId, goodsId, id } = data;

  const [updateSocketVisible, setUpdateSocketVisible] = useState(false);
  const [createOrderLoading, setCreateOrderLoading] = useState(false);
  const [socket, setSocket] = useState('');

  const createOrder = () => {
    marketplacePaymentApi
      .createOrder({
        projectId,
        licenseId: license.licenseId,
        purchaseRecordId: license.id,
        productId: goodsId,
        environmentType: 1,
        productType: 0,
        buyTypeEnum: 1,
      })
      .then(res => {
        if (res && res.excuteStatus) {
          window.open(`${md.global.Config.MarketUrl}/orderDetail/${res.orderId}`);
        }
      })
      .finally(() => setCreateOrderLoading(false));
  };

  const handleCreateOrder = () => {
    if (createOrderLoading) {
      return;
    }

    if (md.global.Config.IsLocal) {
      alert(_l('请前往市场操作续订'), 3);
      return;
    }

    setCreateOrderLoading(true);
    marketplacePaymentApi.checkUnpayOrderByPurchaseRecordId({ purchaseRecordId: license.id }).then(data => {
      if (data.hasUnpayOrder) {
        setCreateOrderLoading(false);
        window.open(`${md.global.Config.MarketUrl}/orderDetail/${data.orderId}`);
      } else {
        createOrder();
      }
    });
  };

  const onUpdateSocket = () => {
    if (!socket) {
      alert(_l('密钥不能为空'), 3);
      return;
    }
    marketplaceApi.setSecretKeyForApp({ key: socket, appId: id }).then(data => {
      const alertMessage = {
        1: _l('更新成功'),
        2: _l('密钥错误'),
        3: _l('应用已删除'),
        4: _l('安装的应用和授权的应用不一致'),
        5: _l('授权密钥组织不匹配'),
        6: _l('授权已更新'),
      };
      alert(alertMessage[data], data === 1 ? 1 : 2);
      if (data === 1) {
        setUpdateSocketVisible(false);
        setSocket('');
        location.reload();
      }
    });
  };

  return (
    <React.Fragment>
      <Tooltip
        popupAlign={{
          overflow: { adjustX: true, adjustY: true },
          points: ['tr', 'br'],
          offset: [5, -50],
          ...popupAlign,
        }}
        action={['hover']}
        popupClassName="licensePopup"
        autoCloseDelay={0}
        popup={
          <div
            className="Menu ming flexColumn pAll20 appLicenseWrap"
            style={{ minWidth: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flexRow mBottom10">
              <div className="Gray_75 mRight15 nowrap">{_l('开发者')}</div>
              <div className="ellipsis">{license.developName}</div>
            </div>
            <div className="flexRow mBottom10">
              <div className="Gray_75 mRight15 nowrap">{_l('订购计划')}</div>
              <div className="ellipsis">{planTypes[license.planType]}</div>
            </div>
            <div className="flexRow mBottom10">
              <div className="Gray_75 mRight15 nowrap">{_l('周期')}</div>
              <div className="ellipsis">
                {endTime ? (
                  <React.Fragment>
                    <span>{license.day ? _l('剩余%0天', license.day) : ''}</span>
                    <span className="mLeft10">{_l('%0 到期', endTime)}</span>
                  </React.Fragment>
                ) : (
                  _l('永久有效')
                )}
              </div>
            </div>
            <div className="flexRow mBottom10">
              <div className="Gray_75 mRight15 nowrap">{_l('人数限制')}</div>
              <div className="ellipsis">{license.personCount || _l('不限制')}</div>
            </div>
            <div className="flexRow mBottom10">
              <div className="Gray_75 mRight15 nowrap">{_l('版本号')}</div>
              <div className="ellipsis">{license.versionNo}</div>
            </div>
            <div className="flexRow alignItemsCenter">
              <div className="Gray_75 mRight15 nowrap">{_l('状态')}</div>
              <div className={cx('licenseStatus', { valid: license.status === 1 })}>
                {license.status === 1 ? _l('生效中') : _l('已过期')}
              </div>
              {type === 'app' && license.projectType === 2 && (
                <div
                  className="ThemeColor ThemeHoverColor2 pointer mLeft8"
                  onClick={() => setUpdateSocketVisible(true)}
                >
                  {_l('更新密钥')}
                </div>
              )}
            </div>
            {type === 'app' && [2, 3].includes(license.planType) && license.status === 1 && endTime && (
              <div
                className="renewal mTop10 pointer flexRow alignItemsCenter justifyContentCenter"
                onClick={handleCreateOrder}
              >
                {createOrderLoading && <LoadDiv className="mLeft0 mRight5" size={16} />}
                {_l('立即续订')}
              </div>
            )}
          </div>
        }
      >
        {children}
      </Tooltip>
      {updateSocketVisible && (
        <Dialog
          visible={true}
          width={480}
          title={_l('更新密钥')}
          showCancel={false}
          overlayClosable={false}
          onCancel={() => {
            setUpdateSocketVisible(false);
            setSocket('');
          }}
          onOk={onUpdateSocket}
        >
          <div className="mBottom16 Font14">{_l('密钥')}</div>
          <Input
            className="w100"
            placeholder={_l('通过填入密钥更新授权信息，密钥可在应用详情中查看')}
            value={socket}
            onChange={socket => setSocket(socket)}
          />
        </Dialog>
      )}
    </React.Fragment>
  );
}
