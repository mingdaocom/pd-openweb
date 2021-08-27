import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Icon from 'ming-ui/components/Icon';

class Menu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 已选中的值
       */
      value: null,
      /**
       * 当前显示的选项
       */
      options: this.props.options || [],
      /**
       * 所有父级选项
       */
      list: [],
      /**
       * 已选中的选项
       */
      checkedItems: {},
    };

    this.list = {};

    this.getAllItems(this.props.options);
  }

  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.initValue(nextProps);
    }
    if (nextProps.options !== this.props.options) {
      this.initOptions(nextProps);
    }
  }

  getAllItems = (data) => {
    for (const i in data) {
      if (data[i]) {
        const item = data[i];
        if (item.id) {
          this.list[item.id] = item;

          if (item.children && item.children.length) {
            this.generateOptions(item.children);
          }
        }
      }
    }

    return true;
  };

  /**
   * 获取 value 和 checkedItems
   */
  getValue = (props) => {
    const value = props.value || null;
    const checkedItems = {};
    let values = [];
    if (!props.multipleSelect) {
      values.push(value);
    } else {
      values = value;
    }
    if (values && values.length) {
      for (const i in values) {
        if (values[i]) {
          checkedItems[values[i]] = this.list[values[i]];
        }
      }
    }

    return {
      value,
      checkedItems,
    };
  };

  /**
   * 状态初始化
   */
  init = (props) => {
    this.initValue(props);
    this.initOptions(props);
  };

  /**
   * 初始化 value 和 checkedItems
   */
  initValue = (props) => {
    const { value, checkedItems } = this.getValue(props);

    this.setState({
      value,
      checkedItems,
    });
  };

  /**
   * 初始化 options 和 list
   */
  initOptions = (props) => {
    const { value, checkedItems } = this.getValue(props);

    this.setState({
      value,
      options: props.options || [],
      list: [],
      checkedItems,
    });
  };

  /**
   * 展开显示子选项
   */
  showSubItems = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.disabled) {
      return;
    }

    const list = this.state.list;
    let options = this.state.options;

    if (this.props.multipleLevel && item.items && item.items.length) {
      list.push(item);
      options = item.items;
    }

    this.setState({
      options,
      list,
    });
  };

  /**
   * 点击选项
   */
  itemOnClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.disabled) {
      return;
    }

    /**
     * 操作后是否隐藏菜单
     */
    let autoHide = true;

    if (!this.props.multipleSelect) {
      let label = item.label;

      if (this.props.multipleLevel) {
        label = this.state.list.map((_item, i, list) => {
          return _item.label;
        });
        label.push(item.label);
      }

      this.props.onChange(e, item.value, label, autoHide);

      this.setState({
        value: item.value,
      });
    } else {
      autoHide = false;

      const checkedItems = {};
      for (const key in this.state.checkedItems) {
        if (this.state.checkedItems[key]) {
          const checkedItem = this.state.checkedItems[key];
          checkedItems[key] = checkedItem;
        }
      }
      if (checkedItems[item.value]) {
        checkedItems[item.value] = null;
      } else {
        checkedItems[item.value] = item;
      }

      const values = [];
      const labels = [];
      for (const key in checkedItems) {
        if (checkedItems[key]) {
          const checkedItem = checkedItems[key];
          values.push(checkedItem.value);
          labels.push(checkedItem.label);
        }
      }

      this.props.onChange(e, values, labels, autoHide);

      this.setState({
        checkedItems,
      });
    }
  };

  /**
   * 取消选中制定项目
   */
  unCheckItem = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const checkedItems = {};

    for (const key in this.state.checkedItems) {
      if (this.state.checkedItems[key]) {
        const _item = this.state.checkedItems[key];
        if (key !== item.value) {
          checkedItems[key] = _item;
        }
      }
    }

    const values = [];
    const labels = [];
    for (const key in checkedItems) {
      if (checkedItems[key]) {
        const checkedItem = checkedItems[key];
        values.push(checkedItem.value);
        labels.push(checkedItem.label);
      }
    }

    this.props.onChange(e, values, labels, false);

    this.setState({
      checkedItems,
    });
  };

  /**
   * 清空已选中的项目
   */
  clearCheckedItems = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.props.onChange(e, [], [], false);

    this.setState({
      checkedItems: {},
    });
  };

  /**
   * 返回上一级选项
   */
  back = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const list = this.state.list;
    list.pop();

    let options = [];
    if (list.length > 0) {
      options = list[list.length - 1].items;
    } else {
      options = this.props.options;
    }

    this.setState({
      list,
      options,
    });
  };

  render() {
    /**
     * 标题显示文字
     */
    let navText = _l('请选择');
    /**
     * 清空按钮
     */
    let clearBtn = null;
    /**
     * 已选中的项目列表
     */
    let pills = null;
    if (this.props.multipleLevel && this.props.multipleSelect) {
      const pillItems = [];

      for (const key in this.state.checkedItems) {
        if (this.state.checkedItems[key]) {
          const item = this.state.checkedItems[key];

          pillItems.push(
            <li key={item.value}>
              <div className="mui-dropdown-pills-label">
                <span title={item.label}>{item.label}</span>
              </div>
              <Icon
                icon="close"
                onClick={(e) => {
                  this.unCheckItem(e, item);
                }}
              />
            </li>
          );
        }
      }

      if (pillItems.length) {
        navText = _l('已选择');

        clearBtn = (
          <button
            onClick={(e) => {
              this.clearCheckedItems(e);
            }}
          >
            {_l('清除选择')}
          </button>
        );

        pills = <ul className="mui-dropdown-pills">{pillItems}</ul>;
      }
    }

    /**
     * 标题区域
     */
    let menuNav = null;
    /**
     * 标题下方的分隔线
     */
    let divider = null;
    if (this.props.multipleLevel || this.props.multipleSelect) {
      divider = <div className="mui-dropdown-li mui-dropdown-divider" key="divider-0" />;
      if (this.state.list.length < 1) {
        menuNav = (
          <div className="mui-dropdown-li mui-dropdown-nav" key="nav">
            <div>
              <div className="mui-dropdown-label">
                <span>{navText}</span>
              </div>
              {clearBtn}
            </div>
          </div>
        );
      } else {
        menuNav = (
          <div className="mui-dropdown-li mui-dropdown-nav mui-dropdown-back" key="nav" onClick={this.back}>
            <Icon icon="arrow-left-border" />
            <div>
              <div className="mui-dropdown-label">
                <span>{_l('返回')}</span>
              </div>
              {clearBtn}
            </div>
          </div>
        );
      }
    }

    /**
     * 当前显示的项目列表
     */
    let menuItems = this.state.options.map((item, i, list) => {
      if (item.type && item.type === 'header') {
        // 副标题
        return (
          <li className="mui-dropdown-header" key={`header-${i}`}>
            {item.label}
          </li>
        );
      } else if (item.type && item.type === 'divider') {
        // 分隔线
        return <li className="mui-dropdown-divider" key={`divider-${i}`} />;
      } else {
        // 普通选项
        const classList = [];
        const rectClassList = ['mui-dropdown-rect'];
        if ((!this.props.multipleSelect && item.value === this.state.value) || (this.props.multipleSelect && this.state.checkedItems[item.value])) {
          // 已选中
          classList.push('mui-dropdown-item-checked');
          rectClassList.push('ThemeBgColor3');
        }
        if (item.disabled) {
          // 已禁用
          classList.push('mui-dropdown-item-disabled');
        }

        const classNames = classList.join(' ');
        const rectClassNames = rectClassList.join(' ');

        // 多选选项的 checkbox
        let checkIcon = null;
        if (this.props.multipleSelect) {
          const checked = !!this.state.checkedItems[item.value];

          if (checked) {
            checkIcon = (
              <span className="mui-dropdown-check-icon">
                <span className={rectClassNames}>
                  <Icon icon="ok" />
                </span>
              </span>
            );
          } else {
            checkIcon = (
              <span className="mui-dropdown-check-icon">
                <span className="mui-dropdown-rect" />
              </span>
            );
          }
        }

        // 多级数据子选项箭头
        let arrowIcon = null;
        let className = '';
        if (this.props.multipleLevel && item.items && item.items.length) {
          arrowIcon = (
            <Icon
              className="mui-dropdown-arrow"
              icon="arrow-right-border"
              onClick={(e) => {
                this.showSubItems(e, item);
              }}
            />
          );
          className = 'mui-dropdown-arrow';
        }
        if (!item.isDeleted) {
          return (
            <li className={classNames} key={`${item.value}-${i}`}>
              <div
                className={className}
                onClick={(e) => {
                  this.itemOnClick(e, item);
                }}
              >
                {checkIcon}
                { this.props.colored && <span className="colortag" style={{ backgroundColor: item.color }}></span> }
                <div className="mui-dropdown-label">
                  <span title={item.label}>{item.label}</span>
                </div>
              </div>
              {arrowIcon}
            </li>
          );
        }
      }
    });

    if (!this.props.options || !this.props.options.length) {
      menuItems = [
        <li className="mui-dropdown-item-disabled" key="item-empty">
          <div>
            <div className="mui-dropdown-label">
              <span title={this.props.emptyHint}>{this.props.emptyHint}</span>
            </div>
          </div>
        </li>,
      ];
    }

    return (
      <ul className="mui-dropdown-menu" style={this.props.menuStyle || {}}>
        {menuNav}
        {pills}
        {divider}
        <ul className="mui-dropdown-list">{menuItems}</ul>
      </ul>
    );
  }
}

Menu.propTypes = {
  value: PropTypes.any,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
      type: PropTypes.oneOf(['header', 'divider']),
      disabled: PropTypes.bool,
      item: PropTypes.any,
    })
  ),
  emptyHint: PropTypes.string,
  multipleLevel: PropTypes.bool,
  multipleSelect: PropTypes.bool,
  onChange: PropTypes.func,
  menuStyle: PropTypes.object, // menuList固定定位
};

Menu.defaultProp = {
  value: null,
  options: [],
  emptyHint: '',
  multipleLevel: false,
  multipleSelect: false,
  onChange: (event, value) => {},
};

export default Menu;
