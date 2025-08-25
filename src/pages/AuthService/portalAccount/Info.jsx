import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import { browserIsMobile } from 'src/utils/common';
import { accountResultAction, setAutoLoginKey, statusList } from './util';

const Wrap = styled.div`
  .Hide {
    display: none;
  }
  img {
    max-width: 100%;
    object-fit: contain;
  }
  overflow: auto;
  padding: 64px 48px;
  box-sizing: border-box;
  width: 50%;
  max-width: 840px;
  min-width: 360px;
  height: 100%;
  background: #fff;
  .logoImageUrlIcon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    div {
      height: 28px;
    }
  }
  p {
    margin: 0;
    padding: 0;
  }
  .messageConBox {
    // max-width: 600px;
    margin: 0 auto;
  }
  &.isCenterCon {
    padding: 24px 32px;
    border-radius: 4px;
    margin: 32px auto;
    min-width: 800px;
    background: #ffffff;
    height: auto;
    box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.16);
    overflow: auto;
    .messageConBox {
      // max-width: 600px;
    }
  }
  &.isR {
    margin: 0 0 0 auto;
  }
  &.isM {
    position: relative;
    margin: 10px auto;
    border-radius: 4px;
    width: 95%;
    min-width: 95%;
    padding: 48px 24px 23px;
    .messageConBox {
      margin: 0 auto;
    }
  }
  .send {
    background: #1677ff;
    height: 40px;
    border-radius: 4px;
    line-height: 40px;
    color: #fff;
    max-width: 120px;
    margin: 0 auto;
    &:hover {
      background: #0f82dd;
    }
  }
`;

export default function Info(props) {
  const [loading, setLoading] = useState(true);
  const {
    pageMode = 3,
    logoImageUrl,
    appId,
    accountId = '',

    state = '',
    setStatus,
    isAutoLogin,
    autoLogin,
    registerMode = {},
  } = props;
  const [sending, setSending] = useState(false); //点击
  const [cells, setCells] = useState([]);
  const [Components, setComponents] = useState(null);
  const customwidget = useRef(null);
  useEffect(() => {
    externalPortalAjax
      .getUserCollect({
        appId,
        exAccountId: accountId,
        lang: getCurrentLangCode(),
      })
      .then(res => {
        res = res.map(o => {
          if (o.type === 36) {
            //检查框默认值处理
            let defsource = _.get(o, ['advancedSetting', 'defsource']);
            try {
              defsource = safeParse(defsource, 'array')[0] || {};
            } catch (error) {
              console.log(error);
              defsource = {};
            }
            let { staticValue = '' } = defsource;
            return { ...o, value: staticValue || o.value };
          } else if (o.type === 29) {
            return { ...o, enumDefault2: 1 };
          } else {
            return o;
          }
        });
        setCells(res);
        setLoading(false);
      });

    import('src/components/newCustomFields').then(res => {
      setComponents(res);
    });
  }, []);
  const onLogin = data => {
    setSending(true);
    window.clientId = '';
    sessionStorage.removeItem('clientId');
    setTimeout(() => {
      externalPortalAjax
        .infoLogin(
          {
            state,
            receiveControls: data.map(c => formatControlToServer(c, { isNewRecord: true })),
            autoLogin: autoLogin && isAutoLogin,
          },
          props.customLink ? { ajaxOptions: { header: { 'Ex-custom-link-path': props.customLink } } } : {},
        )
        .then(res => {
          setSending(false);
          setAutoLoginKey({ ...res, appId });
          // accountResult 为1则代表正常登录，会返回sessoinId，accountId，appId，projectId，正常进行登录转跳即可；accountResult 为3代表待审核
          const { accountResult } = res;
          if (statusList.includes(accountResult)) {
            setStatus(accountResult);
          } else if ([20].includes(accountResult)) {
            return alert(
              registerMode.email && registerMode.phone
                ? _l('手机号/邮箱或者验证码错误！')
                : registerMode.phone
                  ? _l('手机号或者验证码错误')
                  : _l('邮箱或者验证码错误'),
              3,
            );
          } else {
            accountResultAction(res, props.customLink);
          }
        });
    }, 500);
  };
  return (
    <Wrap
      className={cx('infoCon', {
        isCenterCon: pageMode === 3,
        isR: pageMode === 6 && !browserIsMobile(),
        isM: browserIsMobile(),
      })}
    >
      {loading || !Components ? (
        <LoadDiv className="" style={{ margin: '50px auto' }} />
      ) : (
        <React.Fragment>
          {logoImageUrl ? <img src={logoImageUrl} height={48} /> : ''}
          <h6 className="Font26 Bold mTop20">{_l('请继续完善信息')}</h6>
          <div className="messageConBox">
            <Components.default data={cells} ref={customwidget} disableRules />
          </div>
          <div
            className={cx('send mTop32 TxtCenter Hand')}
            onClick={() => {
              if (sending) {
                return;
              }
              let { data = [], hasError } = customwidget.current.getSubmitData();
              if (data.find(o => o.type === 29 && safeParse(o.value, 'array').length > 5)) {
                alert(_l('最多只能关联 5 条记录'), 3);
                return;
              }
              if (hasError) {
                return;
              }
              onLogin(data);
            }}
          >
            {_l('提交')}
            {sending ? '...' : ''}
          </div>
        </React.Fragment>
      )}
    </Wrap>
  );
}
