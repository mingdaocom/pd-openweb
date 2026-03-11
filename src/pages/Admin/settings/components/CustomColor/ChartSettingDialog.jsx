import React, { useEffect, useRef, useState } from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { ColorPicker, Dialog, Icon, Input } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import IllustrationTrigger from './IllustrationTrigger';

const CustomChartContentWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  .label {
    font-size: 13px;
    font-family: FZLanTingHeiS;
    font-weight: 600;
    line-height: 13px;
    color: var(--color-text-title);
  }
  .nameInput {
    width: 100%;
    cursor: pointer;
  }
  .colorList {
    padding: 6px 0;
    flex: 1;
    overflow-y: scroll;
    min-height: 200px;
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    max-height: 285px;
    overflow-y: scroll;
    .colorSelectItem {
      padding: 6px 10px 6px 19px;
      display: flex;
      align-items: center;
      .ColorPickerPanel {
        font-size: 0;
      }
      .item {
        height: 24px;
        margin-right: 7px;
        width: 40px;
        display: inline-block;
        border-radius: 2px;
        &.border {
          border: 1px solid var(--color-border-secondary);
        }
      }
      .deleteIcon {
        display: none;
        &:hover {
          color: var(--color-error) !important;
        }
      }
      &.addItem {
        .item {
          background: var(--color-background-primary);
          border: 1px solid var(--color-border-secondary);
          text-align: center;
          line-height: 24px;
        }
      }
      &:hover,
      &.active {
        background: var(--color-background-secondary);
        .deleteIcon {
          display: inline-block;
        }
      }
    }
  }
  .colorSelectWrap {
    width: 80px;
    height: 36px;
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-secondary);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px;
    .colorBg {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--color-border-secondary);
      box-sizing: content-box;
    }
    &.disableColorSelectWrap {
      background: var(--color-background-secondary);
    }
  }
  .themeList {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    .colorItem {
      width: 36px;
      height: 36px;
      background: var(--color-background-primary);
      border: 1px solid var(--color-border-secondary);
      border-radius: 4px;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      .colorBg {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      &.disable {
        background: var(--color-background-secondary);
      }
      &:hover {
        .removeIcon {
          opacity: 1;
        }
      }
      .removeIcon {
        position: absolute;
        font-size: 16px;
        top: 0;
        right: 0;
        background: var(--color-background-primary);
        transform: translate(50%, -50%);
        border-radius: 50%;
        opacity: 0;
        cursor: pointer;
        color: var(--color-text-disabled);
        &:hover {
          color: var(--color-primary);
        }
      }
    }
    .addColorWrap:hover {
      border: 1px solid var(--color-primary);
      .icon {
        color: var(--color-primary);
      }
    }
  }
  .fitContent {
    width: fit-content;
  }
`;

const CustomColorsWrap = styled.div`
  width: 360px;
  background: var(--color-background-primary);
  box-shadow: var(--shadow-lg);
  opacity: 1;
  border-radius: 5px;
  padding: 24px;
  .customColors {
    display: flex;
    gap: 6px;
    margin-top: 16px;
    flex-wrap: wrap;
    .colorItem {
      width: 34px;
      height: 34px;
      background: var(--color-background-primary);
      border: 1px solid var(--color-border-secondary);
      border-radius: 4px;
      padding: 2px;
      cursor: pointer;
      position: relative;
      .bgColor {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      &.isDark {
        .selectIcon {
          color: var(--color-white);
        }
      }
      &.selected {
        border: 1px solid var(--color-primary);
      }
      &.disabled {
        cursor: not-allowed;
        &::after {
          content: '';
          width: 1px;
          height: 28px;
          background: var(--color-background-inverse);
          display: inline-block;
          position: absolute;
          top: 2px;
          transform: rotate(-45deg);
          left: 15px;
        }
      }

      &.disabled.isDark {
        &::after {
          background: var(--color-background-primary);
        }
      }
    }
  }
`;

const DEFAULT_COLOR = '#1677ff';

export default function ChartSettingDialog(props) {
  const { onOk, visible, onCancel, data = null, editable = false, customColors = [], id, customChar = [] } = props;

  const [name, setName] = useState((data || {}).name);
  const [colors, setColors] = useState((data || {}).colors || new Array(8).fill());
  const [themeColors, setThemeColors] = useState((data || {}).themeColors || []);
  const [customThemeVisible, setCustomThemeVisible] = useState(false);
  const [otherThemeColors, setOtherThemeColors] = useState([]);
  const [lastColor, setLastColor] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (customChar.length === 0) return;

    let _data = [];
    customChar.forEach(item => {
      _data = _data.concat(id === item.id && data ? [] : item.themeColors || []);
    });
    setOtherThemeColors(_data);
  }, [id]);

  const isWhite = color => new TinyColor(color).toHexString() === '#ffffff';

  const renderColorSelectWrap = (color, index) => {
    return (
      <ColorPicker
        key={`ColorPicker-${index}`}
        disabled={!editable}
        isPopupBody
        value={color || lastColor || DEFAULT_COLOR}
        onChange={value => {
          setColors(colors.map((l, i) => (index === i ? value : l)));
        }}
        handleClose={value => setLastColor(value)}
      >
        <div
          className={cx('item', { border: isWhite(color || DEFAULT_COLOR) })}
          style={{ background: color || DEFAULT_COLOR }}
        ></div>
      </ColorPicker>
    );
  };

  const renderMenu = colors => {
    return (
      <CustomColorsWrap>
        <div className="title Font14 bold textPrimary">{_l('自定义主题颜色')}</div>
        <div className="customColors">
          {colors.map(item => {
            const selected = themeColors.includes(item.color);
            const disabled = otherThemeColors.includes(item.color);

            return (
              <div
                className={cx('colorItem', {
                  selected: selected,
                  disabled: disabled,
                  isDark: new TinyColor(item.color).isDark(),
                })}
                onClick={() => {
                  if (disabled) return;
                  setThemeColors(selected ? themeColors.filter(l => l !== item.color) : themeColors.concat(item.color));
                  setCustomThemeVisible(false);
                }}
              >
                <div className="bgColor" style={{ background: item.color }}>
                  <i className={cx('icon-done selectIcon', { hide: !selected })}></i>
                </div>
              </div>
            );
          })}
        </div>
      </CustomColorsWrap>
    );
  };

  const editCustomChart = () => {
    if (!name) {
      alert(_l('请填写图表配色名称'), 3);
      return;
    }

    onOk({
      name,
      colors: colors.map(l => l || DEFAULT_COLOR),
      themeColors,
      id: id || null,
    });
  };

  const onAdd = () => setColors(colors.concat(undefined));

  return (
    <Dialog
      width={480}
      hight={640}
      className="customChartDialog"
      visible={visible}
      title={editable ? _l('自定义图表配色') : _l('预设颜色')}
      onCancel={onCancel}
      onOk={editCustomChart}
    >
      <CustomChartContentWrap>
        <div className="label mBottom12">
          {_l('名称')}
          <Tooltip title={_l('最多15个字符')}>
            <Icon icon="info_outline" className="Font16 textDisabled mLeft4" />
          </Tooltip>
        </div>
        <Input
          placeholder={_l('请填写自定义图表配色名称')}
          disabled={!editable}
          className="nameInput placeholderColor"
          value={name}
          onChange={value => setName(value)}
          maxlength="15"
          manualRef={inputRef}
        />
        <div className="label mBottom16 mTop24">{_l('颜色')}</div>
        <div className="colorList">
          {colors.map((color, index) => (
            <div className="colorSelectItem" key={`chatSetting-${index}`}>
              {renderColorSelectWrap(color, index)}
              <div className="Font13 flex">{_l('色值%0', index + 1)}</div>
              {colors.length > 8 && (
                <Tooltip title={_l('删除')}>
                  <Icon
                    icon="delete_12"
                    className="textTertiary deleteIcon"
                    onClick={() => setColors(colors.filter((l, i) => i !== index))}
                  />
                </Tooltip>
              )}
            </div>
          ))}
          {editable && colors.length < 18 && (
            <div className="colorSelectItem addItem Hand" onClick={onAdd}>
              <div className="item">
                <Icon icon="add" className="textTertiary Font16" />
              </div>
              <div className="Font13 textTertiary hoverColorPrimary">{_l('添加颜色')}</div>
            </div>
          )}
        </div>
        <IllustrationTrigger type="chart">
          <div className="label mBottom16 mTop32 valignWrapper fitContent">
            {_l('主题颜色（只可选择自定义主题色）')}
            <Icon icon="info_outline" className="Font16 textDisabled mLeft4" />
          </div>
        </IllustrationTrigger>
        <div className="themeList">
          {themeColors.map(color => (
            <div className={cx('colorItem', { disable: !editable })}>
              <div className="colorBg" style={{ background: color }}></div>
              {editable && (
                <i
                  className="icon-minus-square removeIcon"
                  onClick={e => {
                    e.stopPropagation();
                    setThemeColors(themeColors.filter(l => l !== color));
                  }}
                ></i>
              )}
            </div>
          ))}
          {editable && (
            <Trigger
              popup={renderMenu(customColors)}
              popupVisible={customThemeVisible}
              onPopupVisibleChange={visible => {
                setCustomThemeVisible(visible);
              }}
              action={['click']}
              popupAlign={{
                points: ['tl', 'bl'],
                overflow: { adjustX: true, adjustY: true },
              }}
            >
              <div className="colorItem addColorWrap">
                <Icon icon="add" className="Font16 textTertiary" />
              </div>
            </Trigger>
          )}
        </div>
      </CustomChartContentWrap>
    </Dialog>
  );
}
