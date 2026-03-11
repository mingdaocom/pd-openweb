import React, { useState } from 'react';
import { bool, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';

const IconBtn = styled.span`
  color: var(--color-text-tertiary);
  display: inline-block;
  width: 28px;
  height: 28px;
  text-align: center;
  font-size: 20px;
  line-height: 28px;
  border-radius: 5px;
  &:hover {
    background: var(--color-background-hover);
  }
`;

export default function ExportSheetButton(props) {
  const { className, style, noLoading, exportSheet = () => {} } = props;
  const [loading, setLoading] = useState(false);
  return (
    <Tooltip title={_l('导出Excel')} placement="bottom">
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
    </Tooltip>
  );
}

ExportSheetButton.propTypes = {
  className: string,
  noLoading: bool,
  style: shape({}),
  exportSheet: func,
};
