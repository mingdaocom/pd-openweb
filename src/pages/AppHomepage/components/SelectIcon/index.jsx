import React, { Component, createRef } from 'react';
import { string, number, arrayOf, func } from 'prop-types';
import cx from 'classnames';
import { ScrollView, Icon } from 'ming-ui';
import { Tabs } from 'antd';
import withClickAway from 'ming-ui/decorators/withClickAway';
import SvgIcon from 'src/components/SvgIcon';
import { COLORS } from './config';
import './index.less';
import ajaxRequest from 'src/api/appManagement';
import { isEmpty } from 'lodash';

const DEFAULT_COLOR = '#2196f3';

@withClickAway
export default class extends Component {
  static propTypes = {
    projectId: string,
    className: string,
    iconColor: string,
    icon: string,
    name: string,
    // 索引，用作按顺序选颜色,若不传则默认选择第一个颜色
    index: number,
    // 选颜色的标题
    pickColorTitle: string,
    colorList: arrayOf(string),
    onChange: func,
    onModify: func,
    onClose: func,
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
    const { icon, iconColor } = props;
    this.$nameRef = createRef();
    this.state = {
      icon: icon,
      iconColor: iconColor,
      customIcon: [],
      systemIcon: [],
    };
  }

  componentDidMount() {
    this.$nameRef.current.focus();
    this.$nameRef.current.select();
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

  dataChange = () => {
    const { current } = this.$nameRef;
    const { value = '' } = current;
    const { icon, iconColor } = this.state;
    if (value) {
      this.props.onChange({ icon, iconColor, name: value.trim().slice(0, 50) });
    }
  };

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
    const { colorList, index, iconColor = colorList[index % colorList.length], icon } = this.props;
    const { systemIcon, customIcon } = this.state;
    if (isEmpty(customIcon)) {
      return (
        <div className="systemIcon">
          {/* <div className={cx('title', { withColorList: colorList.length > 0 })}>{_l('默认图标')}</div> */}
          <ul className="iconsWrap">
            {systemIcon.map(({ fileName, iconUrl }) => {
              let isCurrent = icon === fileName;
              return (
                <li
                  key={fileName}
                  className={cx({ isCurrentIcon: isCurrent })}
                  style={{ backgroundColor: isCurrent ? iconColor : '#fff' }}
                  onClick={() => this.handleClick({ icon: fileName, iconUrl })}>
                  <SvgIcon url={iconUrl} fill={isCurrent ? '#fff' : '#9e9e9e'} />
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    return (
      <Tabs defaultActiveKey="system">
        <Tabs.TabPane tab={_l('默认')} key="system">
          <div className="systemIcon">
            {/* <div className={cx('title', { withColorList: colorList.length > 0 })}>{_l('默认图标')}</div> */}
            <ul className="iconsWrap">
              {systemIcon.map(({ fileName, iconUrl }) => {
                let isCurrent = icon === fileName;
                return (
                  <li
                    key={fileName}
                    className={cx({ isCurrentIcon: isCurrent })}
                    style={{ backgroundColor: isCurrent ? iconColor : '#fff' }}
                    onClick={() => this.handleClick({ icon: fileName, iconUrl })}>
                    <SvgIcon url={iconUrl} fill={isCurrent ? '#fff' : '#9e9e9e'} />
                  </li>
                );
              })}
            </ul>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={_l('自定义')} key="custom">
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
                    onClick={() => this.handleClick({ icon: fileName, iconUrl })}>
                    <SvgIcon url={iconUrl} fill={isCurrent ? '#fff' : '#9e9e9e'} />
                  </li>
                );
              })}
            </ul>
          </div>
        </Tabs.TabPane>
      </Tabs>
    );
  };
  render() {
    const { className, colorList, index, iconColor = colorList[index % colorList.length], name } = this.props;
    return (
      <div className={cx('selectIconWrap', className)}>
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
        {!!colorList.length && (
          <ul className="colorsWrap">
            {colorList.map(item => (
              <li
                key={item}
                className={cx({ isCurrentColor: item === iconColor })}
                style={{ backgroundColor: item }}
                onClick={() => this.handleClick({ iconColor: item })}>
                {item === iconColor && <Icon icon="hr_ok" />}
              </li>
            ))}
          </ul>
        )}
        <ScrollView className="iconsScrollViewWrap">{this.renderIcons()}</ScrollView>
      </div>
    );
  }
}
