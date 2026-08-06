import React from 'react';
import PropTypes from 'prop-types';
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
    if (this.currentTab) {
      this.setIndicatorStyle();
    }
  }

  componentDidUpdate() {
    if (this.currentTab) {
      this.setIndicatorStyle();
    }
  }

  setIndicatorStyle = () => {
    const indicator = this.indicator;
    if (!indicator) return;

    const position = this.getIndicatorPosition();
    if (!position) return;

    indicator.style.left = position.left + 'px';
    indicator.style.width = position.width + 'px';
  };

  getIndicatorPosition = () => {
    const currentTab = this.currentTab;
    if (!currentTab) return;

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
              setRef: el.props.focused ? currentTab => (this.currentTab = currentTab) : undefined,
              style: el.props.style,
              className: el.props.className,
            }),
          )}
        </ul>
        <div
          className="mmTabIndicator bgColorPrimary"
          ref={indicator => {
            this.indicator = indicator;
          }}
        />
      </div>
    );
  }
}
