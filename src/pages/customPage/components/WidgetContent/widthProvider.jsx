import React, { Component } from 'react';

export default function widthProvider(GridOutComponent) {
  return class WidthProvider extends Component {
    state = {
      width: 1280,
    };
    mounted = false;

    componentDidMount() {
      this.mounted = true;
      this.wrapEl = document.querySelector('.CustomPageContentWrap .content');
      if (this.wrapEl) {
        this.resizeObserver = new ResizeObserver(() => {
          this.onWindowResize();
        });
        this.resizeObserver.observe(this.wrapEl);
      }

      window.customPageWindowResize = this.onWindowResize;
      this.onWindowResize();
    }

    componentDidUpdate(prevProps) {
      if (prevProps !== this.props) {
        if (this.props.sheetListVisible !== prevProps.sheetListVisible) {
          // 增减左侧列表展开收起之间的宽度差值
          const width = this.props.sheetListVisible ? -176 : 176;
          const countryLayerChart = document.querySelector('.countryLayerChart');

          if (countryLayerChart) {
            setTimeout(() => this.onWindowResize(width), 0);
          } else {
            this.onWindowResize(width);
          }
        }

        if (prevProps.isFullscreen !== this.props.isFullscreen && !this.props.isFullscreen) {
          setTimeout(() => {
            this.onWindowResize();
          }, 100);
        }
      }
    }

    componentWillUnmount() {
      this.mounted = false;
      delete window.customPageWindowResize;
      this.resizeObserver && this.resizeObserver.disconnect();
    }

    onWindowResize = width => {
      if (!this.mounted) return;
      const { layoutType } = this.props;
      const node =
        layoutType === 'mobile'
          ? document.querySelector('.customPageContentWrap .layout')
          : document.querySelector('#componentsWrap .componentsWrap>.layout');

      if (node instanceof HTMLElement) {
        const nextWidth = typeof width === 'number' ? node.offsetWidth + width : node.offsetWidth;

        if (nextWidth !== this.state.width) {
          this.setState({ width: nextWidth });
        }
      }
    };
    render() {
      if (!this.mounted) {
        return <div className={this.props.className} style={this.props.style} />;
      }

      return <GridOutComponent {...this.props} {...this.state} />;
    }
  };
}
