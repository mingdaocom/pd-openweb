import React, { Fragment, useState } from 'react';
import { Collapse } from 'antd';
import { Icon } from 'ming-ui';
import { CaretRightOutlined } from '@ant-design/icons';
import { SettingItem, AnimationWrap } from '../../styled';
import WidgetColor from '../components/WidgetColor';
import cx from 'classnames';
import { handleAdvancedSettingChange, updateConfig } from '../../util/setting';
import { SettingCollapseWrap } from './styled';
import { isCustomWidget, notExplainDisplay } from '../../util';
import { HAVE_VALUE_STYLE_WIDGET } from '../../config';
import { SectionItem } from '../components/SplitLineConfig/style';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue.jsx';

const { Panel } = Collapse;

const DISPLAY_TYPES = [
  {
    icon: 'format_bold',
    value: 0,
  },
  {
    icon: 'format_italic',
    value: 1,
  },
  {
    icon: 'format_underlined',
    value: 2,
  },
  {
    icon: 'strikethrough_s',
    value: 3,
  },
];

const getStyleOptions = data => {
  const defaultData = [];
  // 不支持字段名称样式
  if (!notExplainDisplay(data)) {
    defaultData.push({
      text: _l('名称'),
      key: 'title',
    });
  }
  if (!isCustomWidget(data) && _.includes(HAVE_VALUE_STYLE_WIDGET, data.type)) {
    defaultData.push({
      text: _l('值'),
      key: 'value',
    });
  }
  return defaultData;
};

const DISPLAY_SIZE = Array.from({ length: 5 }).map((item, index) => ({
  value: `${index}`,
  icon: index ? 'T' + index : 'title',
}));

const DefaultStyle = ({ data, onChange }) => {
  const { advancedSetting = {}, type, enumDefault } = data;
  const { minheight = '90', maxheight } = advancedSetting;

  const DISPLAY_OPTIONS = getStyleOptions(data);

  return (
    <Fragment>
      {DISPLAY_OPTIONS.map(item => {
        const colorKey = item.key + 'color';
        const styleKey = item.key + 'style';
        const sizeKey = item.key + 'size';
        return (
          <SettingItem>
            <div className="settingItemTitle">{item.text}</div>
            <SectionItem>
              <div className="label Gray_75">{_l('颜色')}</div>
              <WidgetColor
                type="normal"
                fromWidget={true}
                color={advancedSetting[colorKey] || (item.key === 'title' && type !== 34 ? '#757575' : '#151515')}
                handleChange={color => {
                  onChange(handleAdvancedSettingChange(data, { [colorKey]: color }));
                }}
              />
            </SectionItem>
            <SectionItem>
              <div className="label Gray_75">{_l('样式')}</div>
              <AnimationWrap className="flex">
                {DISPLAY_TYPES.map(itemType => {
                  if (item.key === 'title' && itemType.value === 0) return null;
                  const styleValues = advancedSetting[styleKey] || '0000';
                  const isActive = styleValues[itemType.value] === '1';
                  return (
                    <div
                      className={cx('animaItem', {
                        active: isActive,
                      })}
                      onClick={() => {
                        onChange(
                          handleAdvancedSettingChange(data, {
                            [styleKey]: updateConfig({
                              config: styleValues,
                              value: isActive ? '0' : '1',
                              index: itemType.value,
                            }),
                          }),
                        );
                      }}
                    >
                      <Icon icon={itemType.icon} className="Font24" />
                    </div>
                  );
                })}
              </AnimationWrap>
            </SectionItem>
            <SectionItem>
              <div className="label Gray_75">{_l('字号')}</div>
              <AnimationWrap className="flex">
                {DISPLAY_SIZE.map((itemSize, index) => (
                  <div
                    className={cx('animaItem', {
                      active: (advancedSetting[sizeKey] || (type === 34 ? '1' : '0')) === itemSize.value,
                    })}
                    onClick={() => {
                      onChange(handleAdvancedSettingChange(data, { [sizeKey]: itemSize.value }));
                    }}
                  >
                    <Icon icon={itemSize.icon} className="Font24" />
                  </div>
                ))}
              </AnimationWrap>
            </SectionItem>
          </SettingItem>
        );
      })}
      {((type === 2 && enumDefault === 1) || type === 41) && (
        <SettingItem>
          <div className="settingItemTitle">{_l('文本框高度（px）')}</div>
          <SectionItem>
            <div className="label Gray_75">{_l('最小')}</div>
            <InputValue
              value={minheight}
              className="w100"
              type={2}
              placeholder={_l('最小')}
              onChange={value => {
                onChange(handleAdvancedSettingChange(data, { minheight: value }));
              }}
              onBlur={value => {
                let tempMinValue = value;
                if (type === 2 && tempMinValue < 36) {
                  tempMinValue = 36;
                }
                if (type === 41 && tempMinValue < 90) {
                  tempMinValue = 90;
                }
                const max = type === 2 ? maxheight || 400 : maxheight;
                if (max && tempMinValue > Number(max)) {
                  tempMinValue = max;
                }
                onChange(handleAdvancedSettingChange(data, { minheight: tempMinValue.toString() }));
              }}
            />
          </SectionItem>
          <SectionItem>
            <div className="label Gray_75">{_l('最大')}</div>
            <InputValue
              value={maxheight}
              className="w100"
              type={2}
              placeholder={_l('自适应')}
              onChange={value => {
                onChange(handleAdvancedSettingChange(data, { maxheight: value }));
              }}
              onBlur={value => {
                let tempMaxValue = value;
                if (type === 2 && tempMaxValue > 400) {
                  tempMaxValue = 400;
                }
                if (minheight && tempMaxValue && tempMaxValue < Number(minheight)) {
                  tempMaxValue = minheight;
                }
                onChange(handleAdvancedSettingChange(data, { maxheight: tempMaxValue.toString() }));
              }}
            />
          </SectionItem>
        </SettingItem>
      )}
    </Fragment>
  );
};

const getItems = props => {
  return [
    {
      key: 'default',
      label: _l('默认'),
      children: <DefaultStyle {...props} />,
    },
  ];
};

export default function StyleContent(props) {
  const [expandKeys, setExpandKeys] = useState(['default']);

  return (
    <SettingCollapseWrap
      bordered={false}
      activeKey={expandKeys}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      items={getItems(props)}
      onChange={value => setExpandKeys(value)}
    >
      {getItems(props).map(item => {
        return (
          <Panel header={item.label} key={item.key}>
            {item.children}
          </Panel>
        );
      })}
    </SettingCollapseWrap>
  );
}
