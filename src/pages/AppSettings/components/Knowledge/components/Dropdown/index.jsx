import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon, ScrollView } from 'ming-ui';
import { Button, Popover } from 'ming-ui/antd-components';
import { useAutoFocus } from 'src/utils/platform/react/interaction';

export const DropdownPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  max-height: 320px;
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;

  .searchInput {
    display: flex;
    width: 98%;
    margin: 0 auto 10px;
    padding: 4px 10px 4px 40px;
    border: none;
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .icon {
    position: absolute;
    top: 5px;
    left: 12px;
    color: var(--color-text-tertiary);
    font-size: 22px;
  }
`;

export const Item = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background-color: var(--color-background-hover);
  }
  &.disabled {
    color: var(--color-text-disabled);
    cursor: not-allowed;

    &:hover {
      background-color: var(--color-background-primary);
    }
  }
  .labelIcon {
    margin-right: 7px;
    font-size: 20px;
    color: var(--color-text-secondary);
  }
  .labelText {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 14px;
    color: var(--color-text-primary);
  }
  .labelSubIcon {
    margin-left: 5px;
    font-size: 18px;
    color: var(--color-primary);
  }
`;

const DropdownTrigger = React.forwardRef(({ disabled, children, triggerText, className, ...props }, ref) => {
  if (children) {
    return (
      <span {...props} ref={ref} className={className}>
        {children}
      </span>
    );
  }

  return (
    <Button
      {...props}
      ref={ref}
      className={className}
      color="primary"
      variant="link"
      disabled={disabled}
      icon={<Icon icon="plus" />}
    >
      {triggerText}
    </Button>
  );
});

DropdownTrigger.displayName = 'DropdownTrigger';

const SelectDropdownPopover = ({
  data = [],
  getKey,
  getLabel,
  getIcon,
  getSubIcon,
  onSelect,
  searchable = true,
  searchPlaceholder = _l('搜索'),
  emptyText = _l('暂无数据'),
  triggerText,
  immediateClose = false,
  abortVisibleChange,
  children,
}) => {
  const inputRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useAutoFocus(inputRef, visible);

  const filteredData = useMemo(() => {
    if (!searchable || !searchText) return data;

    const keyword = searchText.toLowerCase();
    return data.filter(item => String(getLabel(item)).toLowerCase().includes(keyword));
  }, [data, getLabel, searchText, searchable]);

  const handleItemClick = item => {
    onSelect(item);

    if (filteredData.length === 1 || immediateClose) {
      setVisible(false);
    }
  };

  const renderItem = item => {
    const key = getKey(item);
    const label = getLabel(item);
    const icon = getIcon?.(item);
    const subIcon = getSubIcon?.(item);

    return (
      <Item key={key} onClick={() => handleItemClick(item)}>
        {icon && <Icon icon={icon} className="labelIcon" />}
        <span className="labelText">{label}</span>
        {subIcon && <Icon icon={subIcon} className="labelSubIcon" />}
      </Item>
    );
  };

  const overlay = (
    <DropdownPanel onClick={e => e.stopPropagation()}>
      {searchable && (
        <SearchInputWrapper>
          <input
            ref={inputRef}
            className="searchInput"
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onClick={e => e.stopPropagation()}
          />
          <Icon icon="search" />
        </SearchInputWrapper>
      )}

      <ScrollView className="flex">
        {filteredData.length ? filteredData.map(renderItem) : <Item className="disabled">{emptyText}</Item>}
      </ScrollView>
    </DropdownPanel>
  );

  return (
    <Popover
      trigger="click"
      open={visible}
      placement="bottomLeft"
      getPopupContainer={() => document.body}
      noPadding
      onOpenChange={v => {
        if (abortVisibleChange?.()) {
          setVisible(false);
          return;
        }

        setVisible(v);
      }}
      content={overlay}
    >
      <DropdownTrigger triggerText={triggerText}>{children}</DropdownTrigger>
    </Popover>
  );
};

const SelectDropdown = props => {
  if (props.disabled) {
    return (
      <DropdownTrigger disabled triggerText={props.triggerText}>
        {props.children}
      </DropdownTrigger>
    );
  }

  return <SelectDropdownPopover {...props} />;
};

export default SelectDropdown;
