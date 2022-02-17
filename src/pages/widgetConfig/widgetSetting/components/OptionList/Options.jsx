import React, { useState, Fragment } from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { Checkbox, Radio } from 'ming-ui';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { Tooltip } from 'antd';
import update from 'immutability-helper';
import { useSetState } from 'react-use';
import { every, includes, pull } from 'lodash';
import { isLightColor } from 'src/util';
import { getAdvanceSetting, parseOptionValue } from '../../../util/setting';
import SelectColor from './SelectColor';
import { OPTION_COLORS_LIST } from '../../../config';
import AssignValue from './AssignValue';
import BatchAdd from './BatchAdd';
import 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/inputTypes/SubSheet/style.less';

const OptionsWrap = styled.div`
  margin-top: 8px;

  .dragPointer {
    &:hover {
      cursor: move;
    }
  }
`;

const HandleOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;

  .operate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 116px;
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
`;
const DragItem = styled.li`
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
    margin-left: 8px;
    padding-right: 8px;
    display: flex;
    align-items: center;
    flex: 1;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    &:hover {
      border-color: #2196f3;
    }
  }

  .checkWrap {
    .ming.Checkbox {
      height: 18px;
    }
  }

  .optionName {
    flex: 1;
  }
  .ming.Radio {
    margin: 0;
  }

  input {
    width: 100%;
    border: none;
    outline: none;
    padding: 0 8px;
    line-height: 37px;
  }
  .deleteWrap {
    color: #9e9e9e;
  }
`;

const DragHandle = SortableHandle(() => (
  <Tooltip title={_l('拖拽调整排序')}>
    <div className="pointer dragPointer">
      <i className="icon-drag"></i>
    </div>
  </Tooltip>
));

const OptionItem = SortableElement(
  ({
    checkedValue = [],
    addOption,
    item,
    focusIndex,
    switchChecked,
    mode,
    options,
    idx: index,
    colorful,
    isMulti,
    updateOption,
  }) => {
    const [visible, setVisible] = useState(false);
    const { key, value, isDeleted, color } = item;
    const checked = includes(checkedValue, key);
    return (
      <DragItem>
        {!isDeleted && (
          <Fragment>
            <DragHandle />
            <div className="optionContent">
              {colorful && (
                <Trigger
                  action={['click']}
                  popup={
                    <SelectColor
                      onClickAway={() => setVisible(false)}
                      color={item.color || OPTION_COLORS_LIST[index % OPTION_COLORS_LIST.length]}
                      onChange={color => updateOption(index, { color })}
                    />
                  }
                  popupAlign={{ points: ['tl', 'bl'], offset: [-45, 10] }}
                >
                  <div className="colorWrap pointer" style={{ backgroundColor: color }}>
                    <div className={cx('tri', { isLight: isLightColor(color) })}></div>
                  </div>
                </Trigger>
              )}
              <div className="optionName">
                <input
                  autoFocus={index === focusIndex}
                  value={value}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && index === options.length - 1) {
                      addOption();
                    }
                  }}
                  onChange={e => updateOption(index, { value: e.target.value.trim() })}
                />
              </div>
              {mode !== 'list' && (
                <div className="checkWrap" data-tip={_l('设为默认选中')}>
                  {isMulti ? (
                    <Checkbox checked={checked} size="small" onClick={() => switchChecked(key)} />
                  ) : (
                    <Radio checked={checked} size="small" onClick={() => switchChecked(key)} />
                  )}
                </div>
              )}
              <div
                className="deleteWrap pointer"
                data-tip={_l('删除')}
                onClick={() => updateOption(index, { isDeleted: true })}
              >
                <i className="icon-delete Font18"></i>
              </div>
            </div>
          </Fragment>
        )}
      </DragItem>
    );
  },
);

const OptionList = SortableContainer(({ options = [], ...rest }) => {
  return (
    <ul>
      {options.map((option, index) => (
        <OptionItem key={option.key} options={options} index={index} idx={index} item={option} {...rest} />
      ))}
    </ul>
  );
});

export default function SelectOptions(props) {
  const { mode = 'add', onAdd, enableScore, onChange, options, isMulti, data = {}, fromPortal } = props;
  const [focusIndex, setIndex] = useState(-1);
  const checkedValue = parseOptionValue(data.default);

  const [{ assignValueVisible, batchAddVisible }, setVisible] = useSetState({
    assignValueVisible: false,
    batchAddVisible: false,
  });

  const addOption = () => {
    const colorIndex = _.findIndex(OPTION_COLORS_LIST, item => item === (_.last(options) || {}).color);
    const nextOptions = update(options, {
      $push: [
        {
          key: uuidv4(),
          value: _l('选项%0', options.length + 1),
          isDeleted: false,
          index: options.length + 1,
          color: OPTION_COLORS_LIST[(colorIndex + 1) % OPTION_COLORS_LIST.length],
        },
      ],
    });
    onChange({
      options: nextOptions,
    });
    setIndex(nextOptions.length - 1);
    if (onAdd) {
      onAdd();
    }
  };

  const switchChecked = key => {
    if (!isMulti) {
      onChange({ default: JSON.stringify(checkedValue.includes(key) ? [] : [key]) });
      return;
    }
    const nextCheckedValue = checkedValue.includes(key) ? pull(checkedValue, key) : checkedValue.concat(key);
    onChange({ default: JSON.stringify(nextCheckedValue) });
  };

  const updateOption = (index, obj) => {
    const nextOptions = update(options, { [index]: { $apply: item => ({ ...item, ...obj }) } });
    if (every(nextOptions, item => item.isDeleted)) {
      alert(_l('最少保留一个选项'));
      return;
    }
    onChange({ options: nextOptions });
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    // 选项拖拽重新生成index
    onChange({ options: arrayMove(options, oldIndex, newIndex).map((item, index) => ({ ...item, index })) });
  };

  const updateVisible = (type, visible = true) => {
    setVisible({ [`${type}Visible`]: visible });
  };

  return (
    <OptionsWrap>
      <OptionList
        {...props}
        useDragHandle
        addOption={addOption}
        onSortEnd={onSortEnd}
        switchChecked={switchChecked}
        updateOption={updateOption}
        focusIndex={focusIndex}
        checkedValue={checkedValue}
        helperClass="selectOptionSortableList"
      />
      <HandleOption>
        <div className="addOptions" onClick={addOption}>
          <i className="icon-add Font18"></i>
          <span>{_l('添加选项')}</span>
        </div>
        {!fromPortal && (
          <div className="operate">
            <div className="batchAdd hoverText" onClick={() => updateVisible('batchAdd')}>
              {_l('批量添加')}
            </div>
            <div className="assignValue hoverText" onClick={() => updateVisible('assignValue')}>
              {_l('赋分值')}
            </div>
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
          options={mode === 'edit' ? options : []}
          onOk={value => {
            const textArr = _.uniqBy(
              value
                .split(/\n/)
                .filter(v => !!v)
                .map(v => v.trim()),
            );
            const texts = options.map(item => item.value);
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
              if (mode === 'edit') {
                return formatOptions(textArr);
              }
              return options.concat(formatOptions(textArr.filter(v => !texts.includes(v))));
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
