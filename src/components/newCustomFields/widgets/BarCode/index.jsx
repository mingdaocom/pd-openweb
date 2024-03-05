import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { BarCode, Qr } from 'ming-ui';
import emptyCover from 'src/pages/worksheet/assets/emptyCover.png';
import { getBarCodeValue } from '../../tools/utils';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import { parseDataSource } from 'src/pages/widgetConfig/util/setting.js';
import { FROM } from '../../tools/config';

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
  background-color: #eaeaea;
  margin: 15px 0;
`;

export default class Widgets extends Component {
  static propTypes = {
    isCell: PropTypes.bool,
    enumDefault: PropTypes.number,
    enumDefault2: PropTypes.number,
    dataSource: PropTypes.string,
    formData: PropTypes.arrayOf(PropTypes.shape({})),
    advancedSetting: PropTypes.object,
  };

  state = {
    value: '',
  };

  componentDidMount() {
    this.updateValue(this.props.formData);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.formData !== this.props.formData ||
      nextProps.enumDefault2 !== this.props.enumDefault2 ||
      nextProps.enumDefault !== this.props.enumDefault
    ) {
      this.updateValue(nextProps.formData);
    }
  }

  componentWillUnmount() {
    this.barId && clearTimeout(this.barId);
  }

  updateValue = data => {
    const { enumDefault, enumDefault2, dataSource, recordId, appId, worksheetId, viewIdForPermit, viewId, isView } =
      this.props;
    const newVal = getBarCodeValue({
      data,
      control: { enumDefault, enumDefault2, dataSource: parseDataSource(dataSource) },
      codeInfo: { recordId, appId, worksheetId, viewId: viewId || viewIdForPermit },
    });
    if (newVal !== this.state.value) {
      if (isView) {
        this.setState({
          value: newVal,
        });
        return;
      }

      this.barId = setTimeout(() => {
        this.setState({
          value: newVal,
        });
      }, 100);
    }
  };

  onPreview = e => {
    e.stopPropagation();
    const url = this.ImgCode.childNodes[0] ? this.ImgCode.childNodes[0].src : '';
    if (!url) return;
    previewQiniuUrl(url, { disableDownload: true, ext: 'png', name: 'code.png', theme: 'light' });
  };

  render() {
    const { isCell, advancedSetting: { width, faultrate } = {}, enumDefault, isView, from, className } = this.props;
    const parseWidth = parseFloat(width);
    const { value } = this.state;

    if (!this.state.value) {
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
        onClick={this.onPreview}
        ref={con => (this.ImgCode = con)}
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
}
