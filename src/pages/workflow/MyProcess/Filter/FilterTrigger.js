import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { TABS } from '../config';

export default class Filter extends Component {
  getFilterLength = () => {
    const { stateTab } = this.props;
    const filter = {
      ...this.props.filter,
      isAsc: undefined,
    };

    if (_.isObject(filter)) {
      // 不是筛选项
      delete filter.type;
      delete filter.resultType;
    } else {
      return 0;
    }

    if (stateTab !== TABS.COMPLETE) {
      delete filter.startDate;
      delete filter.endDate;
    }

    return _.toArray(filter).filter(item => item).length;
  };
  handleClear = e => {
    e.stopPropagation();
    this.props.handleClear();
  };
  render() {
    const { visible } = this.props;
    const length = this.getFilterLength();
    return (
      <Fragment>
        <div
          className={cx('processFilterTarget flexRow valignWrapper textSecondary pointer', {
            active: visible || length,
          })}
          onClick={this.props.handleOpen}
        >
          <Icon icon="worksheet_filter" className="mBottom2" />
          <span className="Font13 mLeft5">{length ? _l('已筛选') : _l('筛选')}</span>
          {length ? <Icon icon="close" className="Font16 mBottom2 mLeft5" onClick={this.handleClear} /> : null}
        </div>
      </Fragment>
    );
  }
}
