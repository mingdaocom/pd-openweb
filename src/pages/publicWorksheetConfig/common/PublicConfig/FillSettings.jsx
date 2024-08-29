import React, { Fragment, useRef } from 'react';
import { Dialog, Dropdown } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';
import CommonSwitch from './CommonSwitch';
import SectionTitle from './SectionTitle';
import CommonFieldDropdown from './CommonFieldDropdown';

export default function FillSettings(props) {
  const { data, setState } = props;
  const {
    needCaptcha,
    smsVerification,
    smsVerificationFiled,
    smsSignature,
    cacheDraft,
    cacheFieldData = {},
    originalControls = [],
    extendSourceId,
    weChatSetting,
    controls,
    titleFolded,
  } = data;
  const inputRef = useRef();

  const getMobileControls = () => {
    return originalControls
      .filter(i => i.type === 3)
      .map(({ controlName: text, controlId: value }) => ({ value, text }));
  };

  const isMobileControlDelete = () => {
    if (!smsVerificationFiled) return null;
    const selectControl = _.find(originalControls || [], i => i.controlId === smsVerificationFiled);
    return selectControl ? (selectControl.type === 3 ? null : selectControl) : { controlName: _l('字段已删除') };
  };

  const editSmsSignature = () => {
    Dialog.confirm({
      title: <span className="Font16 Bold">{_l('自定义验证码签名')}</span>,
      width: 480,
      description: (
        <Fragment>
          <div className="Gray_9e Font12 mBottom20">
            <div>{_l('自定义签名仅支持国内号码')}</div>
            <div className="mTop8 ">
              {_l('请谨慎填写您的组织简称、网站名、品牌名，2-12个汉字。如签名不符合规范，将会被运营商拦截')}
            </div>
          </div>
          <input maxLength={12} className="ming Input w100" defaultValue={smsSignature} ref={inputRef} />
        </Fragment>
      ),
      onOk: () => {
        if (!/^[a-zA-z\u4e00-\u9fa5]{2,12}$/.test(inputRef.current.value)) {
          alert(_l('签名需要控制在2-12个中英文字符'), 2);
          return false;
        } else {
          setState({ smsSignature: inputRef.current.value || smsSignature });
        }
      },
    });
  };

  return (
    <React.Fragment>
      <SectionTitle
        title={_l('填写设置')}
        isFolded={titleFolded.fillSettings}
        onClick={() =>
          setState({ titleFolded: Object.assign({}, titleFolded, { fillSettings: !titleFolded.fillSettings }) })
        }
      />
      {!titleFolded.fillSettings && (
        <div className="mLeft25">
          <div className="mBottom24">
            <div>
              <CommonSwitch
                checked={smsVerification}
                onClick={checked => setState({ smsVerification: !checked })}
                name={_l('手机号短信验证')}
                tip={_l('对填写的手机号字段进行短信验证，以确保为本人有效手机号。') + ((!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal')) ? _l('验证码短信%0每条，自动从企业账户扣除，余额不足时无法获取验证码。', _.get(md, 'global.PriceConfig.SmsPrice')): '')}
              />
            </div>
            {smsVerification && (
              <div className="codeContent">
                <Dropdown
                  border
                  isAppendToBody
                  className={cx({ deleteCode: isMobileControlDelete() })}
                  value={smsVerificationFiled}
                  data={getMobileControls()}
                  onChange={value => setState({ smsVerificationFiled: value })}
                  {...(isMobileControlDelete()
                    ? {
                        renderError: () => <span className="Red">{(isMobileControlDelete() || {}).controlName}</span>,
                      }
                    : {})}
                />
                <span className="mLeft20">
                  <span className="Gray_9e">{_l('短信签名：')}</span>
                  <span>{_l('【%0】', smsSignature)}</span>
                  <span className="ThemeColor3 ThemeHoverColor2 pointer" onClick={editSmsSignature}>
                    {_l('修改')}
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="mBottom24">
            <CommonSwitch
              checked={needCaptcha}
              onClick={checked => setState({ needCaptcha: !checked })}
              name={_l('表单提交前进行图形验证')}
              tip={_l('打开后，填写者在提交数据前需要输入验证码，用于防止恶意或重复数据提交。')}
            />
          </div>
          <div className="mBottom24">
            <CommonSwitch
              checked={cacheDraft}
              onClick={checked => setState({ cacheDraft: !checked })}
              name={_l('缓存未提交内容, 下次自动填充')}
              tip={_l('打开后，可以获取到填写者之前未提交的内容，填写者可继续填写表单。')}
            />
          </div>
          <div>
            <CommonSwitch
              checked={cacheFieldData.isEnable}
              onClick={checked => setState({ cacheFieldData: { isEnable: !checked, cacheField: [] } })}
              name={_l('缓存本地填写数据, 下次自动填充')}
              tip={_l('打开后，可以获取到填写者之前已提交的内容（具体到字段），填写者可只填写剩余字段。')}
            />
            {cacheFieldData.isEnable && (
              <div className="commonMargin">
                <CommonFieldDropdown
                  controls={originalControls
                    .filter(item =>
                      _.includes(
                        controls.map(c => {
                          return c.controlId;
                        }),
                        item.controlId,
                      ),
                    )
                    .map(item => {
                      return _.pick(item, ['controlId', 'controlName', 'type']);
                    })}
                  extendSourceId={extendSourceId}
                  weChatSetting={weChatSetting}
                  selectedFields={cacheFieldData.cacheField || []}
                  onChange={value => {
                    const selectedFields = cacheFieldData.cacheField || [];
                    const checked = _.includes(selectedFields, value);
                    !!value &&
                      setState({
                        cacheFieldData: Object.assign({}, cacheFieldData, {
                          cacheField: checked ? _.remove(selectedFields, f => f !== value) : [...selectedFields, value],
                        }),
                      });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
