import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 7px 10px;
  margin: 10px 15px;
  background-color: var(--color-background-tertiary);
  border-radius: 24px;

  form {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  &.manualSearch {
    gap: 9px;
    padding: 0;
    background-color: transparent;

    form {
      align-items: center;
      padding: 7px 10px;
      background-color: var(--color-background-tertiary);
      border-radius: 24px;
    }

    .manualSearchButton {
      display: flex;
      flex: 0 0 36px;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      background-color: var(--color-background-tertiary);
      border: 0;
      border-radius: 50%;

      &:disabled {
        cursor: default;
        opacity: 0.5;
      }
    }
  }

  input {
    flex: 1;
    min-width: 0;
    width: auto;
    border: 0;
    padding: 0 5px;
    background-color: inherit;
  }

  .icon-h5_search {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
  .realtimeSearchIcon {
    font-size: 16px;
  }
  .icon-workflow_cancel {
    flex-shrink: 0;
    font-size: 15px;
    color: var(--color-text-disabled);
  }
`;

const MobileSearch = forwardRef((props, ref) => {
  const { placeholder, onSearch = () => {}, searchMode = 'realtime', disabled = false } = props;
  const isFirstRun = useRef(true);
  const isComposing = useRef(false);
  const latestOnSearch = useRef(onSearch);
  const inputRef = useRef(null);
  const [keywords, setKeywords] = useState('');

  const debouncedSearch = useRef(
    _.debounce(kw => {
      latestOnSearch.current(kw);
    }, 600),
  ).current;

  useEffect(() => {
    latestOnSearch.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (searchMode === 'realtime' && !isComposing.current) {
      debouncedSearch(keywords);
    } else if (searchMode === 'manual') {
      debouncedSearch.cancel();
    }
  }, [debouncedSearch, keywords, searchMode]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useImperativeHandle(ref, () => ({
    keywords,
    focus: () => inputRef.current?.focus(),
  }));

  const handleSearch = () => {
    if (disabled) return;

    debouncedSearch.cancel();
    latestOnSearch.current(keywords);
  };

  return (
    <SearchWrapper className={`popupSearchWrapper ${searchMode === 'manual' ? 'manualSearch' : ''}`}>
      {searchMode === 'realtime' && <Icon icon="h5_search" className="realtimeSearchIcon" />}
      <form action="#" className="flex" onSubmit={e => e.preventDefault()}>
        <input
          ref={inputRef}
          type="search"
          placeholder={placeholder || _l('搜索')}
          className="Font14"
          value={keywords}
          onChange={event => setKeywords(event.target.value)}
          onCompositionStart={() => {
            isComposing.current = true;
            debouncedSearch.cancel();
          }}
          onCompositionEnd={event => {
            isComposing.current = false;
            if (searchMode === 'realtime') debouncedSearch(event.currentTarget.value);
          }}
          onKeyDown={event => {
            event.key === 'Enter' && !isComposing.current && handleSearch();
          }}
        />
        {keywords && (
          <Icon icon="workflow_cancel" onMouseDown={event => event.preventDefault()} onClick={() => setKeywords('')} />
        )}
      </form>
      {searchMode === 'manual' && (
        <button type="button" className="manualSearchButton pointer" disabled={disabled} onClick={handleSearch}>
          <Icon icon="h5_search" />
        </button>
      )}
    </SearchWrapper>
  );
});

MobileSearch.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  searchMode: PropTypes.oneOf(['realtime', 'manual']),
  disabled: PropTypes.bool,
};

export default memo(MobileSearch);
