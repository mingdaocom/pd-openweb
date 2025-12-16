import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import update from 'immutability-helper';
import { every } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { ColorPicker, SortableList } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import 'src/pages/widgetConfig/styled/style.less';
import { getUnUniqName } from 'src/utils/common';
import { isLightColor } from 'src/utils/control';
import { MAX_OPTIONS_COUNT, OPTION_COLORS_LIST } from '../../../config';
import AssignValue from './AssignValue';
import BatchAdd from './BatchAdd';
import 'rc-trigger/assets/index.css';

const OptionsWrap = styled.div`
  margin-top: 8px;
  border: ${({ showBorder }) => (showBorder ? '1px solid rgba(253 ,180,50 ,0.3)' : 'none')};
  .dragPointer {
    &:hover {
      cursor: move;
    }
  }
`;

const HandleOption = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;

  .operate {
    display: flex;
    align-items: center;
    width: 116px;
    &.flexEnd {
      justify-content: flex-end;
    }
  }

  .hoverText {
    color: #757575;
    cursor: pointer;
    &:hover {
      color: #1677ff;
    }
  }

  .addOptions {
    display: flex;
    align-items: center;
    color: #1677ff;
    cursor: pointer;
    &:hover {
      color: #2b65c4;
    }
  }

  .otherAdd {
    &.disabled {
      color: #bdbdbd !important;
      cursor: not-allowed;
    }
  }
`;
const DragItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff;
  i {
    color: #9e9e9e;
    &:hover {
      color: #757575;
    }
  }

  .colorWrap {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    &:hover {
      box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.2);
    }
    .tri {
      width: 0;
      height: 0;
      border: 4px solid transparent;
      border-top-color: #fff;
      &.isLight {
        border-top-color: rgba(0, 0, 0, 0.7);
      }
      transform: translate(5px, 8px);
    }
  }

  .optionContent {
    margin-left: ${props => (props.isOther ? '21px' : '8px')};
    padding-right: 8px;
    display: flex;
    align-items: center;
    flex: 1;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    border-color: ${props => (props.isFocus ? '#1677ff' : '#f0f0f0')};
  }

  .checkWrap {
    .ming.Checkbox {
      height: 18px;
    }
  }

  .optionName {
    flex: 1;
    padding: 0 8px;
    &.repeatError {
      input {
        color: #f44336;
      }
    }
  }
  .ming.Radio {
    margin: 0;
  }

  input {
    width: 100%;
    border: none;
    outline: none;
    line-height: 37px;
    &:hover {
      ${props => (props.isFocus ? '' : 'background: #f5f5f5;cursor: pointer;')};
    }
  }
  .deleteWrap {
    color: #9e9e9e;
  }
`;

