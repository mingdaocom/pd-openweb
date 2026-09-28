import React from 'react';
import cx from 'classnames';
import { Select } from 'ming-ui/antd-components';

export default function (props) {
  const { onChangePortalSet, externalControls, internalControls, businessCardOption, portalSetModel } = props;

  const selectOptions = [
    ...businessCardOption.filter(l => l.value.includes('_')).map(item => ({ value: item.value, label: item.label })),
    ...businessCardOption
      .filter(l => !l.value.includes('_'))
      .map((item, i) => ({
        value: item.value,
        label: item.label,
        className: cx({ BorderTopGrayC: i === 0 }),
      })),
  ];

  return (
    <>
      <h6 className="Font16 textPrimary Bold mBottom0 mTop24">{_l('名片配置')}</h6>
      <p className="Font12 textTertiary mTop4 LineHeight18">{_l('设置外部用户的名片层中可以被其他人查看到的信息')}</p>
      <div className="mTop12 mBottom6">{_l('组织成员查看')}</div>
      <Select
        mode="multiple"
        className="cardSelect"
        allowClear
        style={{ width: '100%' }}
        placeholder={_l('请选择')}
        value={internalControls}
        optionLabelProp="label"
        options={selectOptions}
        onChange={value => {
          if (value.length > 6) {
            alert(_l('最多支持显示6个字段'));
            return;
          }

          onChangePortalSet({
            portalSetModel: {
              ...portalSetModel,
              internalControls: value,
            },
          });
        }}
      />
      <div className="mTop12 mBottom6">{_l('外部用户查看')}</div>
      <Select
        mode="multiple"
        className="cardSelect"
        allowClear
        style={{ width: '100%' }}
        placeholder={_l('请选择')}
        value={externalControls}
        optionLabelProp="label"
        options={selectOptions}
        onChange={value => {
          if (value.length > 6) {
            alert(_l('最多支持显示6个字段'));
            return;
          }

          onChangePortalSet({
            portalSetModel: {
              ...portalSetModel,
              externalControls: value,
            },
          });
        }}
      />
    </>
  );
}
