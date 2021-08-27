import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { Modal } from 'antd';
import { SettingItem } from '../../styled';

const SCORE_OPTIONS = [
  { value: 1, text: _l('1-5颗星') },
  { value: 2, text: _l('1-10级') },
];

export default function Score({ data, onChange }) {
  const changeType = value => {
    const hint =
      value === 2 ? _l('从星级换算为等级，所有星级数据将乘以2') : _l('从等级换算为星级，所有等级数据将除以2并向下取整');
    Modal.confirm({
      centered: true,
      className: 'scoreSwitchScoreConfirm',
      icon: null,
      title: _l('切换等级'),
      width: 480,
      content: <div className="hint Font13 Gray_75">{hint}</div>,
      okText: _l('确认'),
      cancelText: _l('取消'),
      cancelButtonProps: { type: 'link' },
      onOk: () => {
        onChange({
          enumDefault: value,
        });
      },
      onCancel: () => {
        onChange({ enumDefault: value === 1 ? 2 : 1 });
      },
    });
  };
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup size="middle" checkedValue={data.enumDefault} data={SCORE_OPTIONS} onChange={changeType} />
      </SettingItem>
    </Fragment>
  );
}
