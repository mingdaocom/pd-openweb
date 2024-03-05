/**
 * Dropdown 组件，支持
 * 1 单选/多选
 * 2 多级数据
 */
/**
 * Dropdown 组件，支持
 * 1 单选/多选
 * 2 多级数据
 */
/**
 * Dropdown 组件，支持
 * 1 单选/多选
 * 2 多级数据
 */
/**
 * Dropdown 组件，支持
 * 1 单选/多选
 * 2 多级数据
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Icon from 'ming-ui/components/Icon';
import '../less/multidropdown.less';
import '../less/multidropdownmenu.less';
import '../less/multidropdownpills.less';

/**
 * 菜单组件
 */
import MultipleDropdownMenu from './menu';

class MultipleDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 默认选中的值。1 value: any；2 values: any[]
       */
      value: this.props.value || null,
      /**
       * Button 显示内容
       */
      label: this.props.label || '请选择',
      /**
       * 菜单是否展开
       */
      menuOpened: false,
    };

    this.button = null;
  }

  /**
   * window click listener
   * 点击外部区域时，隐藏当前菜单
   */
  clickListener = (e) => {
    const node = ReactDOM.findDOMNode(this);
    if ((node === e.target || !node.contains(e.target)) && this.state.menuOpened) {
      this.hideMenu();
    }
  };

  /**
   * window keydown listener
   * 点击 ESC 键时，隐藏当前菜单
   */
  keyDownListener = (e) => {
    if (
      e.keyCode === 27 && // ESC
      this.state.menuOpened
    ) {
      this.hideMenu();
    }
  };

  componentDidMount() {
    window.addEventListener('click', this.clickListener, true);

    window.addEventListener('keydown', this.keyDownListener, false);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.clickListener, true);

    window.removeEventListener('keydown', this.keyDownListener, false);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value,
      });
    }
    if (nextProps.label !== this.state.label) {
      const label = nextProps.label && nextProps.label.length ? nextProps.label.toString() : '请选择';

      this.setState({
        label,
      });
    }
  }

  /**
   * 选中的值发生变化
   * e: MouseEvent - 点击事件
   * value: value|value[] - 选中的值（单选为一个值；多选为多个值）
   * label: label|label[] - 选中选项的 label（单级单选为一个值；多级数据单选为所有层级的 label；多选为多个 label）
   */
  onChange = (e, value, label, autoHide) => {
    if (this.props.onClick) {
      this.props.onClick(e, value, label);
    }

    if (value !== this.state.value) {
      this.setState({
        value,
      });

      if (this.props.onChange) {
        this.props.onChange(e, value, label);
      }
    }

    if (autoHide) {
      this.hideMenu();
    }
  };

  /**
   * 显示菜单
   */
  showMenu() {
    this.setState({
      menuOpened: true,
    });
  }

  /**
   * 隐藏菜单
   */
  hideMenu() {
    this.setState({
      menuOpened: false,
    });
  }

  /**
   * 切换菜单显示/隐藏
   */
  toggleMenuOpened = () => {
    this.setState({
      menuOpened: !this.state.menuOpened,
    });
  };

  render() {
    const classList = ['multi-dropdown'];
    if (this.state.menuOpened) {
      classList.push('open');
    }
    if (this.button) {
      const rect = this.button.getBoundingClientRect();
      const restHeight = window.innerHeight - rect.top - rect.height;
      if (restHeight < 228) {
        classList.push('menu-top');
      }
    }
    const classNames = classList.join(' ');

    return (
      <div className={cx(classNames, this.props.className || '')}>
        <button
          ref={(button) => {
            this.button = button;
          }}
          type="button"
          className="dropdown-btn"
          onClick={this.toggleMenuOpened}
        >
          <span>{this.state.label}</span>
          <Icon icon="arrow-down-border" />
        </button>
        <MultipleDropdownMenu
          value={this.state.value}
          openMenu={this.state.menuOpened}
          options={this.props.options}
          emptyHint={this.props.emptyHint}
          multipleLevel={this.props.multipleLevel}
          multipleSelect={this.props.multipleSelect}
          filter={this.props.filter}
          filterHint={this.props.filterHint}
          multipleHideDropdownNav={this.props.multipleHideDropdownNav}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

MultipleDropdown.propTypes = {
  /**
   * 默认选中的值。1 value: any；2 values: any[]
   */
  value: PropTypes.any,
  /**
   * Button 显示内容
   */
  label: PropTypes.string,
  /**
   * 选项数据
   */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.any,
      value: PropTypes.any,
      type: PropTypes.oneOf([
        'header', // 副标题
        'divider', // 分隔线
      ]),
      items: PropTypes.any,
    })
  ),
  /**
   * 数据为空时的提示文字
   */
  emptyHint: PropTypes.string,
  /**
   * 是否为多级数据
   */
  multipleLevel: PropTypes.bool,
  /**
   * 是否为多选
   */
  multipleSelect: PropTypes.bool,
  /**
   * 是否支持筛选
   */
  filter: PropTypes.bool,
  /**
   * 筛选提示文本
   */
  filterHint: PropTypes.string,
  /**
   * 选中的值发生变化。e：点击事件；value：选中的值（单选为一个值；多选为多个值）；label：选中选项的 label（单级单选为一个值；多级数据单选为所有层级的 label；多选为多个 label）
   */
  onChange: PropTypes.func,
  /**
   * 点击选项（应对可能多次点击同一选项的情况）。e：点击事件；value：选中的值（单选为一个值；多选为多个值）；label：选中选项的 label（单级单选为一个值；多级数据单选为所有层级的 label；多选为多个 label）
   */
  onClick: PropTypes.func,

  className: PropTypes.string,
};

MultipleDropdown.defaultProp = {
  value: null,
  label: '请选择',
  options: [],
  emptyHint: '',
  multipleLevel: false,
  multipleSelect: false,
  filter: false,
  filterHint: '',
  multipleHideDropdownNav: false,
  onChange: (event, value, label, autoHide) => {},
};

export default MultipleDropdown;
