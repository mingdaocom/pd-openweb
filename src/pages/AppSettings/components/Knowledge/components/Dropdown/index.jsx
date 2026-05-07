import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, ScrollView } from 'ming-ui';
import { useAutoFocus } from '../../core/hooks';

export const Container = styled.div`
  display: flex;
  align-items: center;
  color: var(--color-link);
  font-weight: 700;
  cursor: pointer;

  &.disabled {
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  .icon {
    margin-right: 4px;
    margin-bottom: 2px;
  }
`;

export const DropdownPanel = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px;
  width: 300px;
  max-height: 320px;
  box-shadow: var(--shadow-lg);
  background-color: var(--color-background-primary);
  border-radius: 3px;
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

const DROPDOWN_HEIGHT = 320;
const DROPDOWN_WIDTH = 300;

const SelectDropdown = ({
  disabled = false,
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
  const triggerRef = useRef(null);
  const inputRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [placement, setPlacement] = useState('bottomLeft');

  useAutoFocus(inputRef, visible);

  const filteredData = useMemo(() => {
    if (!searchable || !searchText) return data;

    const keyword = searchText.toLowerCase();
    return data.filter(item => String(getLabel(item)).toLowerCase().includes(keyword));
  }, [data, searchText, searchable]);

  useEffect(() => {
    if (disabled) {
      setVisible(false);
    }
  }, [disabled]);

  const getPlacement = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return 'bottomLeft';

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = window.innerWidth - rect.left;
    const spaceLeft = rect.right;

    let vertical = 'bottom';

    if (spaceBelow >= DROPDOWN_HEIGHT) vertical = 'bottom';
    else if (spaceAbove >= DROPDOWN_HEIGHT) vertical = 'top';
    else vertical = spaceBelow > spaceAbove ? 'bottom' : 'top';

    let horizontal = 'Left';

    if (spaceRight < DROPDOWN_WIDTH && spaceLeft >= DROPDOWN_WIDTH) {
      horizontal = 'Right';
    }

    return `${vertical}${horizontal}`;
  };

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
    <Dropdown
      overlay={overlay}
      trigger={['click']}
      disabled={disabled}
      visible={visible}
      placement={placement}
      getPopupContainer={() => document.body}
      onVisibleChange={v => {
        if (abortVisibleChange?.()) {
          setVisible(false);
          return;
        }

        if (v) {
          setPlacement(getPlacement());
        }

        setVisible(v);
      }}
    >
      <Container className={cx({ disabled })} ref={triggerRef}>
        {children || (
          <Fragment>
            <Icon icon="plus" className="icon" />
            {triggerText}
          </Fragment>
        )}
      </Container>
    </Dropdown>
  );
};

export default SelectDropdown;
