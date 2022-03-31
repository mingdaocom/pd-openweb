import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import Skeleton from './Skeleton';
import filterXSS from 'xss';
import './index.less';

export default class FixedContent extends Component {
  render() {
    const { appPkg, showLeftSkeleton = true, isNoPublish } = this.props;
    const { fixRemark, fixAccount = {} } = appPkg;
    return (
      <div className="unusualContentWrap">
        {showLeftSkeleton && (
          <div className="unusualSkeletonWrap">
            <Skeleton active={false} />
          </div>
        )}
        <div className="unusualContent">
          {isNoPublish ? (
            <React.Fragment>
              <div className="imgWrap mBottom18">
                <Icon className="Font56 Gray_75" icon="send" />
              </div>
              <div className="Font20 mBottom18">{_l('应用暂未发布')}</div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className="imgWrap mBottom10">
                <Icon className="Font56" icon="setting" style={{ color: '#fd7558' }} />
              </div>
              <div className="Font20 mBottom10">{_l('应用维护中...')}</div>
              <div
                className="Font14 Gray_9e mBottom20"
                dangerouslySetInnerHTML={{
                  __html: _l(
                    '该应用已被 %0 设为维护状态，暂停访问',
                    `<a href="/user_${
                      fixAccount.accountId
                    }" target="_blank" class="fixAccount Gray pointer">${filterXSS((fixAccount || {}).fullName)}</a>`,
                  ),
                }}
              ></div>
              <div className="unusualScrollContent">{fixRemark}</div>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
}
