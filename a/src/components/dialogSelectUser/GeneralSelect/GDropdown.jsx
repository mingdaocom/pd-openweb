/* eslint-disable */
/* eslint-disable */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import cx from 'classnames';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import Icon from 'ming-ui/components/Icon';

class Dropdown extends Component {
  static propTypes = {
    /** 点击方法，返回true才显示下拉菜单 */
    onClick: PropTypes.func,
    /**
     * 未选择时的默认提示
     */
    placeholder: PropTypes.string,
    /**
     * 回调，参数为选中item的value值
     */
    onChange: PropTypes.func,
    defaultValue: PropTypes.any,
    value: PropTypes.any,
    /**
     * Menu的样式
     */
    menuStyle: PropTypes.object,
    /**
     * 表单item名字
     */
    name: PropTypes.string,
    /**
     * 下拉列表最高高度
     */
    maxHeight: PropTypes.number,
    /**
     * 给withChildren用
     */
    className: PropTypes.string,
    hoverTheme: PropTypes.bool, // hover变成主题色
    /**
     * 空状态
     */
    noData: PropTypes.node,
    /**
     * 样式
     */
    style: PropTypes.object,
    /**
     * 数据
     */
    data: PropTypes.arrayOf(
      PropTypes.shape({
        /**
         *  默认default  hr为分割线
         */
        type: PropTypes.oneOf(['hr', 'default']),
        text: PropTypes.string,
        /**
         * 接收任何类型，并返回原始值
         */
        value: PropTypes.any,
        /**
         * 是否禁用
         */
        disabled: PropTypes.bool,
        /**
         * 说明
         */
        desc: PropTypes.string,
        /**
         * 字体图标的名字
         */
        iconName: PropTypes.string,
        Children: PropTypes.array,
        /** 显示结果 */
      })
    ),
  };

  static defaultProps = {
    noData: '无数据',
    placeholder: '请选择',
    renderValue: '{{value}}',
    onClick: () => true,
  };

  constructor(props) {
    super(props);
    let value;
    if (props.defaultValue !== undefined) {
      value = props.defaultValue;
    }
    if (props.value !== undefined) {
      value = props.value;
    }

    this.state = {
      value,
      showMenu: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value != undefined) {
      // eslint-disable-line eqeqeq
      this.setState({
        value: nextProps.value,
      });
    }
  }

  getTextFromDataById(data, value) {
    let text = this.props.placeholder;
    const getTextFromList = list => {
      list.forEach(item => {
        if (item.value != undefined && item.value === value) {
          // eslint-disable-line eqeqeq
          text = item.text;
          return false;
        } else if (item.children) {
          getTextFromList(item.children);
        }
      });
    };
    getTextFromList(data);
    return text;
  }

  handleClick() {
    if (this.props.onClick()) {
      this.setState({
        showMenu: !this.state.showMenu,
      });
    }
  }

  handleChange(event, value) {
    if (this.props.value == undefined) {
      // eslint-disable-line eqeqeq
      this.setState({
        value,
      });
    }
    this.setState({
      showMenu: false,
    });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const { value } = state;
    const { placeholder, maxHeight, menuStyle } = props;
    return (
      <div className={`GSelect-Dropdown pointer ${this.props.className || ''}`} style={this.props.style}>
        <div
          className="GSelect-Dropdown--input"
          ref={input => {
            this._input = input;
          }}
          onClick={() => {
            this.handleClick();
          }}
        >
          <div>
            {value != undefined ? ( // eslint-disable-line eqeqeq
              <span
                className={cx('value', {
                  ThemeHoverColor3: this.props.hoverTheme,
                  ThemeHoverBorderColor3: this.props.hoverTheme,
                })}
              >
                {this.props.renderValue.replace(/{{value}}/g, this.getTextFromDataById(this.props.data, this.state.value))}
              </span>
            ) : (
              <span className="GSelect-Dropdown--placeholder">{placeholder}</span>
            )}
          </div>
          <Icon icon="arrow-down-border" />
        </div>
        {this.state.showMenu ? (
          <Menu
            parentMenuItem={this}
            style={{ maxHeight: maxHeight || 300, overflowY: 'auto', overflowX: 'hidden', ...menuStyle }}
            onClickAway={() => {
              this.setState({
                showMenu: false,
              });
            }}
            onClickAwayExceptions={[this._input]}
          >
            {this.props.data && this.props.data.length ? (
              this.props.data.map((item, index) => (
                <MenuItem
                  {...item}
                  key={index}
                  data-value={item.value}
                  icon={item.iconName ? <Icon icon={item.iconName} /> : null}
                  onClick={event => {
                    this.handleChange(event, item.value);
                  }}
                >
                  <div>{item.text}</div>
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                <div>{this.props.noData}</div>
              </MenuItem>
            )}
          </Menu>
        ) : null}
      </div>
    );
  }
}

export default Dropdown;