function OptionItem({
  addOption,
  item = {},
  focusIndex,
  options,
  idx: index,
  colorful,
  updateOption,
  setIndex,
  optionKey,
  renderDragHandle,
}) {
  const isFocus = index === focusIndex;
  const [originValue, setValue] = useState('');
  const { key, value, isDeleted, color } = item;
  const isOther = key === 'other' && !isDeleted;

  const noDelRepeat = options.filter(o => o.key !== key && o.value === value && !o.isDeleted);

  useEffect(() => {
    setValue(isFocus ? value : '');
  }, [isFocus]);

  const handleBlurCheck = () => {
    if (_.isEmpty(value)) {
      alert(_l('选项不得为空'), 3);
      updateOption(index, { value: originValue });
      setIndex(-1);
      return false;
    }
    const exitsOptions = options.filter(o => o.key !== key && o.value === value && !o.isDeleted);
    if (exitsOptions.length) {
      alert(_l('不得与选项列表重复'), 3);
      return false;
    }
    return true;
  };

  return (
    <DragItem isOther={isOther} isFocus={isFocus} key={optionKey}>
      {!isDeleted && (
        <Fragment>
          {!isOther && renderDragHandle()}
          <div className="optionContent">
            {colorful && (
              <ColorPicker
                sysColor
                isPopupBody
                lightBefore
                value={item.color || OPTION_COLORS_LIST[index % OPTION_COLORS_LIST.length]}
                onChange={color => updateOption(index, { color })}
                popupAlign={{ points: ['tl', 'bl'], offset: [-260, 10] }}
              >
                <div className="colorWrap pointer" style={{ backgroundColor: color }}>
                  <div className={cx('tri', { isLight: isLightColor(color) })}></div>
                </div>
              </ColorPicker>
            )}
            <Tooltip title={noDelRepeat.length ? _l('选项重复') : ''}>
              <div className={cx('optionName', { repeatError: !!noDelRepeat.length })}>
                <input
                  id={key}
                  autoFocus={isFocus}
                  value={value}
                  onFocus={() => setIndex(index)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !isOther) {
                      if (handleBlurCheck()) {
                        addOption(false, index + 1);
                      }
                    }
                    // focus上、下
                    if (e.which === 38 || e.which === 40) {
                      if (handleBlurCheck()) {
                        let nextIndex =
                          e.which === 38
                            ? focusIndex === 0
                              ? options.length - 1
                              : focusIndex - 1
                            : focusIndex === options.length - 1
                              ? 0
                              : focusIndex + 1;
                        setIndex(nextIndex);
                        const timer = setTimeout(() => {
                          const optionEl = document.getElementById(_.get(options[nextIndex], 'key'));
                          optionEl && optionEl.select();
                          clearTimeout(timer);
                        }, 50);
                      }
                    }
                  }}
                  onChange={e => updateOption(index, { value: e.target.value })}
                  onBlur={e => {
                    if (handleBlurCheck()) {
                      setIndex(-1);
                      updateOption(index, { value: e.target.value, key }, true);
                    }
                  }}
                />
              </div>
            </Tooltip>
            <Tooltip title={_l('删除')} placement="bottom">
              <div className="deleteWrap pointer" onClick={() => updateOption(index, { isDeleted: true })}>
                <i className="icon-delete Font18"></i>
              </div>
            </Tooltip>
          </div>
        </Fragment>
      )}
    </DragItem>
  );
}

