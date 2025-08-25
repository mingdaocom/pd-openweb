import React, { Component } from 'react';
import { Menu } from 'antd';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum.js';

export default class ViewDisplayMenu extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {};
  render() {
    const { onClick, viewType, ...rest } = this.props;
    return (
      <Menu className="viewTypeMenuWrap" {...rest}>
        {VIEW_TYPE_ICON.filter(o => o.id !== 'customize').map(({ icon, text, id, color, isNew }) => (
          <Menu.Item
            data-event={id}
            key={id}
            className={cx('viewTypeItem', { current: viewType === id })}
            onClick={() => onClick(id)}
          >
            <div className="valignWrapper flex">
              <Icon style={{ color, fontSize: '18px' }} icon={icon} />
              <span className="viewName">{text}</span>
            </div>
            {viewType === id && <Icon icon="done" className="mRight12" />}
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
