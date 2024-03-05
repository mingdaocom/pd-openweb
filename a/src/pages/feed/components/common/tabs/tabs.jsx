import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';

import './tabs.css';

export { default as Tab } from './tab';

/**
 * tab
 */
export class Tabs extends React.Component {
  static propTypes = {
    children: PropTypes.any,
  };

  componentDidMount() {
    if (ReactDom.findDOMNode(this.refs.current)) {
      this.setIndicatorStyle();
    }
  }

  componentDidUpdate() {
    if (ReactDom.findDOMNode(this.refs.current)) {
      this.setIndicatorStyle();
    }
  }

  setIndicatorStyle = () => {
    const indicator = ReactDom.findDOMNode(this.indicator);
    const position = this.getIndicatorPosition();
    indicator.style.left = position.left + 'px';
    indicator.style.width = position.width + 'px';
  };

  getIndicatorPosition = () => {
    const currentTab = ReactDom.findDOMNode(this.refs.current);
    const tabWidth = currentTab.offsetWidth;
    const tabLeft = currentTab.offsetLeft;
    const left = tabLeft;
    const width = tabWidth;
    return { left, width };
  };

  render() {
    return (
      <div className="mmTab">
        <ul>
          {React.Children.map(this.props.children, (el, i) =>
            React.cloneElement(el, {
              key: i,
              ref: el.props.focused ? 'current' : undefined,
              style: el.props.style,
              className: el.props.className,
            }),
          )}
        </ul>
        <div
          className="mmTabIndicator ThemeBGColor3"
          ref={indicator => {
            this.indicator = indicator;
          }}
        />
      </div>
    );
  }
}
