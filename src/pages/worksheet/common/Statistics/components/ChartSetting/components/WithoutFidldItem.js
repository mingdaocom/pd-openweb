import React, { useState } from 'react';
import { useDrop } from 'react-dnd-latest';
import cx from 'classnames';

const WithoutFidldItem = (props) => {
  const [ state, setState ] = useState(false);
  const [ collectProps, drop ] = useDrop({
    accept: 'ChartDnd',
    drop(item) {
      props.onAddControl(item.data);
      return undefined;
    },
    hover(item) {
      if (collectProps.isOver) {
        const state = props.onVerification(item.data);
        setState(state);
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const stateClassName = collectProps.isOver ? (state ? 'succeeFidldItem' : 'errorFidldItem') : '';
  return (
    <div ref={drop} role="Dustbin" className={cx('flexRow valignWrapper withoutFidldItem',  stateClassName)}>{_l('从左侧拖拽添加字段')}</div>
  )
}

export default WithoutFidldItem;
