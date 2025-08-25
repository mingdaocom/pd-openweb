import React, { Component } from 'react';
import _ from 'lodash';
import SplitLineSection from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/SplitLineSection.jsx';

export default class Widgets extends Component {
  render() {
    const { from, renderData, setNavVisible, registerCell, worksheetId } = this.props;
    const sectionStyle = _.get(this.props, 'widgetStyle.sectionstyle') || '0';
    return (
      <SplitLineSection
        data={this.props}
        from={from}
        fromType="display"
        worksheetId={worksheetId}
        sectionstyle={sectionStyle}
        renderData={renderData}
        setNavVisible={setNavVisible}
        registerCell={registerCell}
      />
    );
  }
}
