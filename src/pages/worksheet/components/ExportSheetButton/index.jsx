import React, { useState } from 'react';
import { bool, func, shape, string } from 'prop-types';
import styled from 'styled-components';

const IconBtn = styled.span`
  color: #9e9e9e;
  display: inline-block;
  height: 28px;
  font-size: 20px;
  line-height: 28px;
  padding: 0 4px;
  border-radius: 5px;
  &:hover {
    background: #f7f7f7;
  }
`;

export default function ExportSheetButton(props) {
  const { className, style, noLoading, exportSheet = () => {} } = props;
  const [loading, setLoading] = useState(false);
  return (
    <span
      className={className}
      style={style}
      data-tip={_l('导出Excel')}
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
      {loading ? (
        <i
          className="icon icon-loading_button ThemeColor3"
          style={{
            fontSize: 16,
            margin: 5,
            display: 'inline-block',
            animation: 'rotate 0.6s infinite linear',
          }}
        ></i>
      ) : (
        <IconBtn className="Hand ThemeHoverColor3">
          <i className="icon icon-download" />
        </IconBtn>
      )}
    </span>
  );
}

ExportSheetButton.propTypes = {
  className: string,
  noLoading: bool,
  style: shape({}),
  exportSheet: func,
};
