import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Icon from 'ming-ui/components/Icon';
import Menu from './menu';
import { FormError } from '../lib';
import CustomWidgetConfig from 'src/components/customWidget/src/config';

import './style.less';
import _ from 'lodash';

class Dropdown extends Component {
  constructor(props) {
    super(props);

    /**
     * value 列表
     */
    this.list = {};
    if (!this.props.dataSource) {
      this.props.data.map((item) => {
        this.list[item.value] = true;

        return null;
      });
    }

    this.state = {
      /**
       * 默认选中的值� value: any� values: any[]
       */
      value: this.props.value || null,
      /**
       * 选项
       */
      data: this.props.dataSource ? [] : this.props.data,
      /**
       * 多级
       */
      multipleLevel: this.props.dataSource ? true : this.props.multipleLevel,
      /**
       * 显示内容
       */
      label: this.props.label || '',
      /**
       * 菜单是否展开
       */
      menuOpened: false,
      /**
       * value error
       */
      error: false,
      // dirty
      dirty: false,
      // show error
      showError: false,
    };
  }

  componentWillMount() {
    // 数据�
    if (this.props.dataSource) {
      const companyId = window.storage.getItem('plus_projectId');

      $.get(`${CustomWidgetConfig.OARequest()}/system/source/parent/get?companyId=${companyId}&parentId=${this.props.dataSource}`).then((data) => {
        if (data.status === 1) {
          const options = this.generateOptions(data.data);

          this.setState({
            data: options,
          });
        }
      });
    }
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.clickListener, false);

