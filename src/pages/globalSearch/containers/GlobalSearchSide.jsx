import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
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
    border-left: 2px solid #fff;
  }
  .sideItem:hover {
    background: #f7f7f7;
    span {
      border-left: 2px solid #f7f7f7;
    }
  }
  .sideItem.current {
    background: #f2faff;
    font-weight: 600;
    color: #1677ff;
  }
  .sideItem.current span {
    border-left: 2px solid #1677ff;
  }
  .sideTooltip {
    width: 352px;
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
                  tooltipClass="sideTooltip"
                  autoCloseDelay={0}
                  text={_l(
                    '可搜索的字段类型包含：文本、邮箱、电话、自动编号、证件、文本组合、关联字段、他表字段(仅存储)。',
                  )}
                >
                  <Icon icon="info_outline" className="Font17 Gray_bd mRight10" />
                </Tooltip>
              )}
            </li>
          );
        })}
      </GlobalSearchSideCon>
    );
  }
}
