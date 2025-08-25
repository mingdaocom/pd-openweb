import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, Tooltip } from 'ming-ui';

const LinkParamSettings = styled.div`
  width: 324px;
  padding: 19px 20px;
  box-sizing: border-box;
  background-color: #fff;
  box-shadow: 0px 3px 12px 1px rgba(0, 0, 0, 0.16);
`;

const LinkParams = [
  { text: _l('返回首页按钮'), value: 's' },
  { text: _l('待办'), value: 'td' },
  { text: _l('超级搜索'), value: 'ss' },
  { text: _l('消息侧边栏'), value: 'ch' },
  { text: _l('帐户'), value: 'ac' },
];

const AppLinkWrap = styled.div`
  .url {
    height: 36px;
    line-height: 36px;
    background-color: #f8f8f8;
    border-radius: 3px;
    padding: 0 10px;
    border: 1px solid #dddddd;
  }
  .linkParams,
  .copy {
    height: 36px;
    line-height: 36px;
    border-radius: 3px;
    padding: 0 17px;
    border: 1px solid #dddddd;
    margin-left: 8px;
    &:hover {
      color: #1677ff;
      border: 1px solid #1677ff;
    }
  }
`;

export default function AppLinkParamsSettings(props) {
  const { url = '', defaultHide = [] } = props;
  const [params, setParams] = useState({
    s: !_.includes(defaultHide, 's'),
    td: !_.includes(defaultHide, 'td'),
    ss: !_.includes(defaultHide, 'ss'),
    ch: !_.includes(defaultHide, 'ch'),
    ac: !_.includes(defaultHide, 'ac'),
  });
  const hideCon = LinkParams.filter(({ value }) => !params[value]).map(item => item.text);
  const hasParams = url.indexOf('?') > -1;
  const paramStr = _.reduce(
    LinkParams.filter(({ value }) => !params[value]),
    (count, item, index) => count + `${!hasParams && index == 0 ? '?' : '&'}${item.value}=no`,
    '',
  );
  const appLinkUrl = url + paramStr;

  return (
    <Fragment>
      <AppLinkWrap className="flexRow">
        <div className="url flex flexRow">
          <div className="flex ellipsis" title={appLinkUrl}>
            {appLinkUrl}
          </div>
          <Tooltip popupPlacement="bottom" text={<span>{_l('新窗口打开')}</span>}>
            <span className="Font14 Gray_9d mLeft6 hoverText" onClick={() => window.open(appLinkUrl)}>
              <i className="icon icon-task-new-detail" />
            </span>
          </Tooltip>
        </div>
        <Trigger
          action={['hover']}
          popupAlign={{
            points: ['tr', 'br'],
            offset: [66, 0],
            overflow: { adjustX: true, adjustY: true },
          }}
          popup={
            <LinkParamSettings>
              {LinkParams.map((item, index) => {
                const { text, value } = item;

                return (
                  <div className={cx({ mBottom15: index < LinkParams.length - 1 })}>
                    <Checkbox
                      key={value}
                      checked={params[value]}
                      text={text}
                      onClick={checked => setParams({ ...params, [value]: !checked })}
                    />
                  </div>
                );
              })}
            </LinkParamSettings>
          }
        >
          <div className="linkParams Hand">{_l('链接参数')}</div>
        </Trigger>
        <div
          className="copy Hand"
          onClick={() => {
            copy(appLinkUrl);
            alert(_l('复制成功'));
          }}
        >
          {_l('复制')}
        </div>
      </AppLinkWrap>
      {!_.isEmpty(hideCon) && (
        <div className="Gray_75 mTop10">
          {_l('已隐藏：')}
          {hideCon.join('、')}
        </div>
      )}
    </Fragment>
  );
}
