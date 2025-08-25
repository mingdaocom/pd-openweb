import React, { useState } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Icon } from 'ming-ui';
import './index.less';

const SORT_TYPE = [
  {
    label: '默认',
    key: 0,
    icon: 'score-down',
  },
  {
    label: '更新时间',
    key: 1,
    icon: 'score-down',
  },
  {
    label: '更新时间',
    key: 2,
    icon: 'score-up',
  },
  {
    label: '创建时间',
    key: 3,
    icon: 'score-down',
  },
  {
    label: '创建时间',
    key: 4,
    icon: 'score-up',
  },
];

export default function SelectSort(props) {
  const { value = 0, onChange, className = '' } = props;

  const [visible, setVisible] = useState(false);

  const onChangeValue = value => {
    onChange(value);
    setVisible(false);
  };

  return (
    <Trigger
      className="appSelectTrigger"
      popupVisible={visible}
      onPopupVisibleChange={visible => setVisible(visible)}
      action={['click']}
      popupAlign={{ points: ['tr', 'br'] }}
      popup={
        <div className="SelectSortDrowCon">
          <div className="title">{_l('按更新时间')}</div>
          <div className={cx('item valignWrapper', { lighthigh: value === 1 })} onClick={() => onChangeValue(1)}>
            {_l('降序')}
            <Icon icon="score-down" className="Font16 mLeft4" />
          </div>
          <div className={cx('item valignWrapper', { lighthigh: value === 2 })} onClick={() => onChangeValue(2)}>
            {_l('升序')}
            <Icon icon="score-up" className="Font16 mLeft4" />
          </div>
          <div className="title">{_l('按创建时间')}</div>
          <div className={cx('item valignWrapper', { lighthigh: value === 3 })} onClick={() => onChangeValue(3)}>
            {_l('降序')}
            <Icon icon="score-down" className="Font16 mLeft4" />
          </div>
          <div className={cx('item valignWrapper', { lighthigh: value === 4 })} onClick={() => onChangeValue(4)}>
            {_l('升序')}
            <Icon icon="score-up" className="Font16 mLeft4" />
          </div>
        </div>
      }
    >
      <span className={`selectSort Gray_9e ${className} ${value === 0 ? '' : 'lighthigh'}`}>
        {value === 0 ? _l('更新时间') : SORT_TYPE[value].label}
        <Icon icon={SORT_TYPE[value].icon} className="Gray_9e" />
      </span>
    </Trigger>
  );
}
