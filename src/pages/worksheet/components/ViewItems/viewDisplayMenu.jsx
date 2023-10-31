import React, { Component } from 'react';
import { string } from 'prop-types';
import { Icon } from 'ming-ui';
import { Menu } from 'antd';
import { VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum.js';

export default class ViewDisplayMenu extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {};
  render() {
    const { onClick, ...rest } = this.props;
    return (
      <Menu className="viewTypeMenuWrap" {...rest}>
        {VIEW_TYPE_ICON.map(({ icon, text, id, color, isNew }) => (
          <Menu.Item key={id} className="viewTypeItem" onClick={() => onClick(id)}>
            <div className="valignWrapper">
              <Icon style={{ color, fontSize: '18px' }} icon={icon} />
              <span className="viewName">{text}</span>
            </div>
            {isNew && (
              <div className="newIcon">
                <Icon icon="new" className="ThemeColor Font20" />
              </div>
            )}
          </Menu.Item>
        ))}
      </Menu>
    );
  }
}
