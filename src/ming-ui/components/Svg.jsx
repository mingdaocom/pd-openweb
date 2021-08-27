import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import './less/Svg.less';

let svgs = null;

export default class Svg extends Component {
  constructor(props) {
    super(props);
    if (svgs) {
      this.state = {
        show: true,
      };
    } else {
      this.state = {
        show: false,
      };
    }
  }
  getSvgs(symbolDefs) {
    const x = document.createElement('x');
    svgs = {};
    // 17-10-23 去掉title标签，bug: 火狐会显示多余的内容
    // 提取symbolDefs字符串生成svgs对象
    x.innerHTML = symbolDefs
      .replace(/<symbol/g, '<div')
      .replace(/<\/symbol>/g, '</div>')
      .replace(/<title>.*?<\/title>/g, '');
    const symbols = x.getElementsByTagName('div');
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      const id = symbol.getAttribute('id');
      const svg = document.createElement('svg');
      svg.innerHTML = symbol.innerHTML;
      svg.setAttribute('viewBox', symbol.getAttribute('viewBox'));
      svgs[id] = svg;
    }

    this.setState({
      show: true,
    });
  }
  componentDidMount() {
    const that = this;

    if (!this.state.show) {
      const ajax = new XMLHttpRequest();

      ajax.open('GET', '/src/common/mdcss/svg/symbol-defs.svg', true);
      ajax.send();
      ajax.onload = function(e) {
        that.getSvgs(ajax.responseText);
      };
    }
  }
  render() {
    const style = {};
    if (this.props.size) {
      let size = this.props.size;
      if (typeof this.props.size === 'string' && /^\d+$/.test(this.props.size)) {
        size = size + 'px';
      } else if (typeof this.props.size === 'number') {
        size = size.toString() + 'px';
      }
      style.width = size;
      style.height = size;
    }
    if (!this.state.show) {
      return <div className="InlineBlock" style={style} />;
    }
    if (this.props.color) {
      style.color = this.props.color;
    }
    const svg = svgs[`icon-${this.props.icon}`];
    if (!svg) {
      return null;
    }
    // if (process.env.NODE_ENV !== 'production') {
    //   return (
    //     <svg key={this.props.icon} className={cx('icon-svg', `icon-${this.props.icon}`, this.props.className)} style={style}><use xlinkHref={`#icon-${this.props.icon}`}></use></svg>
    //   );
    // }
    return (
      <svg
        key={this.props.icon}
        className={cx('icon-svg', `icon-${this.props.icon}`, this.props.className)}
        style={style}
        viewBox={svg.getAttribute('viewBox')}
        dangerouslySetInnerHTML={{ __html: svg.innerHTML }}
      />
    );
  }
}

Svg.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.string,
  size: PropTypes.string,
  color: PropTypes.string,
};
