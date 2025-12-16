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
  background-color: var(--color-background-secondary);
  border-radius: 24px;

  input {
    width: 100%;
    border: 0;
    padding: 0 5px;
    background-color: inherit;
  }

  .icon-h5_search {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
  .icon-workflow_cancel {
    font-size: 15px;
    color: var(--color-text-disabled);
  }
`;

const MobileSearch = forwardRef((props, ref) => {
  const { placeholder, onSearch = () => {} } = props;
  const isFirstRun = useRef(true);
  const latestOnSearch = useRef(onSearch);
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
    debouncedSearch(keywords);
  }, [keywords]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    keywords,
  }));

  return (
    <SearchWrapper className="popupSearchWrapper">
      <Icon icon="h5_search" />
      <form action="#" className="flex" onSubmit={e => e.preventDefault()}>
        <input
          type="search"
          placeholder={placeholder || _l('搜索')}
          className="Font14"
          value={keywords}
          onChange={event => setKeywords(event.target.value)}
          onKeyDown={event => {
            event.key === 'Enter' && onSearch(keywords);
          }}
        />
      </form>
      {keywords && (
        <Icon icon="workflow_cancel" onMouseDown={event => event.preventDefault()} onClick={() => setKeywords('')} />
      )}
    </SearchWrapper>
  );
});

MobileSearch.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
};

export default memo(MobileSearch);
