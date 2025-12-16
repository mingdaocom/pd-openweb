import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { handleShare } from 'worksheet/common/recordInfo/handleRecordShare';
import { handlePrePayOrder } from 'src/pages/Admin/pay/PrePayorder';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { browserIsMobile } from 'src/utils/common';
import { formatNumberThousand } from 'src/utils/control';

const PayWrap = styled.div`
  padding: 12px 25px;
  background: #f2fcf2;
  z-index: 4;
  position: sticky;
  top: 0;
`;

const PayButton = styled.div`
  padding: 0 25px;
  line-height: 32px;
  border-radius: 3px;
  color: #fff;
  background: rgba(76, 175, 80, 0.9);
  &:hover {
    background: rgba(76, 175, 80, 1);
  }
`;

const PayShare = styled.div`
  width: 32px;
  height: 32px;
  background: #f2fcf2;
  border: 1px solid #4caf50;
  color: #4caf50;
  text-align: center;
  margin-left: 6px;
  border-radius: 3px;
  &:hover {
    background: #e2fce2;
  }
`;

export default function RecordPay(props) {
  const {
    projectId,
    appId,
    worksheetId,
    viewId,
    rowId,
    isCharge,
    sheetSwitchPermit,
    payConfig,
    isRecordLock,
    entityName,
    onUpdateSuccess,
  } = props;

  const isPayShare = location.search.includes('payshare=true');
  const isMobile = browserIsMobile();

  const handlePayShare = () => {
    if (isRecordLock) {
      alert(_l('%0已锁定', entityName), 3);
      return;
    }
    handleShare({
      width: 640,
      isPayShare: true,
      title: _l('发送给其他人付款'),
      isCharge,
      appId,
      worksheetId,
      viewId,
      recordId: rowId,
      privateShare: false,
      hidePublicShare: false,
      hidePublicTitle: true,
      publicShareDesc: _l('获取带付款按钮的记录分享链接，得到此链接的所有人都可以查看记录并进行付款。'),
      getShareLinkTxt: _l('获取链接'),
    });
  };

  // 支付
  const handlePay = () => {
    if (payConfig.orderId) {
      location.href = `${md.global.Config.WebUrl}orderpay/${payConfig.orderId}`;
    } else {
      handlePrePayOrder({
        worksheetId,
        rowId,
        paymentModule: md.global.Account.isPortal ? 3 : 2,
        orderId: payConfig.orderId,
        projectId,
        appId,
        payNow: payConfig.isAtOncePayment,
        onUpdateSuccess: onUpdateSuccess,
      });
    }
  };

  if (!payConfig.isShowPay) return null;

  if (isMobile) {
    return (
      <div className="payWrap flexRow alignItemsCenter Bold" onClick={handlePay}>
        <div className="flex ellipsis mRight10 Font15">{payConfig.payDescription}</div>
        <div className="Font15 mRight10"> {_l('%0 元', formatNumberThousand(payConfig.payAmount))}</div>
        <div className="payBtn Font15">{_l('付款')}</div>
      </div>
    );
  }

  return (
    <PayWrap className="flexRow alignItemsCenter">
      <div className="flex Bold Font14 ellipsis">{_l('支付内容：%0', payConfig.payDescription)}</div>
      <span className="Gray mLeft25 Font17 Bold">{_l('%0 元', formatNumberThousand(payConfig.payAmount))}</span>
      <PayButton
        className="mLeft25 Bold Hand"
        onClick={() => {
          if (isRecordLock) {
            alert(_l('%0已锁定', entityName), 3);
            return;
          }
          handlePrePayOrder({
            worksheetId,
            rowId,
            paymentModule: md.global.Account.isPortal ? 3 : 2,
            orderId: payConfig.orderId,
            projectId,
            appId,
            payNow: payConfig.isAtOncePayment,
            onUpdateSuccess,
          });
        }}
      >
        {_l('付款')}
      </PayButton>
      {!isPayShare &&
        isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId) &&
        !md.global.Account.isPortal && (
          <Tooltip placement="bottom" title={_l('发送给其他人付款')}>
            <PayShare onClick={handlePayShare}>
              <i className="icon icon-Collection LineHeight32 Font20 Hand" />
            </PayShare>
          </Tooltip>
        )}
    </PayWrap>
  );
}

RecordPay.propsTypes = {
  projectId: PropTypes.string,
  appId: PropTypes.string,
  worksheetId: PropTypes.string,
  viewId: PropTypes.string,
  rowId: PropTypes.string,
  from: PropTypes.number,
  isCharge: PropTypes.bool,
  onUpdateSuccess: PropTypes.func,
};
