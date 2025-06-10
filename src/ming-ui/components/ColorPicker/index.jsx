import React, { cloneElement, Component } from 'react';
import { HexAlphaColorPicker, HexColorInput, RgbaColorPicker } from 'react-colorful';
import { generate } from '@ant-design/colors';
import { InputNumber } from 'antd';
import { TinyColor } from '@ctrl/tinycolor';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dropdown } from 'ming-ui';
import '../less/ColorPicker.less';

const TYPES = ['HEX', 'RGB'];
const THEME_COLOR_VALUE = ['DARK_COLOR', 'LIGHT_COLOR'];
const DEFAULT_COLORS_ROW_1 = [
  '#000000ff',
  '#151515ff',
  '#5a5a5aff',
  '#757575ff',
  '#9e9e9eff',
  '#bdbdbdff',
  '#ddddddff',
  '#f5f5f5ff',
  '#ffffffff',
];

const DEFAULT_COLORS_ROW_2 = [
  '#2196f3ff',
  '#08c9c9ff',
  '#00c345ff',
  '#fad714ff',
  '#ff9300ff',
  '#f52222ff',
  '#eb2f96ff',
  '#7500eaff',
  '#2d46c4ff',
];

const DEFAULT_COLORS_ROW_3 = [
  '#c9e6fcff',
  '#c3f2f2ff',
  '#c2f1d2ff',
  '#fef6c6ff',
  '#ffe5c2ff',
  '#fdcacaff',
  '#facde6ff',
  '#dec2faff',
  '#ccd2f1ff',
];

const DEFAULT_COLORS2 = [
  '#151515ff',
  '#757575ff',
  '#2196f3ff',
  '#08c9c9ff',
  '#00c345ff',
  '#fad714ff',
  '#ff9300ff',
  '#f52222ff',
  '#eb2f96ff',
  '#7500eaff',
  '#2d46c4ff',
];

const TYPE_COMP = {
  HEX: HexAlphaColorPicker,
  RGB: RgbaColorPicker,
};

const COLOR_BOX = styled.span(
  ({ background }) => `
    min-width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid #d9d9d9;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    padding: 3px;
    .color_box_content {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      background: ${background};
    }
    `,
);

const isSameColor = (propsColor, stateColor) => {
  return new TinyColor(propsColor).toHex8String() === new TinyColor(stateColor).toHex8String();
};

const isColorString = value => {
  return value.startsWith('#') || value.startsWith('rgb');
};

