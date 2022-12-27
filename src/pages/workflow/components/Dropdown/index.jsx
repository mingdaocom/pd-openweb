import React, { Component } from 'react';
import cx from 'classnames';
import { string, arrayOf, shape, bool, func, node } from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import './index.less';
import _ from 'lodash';

export default class Dropdown extends Component {
  static propTypes = {
    /** 列表之后的尾部元素 */
    suffix: node,
    /** 列表之前的头部元素 */
    prefix: node,
    /** 默认标题显示 */
    placeholder: node,
    /** 整体下拉类名 */
    className: string,
    // 弹出层类名
    popupClassName: string,
    /** 不需要特殊高亮样式的项 */
    specialStyleExpect: arrayOf(string),
    /** 弹出层的默认显示状态 */
    defaultPopupVisible: bool,
    /** 下拉框中的数据 */
    data: arrayOf(shape({ text: string, value: string.isRequired })),
    /** 选中的数据 */
    selectedValue: string,
    /** 弹出层对齐方式 */
    popupAlign: shape({ points: arrayOf(string) }),
    /** 无数据的空状态 */
    emptyStatus: node,
    /** 自定义渲染标题 */
    renderTitle: func,
    onChange: func,
  };
  static defaultProps = {
    placeholder: '未选择',
    defaultPopupVisible: false,
    data: [],
    emptyStatus: '暂无数据',
    popupAlign: { points: ['tl', 'bl'] },
    onChange: () => {},
  };

  state = {
    popupVisible: false,
  };

  handleChange = (val) => {
    this.setState({ popupVisible: false });
    this.props.onChange(val);
  };

  handlePopupVisibleChange = (popupVisible) => {
    this.setState({ popupVisible });
  };

  /**
   * 渲染弹出层
   */
  renderPopup = () => {
    const { prefix, suffix, data, selectedValue, emptyStatus, specialStyleExpect } = this.props;
    return (
      <div className="popupWrap">
        {prefix}
        {data.length ? (
          <ul>
            {data.map((item, index) => {
              const { icon, text, value } = item;
              return (
                <li
                  key={index}
                  className={cx({ ThemeColor3: value === selectedValue && !_.includes(specialStyleExpect, value) }, 'ThemeHoverBGColor3 HoverWhite')}
                  onClick={() => this.handleChange(value)}
                >
                  {icon && <Icon icon={icon} />}
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          emptyStatus
        )}
        {suffix}
      </div>
    );
  };

  /**
   * 根据选中的值获取标题
   */
  getTitle = () => {
    const { data, selectedValue } = this.props;
    const item = data.find(item => item.value === selectedValue);
    return item && item.text ? item.text : '';
  };

  /**
   * 渲染触发元素
   */
  renderTrigger = () => {
    const { placeholder, renderTitle } = this.props;
    const { popupVisible } = this.state;
    return (
      <div className="triggerWrap">
        <div className="title overflow_ellipsis">{renderTitle ? renderTitle() : this.getTitle() || placeholder}</div>
        <div className={cx('arrow', { bottom: popupVisible })} />
      </div>
    );
  };

  render() {
    const { className, defaultPopupVisible, popupClassName, popupAlign } = this.props;
    const { popupVisible } = this.state;
    return (
      <div className={cx('mingUiDropdownWrap', className)}>
        <Trigger
          popupClassName={popupClassName}
          defaultPopupVisible={defaultPopupVisible}
          popupVisible={popupVisible}
          popupStyle={{ width: 180 }}
          action={['click']}
          popup={this.renderPopup()}
          popupAlign={popupAlign}
          onPopupVisibleChange={this.handlePopupVisibleChange}
        >
          {this.renderTrigger()}
        </Trigger>
      </div>
    );
  }
}
