import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { GLOBAL_SEARCH_TYPE } from '../enum';

const GlobalSearchSideCon = styled.ul`
  padding-top: 8px;
  padding-right: 11px;
  width: fit-content;
  .sideItem {
    width: 150px;
    padding: 13px 0;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sideItem span {
    line-height: 14px;
    height: 14px;
    padding-left: 10px;
    border-left: 2px solid var(--color-white);
  }
  .sideItem:hover {
    background: var(--color-background-secondary);
    span {
      border-left: 2px solid var(--color-background-secondary);
    }
  }
  .sideItem.current {
    background: var(--color-primary-transparent);
    font-weight: 600;
    color: var(--color-primary);
  }
  .sideItem.current span {
    border-left: 2px solid var(--color-primary);
  }
`;

export default class GlobalSearchSide extends Component {
  render() {
    const { current = 'all', onChange } = this.props;
    return (
      <GlobalSearchSideCon>
        {GLOBAL_SEARCH_TYPE.filter(l =>
          md.global.Account.projects.length === 0 ? l.key !== 'app' && l.key !== 'record' : true,
        ).map(item => {
          return (
            <li
              key={`GlobalSearchSide-${item.key}`}
              className={cx('sideItem', { current: current === item.key })}
              onClick={() => onChange({ searchType: item.key })}
            >
              <span>{item.label}</span>
              {item.key === 'record' && (
                <Tooltip
                  placement="bottom"
                  title={_l(
                    '可搜索的字段类型包含：文本、邮箱、电话、自动编号、证件、文本组合、关联字段、他表字段(仅存储)。',
                  )}
                >
                  <Icon icon="info_outline" className="Font17 textDisabled mRight10" />
                </Tooltip>
              )}
            </li>
          );
        })}
      </GlobalSearchSideCon>
    );
  }
}
