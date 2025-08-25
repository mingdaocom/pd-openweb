import React, { Fragment, useRef } from 'react';
import styled from 'styled-components';
import { Dialog, Icon, Input } from 'ming-ui';

const SignText = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  .greenColor {
    color: #4caf50;
  }
`;

export default function SmsSignature(props) {
  const { authType, signature, onSetSignature, signStatus, hasContact } = props;
  const inputRef = useRef(null);

  const onSet = () => {
    Dialog.confirm({
      title: _l('设置签名'),
      width: 600,
      children: (
        <div>
          <div className="Gray_75 bold mTop8">{_l('短信签名')}</div>
          <Input manualRef={inputRef} className="w100 mTop12" />
          <div className="mTop16 Gray_9e">
            <span>{_l('一个营业执照仅支持一个签名，')}</span>
            <span className="ThemeColor ThemeHoverColor2 pointer">{_l('点击查看签名命名规范')}</span>
            <span>
              {_l(
                '，请严格按照要求设置签名，否则无法发送短信；短信签名审核需要3-5 个工作日，审核期间签名统一为：明道云。',
              )}
            </span>
            <span className="ThemeColor ThemeHoverColor2 pointer">{_l('如有疑问请联系客服')}</span>
          </div>
        </div>
      ),
      onOk: () => {
        onSetSignature(inputRef.current.value);
      },
    });
  };

  if ([0, 1].includes(authType) || !hasContact) {
    return (
      <div className="Gray_75">
        {!authType
          ? _l('未完成组织认证，请先完成上面的身份认证')
          : authType === 1
            ? _l('未完成组织认证，请升级到组织认证')
            : _l('组织认证未完善联系人信息，请先补充联系人信息')}
      </div>
    );
  }
  return (
    <Fragment>
      {!signature ? (
        <div>
          <span className="ThemeColor3 adminHoverColor pointer bold" onClick={onSet}>
            {_l('设置')}
          </span>
        </div>
      ) : (
        <div className="flexRow alignItemsCenter">
          <SignText>
            {signStatus === 1 && <Icon icon="done" className="mRight5 Font16 greenColor" />}
            <span>{signature}</span>
          </SignText>
          {signStatus !== 1 && (
            <div className={`mLeft12 bold ${signStatus === 0 ? 'ThemeColor3' : 'Red'}`}>
              {signStatus === 0 ? _l('审核中') : _l('未通过')}
            </div>
          )}
        </div>
      )}

      <div className="set-describe mTop4">
        {(!signature || [0, 1].includes(signStatus)) && (
          <Fragment>
            {signStatus !== 1 && <span>{_l('签名设置完成后，')}</span>}
            <span>{_l('公开表单、外部门户及工作流短信通知节点统一改为此签名；')}</span>
            <span className="ThemeColor3 adminHoverColor pointer">{_l('联系客服')}</span>
          </Fragment>
        )}

        {signStatus === 2 && (
          <Fragment>
            <span>{_l('签名未通过审核，如需重新审核，请')}</span>
            <span className="ThemeColor3 adminHoverColo pointer">{_l('联系客服')}</span>
            <span>{_l('重新审核')}</span>
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}
