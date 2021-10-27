import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import shallowEqual from 'shallowequal';

export default class ScrollView extends Component {
  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    children: PropTypes.node,
    scrollEvent: PropTypes.func,
    disableParentScroll: PropTypes.bool, // 滚动到底部或顶部是否阻止parent滚动，默认不阻止
    scrollContentClassName: PropTypes.string,
    onScrollEnd: PropTypes.func,
    style: PropTypes.object,
  };
  componentDidMount() {
    this.triggerNanoScroller();
  }
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(nextProps, this.props);
  }
  componentDidUpdate() {
    this.triggerNanoScroller();
  }
  componentWillUnmount() {
    $(this.nanoScroller) && $(this.nanoScroller).nanoScroller && ($(this.nanoScroller).nanoScroller instanceof Function) && $(this.nanoScroller).nanoScroller({ destroy: true });
  }
  onWheel(evt) {
    const { clientHeight, scrollTop, scrollHeight } = evt.currentTarget;
    const isTop = evt.deltaY < 0 && scrollTop === 0;
    const isBottom = evt.deltaY > 0 && clientHeight + scrollTop >= scrollHeight;
    if (isTop || isBottom) {
      evt.preventDefault();
    }
  }
  triggerNanoScroller() {
    const SV = this;
    require(['nanoScroller'], () => {
      $(this.nanoScroller).nanoScroller({ scrollendOffset: 60 });
      $(this.nanoScroller)
        .off('update')
        .on('update', (event, values) => {
          // const scrollEvent = new Event('scroll', {
          //   bubbles: false,
          //   cancelable: false,
          // });
          const scrollEvent = document.createEvent('Event');
          scrollEvent.initEvent('scroll', false, false);
          window.dispatchEvent(scrollEvent);
          if (SV.props.updateEvent && typeof SV.props.updateEvent === 'function') {
            SV.props.updateEvent(event, values);
          }
        });
      $(this.nanoScroller).bind('scrollend', e => {
        if (typeof this.props.onScrollEnd === 'function') {
          this.props.onScrollEnd(e);
        }
      });
    });
  }
  render() {
    return (
      <div
        style={this.props.style}
        id={this.props.id}
        ref={el => {
          this.nanoScroller = el;
        }}
        className={cx('nano', this.props.className)}
      >
        <div
          className={cx('nano-content', this.props.scrollContentClassName)}
          onScroll={this.props.scrollEvent}
          ref={el => {
            this.content = el;
          }}
          onWheel={this.props.disableParentScroll ? this.onWheel : evt => evt.stopPropagation()}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}
