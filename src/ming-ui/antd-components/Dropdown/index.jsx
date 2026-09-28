import React, { forwardRef, useContext, useState } from 'react';
import ConfigProvider from 'antd/es/config-provider';
import Divider from 'antd/es/divider';
import AntdDropdown from 'antd/es/dropdown';
import Input from 'antd/es/input';
import theme from 'antd/es/theme';
import PropTypes from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import './index.less';

const DEFAULT_AUTO_ADJUST_OVERFLOW = { adjustX: true, adjustY: true, shiftX: true, shiftY: true };

export const getSubMenuBuiltinPlacements = (direction, autoAdjustOverflow) => {
  const overflow =
    autoAdjustOverflow === false
      ? { adjustX: false, adjustY: false }
      : {
          ...DEFAULT_AUTO_ADJUST_OVERFLOW,
          ...(typeof autoAdjustOverflow === 'object' ? autoAdjustOverflow : {}),
        };

  return {
    rightTop: {
      points: direction === 'rtl' ? ['tr', 'tl'] : ['tl', 'tr'],
      overflow,
    },
  };
};

const defaultFilterOption = (inputValue, item) => {
  const normalizedValue = inputValue.toLocaleLowerCase();

  return [item?.label, item?.title, item?.key].some(
    value =>
      (typeof value === 'string' || typeof value === 'number') &&
      String(value).toLocaleLowerCase().includes(normalizedValue),
  );
};

const defaultMenuExpandIcon = (
  <span className="hap-dropdown-menu-submenu-arrow">
    <Icon className="hap-dropdown-menu-submenu-arrow-icon Font13" icon="arrow-right-tip" />
  </span>
);

export const getMenuProps = (menu, removeShadow = false, direction, autoAdjustOverflow) => {
  if (!menu) return menu;

  const nextMenu = {
    ...menu,
    builtinPlacements: {
      ...getSubMenuBuiltinPlacements(direction, autoAdjustOverflow),
      ...menu.builtinPlacements,
    },
    style: {
      backgroundClip: 'border-box',
      minWidth: 160,
      maxHeight: '80vh',
      overflowY: 'auto',
      ...(removeShadow ? { boxShadow: 'none' } : {}),
      ...menu.style,
    },
  };

  if (menu.expandIcon === undefined) {
    nextMenu.expandIcon = defaultMenuExpandIcon;
  }

  return nextMenu;
};

function DropdownPopupSearch({
  filterOption = true,
  menuNode,
  notFoundContent,
  onSearch,
  popupRender,
  searchAutoFocus,
  searchValue,
}) {
  const { token } = theme.useToken();
  const [innerSearchValue, setInnerSearchValue] = useState('');
  const mergedSearchValue = searchValue === undefined ? innerSearchValue : searchValue;
  const menuItems = menuNode?.props?.items || [];
  const filteredItems =
    mergedSearchValue && filterOption !== false
      ? menuItems.filter(item =>
          typeof filterOption === 'function'
            ? filterOption(mergedSearchValue, item)
            : defaultFilterOption(mergedSearchValue, item),
        )
      : menuItems;
  const filteredMenuNode = React.isValidElement(menuNode)
    ? React.cloneElement(menuNode, { items: filteredItems })
    : menuNode;
  const popup = popupRender ? popupRender(filteredMenuNode) : filteredMenuNode;

  const handleSearch = value => {
    if (searchValue === undefined) {
      setInnerSearchValue(value);
    }

    onSearch?.(value);
  };

  return (
    <div
      className="hap-dropdown-popup-with-search"
      style={{
        borderRadius: token.borderRadiusLG,
        backgroundColor: token.colorBgElevated,
        boxShadow: token.boxShadow,
      }}
    >
      <Input
        style={{ '--hap-input-padding-block': '10px' }}
        autoFocus={searchAutoFocus}
        variant="borderless"
        placeholder={_l('搜索')}
        prefix={<Icon icon="search" className="Font16 textTertiary" />}
        value={mergedSearchValue}
        onClick={event => event.stopPropagation()}
        onChange={event => handleSearch(event.target.value)}
        onKeyDown={event => event.stopPropagation()}
      />
      <Divider className="mTop2 mBottom5" />
      {notFoundContent !== undefined && !filteredItems.length ? (
        <div className="hap-dropdown-empty">{notFoundContent}</div>
      ) : (
        popup
      )}
    </div>
  );
}

export const getDropdownProps = (props, direction) => {
  const {
    menu,
    autoAdjustOverflow = DEFAULT_AUTO_ADJUST_OVERFLOW,
    destroyOnHidden,
    filterOption,
    notFoundContent,
    onSearch,
    popupRender,
    popupSearchAutoFocus = true,
    searchValue,
    showPopupSearch,
    ...restProps
  } = props;
  const nextProps = {
    ...restProps,
    autoAdjustOverflow,
    destroyOnHidden: destroyOnHidden ?? true,
  };

  if (menu !== undefined) {
    nextProps.menu = getMenuProps(menu, showPopupSearch, direction, autoAdjustOverflow);
  }

  if (showPopupSearch) {
    nextProps.popupRender = menuNode => (
      <DropdownPopupSearch
        filterOption={filterOption}
        menuNode={menuNode}
        notFoundContent={notFoundContent}
        onSearch={onSearch}
        popupRender={popupRender}
        searchAutoFocus={popupSearchAutoFocus}
        searchValue={searchValue}
      />
    );
  } else if (popupRender) {
    nextProps.popupRender = popupRender;
  }

  return nextProps;
};

const MdDropdown = forwardRef((props, ref) => {
  const { direction } = useContext(ConfigProvider.ConfigContext);

  return <AntdDropdown {...getDropdownProps(props, direction)} ref={ref} />;
});

MdDropdown.displayName = 'Dropdown';

MdDropdown.propTypes = {
  autoAdjustOverflow: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  destroyOnHidden: PropTypes.bool,
  filterOption: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  notFoundContent: PropTypes.node,
  onSearch: PropTypes.func,
  popupSearchAutoFocus: PropTypes.bool,
  searchValue: PropTypes.string,
  showPopupSearch: PropTypes.bool,
};

export default MdDropdown;
