import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, PriceTip, RichText } from 'ming-ui';
import { Input, Modal, Select } from 'ming-ui/antd-components';
import SmsSignSet from 'src/components/SmsSignSet';
import CommonFieldDropdown from './CommonFieldDropdown';
import CommonSwitch from './CommonSwitch';
import SectionTitle from './SectionTitle';

const PreFillWrap = styled.div`
  justify-content: space-between;
  padding: 0 16px 0 13px;
  height: 36px;
  background: var(--color-background-secondary);
  border-radius: 3px 3px 3px 3px;
  border: 1px solid var(--color-border-primary);
  margin-left: 44px;
  &:hover {
    .Icon {
      color: var(--color-primary) !important;
    }
  }
`;

const FillModalWrap = Modal;
const SMS_FIELD_SELECT_STYLE = { width: 240 };

const ALERT_TEXT = {
  title: _l('请填写标题'),
  content: _l('请填写详细内容'),
  buttonName: _l('请填写按钮名称'),
};

export const getPreFillDescConfig = (preFillDesc, preFillDescData) => {
  const value = { ...preFillDesc, ...preFillDescData, enable: preFillDesc.enable };

  return {
    value,
    unFillKey: ['title', 'content', 'buttonName'].find(key => !value[key]),
  };
};

export default function FillSettings(props) {
  const { data, setState, projectId, projectName } = props;
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
    extendDatas = {},
  } = data;
  const preFillDesc = safeParse(extendDatas.preFillDesc || '{}', 'object');

  const [preFillDescVisible, setPreFillDescVisible] = useState(false);
  const [preFillDescData, setPreFillDescData] = useState(preFillDesc);

  const getMobileControls = () => {
    return originalControls
      .filter(i => i.type === 3)
      .map(({ controlName: label, controlId: value }) => ({ value, label }));
  };

  const isMobileControlDelete = () => {
    if (!smsVerificationFiled) return null;
    const selectControl = _.find(originalControls || [], i => i.controlId === smsVerificationFiled);
    return selectControl ? (selectControl.type === 3 ? null : selectControl) : { controlName: _l('字段已删除') };
  };

  const changePreFillDesc = () => {
    const { value, unFillKey } = getPreFillDescConfig(preFillDesc, preFillDescData);

    if (unFillKey) {
      alert(ALERT_TEXT[unFillKey], 3);
      return;
    }

    setState({
      extendDatas: { ...extendDatas, preFillDesc: JSON.stringify(value) },
    });
    setPreFillDescVisible(false);
  };

  const handleCancel = () => {
    setPreFillDescData(preFillDesc);
    setPreFillDescVisible(false);
  };

  const renderPreFillDialog = () => {
    return (
      <FillModalWrap
        title={_l('设置填写说明')}
        open={preFillDescVisible}
        mask={{ closable: true }}
        keyboard
        width={1000}
        onOk={changePreFillDesc}
        onCancel={handleCancel}
      >
        <div className="textPrimary Font13 mBottom8 Bold">{_l('标题')}</div>
        <Input
          className="w100 mBottom24"
          value={preFillDescData.title}
          onChange={event => setPreFillDescData({ ...preFillDescData, title: event.target.value })}
        />
        <div className="textPrimary Font13 mBottom8 Bold">{_l('详细内容')}</div>
        <RichText
          className="mBottom24"
          maxWidth={800}
          maxHeight={400}
          minHeight={200}
          dropdownPanelPosition={{ left: '0px', right: 'initial' }}
          data={preFillDescData.content || ''}
          onSave={value => setPreFillDescData({ ...preFillDescData, content: value })}
        />
        <div className="textPrimary Font13 mBottom8">
          <span className="Bold">{_l('按钮名称')}</span>
          <span className="Font12 textTertiary">{_l('（用户在点击按钮后开始填写）')}</span>
        </div>
        <Input
          className="w100 mBottom24"
          value={preFillDescData.buttonName}
          onChange={event => setPreFillDescData({ ...preFillDescData, buttonName: event.target.value })}
        />
      </FillModalWrap>
    );
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
                checked={preFillDesc.enable === true}
                onClick={checked =>
                  setState({
                    extendDatas: {
                      ...extendDatas,
                      preFillDesc: JSON.stringify({ ...preFillDescData, enable: !checked }),
                    },
                  })
                }
                name={_l('在填写前显示填写说明')}
                tip={_l('填写表单前可设置收集表单的说明，需用户点击弹窗按钮才可继续填写表单')}
              />
            </div>
            {preFillDesc.enable && (
              <Fragment>
                <PreFillWrap className="valignWrapper mTop16" onClick={() => setPreFillDescVisible(true)}>
                  <span className="Font13 textPrimary bold">{preFillDesc.title ? _l('已设置') : _l('未设置')}</span>
                  <Icon icon="edit" className="Font15 textTertiary Hand hoverColorPrimary" />
                </PreFillWrap>
                {renderPreFillDialog()}
              </Fragment>
            )}
          </div>
          <div className="mBottom24">
            <div>
              <CommonSwitch
                checked={smsVerification}
                onClick={checked => setState({ smsVerification: !checked })}
                name={_l('对填写手机号进行短信验证')}
                tip={
                  <Fragment>
                    <div>
                      <PriceTip
                        text={_l(
                          '对手机号字段进行短信验证。发送至中国大陆区的短信费用将自动从组织信用点扣除，信用点不足时无法获取验证码。',
                        )}
                      />
                    </div>
                    <div>
                      {_l(
                        '发送港澳台/国际短信需确保已配置服务商，否则无法送达。 短信签名默认跟随平台签名，发送港澳台/国际短信无需配置短信签名。',
                      )}
                    </div>
                  </Fragment>
                }
              />
            </div>
            {smsVerification && (
              <div className="codeContent">
                <Select
                  className={cx({ deleteCode: isMobileControlDelete() })}
                  style={SMS_FIELD_SELECT_STYLE}
                  value={smsVerificationFiled || undefined}
                  placeholder={_l('请选择')}
                  options={getMobileControls()}
                  onChange={value => setState({ smsVerificationFiled: value })}
                  labelRender={({ label }) =>
                    isMobileControlDelete() ? <span className="Red">{isMobileControlDelete().controlName}</span> : label
                  }
                />
                <span className="mLeft20 textTertiary nowrap">{_l('短信签名：')}</span>
                <SmsSignSet
                  projectId={projectId}
                  onOk={value => setState({ smsSignature: value })}
                  sign={smsSignature}
                  suffix={projectName}
                />
              </div>
            )}
          </div>
          <div className="mBottom24">
            <CommonSwitch
              checked={needCaptcha}
              onClick={checked => setState({ needCaptcha: !checked })}
              name={_l('提交时进行图形验证')}
              tip={_l('打开后，填写者在提交数据前需要输入验证码，用于防止恶意或重复数据提交。')}
            />
          </div>
          <div className="mBottom24">
            <CommonSwitch
              checked={cacheDraft}
              onClick={checked => setState({ cacheDraft: !checked })}
              name={_l('缓存未提交内容, 下次自动填充')}
              tip={_l('打开后，可以获取到填写者之前未提交的内容（不支持关联字段），填写者可继续填写表单。')}
            />
          </div>
          <div>
            <CommonSwitch
              checked={cacheFieldData.isEnable}
              onClick={checked => setState({ cacheFieldData: { isEnable: !checked, cacheField: [] } })}
              name={_l('缓存本次填写数据，下次自动填充')}
              tip={_l('打开后，可以获取到填写者之前已提交的内容（具体到字段），填写者可只填写剩余字段。')}
            />
            {cacheFieldData.isEnable && (
              <div className="commonMargin">
                <CommonFieldDropdown
                  controls={originalControls
                    .filter(item => _.find(controls, c => c.controlId === item.controlId) && item.type !== 29) //本地缓存 不支持关联记录字段填充
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
