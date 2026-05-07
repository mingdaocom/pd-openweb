import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { Button, Dialog, Icon, Input, Support, Switch } from 'ming-ui';
import smsAjax from 'src/api/sms';
import { encrypt } from 'src/utils/common';
import Config from '../../../config';

const FORM_KEYS = ['keySid', 'keySecret', 'verifyServiceSid', 'messagingServiceSid'];
const SECRET_KEYS = ['KeySid', 'KeySecret'];

/** 共用：单行字段容器（标签 + 可选 hint + 内容） */
function FieldRow({ label, hint, children }) {
  return (
    <div className="mBottom16">
      <div className="mBottom8 Font14">{label}</div>
      {hint && <div className="mBottom4 Font13 textTertiary">{hint}</div>}
      {children}
    </div>
  );
}

const FIELD_CONFIG = [
  { key: 'keySid', label: 'API Key SID', placeholder: _l('请输入API Key SID'), secretKey: 'sid' },
  { key: 'keySecret', label: 'API Key Secret', placeholder: _l('请输入API Key Secret'), secretKey: 'secret' },
  {
    key: 'verifyServiceSid',
    label: 'Verify Service SID',
    hint: _l('用于公开表单手机号验证'),
    placeholder: _l('请输入Verify Service SID'),
  },
  {
    key: 'messagingServiceSid',
    label: 'Messaging Service SID',
    hint: _l('用于工作流短信节点、外部门户等自定义短信内容'),
    placeholder: _l('请输入Messaging Service SID'),
  },
];

