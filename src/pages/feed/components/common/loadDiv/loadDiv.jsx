import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * 加载中
 */
function LoadDiv(props) {
  let { size } = props;
  if (size === 'big') {
    size = 36;
  } else if (!size || size === 'middle') {
    size = 24;
  } else if (size === 'small') {
    size = 16;
  }
  const strokeWidth = Math.floor(size / 8);
  const r = Math.floor(size / 2);
  const cx = r + strokeWidth;
  const cy = cx;
  const width = cx + cy;
  return (
    <div className={classNames('divCenter TxtCenter TxtMiddle', props.className)}>
      <div className="MdLoader" style={{ width }}>
        <svg className="MdLoader-circular">
          <circle {...{ cx, cy, r, strokeWidth }} className="MdLoader-path" />
        </svg>
      </div>
    </div>
  );
}
LoadDiv.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

module.exports = LoadDiv;
