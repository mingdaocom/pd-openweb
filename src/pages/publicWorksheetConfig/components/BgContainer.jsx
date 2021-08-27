import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { themes } from '../enum';

const Bg = styled.div`overflow: hidden; .bgHeader { position: absolute; width: 100%; background-size: cover !important; background-position: center !important; }`;
const Mask = styled.div`position: absolute; width: 100%; height: 330px; background-color: rgba(0, 0, 0, .05);}`;

export default function FormContainer(props) {
  const { className, children, themeIndex, mask, coverUrl = '' } = props;
    const theme = themes[themeIndex] || {};
    return (<Bg className={className}>
      <div
        className="bgHeader"
        style={{
          height: 330,
          background: `${theme.main} url(${coverUrl})`,
        }}
      ></div>
      { mask && <Mask /> }
      { children }
    </Bg>);
}

FormContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  themeIndex: PropTypes.number,
  coverUrl: PropTypes.string,
};
