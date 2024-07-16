import React from 'react';
import cx from 'classnames';
import { useDrag } from 'react-dnd-latest';
import { Icon } from 'ming-ui';
import { Checkbox } from 'antd';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

const SourceBox = ({ item, isActive, onChangeCheckbox }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'ChartDnd', data: item },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const getIcon = () => {
    if (item.controlId === 'record_count') {
      return 'calculate';
    }
    if ([WIDGETS_TO_API_TYPE_ENUM.SCORE, WIDGETS_TO_API_TYPE_ENUM.MONEY].includes(item.type)) {
      return 'number_6';
    }
    if ([WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT].includes(item.type)) {
      return 'arrow_drop_down_circle';
    }
    // 公式-数字
    if (WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER === item.type) {
      return 'number_6';
    }
    return getIconByType(item.type);
  }
  return (
    <div
      ref={drag}
      role="axisControlItem"
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="axisControlItem flexRow valignWrapper pTop8 pBottom8 pLeft5 Font13 Gray pointer"
    >
      <div>
        <Checkbox
          disabled={item.type === WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT}
          className="mRight10"
          checked={isActive}
          onChange={onChangeCheckbox}
        >
        </Checkbox>
      </div>
      <Icon
        className={cx('Gray_75 Font20 mRight10', {
          active: isActive
        })}
        icon={getIcon()}
      />
      <span className={cx('ellipsis', { active: isActive })}>{item.controlName}</span>
    </div>
  );
};

export default SourceBox;