export default function Twilio(props) {
  const { visible = true, onCancel, onSaveSuccess, onRemoveSuccess, twilioInfo, helpUrl } = props;
  const [form, setForm] = useState(Object.fromEntries(FORM_KEYS.map(k => [k, ''])));
  const [saving, setSaving] = useState(false);
  const [isEditSecret, setIsEditSecret] = useState(false);
  const initialFormRef = useRef(null);
  const prevVisibleRef = useRef(false);

  // 弹窗打开时缓存当前 twilioInfo 为「初始值」并填入表单；关闭时（未保存）一律重置回该初始值
  useEffect(() => {
    if (visible) {
      const initial = Object.fromEntries(FORM_KEYS.map(k => [k, _.get(twilioInfo, k, '')]));

      if (!prevVisibleRef.current) {
        initialFormRef.current = initial;
        setForm(initial);
        setIsEditSecret(!twilioInfo?.keySecret);
      }
    } else {
      if (initialFormRef.current) setForm(initialFormRef.current);
      setIsEditSecret(!twilioInfo?.keySecret);
    }

    prevVisibleRef.current = visible;
  }, [visible, twilioInfo]);

  useEffect(() => {
    return () => setIsEditSecret(false);
  }, []);

  const handleInputChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleCancel = () => {
    if (initialFormRef.current) setForm(initialFormRef.current);
    setIsEditSecret(!twilioInfo?.keySecret);
    onCancel?.();
  };

  const handleSave = () => {
    const t = _.mapValues(form, v => _.trim(v));
    const [sidChanged, secretChanged] = [
      t.keySid !== (twilioInfo?.keySid ?? ''),
      t.keySecret !== (twilioInfo?.keySecret ?? ''),
    ];
    const missing = FORM_KEYS.filter(k => !t[k]).map(k => _l(FIELD_CONFIG.find(f => f.key === k)?.label || k));

    if (missing.length) {
      alert(_l('请填写%0', missing.join('、')), 2);
      return;
    }

    setSaving(true);
    const base = {
      projectId: Config.projectId,
      verifyServiceSid: t.verifyServiceSid,
      messagingServiceSid: t.messagingServiceSid,
    };
    const apiCall = twilioInfo
      ? smsAjax.editTwilioProvider({
          ...base,
          id: twilioInfo.id,
          keySid: encrypt(twilioInfo?.keySid),
          keySecret: encrypt(twilioInfo?.keySecret),
          ...(sidChanged && { keySid: encrypt(t.keySid) }),
          ...(secretChanged && { keySecret: encrypt(t.keySecret) }),
          ...((!sidChanged || !secretChanged) && {
            secretUnmodifyKeys: _.filter(SECRET_KEYS, (_, i) => ![sidChanged, secretChanged][i]),
          }),
        })
      : smsAjax.addTwilioProvider({ ...base, keySid: encrypt(t.keySid), keySecret: encrypt(t.keySecret) });
    apiCall
      .then(res => {
        if (res) {
          alert(_l('保存成功'));
          onCancel?.();
          onSaveSuccess?.();
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .catch(() => alert(_l('保存失败'), 2))
      .finally(() => setSaving(false));
  };

  const handleRemove = () =>
    smsAjax
      .removeTwilioProvider({ projectId: Config.projectId, id: twilioInfo?.id })
      .then(() => onRemoveSuccess?.())
      .catch(() => alert(_l('删除失败'), 2));

  const handleSwitchChange = checked =>
    checked &&
    Dialog.confirm({
      title: _l('确认关闭服务?'),
      description: _l('关闭后,将立即停止该服务的使用,已配置的相关功能将无法继续生效。如需恢复,需重新确认配置。'),
      okText: _l('确认'),
      cancelText: _l('取消'),
      onOk: handleRemove,
    });

  return (
    <Dialog
      visible={visible}
      width={640}
      title={
        <div className="flexRow alignItemsCenter">
          <span className="Font24 Bold">{_l('Twilio 国际短信')}</span>
          <Support type={1} href={helpUrl} className="mLeft8" />
        </div>
      }
      onCancel={handleCancel}
      footer={
        <div className="flexRow alignItemsCenter justifyContentBetween w100">
          <div className="flexRow alignItemsCenter">
            {twilioInfo && (
              <>
                <Switch checked={!!twilioInfo} size="small" onClick={handleSwitchChange} className="mRight8" />
                <span className={twilioInfo ? 'Font14 Green' : 'Font14 textSecondary'}>{_l('已连接')}</span>
              </>
            )}
          </div>
          <div className="flexRow">
            <Button type="link" onClick={handleCancel}>
              {_l('取消')}
            </Button>
            <Button type="primary" onClick={handleSave} loading={saving} disabled={saving}>
              {_l('保存')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="pAll0">
        <div className="mBottom24 Font14 textSecondary">
          {_l(
            '填写Twilio账户的 API Key SID 与 API Key Secret，用于工作流短信节点、公开表单验证及外部门户（验证/邀请/审核）等服务。如果是Twilio免费账户，则只能向Twilio平台验证过的手机号发送消息。',
          )}
        </div>

        <div className="mBottom24">
          <div className="Font16 Bold mBottom16">{_l('填写连接信息')}</div>
          {FIELD_CONFIG.filter(f => f.secretKey).map(({ key, label, placeholder }) => (
            <FieldRow key={key} label={label}>
              {key === 'keySecret' && !isEditSecret ? (
                <div className="flexRow alignItemsCenter w100 Height36 pLeft12 pRight12 boxSizing">
                  <span className="minWidth0 Font14 textTertiary overflow_ellipsis">{form[key] || ''}</span>
                  <Icon
                    icon="edit"
                    className="icon icon-edit Hand textTertiary mLeft10 Font15 hoverColorPrimary"
                    aria-label={_l('编辑')}
                    onClick={() => (setIsEditSecret(true), setForm(prev => ({ ...prev, keySecret: '' })))}
                  />
                </div>
              ) : (
                <Input
                  value={form[key]}
                  onChange={v => handleInputChange(key, v)}
                  placeholder={placeholder}
                  className="w100"
                />
              )}
            </FieldRow>
          ))}
        </div>

        <div>
          <div className="Font16 Bold mBottom16">{_l('填写短信SID')}</div>
          {FIELD_CONFIG.filter(f => f.hint).map(({ key, label, hint, placeholder }) => (
            <FieldRow key={key} label={label} hint={hint}>
              <Input
                value={form[key]}
                onChange={value => handleInputChange(key, value)}
                placeholder={placeholder}
                className="w100"
              />
            </FieldRow>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
