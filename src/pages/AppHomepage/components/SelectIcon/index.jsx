import React, { Fragment, Component, createRef } from 'react';
import { string, number, arrayOf, func, bool, shape } from 'prop-types';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import withClickAway from 'ming-ui/decorators/withClickAway';
import AddColorDialog from './AddColorDialog';
import { COLORS, COLORS_TEST } from './config';
import './index.less';
import { generate } from '@ant-design/colors';
import _ from 'lodash';
import IconTabs from './IconTabs';

const DEFAULT_COLOR = '#2196f3';

@withClickAway
class SelectIcon extends Component {
  static propTypes = {
    projectId: string,
    className: string,
    style: shape({}),
    iconColor: string,
    icon: string,
    name: string,
    hideInput: bool,
    hideColor: bool,
    // 索引，用作按顺序选颜色,若不传则默认选择第一个颜色
    index: number,
    // 选颜色的标题
    pickColorTitle: string,
    colorList: arrayOf(string),
    onChange: func,
    onModify: func,
    onClose: func,
    onClearIcon: func,
  };

  static defaultProps = {
    iconColor: DEFAULT_COLOR,
    index: 0,
    pickColorTitle: _l('默认图标'),
    icon: 'custom_style',
    colorList: COLORS,
    onChange: _.noop,
    onModify: _.noop,
    onClose: _.noop,
  };

  constructor(props) {
    super(props);
    const { icon, iconColor, navColor, colorList, index } = props;
    this.$nameRef = createRef();
    this.state = {
      icon: icon,
      iconColor: iconColor || colorList[index % colorList.length] ,
      navColor,
      customColors: (localStorage.getItem('customColors') || '').split(',').filter(_ => _),
      addColorDialogVisible: false,
      loading: false,
      currentKey: 'general',
    };
    this.colorIndex = navColor ? (this.getNavColorList(iconColor).indexOf(navColor) || 0) : 0;
  }

  componentDidMount() {
    if (this.$nameRef.current) {
      this.$nameRef.current.focus();
      this.$nameRef.current.select();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.state, nextState)) {
      return true;
    }
    if(this.state.icon !== nextProps.icon || this.state.iconColor !== nextProps.iconColor) {
      this.setState({
        icon: nextProps.icon,
        iconColor: nextProps.iconColor,
      })
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    this.dataChange();
  }

  getNavColorList(iconColor) {
    const lightColor = generate(iconColor)[0];
    return [iconColor, lightColor, '#ffffff', '#f5f6f7', '#1b2025'];
  }

  dataChange = () => {
    const { current } = this.$nameRef;
    const { value = '' } = current || {};
    const { icon, iconColor, navColor } = this.state;
    if (value) {
      const lightColor = generate(iconColor)[0];
      this.props.onChange({ icon, iconColor, navColor, lightColor, name: value.trim().slice(0, 50) });
    }
  };

  handleSelectColor = color => {
    const { navColor } = this.state;
    const currentColors = this.getNavColorList(color);

    this.handleClick({
      iconColor: color,
      navColor: navColor ? currentColors[this.colorIndex] : undefined,
      lightColor: currentColors[1],
    });
  };

  handleClick = obj => {
    this.setState(obj, () => {
      setTimeout(() => {
        this.props.onModify(obj)
      }, 200)
    });
  };

  handleInput = _.debounce(value => {
    const { onModify } = this.props;
    onModify({ name: value || '' });
  }, 500);

  handleFocus = () => {
    this.$nameRef.current.select();
  };

  handleKeydown = e => {
    const { keyCode } = e;
    if (keyCode === 13) {
      this.props.onClose();
    }
  };

