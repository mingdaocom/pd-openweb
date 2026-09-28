import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox } from 'ming-ui/antd-components';
import { SCOPES } from './enum';

const Wrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;

  .permissionItem {
    border-bottom: 1px solid var(--color-border-secondary);
    display: flex;
    align-items: center;
    height: 50px;
    line-height: 50px;
  }

  .scopeCategoryItem {
    padding-left: 25px;
  }

  .scopeChildItem {
    padding-left: 75px;
  }

  .permissionLabel {
    color: var(--color-text-primary);
  }

  .permissionCheckbox {
    width: 100%;
    margin-right: 0;
  }

  .expandIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 10px;
    color: var(--color-text-tertiary);
    cursor: pointer;
  }
`;

export const DEFAULT_DISABLED_SCOPE_CODES = [200000, 200100, 200200];

const getScopeCodes = scope => ((scope.children || []).length ? scope.children.map(item => item.code) : [scope.code]);

export const normalizeScopeCodes = (scopes, codes) => {
  const input = new Set(codes);
  const result = new Set();

  (scopes || []).forEach(scope => {
    const children = scope.children || [];

    if (children.length) {
      if (children.every(child => input.has(child.code))) {
        result.add(scope.code);
      }

      children.forEach(child => input.has(child.code) && result.add(child.code));
    } else if (input.has(scope.code)) {
      result.add(scope.code);
    }
  });

  return Array.from(result);
};

const getSelectableScopeCodes = (scopes, disabledCodes) =>
  (scopes || []).flatMap(getScopeCodes).filter(code => !disabledCodes.includes(code));

export const getSelectAllState = (scopes, codes) => {
  const selectedCodes = new Set(codes);
  const scopeCodes = (scopes || []).flatMap(getScopeCodes);
  const checkedCount = scopeCodes.filter(code => selectedCodes.has(code)).length;

  return {
    checked: !!scopeCodes.length && checkedCount === scopeCodes.length,
    indeterminate: checkedCount > 0 && checkedCount < scopeCodes.length,
  };
};

export const toggleAllScopeCodes = (scopes, codes, disabledCodes = DEFAULT_DISABLED_SCOPE_CODES) => {
  const { checked } = getSelectAllState(scopes, codes);
  const selectableCodes = getSelectableScopeCodes(scopes, disabledCodes);
  const nextCodes = checked
    ? codes.filter(code => !selectableCodes.includes(code))
    : codes.concat(selectableCodes.filter(code => !codes.includes(code)));

  return normalizeScopeCodes(scopes, nextCodes);
};

export default function ApiScopeList(props) {
  const {
    scopes = [],
    codes = [],
    showCheckbox = false,
    showSelectAll = false,
    selectAllLabel,
    checkboxDisabled = false,
    disabledCodes = DEFAULT_DISABLED_SCOPE_CODES,
    onChange,
    className,
  } = props;
  const [expandedScopes, setExpandedScopes] = useState([]);
  const [selectAllExpanded, setSelectAllExpanded] = useState(true);
  const selectedCodes = showCheckbox ? codes : [];
  const filterCodes = showCheckbox ? [] : codes;
  const shouldShowSelectAll = showCheckbox && showSelectAll;
  const selectAllState = getSelectAllState(scopes, selectedCodes);

  const toggleCategory = categoryId =>
    setExpandedScopes(prev =>
      prev.includes(categoryId) ? prev.filter(code => code !== categoryId) : [...prev, categoryId],
    );

  const updateSelectedCodes = nextCodes => {
    if (!onChange) return;
    onChange(normalizeScopeCodes(scopes, nextCodes));
  };

  const toggleScope = scope => {
    const currentCodes = getScopeCodes(scope);
    const checked = currentCodes.every(item => selectedCodes.includes(item));

    updateSelectedCodes(
      checked ? selectedCodes.filter(item => !currentCodes.includes(item)) : selectedCodes.concat(currentCodes),
    );
  };

  const toggleScopeItem = code =>
    updateSelectedCodes(
      selectedCodes.includes(code) ? selectedCodes.filter(item => item !== code) : selectedCodes.concat(code),
    );

  const renderLabel = ({ code, label, checked, indeterminate, onClick }) =>
    showCheckbox ? (
      <Checkbox
        className="permissionCheckbox"
        checked={checked}
        indeterminate={indeterminate}
        disabled={checkboxDisabled || disabledCodes.includes(code)}
        onChange={() => !checkboxDisabled && !disabledCodes.includes(code) && onClick()}
      >
        {label || SCOPES[code]}
      </Checkbox>
    ) : (
      <span className="permissionLabel">{label || SCOPES[code]}</span>
    );

  const renderScope = scope => {
    const children = scope.children || [];
    const visibleChildren = filterCodes.length ? children.filter(c => filterCodes.includes(c.code)) : children;

    if (filterCodes.length && !filterCodes.includes(scope.code) && !visibleChildren.length) return null;

    const currentCodes = getScopeCodes(scope);
    const checkedCount = currentCodes.filter(code => selectedCodes.includes(code)).length;
    const checked = checkedCount === currentCodes.length;
    const indeterminate = checkedCount > 0 && !checked;
    const isExpanded = expandedScopes.includes(scope.code);

    return (
      <div key={scope.code}>
        <div className={cx('permissionItem', shouldShowSelectAll && 'scopeCategoryItem')}>
          <Icon
            icon={isExpanded ? 'arrow-down' : 'arrow-right-tip'}
            className="expandIcon"
            onClick={() => toggleCategory(scope.code)}
          />
          {renderLabel({ code: scope.code, checked, indeterminate, onClick: () => toggleScope(scope) })}
        </div>
        {isExpanded && (
          <div>
            {visibleChildren.map(child => (
              <div
                key={child.code}
                className={cx(
                  'permissionItem',
                  shouldShowSelectAll ? 'scopeChildItem' : showCheckbox ? 'pLeft50' : 'pLeft25',
                )}
              >
                {renderLabel({
                  code: child.code,
                  checked: selectedCodes.includes(child.code),
                  onClick: () => toggleScopeItem(child.code),
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!scopes.length) {
    return (
      <Wrap className={className || ''}>
        <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter textSecondary">{_l('暂无权限')}</div>
      </Wrap>
    );
  }

  return (
    <Wrap className={className || ''}>
      {shouldShowSelectAll && (
        <div className="permissionItem">
          <Icon
            icon={selectAllExpanded ? 'arrow-down' : 'arrow-right-tip'}
            className="expandIcon"
            onClick={() => setSelectAllExpanded(value => !value)}
          />
          {renderLabel({
            label: selectAllLabel,
            ...selectAllState,
            onClick: () => updateSelectedCodes(toggleAllScopeCodes(scopes, selectedCodes, disabledCodes)),
          })}
        </div>
      )}
      {(!shouldShowSelectAll || selectAllExpanded) && scopes.map(renderScope)}
    </Wrap>
  );
}
