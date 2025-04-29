import React, { Fragment } from 'react';
import { Icon, Checkbox } from 'ming-ui';
import { SettingItem, AnimationWrap, DisplayMode } from '../../../styled';
import WidgetColor from '../WidgetColor';
import cx from 'classnames';
import { handleAdvancedSettingChange, updateConfig, canSetWidgetStyle } from '../../../util/setting';
import { SectionItem } from '../SplitLineConfig/style';
import { isCustomWidget, notExplainDisplay, getAdvanceSetting } from '../../../util';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue.jsx';

const DISPLAY_STYLE_TYPES = [
  { icon: 'format_bold', value: 0 },
  { icon: 'format_italic', value: 1 },
  { icon: 'format_underlined', value: 2 },
  { icon: 'strikethrough_s', value: 3 },
];

const DISPLAY_SIZE_TYPES = [
  { text: '1', value: '0' },
  { text: '1.2', value: '1' },
  { text: '1.4', value: '2' },
  { text: '1.6', value: '3' },
  { text: '1.8', value: '4' },
];

// const DISPLAY_CARD_SIZE_TYPES = [
//   { text: '1.2', value: '1' },
//   { text: '1.4', value: '2' },
//   { text: '1.6', value: '3' },
//   { text: '1.8', value: '4' },
//   { text: '2', value: '5' },
// ];

const DISPLAY_POSITION_TYPES = [
  { text: _l('常规'), value: '1', icon: 'horizontal-fieldvalue' },
  { text: _l('强调值'), value: '2', icon: 'highlight-fieldvalue' },
];

const DISPLAY_OTHER_COLOR_TYPES = [
  { text: _l('边框'), key: 'bordercolor', isDefault: true },
  { text: _l('背景'), key: 'background' },
];

// 样式
const StyleDefault = props => {
  const { data = {}, editKey = '', ignoreFormat = [], onChange, defaultStyle } = props;
  const isOldConfig = _.includes(['titledefault', 'valuedefault'], editKey);
  const defaultConfig = isOldConfig ? safeParse(defaultStyle || '{}') : getAdvanceSetting(data, [editKey]) || {};
  const sizeResult = defaultConfig.size || (editKey === 'rowtitlestyle' || data.type === 34 ? '1' : '0');
  const colorResult =
    defaultConfig.color ||
    (_.includes(['titledefault', 'cardtitlestyle'], editKey) && data.type !== 34 ? '#757575' : '#151515');
  return (
    <Fragment>
      <SectionItem key={editKey}>
        <div className="label Gray_75">{_l('样式')}</div>
        <div className="flex flexRow flexCenter">
          <WidgetColor
            fromWidget={true}
            color={colorResult}
            handleChange={value => {
              if (isOldConfig) {
                const colorKey = editKey.startsWith('title') ? 'titlecolor' : 'valuecolor';
                onChange(handleAdvancedSettingChange(data, { [colorKey]: value }));
                return;
              }
              onChange(
                handleAdvancedSettingChange(data, {
                  [editKey]: JSON.stringify({ ...defaultConfig, color: value }),
                }),
              );
            }}
          />

          <AnimationWrap className="flex mLeft8">
            {DISPLAY_STYLE_TYPES.map(({ icon, value }) => {
              if (_.includes(ignoreFormat, value)) return null;
              const styleValues = defaultConfig.style || '0000';
              const isActive = styleValues[value] === '1';
              return (
                <div
                  className={cx('animaItem', { active: isActive })}
                  onClick={() => {
                    const result = updateConfig({
                      config: styleValues,
                      value: isActive ? '0' : '1',
                      index: value,
                    });
                    if (isOldConfig) {
                      const styleKey = editKey.startsWith('title') ? 'titlestyle' : 'valuestyle';
                      onChange(handleAdvancedSettingChange(data, { [styleKey]: result }));
                      return;
                    }
                    onChange(
                      handleAdvancedSettingChange(data, {
                        [editKey]: JSON.stringify({ ...defaultConfig, style: result }),
                      }),
                    );
                  }}
                >
                  <Icon icon={icon} className="Font24" />
                </div>
              );
            })}
          </AnimationWrap>
        </div>
      </SectionItem>
      <SectionItem className="mTop10">
        <div className="label Gray_75">{_l('字号')}</div>
        <AnimationWrap className="flex">
          {DISPLAY_SIZE_TYPES.map(({ text, value }) => (
            <div
              className={cx('animaItem', {
                active: sizeResult === value,
              })}
              onClick={() => {
                if (isOldConfig) {
                  const sizeKey = editKey.startsWith('title') ? 'titlesize' : 'valuesize';
                  onChange(handleAdvancedSettingChange(data, { [sizeKey]: value }));
                  return;
                }
                onChange(
                  handleAdvancedSettingChange(data, {
                    [editKey]: JSON.stringify({ ...defaultConfig, size: value }),
                  }),
                );
              }}
            >
              {text}
            </div>
          ))}
        </AnimationWrap>
      </SectionItem>
    </Fragment>
  );
};

