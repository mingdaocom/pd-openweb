import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import ScanQRCode from './ScanQRCode';

const Box = styled(ScanQRCode)`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  position: absolute;
  right: 0;
  top: 0;
`;

export default class Widgets extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    disablePhoto: PropTypes.bool,
    onChange: PropTypes.func,
  };
  render() {
    const { onChange, ...otherProps } = this.props;
    return (
      <Box onScanQRCodeResult={onChange} {...otherProps}>
        <Icon icon="qr_code_19" className="Font20 Gray_75" />
      </Box>
    );
  }
}
