import React, { Fragment, Component, createRef } from 'react';
import { string, number, arrayOf, func, bool, shape } from 'prop-types';
import cx from 'classnames';
import { ScrollView, Icon } from 'ming-ui';
import { Tabs, Tooltip } from 'antd';
import withClickAway from 'ming-ui/decorators/withClickAway';
import AddColorDialog from './AddColorDialog';
import SvgIcon from 'src/components/SvgIcon';
import { COLORS, COLORS_TEST } from './config';
import './index.less';
import ajaxRequest from 'src/api/appManagement';
import { generate } from '@ant-design/colors';
import { isEmpty } from 'lodash';

const DEFAULT_COLOR = '#2196f3';

@withClickAway
export default class extends Component {
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
    const { icon, iconColor, navColor } = props;
    this.$nameRef = createRef();
    this.state = {
      icon: icon,
      iconColor: iconColor,
      navColor,
      customIcon: [],
      systemIcon: [],
      customColors: (localStorage.getItem('customColors') || '').split(',').filter(_ => _),
      addColorDialogVisible: false
    };
  }

  componentDidMount() {
    if (this.$nameRef.current) {
      this.$nameRef.current.focus();
      this.$nameRef.current.select();
    }
    this.getIcon();
  }

  componentWillUnmount() {
    this.dataChange();
  }

  getIcon() {
    const { projectId } = this.props;
    ajaxRequest.getIcon({ projectId }).then(({ customIcon, systemIcon }) => {
      this.setState({ customIcon, systemIcon });
    });
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

  handleSelectColor = (color) => {
    const { iconColor, navColor } = this.props;
    const colors = this.getNavColorList(iconColor);
    const index = colors.indexOf(navColor);
    this.handleClick({
      iconColor: color,
      navColor: navColor ? this.getNavColorList(color)[index] : undefined,
      lightColor: this.getNavColorList(color)[1]
    })
  }

  handleClick = obj => {
    this.setState(obj, () => {
      this.props.onModify(obj);
    });
  };

  handleInput = e => {
    const { onModify } = this.props;
    let { value } = e.target;
    const normalizedValue = value.slice(0, 50);
    if (normalizedValue !== value) {
      this.$nameRef.current.value = value.slice(0, 50);
    }
    onModify({ name: value });
  };

  handleFocus = () => {
    this.$nameRef.current.select();
  };

  handleKeydown = e => {
    const { keyCode } = e;
    if (keyCode === 13) {
      this.props.onClose();
    }
  };
  renderIcons = () => {
    const { colorList, index, iconColor = colorList[index % colorList.length], hideCustom } = this.props;
    const { icon, systemIcon, customIcon } = this.state;

    const renderSystemIcon = () => {
      return (
        <ScrollView className="iconsScrollViewWrap">
          <div className="systemIcon">
            <ul className="iconsWrap">
              {systemIcon.map(({ fileName, iconUrl }) => {
                let isCurrent = icon === fileName;
                return (
                  <li
                    key={fileName}
                    className={cx({ isCurrentIcon: isCurrent })}
                    style={{ backgroundColor: isCurrent ? iconColor : '#fff' }}
                    onClick={() => this.handleClick({ icon: fileName, iconUrl })}
                  >
                    <SvgIcon url={iconUrl} fill={isCurrent ? '#fff' : '#9e9e9e'} />
                  </li>
                );
              })}
            </ul>
          </div>
        </ScrollView>
      );
    }

    return (
      <Tabs defaultActiveKey="system">
        <Tabs.TabPane tab={_l('图标')} key="system">
          {renderSystemIcon()}
        </Tabs.TabPane>
        {!hideCustom && !isEmpty(customIcon) && (
          <Tabs.TabPane tab={_l('自定义')} key="custom">
            <ScrollView className="iconsScrollViewWrap">
              <div className="customIcon">
                {/* <div className="title">{_l('自定义图标')}</div> */}
                <ul className="iconsWrap">
                  {customIcon.map(({ iconUrl, fileName }) => {
                    let isCurrent = icon === fileName;
                    return (
                      <li
                        key={fileName}
                        className={cx({ isCurrentIcon: isCurrent })}
                        style={{ backgroundColor: isCurrent ? iconColor : '#fff' }}
                        onClick={() => this.handleClick({ icon: fileName, iconUrl })}
                      >
                        <SvgIcon url={iconUrl} fill={isCurrent ? '#fff' : '#9e9e9e'} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </ScrollView>
          </Tabs.TabPane>
        )}
      </Tabs>
    );
  };
  renderNavigationColor(iconColor) {
    const { navColor, onShowNavigationConfig } = this.props;
    const colors = this.getNavColorList(iconColor);
    const colorsText = [_l('主题色'), _l('浅主题色'), _l('白色'), _l('灰色'), _l('黑色')];
    return (
      <Fragment>
        <div className="flexRow alignItemsCenter">
          <div className="bold flex">{_l('导航色')}</div>
          {onShowNavigationConfig && (
            <div className="ThemeColor pointer mRight30" onClick={onShowNavigationConfig}>{_l('设置导航方式')}</div>
          )}
        </div>
        <div className="navigationColor flexRow mTop10">
          {colors.map((data, index) => (
            <Tooltip key={index} title={colorsText[index]} color="#000" placement="bottom">
              <div
                className="colorItem flexRow alignItemsCenter justifyContentCenter pointer"
                style={{ backgroundColor: data }}
                onClick={() => this.handleClick({ navColor: data, iconColor, lightColor: colors[1] })}
              >
                {data === navColor && <Icon icon="hr_ok" className={cx('Font17', { White: [0, 4].includes(index) }) } />}
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
            <Icon icon="task-add-member-circle" className="Gray_bd Font24 pointer" onClick={() => this.setState({ addColorDialogVisible: true })}/>
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
            onSave={(color) => {
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
      index,
      iconColor = colorList[index % colorList.length],
      navColor,
      name,
      hideInput,
      hideColor,
      onClearIcon,
    } = this.props;
    return (
      <div className={cx('selectIconWrap', className, { pTop10: hideInput })} style={style}>
        {!hideInput && (
          <div className="inputWrap">
            <input
              type="text"
              ref={this.$nameRef}
              defaultValue={name}
              onFocus={this.handleFocus}
              onChange={this.handleInput}
              onKeyDown={this.handleKeydown}
            />
          </div>
        )}
        <div className="flexRow">
          <div className="flexColumn mTop10">
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
          <div className="flex" style={{ minWidth: 375 }}>
            {this.renderIcons()}
            {onClearIcon && (
              <div
                className="clearBtn pointer Gray_75"
                onClick={() => {
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
