import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { Linkify } from 'ming-ui';
import { formatStrZero } from 'src/util';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';

export default class Widgets extends Component {
  static propTypes = {
    value: PropTypes.any,
    type: PropTypes.number,
    dot: PropTypes.number,
    unit: PropTypes.string,
    advancedSetting: PropTypes.object,
  };

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
    const { advancedSetting } = this.props;
    const isLink = advancedSetting.analysislink === '1';
    const content = renderCellText(this.props);

    return (
      <div className="customFormControlBox customFormTextareaBox customFormReadonly">
        {isLink ? <Linkify properties={{ target: '_blank' }}>{content}</Linkify> : content}
      </div>
    );
  }
}
