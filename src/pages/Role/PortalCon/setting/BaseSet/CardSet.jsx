import React from 'react';
import { Select } from 'antd';
import cx from 'classnames';

export default function (props) {
  const { onChangePortalSet, externalControls, internalControls, businessCardOption, portalSetModel } = props;

  const renderSelectOptions = () => {
    return (
      <React.Fragment>
        {businessCardOption
          .filter(l => l.value.includes('_'))
          .map(item => (
            <Select.Option value={item.value} label={item.label}>
              {item.label}
            </Select.Option>
          ))}
        {businessCardOption
          .filter(l => !l.value.includes('_'))
          .map((item, i) => (
            <Select.Option value={item.value} label={item.label} className={cx({ BorderTopGrayC: i === 0 })}>
              {item.label}
            </Select.Option>
          ))}
      </React.Fragment>
    );
  };
  return (
    <>
      <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('名片配置')}</h6>
      <p className="Font12 Gray_9e mTop4 LineHeight18">{_l('设置外部用户的名片层中可以被其他人查看到的信息')}</p>
      <div className="mTop12 mBottom6">{_l('组织成员查看')}</div>
      <Select
        mode="multiple"
        className="cardSelect"
        allowClear
        style={{ width: '100%' }}
        placeholder={_l('请选择')}
        value={internalControls}
        optionLabelProp="label"
        onChange={value => {
          if (value.length > 6) {
            alert('最多支持显示6个字段');
            return;
          }
          onChangePortalSet({
            portalSetModel: {
              ...portalSetModel,
              internalControls: value,
            },
          });
        }}
      >
        {renderSelectOptions()}
      </Select>
      <div className="mTop12 mBottom6">{_l('外部用户查看')}</div>
      <Select
        mode="multiple"
        className="cardSelect"
        allowClear
        style={{ width: '100%' }}
        placeholder={_l('请选择')}
        value={externalControls}
        optionLabelProp="label"
        onChange={value => {
          if (value.length > 6) {
            alert('最多支持显示6个字段');
            return;
          }
          onChangePortalSet({
            portalSetModel: {
              ...portalSetModel,
              externalControls: value,
            },
          });
        }}
      >
        {renderSelectOptions()}
      </Select>
    </>
  );
}
