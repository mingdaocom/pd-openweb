import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { Linkify } from 'ming-ui';
import { formatStrZero } from 'src/util';
import _ from 'lodash';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';

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
