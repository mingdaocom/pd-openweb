import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

function TagCon(props) {
  const { disabled, data, renderItem, onRemove } = props;
  return (<div className={cx('filterTagCon', { disabled })}>
    { data.length ? data.map((item, index) => <span className="fiterTagItem" key={index}>
      { renderItem ? renderItem(item) : <span className="text">{ item.name }</span> }
      <span
        className="remove"
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) {
            return;
          }
          onRemove(item);
        }} >
        <i className="icon icon-delete"></i>
      </span>
    </span>) : <span className="placeholder">{ _l('请选择') }</span> }
  </div>);
}

TagCon.propTypes = {
  disabled: PropTypes.bool,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  renderItem: PropTypes.func,
  onRemove: PropTypes.func,
};

export default TagCon;