function SelectOptions(props, ref) {
  const { onChange, options, data = {}, showAssign = false, fromPortal, enableScore, className, isDialog } = props;
  const [focusIndex, setIndex] = useState(-1);
  const [isDrag, setIsDrag] = useState(false);
  const [focusIndexs, setIndexs] = useState([]);
  const hasOther = _.find(options, i => i.key === 'other' && !i.isDeleted);
  const findOther = _.findIndex(options, i => i.key === 'other');
  const noDelOptions = options.filter(i => !i.isDeleted);
  const notAdd = noDelOptions.length >= MAX_OPTIONS_COUNT;

  const [{ assignValueVisible, batchAddVisible }, setVisible] = useSetState({
    assignValueVisible: false,
    batchAddVisible: false,
  });

  useEffect(() => {
    setIndexs([...focusIndexs, focusIndex]);
  }, [focusIndex]);

  useImperativeHandle(ref, () => ({
    addOption,
  }));

  const addOption = (isOther, nextIndex) => {
    if (notAdd) {
      alert(_l('选项不得超过%0个', MAX_OPTIONS_COUNT), 3);
      return;
    }

    if (isOther && _.find(noDelOptions, o => o.key !== 'other' && o.value === _l('其他'))) {
      alert(_l('不得与选项列表重复'), 3);
      return;
    }

    const colorIndex = options.filter(i => i.key !== 'other').length - 1;
    const nextKey = isOther ? 'other' : uuidv4();

    const newIndex = nextIndex || (findOther > -1 ? findOther : options.length);
    const newItem = {
      key: nextKey,
      value: isOther ? _l('其他') : getUnUniqName(options, _l('选项%0', newIndex + 1), 'value'),
      isDeleted: false,
      index: newIndex + 1,
      isNew: true,
      color: isOther ? '#D3D3D3' : OPTION_COLORS_LIST[(nextIndex || colorIndex + 1) % OPTION_COLORS_LIST.length],
    };

    const nextOptions =
      isOther && findOther > -1
        ? update(options, { [findOther]: { $apply: item => ({ ...item, isDeleted: false }) } })
        : update(options, { $splice: [[newIndex, 0, newItem]] });

    onChange({
      options: nextOptions.map((item, idx) => ({ ...item, index: idx + 1 })),
    });

    setIndex(newIndex);
    setTimeout(() => {
      const $dom = document.getElementById(nextKey);
      if ($dom) {
        $dom.setSelectionRange(0, $dom.value.length);
      }
    }, 50);
  };

  const updateOption = (index, obj, isBlur = false) => {
    const isDeleteExtIndex = options.findIndex(
      item =>
        item.isDeleted &&
        item.value === obj.value &&
        (obj.key === 'other' ? item.key === 'other' : item.key !== 'other'),
    );
    delete obj.key;
    let nextOptions = [].concat(options);
    const isNew = _.get(nextOptions[index], 'isNew');
    // 新增的选项删除直接删除
    if (isNew && _.isBoolean(obj.isDeleted)) {
      nextOptions.splice(index, 1);
    } else if (isNew && isBlur && isDeleteExtIndex > -1) {
      // 新增选项失焦时回收站有重复直接恢复
      const oldItem = nextOptions[isDeleteExtIndex];
      nextOptions.splice(index, 1, { ...oldItem, ...obj, isDeleted: false });
      nextOptions.splice(isDeleteExtIndex, 1);
    } else {
      nextOptions = update(nextOptions, { [index]: { $apply: item => ({ ...item, ...obj }) } });
    }

    if (every(nextOptions, item => item.isDeleted)) {
      alert(_l('最少保留一个选项'), 3);
      return;
    }
    onChange({ options: nextOptions.map((item, idx) => ({ ...item, index: idx + 1 })) });
  };

  const onSortEnd = (newItems = []) => {
    // 选项拖拽重新生成index
    setIsDrag(false);
    onChange({ options: newItems.map((item, index) => ({ ...item, index })) });
  };

  const updateVisible = (type, visible = true) => {
    setVisible({ [`${type}Visible`]: visible });
  };

  const windowHeight = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
  const showBorder = isDialog && isDrag && windowHeight - 340 < options.length * 40;

  return (
    <OptionsWrap className={className} showBorder={showBorder}>
      <SortableList
        useDragHandle
        items={options}
        itemKey="key"
        onSortEnd={onSortEnd}
        moveItem={() => setIsDrag(true)}
        renderItem={({ item, index, DragHandle }) => {
          return (
            <OptionItem
              {...props}
              optionKey={`item_${item.key}`}
              item={_.find(options, o => o.key === item.key)}
              idx={index}
              addOption={addOption}
              updateOption={updateOption}
              setIndex={setIndex}
              focusIndex={focusIndex}
              renderDragHandle={() => (
                <DragHandle>
                  <div className="pointer dragPointer">
                    <i className="icon-drag"></i>
                  </div>
                </DragHandle>
              )}
            />
          );
        }}
      />
      <HandleOption className="handleOption">
        <div
          className="addOptions"
          onClick={() => {
            const prevFocusIndex = focusIndexs[focusIndexs.length - 2];
            addOption(
              false,
              prevFocusIndex === -1 || (hasOther && prevFocusIndex === noDelOptions.length - 1)
                ? undefined
                : prevFocusIndex + 1,
            );
          }}
        >
          <i className="icon-add Font18"></i>
          <span>{_l('添加选项')}</span>
        </div>
        <div
          className="batchAdd hoverText mLeft24"
          onClick={() => {
            if (notAdd) {
              alert(_l('选项不得超过%0个', MAX_OPTIONS_COUNT), 3);
              return;
            }
            updateVisible('batchAdd');
          }}
        >
          {_l('批量添加')}
        </div>
        {!fromPortal && showAssign && (
          <div className="assignValue hoverText flex TxtRight" onClick={() => updateVisible('assignValue')}>
            {_l('赋分值')}
          </div>
        )}
      </HandleOption>
      {assignValueVisible && (
        <AssignValue
          options={options}
          enableScore={enableScore}
          onOk={({ options, enableScore }) => {
            onChange({ options, enableScore });
            updateVisible('assignValue', false);
          }}
          onCancel={() => updateVisible('assignValue', false)}
        />
      )}
      {batchAddVisible && (
        <BatchAdd
          data={data}
          options={options}
          onOk={newAddOptions => {
            onChange({ options: newAddOptions });
            updateVisible('batchAdd', false);
          }}
          onCancel={() => updateVisible('batchAdd', false)}
        />
      )}
    </OptionsWrap>
  );
}

export default forwardRef(SelectOptions);
