import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BarCode, Qr } from 'ming-ui';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import { parseDataSource } from 'src/pages/widgetConfig/util';
import emptyCover from 'src/pages/worksheet/assets/emptyCover.png';
import { FROM } from '../../../core/config';
import { getBarCodeValue } from '../../../core/utils';

const QRErrorCorrectLevel = {
  '7%': 1,
  '15%': 0,
  '25%': 3,
  '30%': 2,
};

const BarCodeWrap = styled.span`
  cursor: pointer;
  display: inline-block;
  ${({ isRecord }) => isRecord && 'border: 1px solid #e6e6e6;'}
  ${({ isView }) => (isView ? 'height: 170px;' : '')}
  &:hover {
    ${({ isRecord }) => isRecord && 'box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);'}
  }
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
  background-color: var(--color-border-secondary);
  margin: 15px 0;
`;

export default function BarCodeWidgets(props) {
  const {
    isCell,
    enumDefault,
    enumDefault2,
    dataSource,
    formData,
    advancedSetting,
    recordId,
    appId,
    worksheetId,
    viewIdForPermit,
    viewId,
    isView,
    from,
    className,
  } = props;

  const [value, setValue] = useState('');
  const barIdRef = useRef(null);
  const imgCodeRef = useRef(null);

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

      barIdRef.current = setTimeout(() => {
        setValue(newVal);
      }, 100);
    }
  };

  useEffect(() => {
    updateValue(formData);

    return () => {
      if (barIdRef.current) {
        clearTimeout(barIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    updateValue(formData);
  }, [formData, enumDefault2, enumDefault]);

  const onPreview = e => {
    e.stopPropagation();
    const url = imgCodeRef.current?.childNodes[0] ? imgCodeRef.current.childNodes[0].src : '';
    if (!url) return;
    previewQiniuUrl(url, { disableDownload: true, ext: 'png', name: 'code.png', theme: 'light' });
  };

  const { width, faultrate } = advancedSetting || {};
  const parseWidth = parseFloat(width);

  if (!value) {
    return isCell ? (
      <span />
    ) : isView ? (
      <div className="coverWrap emptyCoverWrap">
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
}

BarCodeWidgets.propTypes = {
  isCell: PropTypes.bool,
  enumDefault: PropTypes.number,
  enumDefault2: PropTypes.number,
  dataSource: PropTypes.string,
  formData: PropTypes.arrayOf(PropTypes.shape({})),
  advancedSetting: PropTypes.object,
};
