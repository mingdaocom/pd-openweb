import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Dropdown, Menu } from 'antd';
export default class DropDownItem extends Component {
  static propTypes = {
    value: PropTypes.any,
    dropDownData: PropTypes.array,
    onChange: PropTypes.func,
    className: PropTypes.string,
    listWidth: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
    };
  }
  getTextByValue(key, value) {
    const { dropDownData } = this.props;
    let result;
    dropDownData.forEach(item => {
      if (item.value === value) {
        result = item[key] || '';
      }
    });
    return result;
  }
  render() {
    const { className, listWidth, dropDownData, onChange } = this.props;
    const { value } = this.state;

    const menu = (
      <Menu
        selectedKeys={[value.toString()]}
        className="excelControlDropDownList"
        style={{ width: listWidth }}
        onClick={e => {
          const value = Number(e.key) || '';
          this.setState({ value });
          onChange(value);
        }}
      >
        {dropDownData.map(item => {
          return (
            <Menu.Item key={item.value} className="ellipsis">
              {item.text}
            </Menu.Item>
          );
        })}
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['click']} className={cx(className, 'excelControlDropDown')}>
        <div className="fixedDropdownSelected">
          <span className="contentLabel">
            <span className="dropDownLabel TxtBottom">
              {value ? (
                <span className="valueText">{this.getTextByValue('text', value)}</span>
              ) : (
                <span className="valueText Gray_9e">{_l('请选择')}</span>
              )}
              <span className="preViewContent Gray_9e mLeft12">
                {value ? this.getTextByValue('previewContent', value) : ''}
              </span>
            </span>
            <span className="Right mLeft10 mRight10">
              <i className="icon-arrow-down-border Gray_9e Font14" />
            </span>
          </span>
        </div>
      </Dropdown>
    );
  }
}
