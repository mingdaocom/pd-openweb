import React, { Fragment } from 'react';
import _ from 'lodash';

export default function WeChatServiceAccountList(props) {
  const { weiXinInfo, handleClick } = props;

  return (
    <Fragment>
      {/* 未绑定任何服务号时显示 */}
      {_.isEmpty(weiXinInfo) && (
        <div className="description Font13 mBottom20">
          {_l(
            '绑定服务号后，外部门户将可以通过指定的域名获取该服务号下微信用户的授权及OpenID，可以通过工作流为外部的微信用户推送模板消息',
          )}
        </div>
      )}
      {weiXinInfo.map((item, index) => {
        const { appId, nickName } = item;

        return (
          <div key={index} className="weiXinServiceAccountItem flexRow">
            <i className="icon icon-wechat Font40" />
            <span className="Font17 bold mLeft20">{nickName}</span>
            <span className="Font13 textSecondary mLeft20">AppID：{appId}</span>
            <div className="flex"></div>
            <span className="colorPrimary Hand Hover_51 pRight25 pLeft10" onClick={() => handleClick(appId)}>
              {_l('查看')}
              <i className="icon icon-arrow-right-border mLeft3" />
            </span>
          </div>
        );
      })}
    </Fragment>
  );
}
