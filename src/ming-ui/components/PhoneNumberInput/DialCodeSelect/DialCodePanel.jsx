import React, { useMemo, useRef, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const PanelWrap = styled.div`
  width: ${props => props.$panelWidth}px;
  max-height: ${props => (props.$maxPanelHeight ? `${props.$maxPanelHeight}px` : 'none')};
  box-sizing: border-box;
  background: var(--color-background-primary);
  border-radius: 4px;
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  .searchWrap {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 12px;
    line-height: 44px;
    border-bottom: 1px solid var(--color-border-primary);
    .searchIcon {
      margin-right: 8px;
      color: var(--color-text-tertiary);
    }
    input {
      height: 100% !important;
      border: none !important;
      box-shadow: none !important;
    }
  }
  .listWrap {
    position: relative;
    display: flex;
    max-height: ${props => (props.$maxPanelHeight ? `${Math.max(props.$maxPanelHeight - 45, 0)}px` : '400px')};
  }
  .countryList {
    flex: 1;
    overflow: auto;
    padding: 6px 0;
  }
  .countryRow {
    height: 36px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover {
      background: var(--color-background-hover);
    }
    &.active {
      color: var(--color-primary);
    }
    .code {
      width: 64px;
    }
    .name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .groupTitle {
    padding: 6px 12px 2px;
    color: var(--color-text-tertiary);
    font-size: 12px;
  }
  .indexBar {
    width: 22px;
    padding: 12px 4px;
    border-left: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    user-select: none;
  }
  .indexItem {
    line-height: 15px;
    font-size: 12px;
    color: var(--color-text-tertiary);
    cursor: pointer;
    &:hover {
      color: var(--color-primary);
    }
  }
  .empty {
    padding: 16px 12px;
    color: var(--color-text-tertiary);
  }
`;

const DEFAULT_COUNTRY_OPTIONS = [];
const DEFAULT_PREFERRED_COUNTRIES = [];

export default function DialCodePanel({
  countryOptions = DEFAULT_COUNTRY_OPTIONS,
  code = '',
  preferredCountries = DEFAULT_PREFERRED_COUNTRIES,
  onSelectCode = _.noop,
  locale,
  panelWidth = 400,
  maxPanelHeight,
  hideIndexBar = false,
}) {
  const [searchValue, setSearchValue] = useState('');
  const listRef = useRef(null);
  const sectionRefs = useRef({});

  const preferredSet = useMemo(() => {
    return new Set(
      (_.isArray(preferredCountries) ? preferredCountries : safeParse(preferredCountries || '[]', 'array')).map(item =>
        String(item.iso2 || item || '').toUpperCase(),
      ),
    );
  }, [preferredCountries]);

  const filteredOptions = useMemo(() => {
    const keyword = (searchValue || '').trim().toLowerCase();
    if (!keyword) return countryOptions;
    return countryOptions.filter(item => item.searchText.includes(keyword));
  }, [countryOptions, searchValue]);

  const groupedCountryOptions = useMemo(() => {
    const preferred = filteredOptions.filter(item => preferredSet.has(item.value));
    const remain = filteredOptions
      .filter(item => !preferredSet.has(item.value))
      .sort((a, b) => (a.localName || '').localeCompare(b.localName || '', locale || 'zh-CN'));
    const grouped = _.groupBy(remain, 'groupKey');
    const groupKeys = Object.keys(grouped).sort();
    const indexBarKeys = preferred.length ? ['#', ...groupKeys] : groupKeys;
    return { preferred, grouped, groupKeys, indexBarKeys };
  }, [filteredOptions, preferredSet, locale]);

  return (
    <PanelWrap
      className="mdPhoneDialCodePanel"
      $panelWidth={panelWidth}
      $maxPanelHeight={maxPanelHeight}
      onMouseDown={e => {
        const isSearchInput = !!e.target?.closest?.('.searchWrap .ant-input, .searchWrap input');

        if (!isSearchInput) {
          e.preventDefault();
        }
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="searchWrap">
        <Icon icon="search" className="searchIcon" />
        <Input
          value={searchValue}
          autoFocus
          placeholder={_l('搜索地区或区号')}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
        />
      </div>
      <div className="listWrap">
        <div className="countryList" ref={listRef}>
          {!filteredOptions.length && <div className="empty">{_l('没有匹配的国家/地区')}</div>}
          {!!groupedCountryOptions.preferred.length && (
            <div ref={node => (sectionRefs.current['#'] = node)}>
              <div className="groupTitle">#</div>
              {groupedCountryOptions.preferred.map(item => (
                <div
                  key={`pref-${item.value}`}
                  className={cx('countryRow', { active: item.code === code })}
                  onClick={() => onSelectCode(item.code)}
                >
                  <span className="code">+{item.dialCode}</span>
                  <span className="name">{item.localName}</span>
                </div>
              ))}
            </div>
          )}
          {groupedCountryOptions.groupKeys.map(key => (
            <div key={`group-${key}`} ref={node => (sectionRefs.current[key] = node)}>
              <div className="groupTitle">{key}</div>
              {(groupedCountryOptions.grouped[key] || []).map(item => (
                <div
                  key={item.value}
                  className={cx('countryRow', { active: item.code === code })}
                  onClick={() => onSelectCode(item.code)}
                >
                  <span className="code">+{item.dialCode}</span>
                  <span className="name">{item.localName}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {!hideIndexBar && (
          <div className="indexBar">
            {groupedCountryOptions.indexBarKeys.map(key => (
              <span
                key={`index-${key}`}
                className="indexItem"
                onClick={() => {
                  const node = sectionRefs.current[key];
                  const listNode = listRef.current;
                  if (!node || !listNode) return;
                  listNode.scrollTop = node.offsetTop;
                }}
              >
                {key}
              </span>
            ))}
          </div>
        )}
      </div>
    </PanelWrap>
  );
}

DialCodePanel.propTypes = {
  countryOptions: PropTypes.array,
  code: PropTypes.string,
  preferredCountries: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  onSelectCode: PropTypes.func,
  locale: PropTypes.string,
  panelWidth: PropTypes.number,
  maxPanelHeight: PropTypes.number,
  hideIndexBar: PropTypes.bool,
};
