import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const ToolbarIconWrap = styled.div`
  width: 30px;
  text-align: center;
  right: 10px;
  top: ${({ isMobile, icon }) => (icon === 'gpsFixed' ? (isMobile ? '140px' : '470px') : isMobile ? '180px' : '520px')};
  z-index: 10;
  padding: 6px;
  border-radius: ${icon => (icon === 'gpsFixed' ? ' 50%' : 'unset')};
  background: #fff;
  box-shadow: 0 3px 6px 0px rgba(0, 0, 0, 0.16);
`;

export default class OperatorIcon extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { isMobile, onClose, defaultLocation, setPosition, setZoom } = this.props;
    return (
      <Fragment>
        <div
          className="Absolute"
          style={{ right: 12, top: 11, borderRadius: '50%', background: '#fff', width: 16, height: 16, zIndex: 9 }}
        />
        <Icon
          icon="cancel"
          className="Gray_9e Font20 Absolute ThemeHoverColor3 pointer"
          style={{ right: 10, top: 10, zIndex: 10 }}
          onClick={onClose}
        />

        {defaultLocation && defaultLocation.position && (
          <ToolbarIconWrap
            isMobile={isMobile}
            icon="gpsFixed"
            className="Gray_9e Absolute ThemeHoverColor3 pointer flexRow gpsFixedIcon"
            onClick={() => setPosition(defaultLocation.position.lng, defaultLocation.position.lat)}
          >
            <Icon icon="gps_fixed" className="Font18" />
          </ToolbarIconWrap>
        )}
        {defaultLocation && defaultLocation.position && (
          <ToolbarIconWrap
            className="Gray_9e Absolute pointer flexColumn zoomWrap"
            isMobile={isMobile}
            icon="plusMinus"
          >
            <div className="ThemeHoverColor3" onClick={() => setZoom('plus')}>
              <Icon icon="plus" className="Font14" />
            </div>
            <div className="w100 mTop2" style={{ height: 1, border: '1px solid #ddd' }}></div>
            <div className="ThemeHoverColor3 pTop3" style={{ height: 19 }} onClick={() => setZoom('minus')}>
              <Icon icon="minus" className="Font14" />
            </div>
          </ToolbarIconWrap>
        )}
      </Fragment>
    );
  }
}
