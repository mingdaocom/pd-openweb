import React, { Component, createRef, Fragment } from 'react';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import { bool, func, number, string } from 'prop-types';
import { Dialog, FunctionWrap, Icon, IconTabs, Input } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import AppNavStyle from 'src/pages/PageHeader/AppPkgHeader/AppDetail/AppNavStyle';
import { getThemeColors } from 'src/utils/project';
import dialogSelectColor from '../dialogSelectColor';
import './index.less';

const DEFAULT_COLOR = '#1677ff';
const NAME_MAX_LENGTH = 100;

class SelectIcon extends Component {
  static propTypes = {
    projectId: string,
    className: string,
    iconColor: string,
    icon: string,
    name: string,
    hideInput: bool,
    hideColor: bool,
    // 索引，用作按顺序选颜色,若不传则默认选择第一个颜色
    index: number,
    onChange: func,
    onModify: func,
    onClearIcon: func,
  };

  static defaultProps = {
    iconColor: DEFAULT_COLOR,
    index: 0,
    icon: 'custom_style',
    onChange: _.noop,
    onModify: _.noop,
  };

  constructor(props) {
    super(props);
    const { icon, projectId, iconColor, navColor, index, name } = props;
    const colorList = getThemeColors(projectId);
    this.$nameRef = createRef();
    this.state = {
      name,
      icon,
      iconColor: iconColor || colorList[index % colorList.length],
      navColor,
      customColors: (localStorage.getItem('customColors') || '').split(',').filter(_ => _),
    };
    this.colorIndex = navColor ? this.getNavColorList(iconColor).indexOf(navColor) || 0 : 0;

    this.debouncedModifyName = _.debounce(value => {
      this.callOnModify({ name: value || '' });
    }, 500);
  }

  componentDidMount() {
    if (this.$nameRef.current) {
      this.$nameRef.current.focus();
      this.$nameRef.current.select();
    }
  }

  componentWillUnmount() {
    this.dataChange();
    // 取消防抖函数，避免内存泄漏
    this.debouncedModifyName?.cancel();
  }

  getNavColorList(iconColor) {
    const lightColor = generate(iconColor)[0];
    return [iconColor, lightColor, '#ffffff', '#f5f6f7', '#1b2025'];
  }

  // 调用 onModify，始终传入当前 state 中的最新值，确保即使 onModify 是闭包也能拿到最新值
  callOnModify = (updateObj = {}) => {
    this.props.onModify({
      ..._.pick(this.state, ['iconColor', 'navColor', 'lightColor', 'icon', 'iconUrl']),
      ...updateObj,
    });
  };