class ColorPicker extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    value: PropTypes.string, // 颜色值
    onChange: PropTypes.func.isRequired, // 颜色变换时回调函数 输出16进制字符串（#00000000）
    getPopupContainer: PropTypes.func, // 自定义挂载位置函数
    isPopupBody: PropTypes.bool, // true 挂载在body false 挂载在当前元素
    handleClose: PropTypes.func, // 弹层关闭回调函数
    sysColor: PropTypes.bool, // 左侧系统预设 默认false
    themeColor: PropTypes.string, // 主题色
    lightBefore: false, // 是否浅色在前
    disabled: false, //是否禁用
  };

  static defaultProps = {
    visible: false,
    value: '#2196f3',
    isPopupBody: false,
    sysColor: false,
    themeColor: '',
    disabled: false,
    onChange: () => {},
    handleClose: () => {},
  };

  constructor(props) {
    super(props);
    const { value, visible } = props;

    this.state = {
      ...this.initValue(value),
      visible,
      themeExpand: true,
      defaultExpand: true,
      recentExpand: true,
      recentColors: JSON.parse(localStorage.getItem('recentColorsMing') || '[]'),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    const { color } = this.state;

    if (!isSameColor(value, color) && isColorString(value)) {
      this.setState(this.initValue(value));
    }
  }

  setRecentColorsLocal = color => {
    const { recentColors } = this.state;

    if (recentColors.find(l => isSameColor(l, color))) return;

    let newRecentColors = [];
    if (recentColors.length === 5) {
      newRecentColors = _.slice(recentColors, 1, 5).concat(color);
    } else {
      newRecentColors = recentColors.concat(color);
    }

    this.setState({ recentColors: newRecentColors });
    localStorage.setItem('recentColorsMing', JSON.stringify(newRecentColors));
  };

  initValue = value => {
    let isHex = value.startsWith('#');

    return {
      color: new TinyColor(value),
      type: TYPES[isHex ? 0 : 1],
    };
  };

  handleChangeColor = value => {
    this.setColor({ color: new TinyColor(value) });
  };

  setColor = (value, themeValue) => {
    this.setState(
      {
        ...value,
      },
      () => {
        const stringColor = this.state.color.toHex8String();
        this.props.onChange(themeValue || stringColor);
      },
    );
  };

  getPopupContainer = () => {
    const { isPopupBody, getPopupContainer } = this.props;

    if (getPopupContainer) {
      return getPopupContainer();
    }

    return isPopupBody ? document.body : document.querySelector('.ColorPickerPanel');
  };

  getStringColor = color => {
    return new TinyColor(color).toHex8String();
  };

  getSelectedIconColor = backgroundColor => {
    return new TinyColor(backgroundColor).isDark() ? '#fff' : 'rgba(0,0,0,.45)';
  };

  renderSysColors = (expand, list, isTheme = false) => {
    const { color } = this.state;
    return (
      <div className={cx('commonColors', { hide: !expand })}>
        {list.map((colorItem, index) => (
          <div
            className="commonColorItem"
            style={{ background: colorItem }}
            onClick={() => {
              this.setColor({ color: new TinyColor(colorItem) }, isTheme ? THEME_COLOR_VALUE[index] : undefined);
            }}
          >
            <i
              className={cx('icon-done selectedIcon', { hide: !isSameColor(colorItem, color) })}
              style={{ color: this.getSelectedIconColor(colorItem) }}
            ></i>
          </div>
        ))}
      </div>
    );
  };

  onClose = () => {
    const { handleClose } = this.props;
    const stringColor = this.state.color.toHex8String();
    this.setRecentColorsLocal(stringColor);
    handleClose(stringColor);
  };

  render() {
    const {
      children,
      className,
      sysColor,
      themeColor,
      fromWidget,
      popupAlign = {},
      defaultColors,
      lightBefore,
      disabled,
    } = this.props;
    const { color, visible, type, defaultExpand, recentExpand, recentColors, themeExpand } = this.state;
    const themeColors = [themeColor, generate(themeColor)[0]];
    const DEFAULT_COLORS = lightBefore
      ? DEFAULT_COLORS_ROW_3.concat(DEFAULT_COLORS_ROW_2, DEFAULT_COLORS_ROW_1)
      : DEFAULT_COLORS_ROW_1.concat(DEFAULT_COLORS_ROW_2, DEFAULT_COLORS_ROW_3);

    let content = (
      <COLOR_BOX background={this.getStringColor(color)}>
        <span className="color_box_content"></span>
      </COLOR_BOX>
    );
    if (children) {
      content = children;
    }

    let Comp = TYPE_COMP[type];
    let triggerClass = sysColor ? 'ColorPickerPanelTriggerMax' : 'ColorPickerPanelTriggerMin';

    return (
      <span className={cx('ColorPickerPanel ming ColorPicker-wrapper', className)} onClick={e => e.stopPropagation()}>
        <Trigger
          zIndex={1056}
          action={disabled ? [] : ['click']}
          popupVisible={visible}
          onPopupVisibleChange={visible => {
            this.setState({ visible });
            if (visible) {
              const { recentColors } = this.state;
              let recent = JSON.parse(localStorage.getItem('recentColorsMing') || '[]');
              !_.isEqual(recentColors, recent) &&
                this.setState({
                  recentColors: recent,
                });
            } else {
              this.onClose();
            }
          }}
          destroyPopupOnHide
          popupClassName={cx('ColorPickerPanelTrigger', triggerClass)}
          popupAlign={{
            points: ['tl', 'bl'],
            ...popupAlign,
            overflow: { adjustX: true, adjustY: true },
          }}
          getPopupContainer={this.getPopupContainer}
          popup={
            <div className="colorPickerCon">
              {sysColor && (
                <div className="commonColorPickerWrap">
                  {themeColor && (
                    <React.Fragment>
                      <div className="title" onClick={() => this.setState({ themeExpand: !themeExpand })}>
                        <span
                          className={cx('icon-expand_more Font20 Gray_9e expandIcon', { rotate90: !themeExpand })}
                        ></span>
                        <span className="mLeft4">{_l('主题')}</span>
                      </div>
                      {this.renderSysColors(themeExpand, themeColors, true)}
                    </React.Fragment>
                  )}
                  <div className="title" onClick={() => this.setState({ defaultExpand: !defaultExpand })}>
                    <span
                      className={cx('icon-expand_more Font20 Gray_9e expandIcon', { rotate90: !defaultExpand })}
                    ></span>
                    <span className="mLeft4">{_l('常用')}</span>
                  </div>
                  {this.renderSysColors(defaultExpand, fromWidget ? DEFAULT_COLORS2 : defaultColors || DEFAULT_COLORS)}
                  <div className="title" onClick={() => this.setState({ recentExpand: !recentExpand })}>
                    <span
                      className={cx('icon-expand_more Font20 Gray_9e expandIcon', { rotate90: !recentExpand })}
                    ></span>
                    <span className="mLeft4">{_l('最近使用')}</span>
                  </div>
                  {this.renderSysColors(recentExpand, recentColors)}
                </div>
              )}
              <div className="colorPickerWrap" onClick={e => e.stopPropagation()}>
                <Comp color={type === 'HEX' ? color.toHex8String() : color.toRgb()} onChange={this.handleChangeColor} />
                <div className="inputOptionWrap">
                  <Dropdown
                    className="selectType"
                    value={type}
                    data={TYPES.map(l => ({ text: l, value: l }))}
                    onChange={value => {
                      if (value === type) return;

                      this.setState({ type: value });
                    }}
                  />
                  <div className="colorInputWrap">
                    {type === 'HEX' ? (
                      <div className="hexColorInputWrap">
                        <span className="prefix">#</span>
                        <HexColorInput
                          className="hexColorInput"
                          color={color.toHex8String()}
                          onChange={value => {
                            if (value.length !== 7) return;

                            this.setColor({ color: new TinyColor(value) });
                          }}
                        />
                      </div>
                    ) : (
                      <div className="rgbInputWrap">
                        {['r', 'g', 'b'].map(key => (
                          <InputNumber
                            className="rgbInput"
                            size="small"
                            step="1"
                            controls={false}
                            value={color[key]}
                            min={0}
                            max={255}
                            onChange={value => {
                              if (value === null) return;

                              this.setColor({
                                color: new TinyColor({
                                  ...color.toRgb(),
                                  [key]: value,
                                }),
                              });
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <InputNumber
                    className="alphaInput"
                    size="small"
                    step="1"
                    value={color.toRgb().a}
                    min={0}
                    max={1}
                    controls={false}
                    formatter={value => `${_.round(value * 100)}%`}
                    parser={value => _.round(value.replace('%', '') / 100, 2)}
                    onChange={value => {
                      if (value === null) return;

                      const _tcolor = color.setAlpha(value);
                      this.setColor({ color: new TinyColor(_tcolor) });
                    }}
                  />
                </div>
                <div className="colorValue" style={{ background: this.getStringColor(color) }}></div>
              </div>
            </div>
          }
        >
          <span className="ColorPicker-input-container" ref={trigger => (this.trigger = trigger)}>
            {cloneElement(content)}
          </span>
        </Trigger>
      </span>
    );
  }
}

export default ColorPicker;
