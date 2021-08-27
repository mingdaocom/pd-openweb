import React from 'react';
import styled from 'styled-components';
import { TEMPLATE_TYPE } from '../../config/ocr';
import { CommonDisplay } from '../../styled';
const InfoWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  .btn {
    display: flex;
    align-items: center;
    line-height: 36px;
    padding: 0 24px;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
    text-align: center;
    background-color: #fff;
    color: #2196f3;
    font-weight: 500;
    width: 100%;
    max-width: 320px;
    justify-content: center;
    i {
      margin-right: 6px;
    }
  }
  .hint {
    text-align: center;
  }
`;
export default function OcrDisplay({ data }) {
  const { enumDefault } = data;
  const { displayText, icon } = TEMPLATE_TYPE.find(item => item.value === enumDefault) || {};
  return enumDefault ? (
    <InfoWrap>
      {displayText && (
        <div className="btn overflow_ellipsis">
          <i className={`icon-${icon} Font20`}></i>
          {_l('识别%0', displayText)}
        </div>
      )}
    </InfoWrap>
  ) : (
    <CommonDisplay className="overflow_ellipsis">{_l('请在右侧配置识别模板')}</CommonDisplay>
  );
}
