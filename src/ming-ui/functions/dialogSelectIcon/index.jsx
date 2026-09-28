import React, { Component, createRef, Fragment } from 'react';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import { bool, func, number, string } from 'prop-types';
import { Icon, IconTabs } from 'ming-ui';
import { Input, Modal, Tooltip } from 'ming-ui/antd-components';
import { getThemeColors } from 'src/utils/services/project';
import dialogSelectColor from '../dialogSelectColor';
import AppNavStyle from './AppNavStyle';
import './index.less';

const DEFAULT_COLOR = '#1677ff';
const NAME_MAX_LENGTH = 100;
const MODAL_STYLES = { mask: { backgroundColor: 'rgba(0, 0, 0, 0.1)' } };

export class SelectIcon extends Component {
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
    const nameInput = this.getNameInput();

    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  }

  componentWillUnmount() {
    this.dataChange();
    // 取消防抖函数，避免内存泄漏
    this.debouncedModifyName?.cancel();
  }

  getNameInput = () => this.$nameRef.current?.input || this.$nameRef.current;

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
    const { value = '' } = this.getNameInput() || {};
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

    return (
      <div className={cx('selectIconWrap', className)}>
        {!hideInput && (
          <Input
            className="w100"
            maxLength={NAME_MAX_LENGTH}
            ref={this.$nameRef}
            value={name || ''}
            onFocus={event => event.target.select()}
            onChange={event => {
              const value = event.target.value;

              this.setState({ name: value || '' });
              this.debouncedModifyName(value);
            }}
            onKeyDown={event => event.key === 'Enter' && onCancel()}
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
    );
  }
}

export function dialogSelectIcon(options = {}) {
  let modal;
  const colorList = getThemeColors(options.projectId);
  const title = options.showNavigationConfig
    ? _l('应用名称和外观')
    : options.hideInput
      ? _l('修改图标')
      : _l('修改名称和图标');
  const handlePopState = () => modal.destroy();

  const handleCancel = () => {
    if (_.isFunction(options.onCancel)) {
      options.onCancel();
    }
  };

  const handleContentCancel = () => {
    modal.destroy();
    handleCancel();
  };

  modal = Modal.info({
    afterClose: () => window.removeEventListener('popstate', handlePopState),
    centered: true,
    className: 'selectIconDialog',
    content: <SelectIcon {...options} onCancel={handleContentCancel} />,
    footer: null,
    mask: { closable: options.overlayClosable !== false },
    onCancel: handleCancel,
    styles: MODAL_STYLES,
    title,
    width: options.hideColor || !colorList.length ? 570 : 960,
    zIndex: options.zIndex,
  });

  window.addEventListener('popstate', handlePopState);

  return modal;
}

export default dialogSelectIcon;
