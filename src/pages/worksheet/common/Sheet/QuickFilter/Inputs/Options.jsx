import React from 'react';
import cx from 'classnames';
import _, { filter, find } from 'lodash';
import { arrayOf, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import Checkbox from 'src/components/Form/DesktopForm/widgets/Checkbox';
import Dropdown from 'src/components/Form/DesktopForm/widgets/Dropdown';
import Option from './StyledOption';

const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  line-height: 0px;
  .ant-select {
    border-radius: 4px;
    border: 1px solid var(--border-color);
    ${({ isMultiple }) => (isMultiple ? '' : 'height: 32px;')}
    line-height: 32px;
    overflow: hidden;
    .ant-select-arrow {
      color: #9e9e9e;
    }
    .ant-select-clear {
      background: transparent !important;
    }
    &:hover {
      border-color: #ccc !important;
    }
    &:not(.isEmpty):hover {
      .ant-select-arrow {
        display: none;
      }
    }
    &.ant-select-open {
      border-color: #1677ff !important;
    }
    &.customAntSelect:not(.ant-select-open):not(.ant-select-disabled) .ant-select-selector {
      background-color: transparent !important;
      &:hover {
        background-color: transparent !important;
      }
    }
    .ant-select-selector {
      cursor: pointer !important;
      border: none !important;
      min-height: 30px;
      .customAntSelectPlaceHolder,
      .ant-select-selection-placeholder {
        color: #bdbdbd !important;
        font-size: 13px !important;
      }
      .ant-select-selection-search {
        line-height: 0px;
      }
      .ant-select-selection-search-input {
        height: 30px !important;
      }
      .ant-select-selection-placeholder {
        line-height: 30px !important;
      }
      .ant-select-selection-item {
        line-height: 28px !important;
      }
      .ant-select-selection-item > span {
        margin: 3px 0 !important;
      }
      .customAntDropdownTitleWithBG {
        margin-top: 3px !important;
        margin-bottom: 3px !important;
      }
      .customAntSelectPlaceHolder {
        padding: 0px !important;
      }
    }
    .isEmpty {
      color: inherit !important;
      margin-left: 0px !important;
      padding-left: 0px !important;
      .icon-close {
        display: none;
      }
    }
    &.ant-select-multiple {
      .ant-select-selector .ant-select-selection-overflow {
        .ant-select-selection-search {
          margin: 0px;
        }
        .ant-select-selection-overflow-item .customAntDropdownTitle {
          margin-top: 3px !important;
          margin-bottom: 3px !important;
        }
      }
      .customAntDropdownTitleWithBG {
        margin-top: 4px !important;
        margin-bottom: 4px !important;
      }
    }
  }
`;

const FullLineCon = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
`;

function pickOptions(options, navfilters) {
  try {
    const pickIds = JSON.parse(navfilters);
    return pickIds.map(pickId => _.find(options, { key: pickId })).filter(_.identity);
  } catch (err) {
    console.log(err);
    return options;
  }
}
export default function Options(props) {
  const { control, advancedSetting = {}, onChange = () => {} } = props;
  const { allowitem, direction, navshow, navfilters, shownullitem, nullitemname } = advancedSetting;
  let { options } = control;
  if (String(navshow) === '2') {
    options = pickOptions(options, navfilters);
  }
  const values = filter(props.values, key => find(options, { key }) || key === 'isEmpty');
  if (shownullitem === '1') {
    options = [
      {
        key: 'isEmpty',
        color: 'transparent',
        value: nullitemname || _l('为空'),
      },
    ].concat(options);
  }
  const multiple = String(allowitem) === '2';
  function handleChange(value) {
    onChange({
      ...value,
    });
  }
  if (String(direction) === '1') {
    return (
      <FullLineCon>
        {options
          .filter(o => !o.isDeleted)
          .slice(0, 20)
          .map((o, i) => (
            <Option
              className={cx({ multiple, checked: _.includes(values, o.key) })}
              title={o.value}
              key={i}
              onClick={() => {
                if (o.key === 'isEmpty') {
                  handleChange({ values: values.length === 1 && values[0] === 'isEmpty' ? [] : ['isEmpty'] });
                } else if (_.includes(values, o.key)) {
                  handleChange({ values: values.filter(v => v !== o.key && v !== 'isEmpty') });
                } else {
                  handleChange({
                    values: multiple ? _.uniqBy(values.concat(o.key)).filter(v => v !== 'isEmpty') : [o.key],
                  });
                }
              }}
            >
              {multiple && _.includes(values, o.key) && <span className="icon-hr_ok selectedIcon"></span>}
              <div className="ellipsis">{o.value}</div>
            </Option>
          ))}
      </FullLineCon>
    );
  } else if (String(direction) === '2' && String(allowitem) === '1') {
    return (
      <Con>
        <Dropdown
          fromFilter
          {...{
            ...control,
            advancedSetting: { ...control.advancedSetting, allowadd: '0', showtype: '1', chooseothertype: '0' },
            options: options.map(o => {
              return { ...o, hide: false }; //视图 快速筛选不隐藏选项
            }),
          }}
          default={undefined}
          dropdownClassName="scrollInTable withIsEmpty"
          value={JSON.stringify(values)}
          onChange={newValue => {
            handleChange({ values: safeParse(newValue) });
          }}
        />
      </Con>
    );
  } else if (String(direction) === '2' && String(allowitem) === '2') {
    return (
      <Con isMultiple>
        <Checkbox
          {...{
            ...control,
            advancedSetting: { ...control.advancedSetting, checktype: '1', chooseothertype: '0' },
            options: options.map(o => {
              return { ...o, hide: false }; //视图 快速筛选不隐藏选项
            }),
          }}
          default={undefined}
          fromFilter
          isFocus
          dropdownClassName="scrollInTable withIsEmpty"
          value={JSON.stringify(values)}
          onChange={newValue => {
            let parsedValue = JSON.parse(newValue);
            if (parsedValue.length > 1) {
              parsedValue = parsedValue.filter(v => v !== 'isEmpty');
            }
            handleChange({ values: parsedValue });
          }}
        />
      </Con>
    );
  } else {
    return <span />;
  }
}

Options.propTypes = {
  values: arrayOf(string),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
