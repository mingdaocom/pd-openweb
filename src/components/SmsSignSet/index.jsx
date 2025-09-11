import React, { Fragment, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { Dialog, Input, LoadDiv, Radio, Support } from 'ming-ui';
import certificationApi from 'src/api/certification';

export default function SmsSignSet(props) {
  const { onOk = () => {}, sign, projectId, suffix } = props;
  const list = _.get(md, 'global.Config.DefaultSmsProvider') || [];
  const [type, setType] = useState('custom');
  const [signature, setSignature] = useState('');
  const [isCertified, setCertified] = useState(md.global.Config.IsLocal ? true : null);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const currentType = list.includes(sign) ? _.findIndex(list, item => item === sign) : 'custom';

    setType(currentType);
    setSignature(currentType === 'custom' ? sign : '');

    if (visible && isCertified === null && !md.global.Config.IsLocal) {
      certificationApi.checkIsCert({ projectId, certSource: 1, authType: 2 }).then(res => setCertified(res));
    }
  }, [visible]);

  useEffect(() => {
    type === 'custom' && inputRef?.current?.focus();
  }, [type]);

  const onSave = () => {
    if (type === 'custom' && !/^[a-zA-z\u4e00-\u9fa5]{2,20}$/.test(signature)) {
      alert(_l('签名需要控制在2-20个中英文字符'), 2);
      return;
    }

    onOk(type === 'custom' ? signature : list[type]);
    setVisible(false);
  };

  return (
    <Fragment>
      <div>
        <span className="mRight12">{sign}</span>
        <span className="ThemeColor3 ThemeHoverColor2 pointer" onClick={() => setVisible(true)}>
          {_l('修改')}
        </span>
      </div>

      {visible && (
        <Dialog visible width={660} title={_l('设置短信签名')} onCancel={() => setVisible(false)} onOk={onSave}>
          {isCertified === null ? (
            <LoadDiv className="mTop10" />
          ) : (
            <Fragment>
              {!md.global.Config.IsLocal && (
                <Fragment>
                  <div className="Gray_75">
                    <span>
                      {_l(
                        '通过组织认证方可添加自定义签名，并使用您的公司简称或者商标名称。自定义签名到达率受运营商风控等因素影响，若实际到达率不佳，建议您可以尝试切换到平台默认提供的签名。具体命名规范参考：',
                      )}
                    </span>
                    <Support
                      type={3}
                      href="https://help.mingdao.com/workflow/sms-failure/"
                      text={_l('短信签名命名规范')}
                    />
                  </div>
                  <div className="mTop8 Gray_75">
                    <span>
                      {_l(
                        '注意：运营商新规，短信内容不能带有链接/域名/联系方式等引流信息，否则极大概率短信被运营商所拦截。具体发送内容规范参考：',
                      )}
                    </span>
                    <Support
                      type={3}
                      href="https://help.mingdao.com/workflow/sms-failure#regulation"
                      text={_l('发送内容规范')}
                    />
                  </div>
                </Fragment>
              )}

              <div className="mTop16">
                <Radio
                  text={_l('自定义签名')}
                  checked={type === 'custom'}
                  disabled={!isCertified}
                  onClick={() => setType('custom')}
                />
              </div>

              <div className="flexRow alignItemsCenter mTop16">
                <Input
                  manualRef={inputRef}
                  maxLength={20}
                  className="Width400 mLeft30"
                  value={signature}
                  onChange={value => setSignature(value)}
                  disabled={!isCertified || type !== 'custom'}
                />
                {!isCertified && (
                  <div
                    className="ThemeColor ThemeHoverColor2 pointer mLeft16"
                    onClick={() => window.open(`/admin/sysinfo/${projectId}`)}
                  >
                    {_l('组织认证')}
                  </div>
                )}
              </div>

              {list.map((item, index) => {
                const text = md.global.Config.IsLocal
                  ? item
                  : item + (index === 0 ? _l('（官方平台签名）') : _l('（短信供应商签名）'));
                return (
                  <div className="mTop16" key={index}>
                    <Radio text={text} checked={type === index} onClick={() => setType(index)} />
                    {suffix && !md.global.Config.IsLocal && index === 1 && type === index && (
                      <div className="mTop10 mLeft30 Gray_75">
                        {_l('发送效果：【吉信通】 您的验证码是123456，感谢您的使用（发自：%0）', suffix)}
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          )}
        </Dialog>
      )}
    </Fragment>
  );
}
