import React from 'react';
import PropTypes from 'prop-types';
import { Provider, create } from 'mini-store';

import SubMenu from './SubMenu';
import '../less/Menu.less';

export default class Menu extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.any,
    mode: PropTypes.string,
    getPopupContainer: PropTypes.func,
    triggerMainMenuAction: PropTypes.string,
    triggerSubMenuAction: PropTypes.string,
  };

  static defaultProps = {
    mode: 'vertical-left',
    triggerMainMenuAction: 'click',
    triggerSubMenuAction: 'hover',
    getPopupContainer: () => $('#container').get(0),
  };

  constructor(props) {
    super(props);

    this.isRootMenu = true;

    this.store = create({
      openKeys: [],
    });
  }

  onOpenChange = (event) => {
    const props = this.props;
    const openKeys = this.store.getState().openKeys.concat();
    let changed = false;
    const processSingle = (e) => {
      let oneChanged = false;
      if (e.open) {
        oneChanged = openKeys.indexOf(e.key) === -1;
        if (oneChanged) {
          openKeys.push(e.key);
        }
      } else {
        const index = openKeys.indexOf(e.key);
        oneChanged = index !== -1;
        if (oneChanged) {
          openKeys.splice(index, 1);
        }
      }
      changed = changed || oneChanged;
    };
    processSingle(event);
    if (changed) {
      if (!('openKeys' in this.props)) {
        this.store.setState({ openKeys });
      }
    }
  };

  closeAll = () => {
    this.store.setState({ openKeys: [] });
  };

  render() {
    let { trigger, ...props } = this.props;
    props = {
      ...props,
      closeAll: this.closeAll,
      onOpenChange: this.onOpenChange,
      parentMenu: this,
      title: trigger,
      eventKey: 'main',
    };
    return (
      <Provider store={this.store}>
        <SubMenu {...props}>{this.props.children}</SubMenu>
      </Provider>
    );
  }
}
