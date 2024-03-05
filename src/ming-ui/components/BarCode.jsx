import React, { Component } from 'react';
import JsBarcode from 'jsbarcode';

export default class Barcode extends Component {
  static defaultProps = {
    format: 'CODE128',
    renderer: 'svg',
    width: 2,
    height: 100,
    displayValue: true,
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 5,
    fontSize: 15,
    background: '#ffffff',
    lineColor: '#000000',
    margin: 10,
    marginTop: 0,
    renderWidth: 160,
  };

  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    if (this.props.renderWidth && this.barcode) {
      this.barcode.width = this.props.renderWidth;
    }
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  handleBarcode = r => {
    this.barcode = r;
  };

  update() {
    const {
      value,
      format,
      width,
      height,
      displayValue,
      textAlign,
      textPosition,
      textMargin,
      fontSize,
      background,
      margin,
      lineColor,
      marginBottom,
    } = this.props;

    JsBarcode(this.barcode, value, {
      format,
      width,
      height,
      displayValue,
      textAlign,
      textPosition,
      textMargin,
      fontSize,
      background,
      margin,
      lineColor,
      marginBottom,
    });
  }

  render() {
    const { renderer } = this.props;
    if (renderer === 'svg') {
      return <svg ref={this.handleBarcode} />;
    } else if (renderer === 'canvas') {
      return <canvas ref={this.handleBarcode} />;
    } else if (renderer === 'img') {
      return <img ref={this.handleBarcode} alt="" />;
    }
  }
}
