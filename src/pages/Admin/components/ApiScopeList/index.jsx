import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Checkbox, Icon } from 'ming-ui';
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

const getScopeCodes = scope => ((scope.children || []).length ? scope.children.map(item => item.code) : [scope.code]);

const normalizeScopeCodes = (scopes, codes) => {
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

export default function ApiScopeList(props) {
  const { scopes = [], codes = [], showCheckbox = false, checkboxDisabled = false, onChange, className } = props;
  const [expandedScopes, setExpandedScopes] = useState([]);
  const selectedCodes = showCheckbox ? codes : [];
  const filterCodes = showCheckbox ? [] : codes;

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

  const renderLabel = ({ code, checked, indeterminate, onClick }) =>
    showCheckbox ? (
      <Checkbox
        className="permissionCheckbox"
        text={SCOPES[code]}
        checked={checked}
        indeterminate={indeterminate}
        disabled={checkboxDisabled || [200000, 200100, 200200].includes(code)}
        onClick={() => !checkboxDisabled && onClick()}
      />
    ) : (
      <span className="permissionLabel">{SCOPES[code]}</span>
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
        <div className="permissionItem">
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
              <div key={child.code} className={cx('permissionItem', showCheckbox ? 'pLeft50' : 'pLeft25')}>
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

  return <Wrap className={className || ''}>{scopes.map(renderScope)}</Wrap>;
}
