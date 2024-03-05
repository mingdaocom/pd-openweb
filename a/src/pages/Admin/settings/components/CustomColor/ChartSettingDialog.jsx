import React, { useEffect, useRef, useState } from 'react';
import { Tooltip, Dialog, Input, ColorPicker, Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import tinycolor from '@ctrl/tinycolor';

const CustomChartContentWrap = styled.div`
  .label {
    font-size: 13px;
    font-family: FZLanTingHeiS;
    font-weight: 600;
    line-height: 13px;
    color: #333333;
  }
  .nameInput {
    width: 100%;
    cursor: pointer;
  }
  .colorList {
    display: flex;
    flex-wrap: wrap;
    gap: 24px 37px;
  }
  .colorSelectWrap {
    width: 80px;
    height: 36px;
    background: #ffffff;
    border: 1px solid #e6e6e6;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px;
    .colorBg {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      box-sizing: content-box;
    }
    &.disableColorSelectWrap {
      background: #f5f5f5;
    }
  }
  .themeList {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    .colorItem {
      width: 36px;
      height: 36px;
      background: #ffffff;
      border: 1px solid #e6e6e6;
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
        background: #f5f5f5;
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
        background: #fff;
        transform: translate(50%, -50%);
        border-radius: 50%;
        opacity: 0;
        cursor: pointer;
        color: #bdbdbd;
        &:hover {
          color: #2196f3;
        }
      }
    }
    .addColorWrap:hover {
      border: 1px solid #2196f3;
      .icon {
        color: #2196f3;
      }
    }
  }
`;

const CustomColorsWrap = styled.div`
  width: 360px;
  background: #fff;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.24);
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
      background: #ffffff;
      border: 1px solid #e0e0e0;
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
          color: #fff;
        }
      }
      &.selected {
        border: 1px solid #2196f3;
      }
      &.disabled {
        cursor: not-allowed;
        &::after {
          content: '';
          width: 1px;
          height: 28px;
          background: #333;
          display: inline-block;
          position: absolute;
          top: 2px;
          transform: rotate(-45deg);
          left: 15px;
        }
      }

      &.disabled.isDark {
        &::after {
          background: #fff;
        }
      }
    }
  }
`;

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

  const renderColorSelectWrap = (color, index) => {
    const colorSelectContent = (
      <div className={cx('colorSelectWrap', { disableColorSelectWrap: !editable })}>
        <div className="colorBg" style={{ background: color || 'rgba(255, 255, 255, 0)' }}></div>
        <Icon icon="expand_more" className="Font18 Gray_9e" />
      </div>
    );

    return editable ? (
      <ColorPicker
        value={color || lastColor}
        onChange={value => {
          setColors(colors.map((l, i) => (index === i ? value : l)));
          setLastColor(value);
        }}
      >
        {colorSelectContent}
      </ColorPicker>
    ) : (
      colorSelectContent
    );
  };

  const renderMenu = colors => {
    return (
      <CustomColorsWrap>
        <div className="title Font14 bold Gray">{_l('自定义主题颜色')}</div>
        <div className="customColors">
          {colors.map(item => {
            const selected = themeColors.includes(item.color);
            const disabled = otherThemeColors.includes(item.color);

            return (
              <div
                className={cx('colorItem', {
                  selected: selected,
                  disabled: disabled,
                  isDark: tinycolor(item.color).isDark(),
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

  const editCustomChar = () => {
    if (!name) {
      alert(_l('请填写图表配色名称'), 3);
      return;
    }

    if (colors.filter(l => l).length < 8) {
      alert(_l('请完善图表颜色'), 3);
      return;
    }

    onOk({
      name,
      colors,
      themeColors,
      id: id || null,
    });
  };

  return (
    <Dialog
      width={480}
      className="customChartDialog"
      visible={visible}
      title={editable ? _l('自定义图表配色') : _l('预设颜色')}
      onCancel={onCancel}
      onOk={editCustomChar}
    >
      <CustomChartContentWrap>
        <div className="label mBottom12">{_l('名称')}</div>
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
            <div className="colorSelectItem">
              <div className="name mBottom12">
                {_l('颜色')}
                {index + 1}
              </div>
              {renderColorSelectWrap(color, index)}
            </div>
          ))}
        </div>
        <div className="label mBottom16 mTop32">{_l('主题颜色')}</div>
        <div className="themeList">
          {themeColors.map(color => (
            <div className={cx('colorItem', { disable: !editable })}>
              <div className="colorBg" style={{ background: color }}></div>
              {editable && (
                <i
                  className="icon-remove_circle removeIcon"
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
                <Icon icon="add" className="Font16 Gray_9e" />
              </div>
            </Trigger>
          )}
        </div>
      </CustomChartContentWrap>
    </Dialog>
  );
}
