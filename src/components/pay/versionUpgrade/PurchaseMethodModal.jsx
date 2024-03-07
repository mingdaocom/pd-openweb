import React from 'react';
import { Dialog } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import styled from 'styled-components';

const DialogWrap = styled(Dialog)`
  .promptTitle {
    color: #ff9a2e;
  }
  .mui-dialog-default-title {
    font-size: 24px !important;
  }
  .mui-dialog-close-btn {
    right: 22px !important;
    top: 20px !important;
    .Icon {
      width: 20px !important;
      height: 20px !important;
      color: #757575 !important;
    }
  }
  .mui-dialog-header {
    padding: 32px 24px 16px 55px !important;
  }
  .mui-dialog-body {
    padding: 0 55px 22px !important;
  }
  .methodWrap {
    margin-bottom: 48px;
  }
  .methodItem {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    margin-right: 25px;
    padding: 42px 30px 20px 25px;
    box-sizing: border-box;
    &:hover {
      cursor: pointer;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08);
    }
    &:last-child {
      margin-right: 0px;
    }
    .title {
      font-size: 19px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
  }
`;

const mathods = [
  {
    type: 'payOnline',
    icon: 'icon-wechat_pay',
    iconColor: '#15BA11',
    title: _l('在线支付'),
    description: _l('适合对HAP产品已经完成试用的中小企业客户'),
  },
  {
    type: 'partner',
    icon: 'icon-thumb_up_alt',
    iconColor: '#FF9800',
    title: _l('从专业伙伴购买'),
    description: _l('适合需要行业解决方案和应用搭建支持的企业客户'),
  },
  {
    type: 'consultant',
    icon: 'icon-history_edu',
    iconColor: '#2196F3',
    title: _l('联系顾问购买'),
    description: _l('适合具备自主搭建应用能力的客户'),
  },
];

export default function PurchaseMethodModal(props) {
  const { onCancel, projectId, select, isTrial } = props;

  const handleClick = it => {
    if (it.type === 'payOnline') {
      location.assign(`/upgrade/choose?projectId=${projectId}&goToPost=true${select ? '&select=' + select : ''}`);
    } else if (it.type === 'partner') {
      window.open(`${md.global.Config.WebUrl}partnerlist`);
    } else {
      window.open('https://www.mingdao.com/form/fdff452c554747f3aa64484fdfe7a0d4?source=content2821432');
    }
    onCancel();
  };

  return (
    <DialogWrap
      title={
        <div className="flexRow alignItemsCenter">
          {_l('选择购买方式')}
          {isTrial && (
            <span className="promptTitle Font15 bold mLeft10">
              {_l('您的组织目前尚在试用期，购买之后订单将立即生效')}
            </span>
          )}
        </div>
      }
      visible
      width={1160}
      showFooter={false}
      onCancel={onCancel}
    >
      <div className="methodWrap flexRow">
        {mathods.map(it => {
          return (
            <div key={it.type} className="methodItem flex Hand" onClick={() => handleClick(it)}>
              <i className={`ming Icon icon-default icon Font40 ${it.icon}`} style={{ color: it.iconColor }} />
              <div className="title bold">{it.title}</div>
              <div className="Gray_75 Font16">{it.description}</div>
            </div>
          );
        })}
      </div>
      <div className="TxtCenter Gray_75 Font16">{_l('*任何购买渠道下，HAP产品授权的价格部分都是一致的')}</div>
    </DialogWrap>
  );
}

export const purchaseMethodFunc = props => FunctionWrap(PurchaseMethodModal, { ...props });
