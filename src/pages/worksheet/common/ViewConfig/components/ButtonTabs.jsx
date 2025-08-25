import React from 'react';
import cx from 'classnames';
import { AnimationWrap } from 'src/pages/worksheet/common/ViewConfig/style.jsx';

function ButtonTabs(props) {
  const { value, disabled, data, from = '', className, style = {}, onChange } = props;

  const handleChange = newValue => {
    if (disabled) return;

    onChange(newValue);
  };

  return (
    <AnimationWrap className={cx(className, { disabled: disabled })} style={style}>
      {data.map(item => {
        return (
          <li
            className={cx('animaItem overflow_ellipsis', { active: value === item.value })}
            style={{ padding: '8px 18px' }}
            key={`ButtonTabs-${from}-${item.value}`}
            onClick={() => handleChange(item.value)}
          >
            {item.text}
          </li>
        );
      })}
    </AnimationWrap>
  );
}

export default ButtonTabs;
