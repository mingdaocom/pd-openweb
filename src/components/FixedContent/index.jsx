import React, { Component } from 'react';
import { Icon, Skeleton } from 'ming-ui';
import filterXSS from 'xss';
import 'src/components/UnusualContent/index.less';

export default class FixedContent extends Component {
  render() {
    const { appPkg, showLeftSkeleton = true, isNoPublish, hideFixAccount } = this.props;
    const { fixRemark, fixAccount = {}, currentPcNaviStyle } = appPkg;
    return (
      <div className="unusualContentWrap">
        {showLeftSkeleton && currentPcNaviStyle !== 1 && (
          <div className="unusualSkeletonWrap">
            <Skeleton active={false} />
          </div>
        )}
        <div className="unusualContent">
          {isNoPublish ? (
            <React.Fragment>
              <div className="imgWrap mBottom18">
                <Icon className="Font64 Gray_75" icon="install_mobile-_terminal" />
              </div>
              <div className="Font18 mBottom18 centerAlign">
                <div>{_l('应用未在此平台发布')}</div>
                <div>{_l('请至移动端使用')}</div>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className="imgWrap mBottom10">
                <Icon className="Font56" icon="setting" style={{ color: '#fd7558' }} />
              </div>
              <div className="Font20 mBottom10">{_l('应用维护中...')}</div>
              {!hideFixAccount && (
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
              )}
              <div className="unusualScrollContent">{fixRemark}</div>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
}
