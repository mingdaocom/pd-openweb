import React, { useState, Fragment, useEffect } from 'react';
import { ColorPicker, SortableList, Tooltip } from 'ming-ui';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import cx from 'classnames';
import 'rc-trigger/assets/index.css';
import update from 'immutability-helper';
import { useSetState } from 'react-use';
import { every } from 'lodash';
import { isLightColor, getUnUniqName } from 'src/util';
import { getAdvanceSetting } from '../../../util/setting';
import { OPTION_COLORS_LIST, MAX_OPTIONS_COUNT } from '../../../config';
import BatchAdd from './BatchAdd';
import AssignValue from './AssignValue';
import 'src/pages/widgetConfig/styled/style.less';

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
      color: #2196f3;
    }
  }

  .addOptions {
    display: flex;
    align-items: center;
    color: #2196f3;
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
    border-color: ${props => (props.isFocus ? '#2196f3' : '#f0f0f0')};
  }

  .checkWrap {
    .ming.Checkbox {
      height: 18px;
    }
  }

  .optionName {
    flex: 1;
    padding: 0 8px;
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

  useEffect(() => {
    setValue(isFocus ? value : '');
  }, [isFocus]);

  const handleBlurCheck = () => {
    if (!(value || '').trim()) {
      alert(_l('选项不得为空'), 3);
      updateOption(index, { value: originValue });
      setIndex(-1);
      return false;
    }
    const exitsOptions = options.filter(o => o.key !== key && o.value === value);
    if (!!exitsOptions.length) {
      alert(_l('不得与已有选项（包括回收站）重复'), 3);
      return false;
    }
    return true;
  };

  return (
    <DragItem isOther={isOther} isFocus={isFocus} key={optionKey}>
      {!isDeleted && (
        <Fragment>
          {!isOther && renderDragHandle()}
          <div className="optionContent scfdv">
            {colorful && (
              <ColorPicker
                sysColor
                isPopupBody
                value={item.color || OPTION_COLORS_LIST[index % OPTION_COLORS_LIST.length]}
                onChange={color => updateOption(index, { color })}
                popupAlign={{ points: ['tl', 'bl'], offset: [-260, 10] }}
              >
                <div className="colorWrap pointer" style={{ backgroundColor: color }}>
                  <div className={cx('tri', { isLight: isLightColor(color) })}></div>
                </div>
              </ColorPicker>
            )}
            <div className="optionName">
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
                onBlur={() => {
                  if (handleBlurCheck()) setIndex(-1);
                }}
              />
            </div>
            <Tooltip text={_l('删除')} popupPlacement="bottom">
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

export default function SelectOptions(props) {
  const {
    mode = 'add',
    onChange,
    options,
    isMulti,
    data = {},
    showAssign = false,
    fromPortal,
    enableScore,
    className,
    isDialog,
  } = props;
  const [focusIndex, setIndex] = useState(-1);
  const { showtype } = getAdvanceSetting(data);
  const [isDrag, setIsDrag] = useState(false);
  const hasOther = _.find(options, i => i.key === 'other' && !i.isDeleted);
  const findOther = _.findIndex(options, i => i.key === 'other');
  const noDelOptions = options.filter(i => !i.isDeleted);
  const notAdd = noDelOptions.length >= MAX_OPTIONS_COUNT;

  const [{ assignValueVisible, batchAddVisible }, setVisible] = useSetState({
    assignValueVisible: false,
    batchAddVisible: false,
  });

  const addOption = (isOther, nextIndex) => {
    if (notAdd) {
      alert(_l('选项不得超过%0个', MAX_OPTIONS_COUNT), 3);
      return;
    }

    if (isOther && _.find(options, o => o.key !== 'other' && o.value === _l('其他'))) {
      alert(_l('不得与已有选项（包括回收站）重复'), 3);
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
      document.getElementById(nextKey) && document.getElementById(nextKey).select();
    }, 50);
  };

  const updateOption = (index, obj) => {
    const nextOptions = update(options, { [index]: { $apply: item => ({ ...item, ...obj }) } });
    if (every(nextOptions, item => item.isDeleted)) {
      alert(_l('最少保留一个选项'), 3);
      return;
    }
    onChange({ options: nextOptions });
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
        <div className="addOptions" onClick={() => addOption()}>
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
        <div className="mLeft12 Gray_d">|</div>
        <div
          className={cx('otherAdd hoverText mLeft12', { disabled: hasOther, Hidden: showtype === '2' })}
          onClick={() => {
            if (hasOther) return;
            addOption(true);
          }}
        >
          {_l('添加其他')}
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
          options={options}
          onOk={value => {
            const getNewItems = () => {
              const formatOptions = arr =>
                arr.map((value, index) => ({
                  key: uuidv4(),
                  value,
                  checked: false,
                  isDeleted: false,
                  index: (mode === 'edit' ? 0 : options.length) + index + 1,
                  color: OPTION_COLORS_LIST[(index + 1) % OPTION_COLORS_LIST.length],
                }));
              const newOptions = update(options, {
                $splice: [[findOther > -1 ? findOther : options.length, 0, ...formatOptions(value)]],
              });
              return newOptions.map((item, idx) => ({ ...item, index: idx + 1 }));
            };
            onChange({ options: getNewItems() });
            updateVisible('batchAdd', false);
          }}
          onCancel={() => updateVisible('batchAdd', false)}
        />
      )}
    </OptionsWrap>
  );
}
