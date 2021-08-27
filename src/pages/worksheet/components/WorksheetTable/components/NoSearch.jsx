import React from 'react';
import PropTypes from 'prop-types';

export default function NoSearch(props) {
  return (
    <div className="queryEmptyCon">
      <div className="ThemeColor3">
        {_l('没有搜索到"')}
        <span class="green">{props.keyWords}</span>
        {_l('"相关的记录')}
      </div>
    </div>
  );
}

NoSearch.propTypes = {
  keyWords: PropTypes.string,
};
