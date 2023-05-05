import React, { Component } from 'react';
import { Menu } from 'antd';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { OPERATION_TYPE_DATA } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';
@withClickAway
export default class GroupType extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {};
  render() {
    const { onClick, ...rest } = this.props;
    return (
      <Menu className="GroupTypeMenuWrap" {...rest}>
        {OPERATION_TYPE_DATA.map(({ text, value }) => (
          <Menu.Item key={value} className="viewTypeItem" onClick={() => onClick(value)}>
            <span className="viewName">{text}</span>
          </Menu.Item>
        ))}
      </Menu>
    );
  }
}
