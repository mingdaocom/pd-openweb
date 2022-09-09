import React, { useEffect, useState } from 'react';
import { Menu, MenuItem, Dropdown, Checkbox } from 'ming-ui';
import Trigger from 'rc-trigger';
import DynamicDefaultValue from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue';
import cx from 'classnames';
import styled from 'styled-components';
const WrpCheck = styled.div`
  .Icon {
    left: 0 !important;
  }
`;

export default function Input(props) {
  const [visible, setVisible] = useState(false);
  const { item, data } = props;
  let { options = [] } = data;
  options = options.filter(o => !o.isDeleted); //排除已删除的选择
  // [1, 2, 5].includes(type); //文本、邮箱
  // [(6, 8, 3, 28)].includes(type); //数值、金额、手机、等级
  // [(15, 16, 17, 18)].includes(type); //日期
  // [9, 11].includes(type); //单选
  // [10].includes(type); //多选
  // [36].includes(type); //检查框
  // [26].includes(type); //成员（常规）
  // [19, 23, 24].includes(type); //地区
  // [27].includes(type); //部门
  // [29].includes(type); //关联单/多（卡片、下拉）
  // [34].includes(type); //子表

  if ([10].includes(data.type) || [9, 11].includes(data.type)) {
    let { defsource = `[]` } = item;
    try {
      defsource = JSON.parse(item.defsource);
    } catch (error) {
      defsource = [];
    }
    let { staticValue = '[]' } = defsource[0] || {};
    try {
      staticValue = JSON.parse(staticValue);
    } catch (error) {
      staticValue = [];
    }
    return (
      <div className="optionsCon">
        <Trigger
          action={['click']}
          popup={
            <Menu>
              {options.map(o => {
                return (
                  <MenuItem
                    key={o.key}
                    style={{}}
                    onClick={() => {
                      if ([10].includes(data.type)) {
                        staticValue = staticValue.includes(o.key)
                          ? staticValue.filter(it => it !== o.key)
                          : staticValue.filter(it => options.map(item => item.key).includes(it)).concat(o.key);
                      } else {
                        staticValue = [o.key];
                      }
                      props.onChange(
                        JSON.stringify([
                          {
                            cid: '',
                            rcid: '',
                            staticValue: JSON.stringify(staticValue),
                          },
                        ]),
                        true,
                      );
                      ![10].includes(data.type) && setVisible(false);
                    }}
                  >
                    {[10].includes(data.type) ? (
                      <WrpCheck>
                        <Checkbox checked={staticValue.includes(o.key)} text={o.value} />
                      </WrpCheck>
                    ) : (
                      o.value
                    )}
                  </MenuItem>
                );
              })}
            </Menu>
          }
          popupClassName={cx('dropdownTrigger')}
          popupVisible={visible}
          onPopupVisibleChange={visible => {
            setVisible(visible);
          }}
          popupAlign={{
            points: ['tl', 'bl'],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          }}
        >
          <span className="txt Hand" onClick={() => setVisible(true)}>
            {staticValue
              .filter(it => options.map(item => item.key).includes(it))
              .map(o => {
                return options.find(item => item.key === o).value;
              })
              .join('，')}
          </span>
        </Trigger>
      </div>
    );
  }
  const getAdvancedSetting = () => {
    const { data = {} } = props;
    let { advancedSetting = {} } = data;
    let { defsource = '' } = advancedSetting;
    try {
      defsource = JSON.parse(defsource);
    } catch (error) {
      defsource = defsource;
    }
    if (data.type === 34 && defsource.length <= 0) {
      //子表 默认值清空呈现异化
      return { ...advancedSetting, defaulttype: '' };
    } else {
      return advancedSetting;
    }
  };
  return (
    <DynamicDefaultValue
      {..._.pick(props, ['allControls', 'globalSheetInfo', 'onChange', 'titleControl'])}
      data={{ ...props.data, advancedSetting: getAdvancedSetting() }}
      from={1}
      writeObject={props.writeObject}
    />
  );
}
