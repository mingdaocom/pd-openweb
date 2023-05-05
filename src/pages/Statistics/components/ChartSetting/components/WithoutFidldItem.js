import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd-latest';
import cx from 'classnames';

const WithoutFidldItem = (props) => {
  const { disable = false, allowInput, inputValue, onChnageInputValue } = props;
  const [state, setState] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [collectProps, drop] = useDrop({
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
  const handleSave = e => {
    let { value } = e.target;
    if (value !== '') {
      value = parseInt(value);
      value = isNaN(value) ? 0 : value;
    } else {
      value = undefined;
    }
    onChnageInputValue(value, inputValue == value ? false : true);
    setInputVisible(_.isNumber(value) ? true : false);
  }

  useEffect(() => {
    setInputVisible(_.isNumber(inputValue) ? true : false);
  }, [inputValue]);

  return (
    <div
      ref={drop}
      className={cx('flexRow valignWrapper withoutFidldItem', { withoutValueItem: inputVisible, disable }, stateClassName)}
      onClick={() => {
        if (allowInput) {
          setInputVisible(true);
        }
      }}
    >
      {inputVisible ? (
        <input
          autoFocus={true}
          defaultValue={inputValue}
          // onChange={(e) => {
          //   const { value } = e.target;
          //   onChnageInputValue(value, value ? false : true);
          // }}
          onBlur={handleSave}
          onKeyDown={event => {
            event.which === 13 && handleSave(event);
          }}
        />
      ) : (
        allowInput ? _l('输入固定值或选择动态值') : _l('从左侧拖拽添加字段')
      )}
    </div>
  )
}

export default WithoutFidldItem;
