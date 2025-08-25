import React from 'react';
import cx from 'classnames';
import { OptionWrap } from './styled';

const operationTypeData = [
  {
    text: _l('已填写'),
    value: '1-3',
  },
  {
    text: _l('已通过'),
    value: '1-4',
  },
  {
    text: _l('已否决'),
    value: '4-4',
    type: 'hr',
  },
  {
    text: _l('已转交'),
    value: '3-3',
  },
  {
    text: _l('已转审'),
    value: '3-4',
  },
  {
    text: _l('已加签'),
    value: '2-4',
  },
];

export default props => {
  const { operationType, onChange } = props;
  return (
    <div className="flexColumn mBottom20">
      <div className="Font14 bold mBottom15">{_l('处理结果')}</div>
      <div>
        {operationTypeData.map(item => (
          <OptionWrap
            key={item.value}
            className={cx('item', { checked: operationType === item.value })}
            onClick={() => onChange(operationType === item.value ? undefined : item.value)}
          >
            {item.text}
          </OptionWrap>
        ))}
      </div>
    </div>
  );
};
