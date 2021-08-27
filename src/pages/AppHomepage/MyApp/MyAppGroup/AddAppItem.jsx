import React, { Component } from 'react';
import { string, func } from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import { navigateTo } from 'src/router/navigateTo';
import { COLORS } from 'src/pages/AppHomepage/components/SelectIcon/config';
import cx from 'classnames'
const { app: {addAppItem} } = window.private
const {addAppIcon} = addAppItem
const ADD_APP_MODE = [
  { id: 'createFromEmpty', icon: 'plus', text: _l('从空白创建'), href: '/app/lib' },
  {
    id: 'installFromLib',
    icon: 'sidebar_application_library',
    text: _l('从应用库中安装'),
    href: '/app/lib',
  },
  { id: 'buildService', icon: 'work', text: _l('解决方案'), href: 'https://blog.mingdao.com/solution' },
].filter(item => !addAppItem[item.id]);
export default class AddAppItem extends Component {
  static propTypes = {
    createAppFromEmpty: func,
    projectId: string,
    type: string,
  };

  static defaultProps = {
    createAppFromEmpty: _.noop,
  };

  state = { addTypeVisible: false };

  handleClick = ({ id, href }) => {
    const { projectId, type } = this.props;
    switch (id) {
      case 'installFromLib':
        navigateTo(`${href}?projectId=${projectId}`);
        break;
      case 'createFromEmpty':
        this.setState({ addTypeVisible: false });
        this.props.createAppFromEmpty({
          type,
          projectId,
          name: _l('未命名应用'),
          icon: '0_lego',
          iconColor: COLORS[_.random(0, COLORS.length - 1)],
          permissionType: 200,
        });
        break;
      case 'buildService':
        window.open(href);
        break;
      default:
        break;
    }
  };

  handleAddAppItemClick = e => {
    e.stopPropagation();
    this.setState({ addTypeVisible: true });
  };

  render() {
    const { addTypeVisible } = this.state;
    return (
      <div className={cx("addAppItemWrap", {Hidden: addAppIcon})}>
        <div className="addAppItem" onClick={this.handleAddAppItemClick} />
        {addTypeVisible && (
          <Menu
            className="addAppItemMenu"
            onClickAwayExceptions={['.addAppItem']}
            onClickAway={() => {
              this.setState({ addTypeVisible: false });
            }}>
            {ADD_APP_MODE.map(({ id, icon, text, href }) => (
              <MenuItem
                key={id}
                icon={<Icon icon={icon} className="addItemIcon Font16" />}
                onClick={() => {
                  this.handleClick({ id, href });
                }}>
                {text}
              </MenuItem>
            ))}
          </Menu>
        )}
        <div className="info">{_l('添加应用')}</div>
      </div>
    );
  }
}
