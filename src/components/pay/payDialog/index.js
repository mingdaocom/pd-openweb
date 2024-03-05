import React from 'react';
import { Dialog } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import styled from 'styled-components';

const PayDialogWrap = styled(Dialog)`
  .mui-dialog-header {
    padding: 0;
  }
  .confirmBtn {
    padding: 3px 10px;
    border: 0;
    cursor: pointer;
    display: inline-block;
    line-height: 20px;
    margin-bottom: 0;
    text-align: center;
    vertical-align: middle;
    color: #fff;
    background-color: #1e88e5;
    &:hover {
      background-color: #1565c0;
    }
  }
`;

function PayDialog(props) {
  const { url, onCancel = () => {} } = props;
  return (
    <PayDialogWrap title="" visible onCancel={onCancel} showFooter={false}>
      <div className="BorderBottom BorderGrayColor LineHeight40 TxtCenter Font16">{_l('付款是否成功？')}</div>
      <div className="mTop20 Font16 Gray_3 mBottom10">{_l('付款是否成功？')}</div>
      <div className="LineHeight30">{_l('我们将在收到款项后的15分钟内为您完成操作')}</div>
      <div>{_l('如您已完成付款而未完成操作，请联系我们')}</div>
      <a className="mTop20 confirmBtn" href={url} onClick={onCancel}>
        {_l('确定')}
      </a>
      <div className="mTop20 BorderBottom ThemeBorderColor3 mBottom20"></div>
      <div>{_l('付款遇到问题')}</div>
      <div>
        <span className="LineHeight25">{_l('免费咨询热线')}：</span>
        <span className="ThemeColor3 LineHeight25">{md.global.Config.ServiceTel}</span>
      </div>
    </PayDialogWrap>
  );
}

export const payDialogFunc = props => FunctionWrap(PayDialog, { ...props });