    window.addEventListener('keydown', this.keyDownListener, false);

    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps) {
    // apply label update
    if (nextProps.label !== this.props.label) {
      const label = nextProps.label && nextProps.label.length ? nextProps.label.toString() : '';

      this.setState({
        label,
      });
    }
    // apply value update
    if (nextProps.value !== this.props.value) {
      this.setState({
        value: nextProps.value,
      });
    }
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }

    if (!_.isEqual(nextProps.data, this.props.data)) {
      this.list = {};
      nextProps.data.map((item) => {
        this.list[item.value] = true;
        return null;
      });
      this.setState({ data: nextProps.data });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.clickListener, false);

    window.removeEventListener('keydown', this.keyDownListener, false);
  }

  generateOptions = (data) => {
    const options = [];

    for (const i in data) {
      if (data[i]) {
        const item = data[i];
        if (item.id) {
          this.list[item.id] = true;

          let items = [];
          if (item.children && item.children.length) {
            items = this.generateOptions(item.children);
          }

          options.push({
            label: item.title,
            value: item.id,
            items,
          });
        }
      }
    }

    return options;
  };

  /**
   * 选中的值发生变�
   * e: MouseEvent - 点击事件
   * value: value|value[] - 选中的值（单选为一个值；多选为多个值）
   * label: label|label[] - 选中选项�label（单级单选为一个值；多级数据单选为所有层级的 label；多选为多个 label�
   */
  onChange = (e, value, label, autoHide) => {
    const _label = label && label.length ? label[label.length - 1] : '';
    const _value = this.props.dataSource
      ? {
          value,
          label: _label,
        }
      : value;

    if (_value !== this.state.value) {
      this.checkValue(value, true);

      this.setState({
        value: _value,
      });

      if (this.props.onChange) {
        this.props.onChange(e, _value, {
          label: label && label.join ? label.join(', ') : label,
          prevValue: this.state.value,
        });
      }
    }

    if (autoHide) {
      this.hideMenu();
    }
  };

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
   * 点击 ESC 键时，隐藏当前菜�
   */
  keyDownListener = (e) => {
    if (
      e.keyCode === 27 && // ESC
      this.state.menuOpened
    ) {
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
    if (!this.props.disabled) {
      this.setState({
        menuOpened: !this.state.menuOpened,
      });
    }
  };

  /**
   * check value
   * @param {any} value - current value
   * @param {bool} dirty - value ever changed
   */
  checkValue = (value, dirty) => {
    const error = {
      type: '',
      message: '',
      dirty,
    };

    // required
    if (this.props.required && !this.list[value]) {
      error.type = FormError.types.REQUIRED;
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else {
      // fire onValid callback
      if (this.props.onValid) {
        this.props.onValid();
      }
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  render() {
    const classList = ['mui-dropdown'];
    const selectedItem = _.find(this.state.data, item => item.value === this.state.value);
    let menuStyle = {};
    // menuOpened
    if (this.state.menuOpened) {
      $(this.dropDownBox).addClass('mui-dropdown-open');
      if ($('body').height() - $(this.dropDownBox).offset().top - 40 < $(this.dropDownBox).children('.mui-dropdown-menu').height()) {
        menuStyle = {
          top: 'inherit',
          bottom: $('body').height() - $(this.dropDownBox).children('.mui-forminput').offset().top,
          left: $(this.dropDownBox).children('.mui-forminput').offset().left - 10,
          position: 'fixed',
        };
      } else {
        menuStyle = { top: $(this.dropDownBox).offset().top + 40, left: $(this.dropDownBox).offset().left - 10, position: 'fixed' };
      }
    } else {
      $(this.dropDownBox).removeClass('mui-dropdown-open');
    }
    const classNames = classList.join(' ');

    const buttonClassList = ['mui-forminput', 'ThemeFocusBorderColor3'];
    // error
    if (this.state.error && this.state.showError) {
      buttonClassList.push('mui-forminput-error');
    }
    const buttonClassNames = buttonClassList.join(' ');

    return (
      <div className={cx(classNames, this.props.className)} ref={dropDownBox => this.dropDownBox = dropDownBox}>
        <button type="button" className={buttonClassNames} disabled={this.props.disabled} onClick={this.toggleMenuOpened}>
          {this.props.label ? <React.Fragment>
            { selectedItem && this.props.colored && <span className="colortag" style={{ backgroundColor: selectedItem.color }}></span> }
            <span className="mui-forminput-label">{this.state.label}</span>
          </React.Fragment> : (
            <span className="mui-forminput-label placeholder">{this.props.hint}</span>
          )}
          <Icon icon="arrow-down-border" />
        </button>
        <Menu
          value={this.state.value}
          colored={this.props.colored}
          menuStyle={menuStyle}
          options={this.state.data}
          emptyHint={this.props.emptyHint}
          multipleLevel={this.state.multipleLevel}
          multipleSelect={this.props.multipleSelect}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

Dropdown.propTypes = {
  /*
 * 引导文字
 * */
  hint: PropTypes.string,
  /**
   * 默认选中的值� value: any� values: any[]
   */
  value: PropTypes.any,
  /**
   * Button 显示内容
   */
  label: PropTypes.string,
  /**
   * 选项数据
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * 选项显示文字
       */
      label: PropTypes.string,
      /**
       * 选项�
       */
      value: PropTypes.any,
      /**
       * 选项类型
       */
      type: PropTypes.oneOf([
        'header', // 副标�
        'divider', // 分隔�
      ]),
      /**
       * 子选项
       */
      items: PropTypes.any,
    })
  ),
  /**
   * 数据�ID
   */
  dataSource: PropTypes.string,
  /**
   * 数据为空时的提示文字
   */
  emptyHint: PropTypes.string,
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 显示错误（忽�error.dirty�
   */
  showError: PropTypes.bool,
  /**
   * 是否为多级数�
   */
  multipleLevel: PropTypes.bool,
  /**
   * 是否为多�
   */
  multipleSelect: PropTypes.bool,
  /**
   * 【回调】选中的值发生变�
   * @param {Event} event - 事件
   * @param {any|any[]} value - 选中的�
   * @param {string|string[]} data - 其他数据
   * data.label - 选中选项�label
   */
  onChange: PropTypes.func,
  /**
   * 【回调】发生错�
   * @param {Error} error - 错误
   * error.type - 错误类型
   * error.dirty - 值是否发生过改变
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（�onError 相反�
   */
  onValid: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

Dropdown.defaultProp = {
  value: null,
  label: '',
  data: [],
  dataSource: '',
  emptyHint: '',
  required: false,
  disabled: false,
  multipleLevel: false,
  multipleSelect: false,
  showError: false,
  onChange: (event, value, label, autoHide) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default Dropdown;
