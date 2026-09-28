import React from 'react';
import _, { filter, find } from 'lodash';
import { arrayOf, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import Checkbox from 'src/components/Form/DesktopForm/widgets/Checkbox';
import Dropdown from 'src/components/Form/DesktopForm/widgets/Dropdown';

const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  line-height: 0px;
  .hap-select {
    // 记录详情控件高度36, 快速筛选/行内编辑32, 所以这里要减小高度
    .hap-select-selection-item.customAntDropdownTitleWithBG,
    .hap-select-selection-item.customAntDropdownTitle {
      --hap-select-multi-item-height: 21px;
      .multiSelectTagText {
        padding: unset;
      }
    }
    .singleSelectLabel {
      line-height: 21px;
    }
  }
`;

const FullLineCon = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
`;

const OPTION_BUTTON_STYLE = {
  maxWidth: 200,
  '--hap-control-height-sm': '28px',
  '--hap-button-padding-inline-sm': '12px',
};
const SELECTED_MULTIPLE_OPTION_BUTTON_STYLE = {
  ...OPTION_BUTTON_STYLE,
  borderColor: 'var(--hap-color-primary-border)',
};

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
  const { control, advancedSetting = {}, onChange = () => {}, viewId } = props;
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
  const controlKey = `${viewId || ''}-${control.controlId}`;

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
          .map(o => {
            const checked = _.includes(values, o.key);

            return (
              <Button
                className="mTop2 mRight6 mBottom2 Normal"
                color={checked ? 'primary' : 'default'}
                variant={checked ? (multiple ? 'filled' : 'solid') : 'outlined'}
                shape="round"
                size="small"
                ellipsis
                Normal
                style={checked && multiple ? SELECTED_MULTIPLE_OPTION_BUTTON_STYLE : OPTION_BUTTON_STYLE}
                title={o.value}
                key={o.key}
                aria-pressed={checked}
                icon={multiple && checked ? <Icon icon="hr_ok" className="Font13" /> : undefined}
                onClick={() => {
                  if (o.key === 'isEmpty') {
                    handleChange({ values: values.length === 1 && values[0] === 'isEmpty' ? [] : ['isEmpty'] });
                  } else if (checked) {
                    handleChange({ values: values.filter(v => v !== o.key && v !== 'isEmpty') });
                  } else {
                    handleChange({
                      values: multiple ? _.uniqBy(values.concat(o.key)).filter(v => v !== 'isEmpty') : [o.key],
                    });
                  }
                }}
              >
                {o.value}
              </Button>
            );
          })}
      </FullLineCon>
    );
  } else if (String(direction) === '2' && String(allowitem) === '1') {
    return (
      <Con>
        <Dropdown
          key={controlKey}
          fromFilter
          {...{
            ...control,
            advancedSetting: { ...control.advancedSetting, allowadd: '0', showtype: '1', chooseothertype: '0' },
            options: options.map(o => {
              return { ...o, hide: false }; //视图 快速筛选不隐藏选项
            }),
          }}
          default={undefined}
          dropdownClassName="scrollInTable"
          value={JSON.stringify(values)}
          onChange={newValue => {
            handleChange({ values: safeParse(newValue) });
          }}
        />
      </Con>
    );
  } else if (String(direction) === '2' && String(allowitem) === '2') {
    return (
      <Con $isMultiple>
        <Checkbox
          key={controlKey}
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
          dropdownClassName="scrollInTable"
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
  viewId: string,
};
