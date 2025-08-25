import React, { useCallback, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';

export default function (props) {
  const { isOpenGroup, keywords, setKeywords, updateFilter } = props;
  const inputRef = useRef(null);
  const handleSearch = useCallback(
    _.debounce(value => {
      let keyWords = value.trim();
      setKeywords(keyWords);
      updateFilter('');
    }, 500),
    [],
  );
  return (
    <div
      className={cx('searchBar flexRow', {
        pAll0: !isOpenGroup,
        TxtCenter: !isOpenGroup,
      })}
    >
      {isOpenGroup && (
        <React.Fragment>
          <i className="icon icon-search"></i>
          <input
            type="text"
            ref={inputRef}
            placeholder={_l('搜索')}
            className={cx('flex', { placeholderColor: !keywords })}
            onChange={e => handleSearch(e.target.value)}
          />
        </React.Fragment>
      )}
      {keywords && (
        <i
          className="icon icon-cancel Hand"
          onClick={() => {
            setKeywords('');
            updateFilter('');
            inputRef.current.value = '';
          }}
        ></i>
      )}
      {!keywords && (
        <i
          className={cx(`icon Font12 icon-${!isOpenGroup ? 'next-02' : 'back-02'} Hand LineHeight34`, {
            pLeft9: !isOpenGroup,
          })}
          onClick={() => {
            props.changeGroupStatus(!isOpenGroup);
          }}
        ></i>
      )}
    </div>
  );
}