  renderNavigationColor(iconColor) {
    const { navColor } = this.state;
    const { onShowNavigationConfig } = this.props;
    const colors = this.getNavColorList(iconColor);
    const colorsText = [_l('主题色'), _l('浅主题色'), _l('白色'), _l('灰色'), _l('黑色')];
    return (
      <Fragment>
        <div className="flexRow alignItemsCenter">
          <div className="bold flex">{_l('导航色')}</div>
          {onShowNavigationConfig && (
            <div className="ThemeColor pointer mRight30" onClick={onShowNavigationConfig}>
              {_l('设置导航方式')}
            </div>
          )}
        </div>
        <div className="navigationColor flexRow mTop10">
          {colors.map((data, index) => (
            <Tooltip key={index} title={colorsText[index]} color="#000" placement="bottom">
              <div
                className="colorItem flexRow alignItemsCenter justifyContentCenter pointer"
                style={{ backgroundColor: data }}
                onClick={() => {
                  this.colorIndex = index;
                  this.handleClick({ navColor: data, iconColor, lightColor: colors[1] });
                }}
              >
                {data === navColor && <Icon icon="hr_ok" className={cx('Font17', { White: [0, 4].includes(index) })} />}
              </div>
            </Tooltip>
          ))}
        </div>
      </Fragment>
    );
  }
  renderCustomColor(iconColor) {
    const { addColorDialogVisible, customColors } = this.state;
    return (
      <Fragment>
        <div className="Gray_9e">{_l('自定义')}</div>
        <ul className="colorsWrap">
          <li className="isCurrentColor">
            <Icon
              icon="task-add-member-circle"
              className="Gray_bd Font24 pointer"
              onClick={() => this.setState({ addColorDialogVisible: true })}
            />
          </li>
          {customColors.map((item, index) => (
            <Tooltip key={index} title={item} color="#000" placement="bottom">
              <li
                className={cx({ isCurrentColor: item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() })}
                style={{ backgroundColor: item }}
                onClick={() => this.handleSelectColor(item)}
              >
                {item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() && <Icon icon="hr_ok" />}
              </li>
            </Tooltip>
          ))}
        </ul>
        {addColorDialogVisible && (
          <AddColorDialog
            onSave={color => {
              const colors = [color].concat(customColors).slice(0, 5);
              this.setState({ customColors: colors });
              localStorage.setItem('customColors', colors);
              this.handleSelectColor(color);
            }}
            onCancel={() => this.setState({ addColorDialogVisible: false })}
          />
        )}
      </Fragment>
    );
  }
  render() {
    const {
      className,
      style = {},
      colorList,
      name,
      hideInput,
      hideColor,
      onClearIcon,
    } = this.props;

    const { iconColor, navColor } = this.state;

    return (
      <div
        className={cx('selectIconWrap', className, { pTop10: hideInput })}
        style={{
          ...style,
          width: hideColor || !colorList.length ? 409 : 720,
        }}
      >
        {!hideInput && (
          <div className="inputWrap">
            <input
              type="text"
              ref={this.$nameRef}
              defaultValue={name}
              onFocus={this.handleFocus}
              onChange={e => this.handleInput(e.target.value)}
              onKeyDown={this.handleKeydown}
              maxLength={50}
            />
          </div>
        )}
        <div className={cx('flexRow', { noColorColumn: hideColor || !colorList.length })}>
          <div className="flexColumn mTop24" style={{ width: '36%' }}>
            {!hideColor && !!colorList.length && (
              <Fragment>
                <div className="bold">{_l('主题色')}</div>
                <ul className="colorsWrap">
                  {colorList.map((item, index) => (
                    <Tooltip key={item} title={COLORS_TEST[index]} color="#000" placement="bottom">
                      <li
                        className={cx({ isCurrentColor: item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() })}
                        style={{ backgroundColor: item }}
                        onClick={() => this.handleSelectColor(item)}
                      >
                        {item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() && <Icon icon="hr_ok" />}
                      </li>
                    </Tooltip>
                  ))}
                </ul>
                {this.renderCustomColor(iconColor)}
              </Fragment>
            )}
            {navColor && this.renderNavigationColor(iconColor)}
          </div>
          <div className="flex mTop18 relative" style={{ width: '60%' }}>
            <IconTabs
              handleClick={this.handleClick}
              {..._.pick(this.state, ['iconColor', 'icon'])}
              {..._.pick(this.props, ['hideCustom', 'projectId'])}
            />
            {onClearIcon && this.state.icon && (
              <div
                className="clearBtn pointer Gray_75"
                onClick={() => {
                  this.setState({icon: ''})
                  onClearIcon();
                }}
              >
                {_l('清除')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default SelectIcon;
