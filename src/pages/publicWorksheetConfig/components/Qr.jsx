import React from 'react';
import { Qr as QrComp } from 'ming-ui';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Con = styled.div(
  ({ width }) =>
    `position: relative; z-index: 1; width: ${width}px; border-radius: 4px; background-color: #fff; padding: 10px; box-sizing: border-box; box-shadow: 0px 3px 8px #0000004D;`,
);
const Tip = styled.div`
  text-align: center;
  font-size: 13px;
  color: #333;
  line-height: 1em;
  margin: 8px 0 -2px;
`;
const Bulge = styled.span(
  ({ width }) => `
  position: absolute;
  top: -${width}px;
  left: 50%;
  margin-left: -${width / 2}px;
  width: 0px;
  height: 0px;
  border: ${width / 2}px solid transparent;
  border-bottom-color: #fff;
`,
);

export default function Qr(props) {
  const { url, bulge = true, width = 160 } = props;
  const qrurl = md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${encodeURI(`${url}`)}`;
  return (
    <Con width={width}>
      {bulge && <Bulge width={24} />}
      {url && (
        <QrComp content={url} width={width - 24} height={width - 24} alt="" style={{ verticalAlign: 'bottom' }} />
      )}
      <Tip>{_l('扫一扫分享给好友')}</Tip>
    </Con>
  );
}

Qr.propTypes = {
  url: PropTypes.string,
  bulge: PropTypes.bool,
  width: PropTypes.number,
};
