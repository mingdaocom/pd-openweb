import React from 'react';
import cx from 'classnames';
import { useDrag } from 'react-dnd-latest';
import { Icon } from 'ming-ui';
import { Checkbox } from 'antd';
import { isTimeControl, isNumberControl, isRelateSheetControl } from 'src/pages/worksheet/common/Statistics/common';
import { getIconByType } from 'src/pages/widgetConfig/util';

const SourceBox = ({ item, isActive, onChangeCheckbox }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'ChartDnd', data: item },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  return (
    <div
      ref={drag}
      role="axisControlItem"
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="axisControlItem flexRow valignWrapper pTop8 pBottom8 pLeft5 Font13 Gray pointer"
    >
      <Checkbox
        className="mRight10"
        checked={isActive}
        onChange={onChangeCheckbox}
      >
      </Checkbox>
      <Icon
        className={cx('Gray_75 Font20 mRight10', {
          active: isActive,
          Visibility: !(
            isTimeControl(item.type) ||
            isNumberControl(item.type, true) ||
            isRelateSheetControl(item.type)
          ),
        })}
        icon={item.controlId === 'record_count' ? 'calculate' : getIconByType(item.type)}
      />
      <span className={cx('ellipsis', { active: isActive })}>{item.controlName}</span>
    </div>
  );
};

export default SourceBox;