  dataChange = () => {
    const { current } = this.$nameRef;
    const { value = '' } = current || {};
    const { icon, iconColor, navColor } = this.state;
    if (value) {
      const lightColor = generate(iconColor)[0];
      this.props.onChange({ icon, iconColor, navColor, lightColor, name: value.trim().slice(0, NAME_MAX_LENGTH) });
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
        this.callOnModify(obj);
      }, 200);
    });
  };

  renderCustomColor(iconColor) {
    const { customColors } = this.state;

    return (
      <div className="mTop8 mBottom8">
        <div className="textTertiary">{_l('自定义')}</div>
        <ul className="colorsWrap">
          <li className="noHover addIcon">
            <Icon
              icon="add"
              className="textDisabled Font20"
              onClick={() => {
                dialogSelectColor({
                  onSave: color => {
                    const colors = [color].concat(customColors).slice(0, 5);
                    this.setState({ customColors: colors });
                    localStorage.setItem('customColors', colors);
                    this.handleSelectColor(color);
                  },
                });
              }}
            />
          </li>
          {customColors.map((item, index) => (
            <Tooltip key={index} title={item} placement="bottom">
              <li
                className={cx({ noHover: item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() })}
                style={{ backgroundColor: item }}
                onClick={() => this.handleSelectColor(item)}
              >
                {item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() && (
                  <Icon icon="hr_ok" className="textWhite Font16" />
                )}
              </li>
            </Tooltip>
          ))}
        </ul>
      </div>
    );
  }

  renderNavigationColor(iconColor) {
    const { navColor } = this.state;
    const colors = this.getNavColorList(iconColor);
    const colorsText = [_l('主题色'), _l('浅主题色'), _l('白色'), _l('灰色'), _l('黑色')];

    return (
      <Fragment>
        <div className="mTop12 flexRow alignItemsCenter">
          <span className="bold">{_l('导航色')}</span>
          <Tooltip title={_l('导航色仅在浅色主题下生效')}>
            <Icon icon="info_outline" className="Font16 textTertiary mLeft4 Hand" />
          </Tooltip>
        </div>
        <div className={cx('colorsWrap', { disabled: window.themeMode === 'dark' })}>
          {colors.map((data, index) => (
            <Tooltip key={index} title={colorsText[index]} placement="bottom">
              <li
                className="hasBorder noHover"
                style={{ backgroundColor: data }}
                onClick={() => {
                  this.colorIndex = index;
                  this.handleClick({ navColor: data, iconColor, lightColor: colors[1] });
                }}
              >
                {data === navColor && (
                  <Icon icon="hr_ok" className={cx('Font16', { textWhite: [0, 4].includes(index) })} />
                )}
              </li>
            </Tooltip>
          ))}
        </div>
      </Fragment>
    );
  }

  renderNavigateType() {
    const { onChangeNavigationConfig, app } = this.props;
    return (
      <Fragment>
        <div className="bold mTop20 mBottom12">{_l('导航方式')}</div>
        <AppNavStyle className="navTypeWrapper" type="pcNaviStyle" data={app} onChangeApp={onChangeNavigationConfig} />
      </Fragment>
    );
  }

  render() {
    const { projectId, className, hideInput, hideColor, onClearIcon, onCancel, showNavigationConfig } = this.props;
    const colorList = getThemeColors(projectId);
    const { iconColor, navColor, name } = this.state;
    const dialogTitle = showNavigationConfig ? _l('应用名称和外观') : hideInput ? _l('修改图标') : _l('修改名称和图标');

    return (
      <Dialog
        dialogClasses="selectIconDialogContainer"
        visible
        width={hideColor || !colorList.length ? 570 : 960}
        title={dialogTitle}
        onCancel={onCancel}
        okText={_l('关闭')}
        buttonType="ghost"
        showCancel={false}
        onOk={onCancel}
      >
        <div className={cx('selectIconWrap', className)}>
          {!hideInput && (
            <Input
              className="w100"
              manualRef={this.$nameRef}
              maxLength={NAME_MAX_LENGTH}
              value={name}
              onFocus={() => this.$nameRef.current.select()}
              onChange={value => {
                this.setState({ name: value || '' });
                this.debouncedModifyName(value);
              }}
              onKeyDown={e => e.key === 'Enter' && onCancel()}
            />
          )}
          <div className={`flexRow ${hideInput ? 'mTop8' : 'mTop18'}`}>
            {!hideColor && (
              <div className="flexColumn mTop6 pRight60">
                {!!colorList.length && (
                  <Fragment>
                    <div className="bold">{_l('主题色')}</div>
                    <ul className="colorsWrap">
                      {colorList.map(item => (
                        <Tooltip key={item} placement="bottom">
                          <li
                            className={cx({ noHover: item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() })}
                            style={{ backgroundColor: item }}
                            onClick={() => this.handleSelectColor(item)}
                          >
                            {item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() && (
                              <Icon icon="hr_ok" className="textWhite Font16" />
                            )}
                          </li>
                        </Tooltip>
                      ))}
                    </ul>
                    {this.renderCustomColor(iconColor)}
                  </Fragment>
                )}
                {navColor && this.renderNavigationColor(iconColor)}
                {showNavigationConfig && this.renderNavigateType()}
              </div>
            )}

            <div className="flex relative minWidth0">
              <IconTabs
                handleClick={this.handleClick}
                {..._.pick(this.state, ['iconColor', 'icon', 'lightColor', 'navColor'])}
                {..._.pick(this.props, ['hideCustom', 'projectId'])}
                onClearIcon={
                  onClearIcon
                    ? () => {
                        this.setState({ icon: '' });
                        onClearIcon();
                      }
                    : null
                }
              />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default props => FunctionWrap(SelectIcon, { ...props });
