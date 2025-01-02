import React, { Component } from 'react';
import { connect } from 'react-redux';
import { UserHead } from 'ming-ui';
import cx from 'classnames';
import { isSameType } from 'worksheet/common/ViewConfig/util';

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['viewConfig']),
    ..._.pick(state.sheet, ['isCharge', 'base', 'worksheetInfo', 'controls']),
  }),
)
export default class GroupContent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { base, group, viewConfig, controls, worksheetInfo } = this.props;
    const { viewControl } = viewConfig;
    const groupControl = _.find(controls, { controlId: viewControl }) || {};

    if (group.name && isSameType([26], groupControl)) {
      const data = safeParse(group.name);
      return (
        <div className="flexRow alignItemsCenter userHeadWrap">
          <UserHead
            key={data.accountId}
            projectId={worksheetInfo.projectId}
            size={24}
            user={{
              ...data,
              accountId: data.accountId,
              userHead: data.avatar,
            }}
            className={'roleAvatar flexShrink0'}
            appId={base.appId}
          />
          <span className={cx('mLeft6 flexShrink0', { 'flex WordBreak overflow_ellipsis': true })}>
            {data.fullname}
          </span>
        </div>
      );
    }

    if (group.name && isSameType([27, 48], groupControl)) {
      const row = safeParse(group.name || '{}');
      return row[isSameType([27], groupControl) ? 'departmentName' : 'organizeName'];
    }

    return group.name || _l('为空');
  }
}