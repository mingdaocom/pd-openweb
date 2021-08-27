import React from 'react';
import ReactDom from 'react-dom';

module.exports = {
  // When the component mounts, listen to click events and check if we need to
  // Call the componentClickAway function.
  componentDidMount() {
    this._isMounted = true;
    if (!this.manuallyBindClickAway) {
      this._bindClickAway();
    }
  },
  componentWillUnmount() {
    this._unbindClickAway();
    this._isMounted = false;
  },
  _checkClickAway(e) {
    if (!this._isMounted) {
      return;
    }
    const el = ReactDom.findDOMNode(this);
    // Check if the target is inside the current component
    if (e.target != el && $(el).has($(e.target)).length === 0 && document.documentElement.contains(e.target)) {
      if (this.componentClickAway) {
        this.componentClickAway(e);
      }
    }
  },
  _bindClickAway() {
    // react event handler excuted before jquery catching click event, use setTimeout to wait for this component to be rendered
    setTimeout(() => $(document).on('click', this._checkClickAway), 0);
  },
  _unbindClickAway() {
    $(document).off('click', this._checkClickAway);
  },
};
