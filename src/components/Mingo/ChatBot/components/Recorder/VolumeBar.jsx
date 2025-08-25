import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  width: ${props => props.width};
  height: ${props => props.height}px;
`;

const BackgroundLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: ${props => props.bgPattern};
  background-repeat: repeat-x;
  background-position: left center;
`;

const ForegroundLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: ${props => props.fillPattern};
  background-repeat: repeat-x;
  background-position: left center;
  width: ${props => Math.max(0, Math.min(100, props.progress))}%;
  transition: all 0.3s ease-out;
`;

export default function VolumeBar({
  progress = 0,
  width = '100%',
  height = 10,
  segmentWidth = 2,
  segmentGap = 10,
  bgColor = '#9e9e9e',
  fillColor = '#1677ff',
  borderRadius = 0,
  className = '',
}) {
  // 创建 SVG 背景模式
  const createSVGPattern = color => {
    const patternWidth = segmentWidth + segmentGap;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${patternWidth}" height="${height}">
        <rect x="0" y="0" width="${segmentWidth}" height="${height}" fill="${color}" rx="${borderRadius}"/>
      </svg>
    `;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  };

  const bgPattern = createSVGPattern(bgColor);
  const fillPattern = createSVGPattern(fillColor);

  return (
    <Container width={width} height={height} className={className}>
      {/* 背景层 */}
      <BackgroundLayer bgPattern={bgPattern} />

      {/* 前景层 */}
      <ForegroundLayer fillPattern={fillPattern} progress={progress} />
    </Container>
  );
}

VolumeBar.propTypes = {
  progress: PropTypes.number,
  width: PropTypes.string,
  height: PropTypes.number,
  segmentWidth: PropTypes.number,
  segmentGap: PropTypes.number,
  bgColor: PropTypes.string,
  fillColor: PropTypes.string,
};
