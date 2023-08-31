import React, { Component } from 'react';
import cx from 'classnames';
import SectionStyleItem from 'src/pages/widgetConfig/widgetSetting/components/SectionConfig/SectionStyleItem.jsx';
import _ from 'lodash';

export default class Widgets extends Component {
  render() {
    const { children } = this.props;

    const data = _.pick(this.props, [
      'enumDefault',
      'enumDefault2',
      'controlName',
      'controlId',
      'advancedSetting',
      'fieldPermission',
    ]);

    return (
      <SectionStyleItem data={data} from="detail">
        <div className="customFieldsContainer">{children}</div>
      </SectionStyleItem>
    );
  }
}
