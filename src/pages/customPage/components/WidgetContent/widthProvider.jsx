import React, { Component } from 'react';

export default function widthProvider(GridOutComponent) {
  return class WidthProvider extends Component {
    state = {
      width: 1280,
    };
    mounted = false;

    componentDidMount() {
      this.mounted = true;

      window.addEventListener('resize', this.onWindowResize);
      window.customPageWindowResize = this.onWindowResize;
      this.onWindowResize();
    }
    componentWillReceiveProps(nextProps) {
      if (nextProps.chatVisible !== this.props.chatVisible) {
        const chatWidth = nextProps.chatVisible ? -164 : 164;
        this.onWindowResize(chatWidth);
      }
      if (nextProps.sheetListVisible !== this.props.sheetListVisible) {
        // 增减左侧列表展开收起之间的宽度差值
        const width = nextProps.sheetListVisible ? -176 : 176;
        const countryLayerChart = document.querySelector('.countryLayerChart');
        if (countryLayerChart) {
          setTimeout(() => this.onWindowResize(width), 0);
        } else {
          this.onWindowResize(width);
        }
      }
      if (this.props.isFullscreen !== nextProps.isFullscreen && !nextProps.isFullscreen) {
        setTimeout(() => {
          this.onWindowResize();
        }, 100);
      }
    }

    componentWillUnmount() {
      this.mounted = false;
      delete window.customPageWindowResize;
      window.removeEventListener('resize', this.onWindowResize);
    }

    onWindowResize = width => {
      if (!this.mounted) return;
      const { layoutType } = this.props;
      const node = layoutType === 'mobile' ? document.querySelector('.customPageContentWrap .layout') : document.querySelector('#componentsWrap .componentsWrap>.layout');
      if (node instanceof HTMLElement) {
        this.setState({ width: typeof width === 'number' ? node.offsetWidth + width : node.offsetWidth });
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
