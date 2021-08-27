export function noop() {}

export function getActiveKey(props, originalActiveKey) {
  let activeKey = originalActiveKey;
  if (activeKey) {
    let found;
    // TODO: loop children items
    if (found) {
      return activeKey;
    }
  }
  activeKey = null;
  return activeKey;
}

export function getEventKey(props) {
  // when eventKey not available ,it's menu and return menu id '0-menu-'
  return props.eventKey || '0-menu-';
}

export function getKeyFromChildrenIndex(child, menuEventKey, index) {
  const prefix = menuEventKey || '';
  return child.key || `${prefix}item_${index}`;
}

export const menuAllProps = [
  'closeAll',
  'defaultSelectedKeys',
  'selectedKeys',
  'defaultOpenKeys',
  'openKeys',
  'mode',
  'getPopupContainer',
  'onSelect',
  'onDeselect',
  'onDestroy',
  'openTransitionName',
  'openAnimation',
  'subMenuOpenDelay',
  'subMenuCloseDelay',
  'forceSubMenuRender',
  'triggerSubMenuAction',
  'level',
  'selectable',
  'multiple',
  'onOpenChange',
  'visible',
  'focusable',
  'defaultActiveFirst',
  'prefixCls',
  'inlineIndent',
  'parentMenu',
  'title',
  'rootPrefixCls',
  'eventKey',
  'active',
  'onItemHover',
  'onTitleMouseEnter',
  'onTitleMouseLeave',
  'onTitleClick',
  'popupAlign',
  'popupOffset',
  'isOpen',
  'renderMenuItem',
  'manualRef',
  'subMenuKey',
  'disabled',
  'index',
  'isSelected',
  'store',
  'activeKey',

  // the following keys found need to be removed from test regression
  'attribute',
  'value',
  'popupClassName',
  'inlineCollapsed',
  'menu',
  'theme',
];
