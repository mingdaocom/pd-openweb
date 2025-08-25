import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BarCode, Qr } from 'ming-ui';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import emptyCover from 'src/pages/worksheet/assets/emptyCover.png';
import { FROM } from '../../../core/config';
import { getBarCodeValue } from '../../../core/utils';
import { parseDataSource } from '../../tools/utils';

const QRErrorCorrectLevel = {
  '7%': 1,
  '15%': 0,
  '25%': 3,
  '30%': 2,
};

const BarCodeWrap = styled.span`
  display: inline-block;
  ${({ isRecord }) => isRecord && 'border: 1px solid var(--gray-e0);'}
  ${({ isView }) => (isView ? 'height: 170px;' : '')}

  img {
    ${({ width }) => width && `width: ${width}px;`}
    max-width: 100% !important;
    height: auto !important;
  }
`;

const EmptyTag = styled.div`
  border-radius: 6px;
  width: 22px;
  height: 6px;
  background-color: var(--gray-e0);
  margin: 15px 0;
`;

const BarCodeWidget = props => {
  const {
    from,
    formData,
    enumDefault,
    enumDefault2,
    dataSource,
    recordId,
    appId,
    worksheetId,
    viewIdForPermit,
    viewId,
    isView,
    advancedSetting: { width, faultrate } = {},
    className,
  } = props;
  const parseWidth = parseFloat(width);
  const timer = useRef(null);
  const imgCodeRef = useRef(null);
  const [value, setValue] = useState('');

  const updateValue = data => {
    const newVal = getBarCodeValue({
      data,
      control: { enumDefault, enumDefault2, dataSource: parseDataSource(dataSource) },
      codeInfo: { recordId, appId, worksheetId, viewId: viewId || viewIdForPermit },
    });
    if (newVal !== value) {
      if (isView) {
        setValue(newVal);
        return;
      }

      timer.current = setTimeout(() => {
        setValue(newVal);
      }, 100);
    }
  };

  const onPreview = e => {
    e.stopPropagation();
    const url = imgCodeRef.current.childNodes[0] ? imgCodeRef.current.childNodes[0].src : '';
    if (!url) return;
    previewQiniuUrl(url, { disableDownload: true, ext: 'png', name: 'code.png', theme: 'light' });
  };

  useEffect(() => {
    updateValue(formData);

    return () => {
      timer.current && clearTimeout(timer.current);
    };
  }, [formData, enumDefault, enumDefault2]);

  if (!value) {
    return isView ? (
      <div>
        <img src={emptyCover} />
      </div>
    ) : (
      <EmptyTag />
    );
  }

  return (
    <BarCodeWrap
      isRecord={from === FROM.RECORDINFO}
      isView={isView}
      width={parseWidth}
      onClick={onPreview}
      ref={imgCodeRef}
      className={className}
    >
      {enumDefault === 1 ? (
        <BarCode value={value} renderer="img" renderWidth={parseWidth} />
      ) : (
        <Qr
          gap={6}
          content={value}
          width={parseWidth}
          height={parseWidth}
          correctLevel={QRErrorCorrectLevel[faultrate]}
        />
      )}
    </BarCodeWrap>
  );
};

BarCodeWidget.propTypes = {
  from: PropTypes.number,
  isView: PropTypes.bool,
  recordId: PropTypes.string,
  appId: PropTypes.string,
  worksheetId: PropTypes.string,
  viewId: PropTypes.string,
  viewIdForPermit: PropTypes.string,
  enumDefault: PropTypes.number,
  enumDefault2: PropTypes.number,
  dataSource: PropTypes.string,
  formData: PropTypes.arrayOf(PropTypes.shape({})),
  advancedSetting: PropTypes.object,
  className: PropTypes.string,
};

export default memo(BarCodeWidget);
