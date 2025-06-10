import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Linkify } from 'ming-ui';
import { renderText as renderCellText } from 'src/utils/control';

export default class Widgets extends Component {
  static propTypes = {
    value: PropTypes.any,
    type: PropTypes.number,
    dot: PropTypes.number,
    unit: PropTypes.string,
    advancedSetting: PropTypes.object,
  };

  shouldComponentUpdate(nextProps) {
    if (!_.isEqual(_.pick(nextProps, ['value']), _.pick(this.props, ['value']))) {
      return true;
    }
    return false;
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
