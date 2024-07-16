import React, { Component } from 'react';
import SplitLineSection from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/SplitLineSection.jsx';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

export default class Widgets extends Component {
  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  render() {
    const { from, renderData, setNavVisible, registerCell } = this.props;
    const sectionStyle = _.get(this.props, 'widgetStyle.sectionstyle') || '0';
    return (
      <SplitLineSection
        data={this.props}
        from={from}
        fromType="display"
        sectionstyle={sectionStyle}
        renderData={renderData}
        setNavVisible={setNavVisible}
        registerCell={registerCell}
      />
    );
  }
}
