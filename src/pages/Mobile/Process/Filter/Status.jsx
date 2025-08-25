import React from 'react';
import cx from 'classnames';
import { OptionWrap } from './styled';

const statusData = [
  {
    text: _l('已通过'),
    value: 2,
  },
  {
    text: _l('已否决'),
    value: 3,
  },
  {
    text: _l('流程中止'),
    value: 4,
  },
];

export default props => {
  const { status, onChange } = props;
  return (
    <div className="flexColumn mBottom20">
      <div className="Font14 bold mBottom15">{_l('状态')}</div>
      <div>
        {statusData.map(item => (
          <OptionWrap
            key={item.value}
            className={cx('item', { checked: status === item.value })}
            onClick={() => onChange(status === item.value ? undefined : item.value)}
          >
            {item.text}
          </OptionWrap>
        ))}
      </div>
    </div>
  );
};
