import React, { Fragment } from 'react';
import cx from 'classnames';
import { useDrag } from 'react-dnd-latest';
import { Icon, Dialog } from 'ming-ui';

const SourceBox = ({ item, isActive }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'ChartDnd', data: item },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const handleOpenEdit = () => {

  }
  const handleDelete = () => {
    Dialog.confirm({
      title: <span className="Red">{_l('您确定要删除计算字段“%0” ?', item.controlName)}</span>,
      onOk: () => {
      },
    });
  }
  return (
    <Fragment>
      <div
        ref={drag}
        role="axisControlItem"
        style={{ opacity: isDragging ? 0.4 : 1 }}
        className="axisControlItem flexRow valignWrapper pTop8 pBottom8 pLeft5 pRight5 Font13 Gray pointer"
      >
        <Icon
          className={cx('Gray_75 Font20 mRight10', {
            active: isActive
          })}
          icon="calculate"
        />
        <span className={cx('ellipsis flex', { active: isActive })}>{item.controlName}</span>
        <Icon className="Gray_75 Font16 mRight15" icon="settings" />
        <Icon className="Red Font18" icon="trash" onClick={handleDelete} />
      </div>
    </Fragment>
  );
};

export default SourceBox;
