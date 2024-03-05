import React, { Fragment, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { PRINT_TYPE } from './enum';
import img1 from './images/1x1.png';
import img2 from './images/1x2.png';
import img3 from './images/2x2.png';
import img4 from './images/2x5.png';
import img5 from './images/3x6.png';

const Con = styled.div`
  flex: 1;
  height: 100%;
  background: #eaeaea;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Label = styled.div`
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
  border-radius: 12px;
  overflow: hidden;
  font-size: 0px;
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
`;

const A4PreviewImage = styled.div`
  margin: 0 auto;
  width: 300px;
  height: 420px;
  &.img1 {
    background-size: cover;
    background-image: url(${img1});
  }
  &.img2 {
    background-size: cover;
    background-image: url(${img2});
  }
  &.img3 {
    background-size: cover;
    background-image: url(${img3});
  }
  &.img4 {
    background-size: cover;
    background-image: url(${img4});
  }
  &.img5 {
    background-size: cover;
    background-image: url(${img5});
  }
`;

function A4Preview({ layout }) {
  return <A4PreviewImage className={`img${layout}`} />;
}

function getPreviewSize(width, height) {
  let previewWidth, previewHeight;
  const maxHeight = (window.innerHeight - 50) * 0.9;
  const maxWidth = (window.innerWidth - 320) * 0.9;
  if (width > height) {
    previewHeight = 300;
    previewWidth = (width / height) * previewHeight;
    if (previewWidth > maxWidth) {
      previewWidth = maxWidth;
      previewHeight = (previewWidth / width) * height;
    }
  } else {
    previewWidth = 300;
    previewHeight = (height / width) * previewWidth;
    if (previewHeight > maxHeight) {
      previewHeight = maxHeight;
      previewWidth = (previewHeight / height) * width;
    }
  }
  return {
    width: previewWidth,
    height: previewHeight,
  };
}

export default function Preview(props) {
  const { config = {}, labelObject = {}, style = {} } = props;
  const { printType } = config;
  const { width, height } = labelObject.options || {};
  let error;
  const con = useRef();
  useEffect(() => {
    if (labelObject && con.current) {
      con.current.innerHTML = '';
      labelObject.render();
      con.current.appendChild(labelObject.canvas);
    }
  }, [config, labelObject]);
  const previewSize = getPreviewSize(width, height);
  return (
    <Con style={style}>
      {error && <span>{error}</span>}
      {!error && (
        <Fragment>
          {printType === PRINT_TYPE.QR && <Label style={previewSize} ref={con} />}
          {printType === PRINT_TYPE.BAR && <Label style={previewSize} ref={con} />}
          {printType === PRINT_TYPE.A4 && <A4Preview layout={config.layout} />}
        </Fragment>
      )}
    </Con>
  );
}
