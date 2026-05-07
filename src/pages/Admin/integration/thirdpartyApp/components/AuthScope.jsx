import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { SCOPES } from '../enum';

const AuthScopeWrap = styled.div`
  flex: 1;
  min-height: 0;
  padding: 18px 0 18px 16px;
  overflow: hidden;
  .permissionList {
    overflow: auto;
    padding-right: 16px;
  }
  .permissionItem {
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid var(--color-border-secondary);
    .icon {
      color: var(--color-text-tertiary);
    }
  }
`;

export default function AuthScope(props) {
  const { scopes = [], scopeCodes = [] } = props;
  const [expandedScopes, setExpandedScopes] = useState([]);

  // 切换类别展开/折叠
  const toggleCategory = categoryId => {
    setExpandedScopes(prev =>
      prev.includes(categoryId) ? prev.filter(code => code !== categoryId) : [...prev, categoryId],
    );
  };

  return (
    <AuthScopeWrap className="h100 flexColumn">
      <div>{_l('权限')}</div>
      <div className="permissionList flex minHeight0">
        {!scopes.length ? (
          <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter textSecondary">
            {_l('暂无权限')}
          </div>
        ) : (
          scopes.map(item => {
            const isExpanded = expandedScopes.includes(item.code);

            if (
              scopeCodes.length &&
              !scopeCodes.includes(item.code) &&
              !item.children.some(child => scopeCodes.includes(child.code))
            ) {
              return;
            }

            return (
              <div key={item.code}>
                <div className="permissionItem">
                  <span className="Hand mRight10" onClick={() => toggleCategory(item.code)}>
                    <Icon icon={isExpanded ? 'arrow-down' : 'arrow-right-tip'} className="expandIcon" />
                  </span>
                  <span>{SCOPES[item.code]}</span>
                </div>
                {isExpanded && (
                  <div>
                    {(item?.children || []).map(v => {
                      if (scopeCodes.length && !scopeCodes.includes(v.code)) {
                        return;
                      }

                      return (
                        <div key={v.code} className="permissionItem pLeft25">
                          {SCOPES[v.code]}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </AuthScopeWrap>
  );
}