// 位置
const PositionDefault = props => {
  const { data = {}, editKey, onChange } = props;
  const defaultConfig = getAdvanceSetting(data, [editKey]);
  const defaultCardValue = getAdvanceSetting(data, 'cardvaluestyle');
  const { direction = '1' } = defaultConfig;
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('样式')}</div>
      <DisplayMode className="flex">
        {DISPLAY_POSITION_TYPES.map(({ text, value, icon }) => {
          return (
            <div
              className={cx('displayItem', { active: direction === value })}
              onClick={() => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    [editKey]: JSON.stringify({ ...defaultConfig, direction: value }),

                    cardvaluestyle:
                      value === '2'
                        ? JSON.stringify({
                            ...defaultCardValue,
                            size: '3',
                            style: updateConfig({
                              config: defaultCardValue.style,
                              value: '1',
                              index: 0,
                            }),
                          })
                        : JSON.stringify({
                            ...defaultCardValue,
                            size: '0',
                            style: updateConfig({
                              config: defaultCardValue.style,
                              value: '0',
                              index: 0,
                            }),
                          }),
                  }),
                );
              }}
            >
              <div className="mBottom4">
                <Icon icon={icon} className="Font20" />
              </div>
              <span className="text">{text}</span>
            </div>
          );
        })}
      </DisplayMode>
    </SettingItem>
  );
};

// 其他
const OtherDefault = props => {
  const { data = {}, editKey, onChange } = props;
  const defaultConfig = getAdvanceSetting(data, [editKey]);
  return (
    <div className="flexRow flexCenter">
      {DISPLAY_OTHER_COLOR_TYPES.map(({ text, key, isDefault }) => {
        const color = isDefault && _.isUndefined(defaultConfig[key]) ? '#eaeaea' : defaultConfig[key];
        return (
          <div className="flexRow flexCenter flex">
            <Checkbox
              className="mRight20"
              size="small"
              text={text}
              checked={!!color}
              onClick={checked =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    [editKey]: JSON.stringify({
                      ...defaultConfig,
                      [key]: checked ? '' : key === 'background' ? '#f5f5f5' : '#eaeaea',
                    }),
                  }),
                )
              }
            />
            <WidgetColor
              color={color}
              handleChange={color => {
                onChange(
                  handleAdvancedSettingChange(data, {
                    [editKey]: JSON.stringify({ ...defaultConfig, [key]: color }),
                  }),
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// 文本框高度
const TextHeightLimit = props => {
  const { data, onChange } = props;
  const { type } = data;
  const { minheight = '90', maxheight } = getAdvanceSetting(data);
  return (
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
            let tempMinValue = Number(value || 36);
            if (tempMinValue < 36) {
              tempMinValue = 36;
            }
            if (maxheight && tempMinValue > Number(maxheight)) {
              tempMinValue = maxheight;
            }
            onChange(handleAdvancedSettingChange(data, { minheight: tempMinValue.toString() }));
          }}
        />
      </SectionItem>
      <div className="Gray_75 mTop6" style={{ paddingLeft: '50px' }}>
        {_l('最小可设为36px（单行高度）')}
      </div>
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
            let tempMaxValue = Number(value);
            if (type === 2 && tempMaxValue > 400) {
              tempMaxValue = 400;
            }
            if (minheight && tempMaxValue < Number(minheight)) {
              tempMaxValue = minheight;
            }
            onChange(handleAdvancedSettingChange(data, { maxheight: tempMaxValue.toString() }));
          }}
        />
      </SectionItem>
    </SettingItem>
  );
};

// 字段
export const WidgetItem = props => {
  const { data } = props;
  const { type, enumDefault, showControls = [] } = data;
  const { titlestyle, titlecolor, titlesize, valuestyle, valuecolor, valuesize, showtype } = getAdvanceSetting(data);
  return (
    <Fragment>
      {!notExplainDisplay(data) && (
        <SettingItem>
          <div className="settingItemTitle">{_l('字段标题')}</div>
          <StyleDefault
            {...props}
            editKey="titledefault"
            ignoreFormat={[0]}
            defaultStyle={JSON.stringify({ style: titlestyle, color: titlecolor, size: titlesize })}
          />
        </SettingItem>
      )}
      {!isCustomWidget(data) && canSetWidgetStyle(data) && (
        <SettingItem>
          <div className="settingItemTitle">{type === 51 ? _l('字段值（文本）') : _l('字段值')}</div>
          <StyleDefault
            {...props}
            editKey="valuedefault"
            defaultStyle={JSON.stringify({ style: valuestyle, color: valuecolor, size: valuesize })}
          />
        </SettingItem>
      )}
      {((type === 2 && _.includes([1, 3], enumDefault)) || type === 41) && <TextHeightLimit {...props} />}
    </Fragment>
  );
};

//卡片
export const CardItem = props => {
  return (
    <Fragment>
      <PositionDefault {...props} editKey="cardtitlestyle" />
      <SettingItem>
        <div className="settingItemTitle">{_l('记录标题')}</div>
        <StyleDefault {...props} editKey="rowtitlestyle" ignoreFormat={[0]} />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('字段标题')}</div>
        <StyleDefault {...props} editKey="cardtitlestyle" />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('字段值（文本）')}</div>
        <StyleDefault {...props} editKey="cardvaluestyle" />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('其他')}</div>
        <OtherDefault {...props} editKey="cardstyle" />
      </SettingItem>
    </Fragment>
  );
};
