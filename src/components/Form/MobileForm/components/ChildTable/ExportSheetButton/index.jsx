import React, { useState } from 'react';
import { bool, func, shape, string } from 'prop-types';

export default function ExportSheetButton(props) {
  const { className, style, noLoading, exportSheet = () => {} } = props;
  const [loading, setLoading] = useState(false);
  return (
    <span
      className={className}
      style={style}
      onClick={() => {
        if (loading) {
          return;
        }
        if (!noLoading) {
          setLoading(true);
        }
        exportSheet(() => setLoading(false));
      }}
    >
      <div className="operateBtnBox">
        {loading ? (
          <i
            className="icon icon-loading_button"
            style={{
              animation: 'rotate 0.6s infinite linear',
            }}
          ></i>
        ) : (
          <i className="icon icon-file_download" />
        )}
      </div>
    </span>
  );
}

ExportSheetButton.propTypes = {
  className: string,
  noLoading: bool,
  style: shape({}),
  exportSheet: func,
};
