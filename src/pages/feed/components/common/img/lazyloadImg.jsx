import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDom from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import _ from 'lodash';
import cx from 'classnames';

/**
 * 通过 lazyload 懒加载的图片
 */
const LazyloadImg = createReactClass({
  displayName: 'LazyloadImg',

  propTypes: {
    src: PropTypes.string,
    options: PropTypes.object,
    placeholder: PropTypes.string,
  },

  mixins: [PureRenderMixin],

  componentDidMount() {
    this.loadImg();
  },

  componentDidUpdate() {
    this.loadImg();
  },

  loadImg() {
    this.lazyloadOption = _.assign(
      {
        // effect: 'fadeIn', // 第一次慢，后面较快，不需要 fadeIn
        placeholder: this.props.placeholder,
      },
      this.props.options
    );
    const img = ReactDom.findDOMNode(this);
    require(['@mdfe/jquery-lazyload'], () => {
      $(img)
        .show()
        .lazyload(this.lazyloadOption);
    });
  },

  render() {
    const attrs = _.assign({}, this.props);
    delete attrs.options;
    delete attrs.placeholder;
    attrs['data-original'] = attrs.src;
    delete attrs.src;
    attrs.className = cx(attrs.className, 'lazy');
    return <img {...attrs} alt={attrs.alt} />;
  },
});

module.exports = LazyloadImg;
