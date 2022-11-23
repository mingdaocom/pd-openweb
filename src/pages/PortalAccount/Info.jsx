import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import { LoadDiv } from 'ming-ui';
import { getUserCollect, infoLogin } from 'src/api/externalPortal';
import { accountResultAction, setAutoLoginKey } from './util';
import { statusList } from './util';
import SvgIcon from 'src/components/SvgIcon';
import CustomFields from 'src/components/newCustomFields';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';

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
    background: #2196f3;
    height: 40px;
    border-radius: 4px;
    line-height: 40px;
    color: #fff;
    max-width: 120px;
    margin: 0 auto;
    &:hover {
      background: #0f82dd;
    }
    &.sending {
      background: #f5f5f5;
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
    account,
    state = '',
    setStatus,
    appColor = '#00bcd4',
    appLogoUrl = 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg',
    isAutoLogin,
    registerMode = {},
  } = props;
  const [sending, setSending] = useState(false); //点击
  const [cells, setCells] = useState([]);
  const customwidget = useRef(null);
  useEffect(() => {
    getUserCollect({
      appId,
      exAccountId: accountId,
    }).then(res => {
      res = res.map(o => {
        if (o.type === 36) {
          //检查框默认值处理
          let defsource = _.get(o, ['advancedSetting', 'defsource']);
          try {
            defsource = JSON.parse(defsource)[0];
          } catch (error) {
            defsource = {};
          }
          let { staticValue = '' } = defsource;
          return { ...o, value: staticValue || o.value };
        } else {
          return o;
        }
      });
      setCells(res);
      setLoading(false);
    });
  }, []);
  return (
    <Wrap
      className={cx('infoCon', {
        isCenterCon: pageMode === 3,
        isR: pageMode === 6 && !browserIsMobile(),
        isM: browserIsMobile(),
      })}
    >
      {loading || !CustomFields ? (
        <LoadDiv className="" style={{ margin: '50px auto' }} />
      ) : (
        <React.Fragment>
          {logoImageUrl ? (
            <img src={logoImageUrl} height={48} />
          ) : appColor && appLogoUrl ? (
            <span className={cx('logoImageUrlIcon')} style={{ backgroundColor: appColor }}>
              <SvgIcon url={appLogoUrl} fill={'#fff'} size={28} />
            </span>
          ) : (
            ''
          )}
          <h6 className="Font26 Bold mTop20">{_l('请继续完善信息')}</h6>
          <div className="messageConBox">
            <CustomFields data={cells} ref={customwidget} disableRules />
          </div>
          <div
            className={cx('send mTop32 TxtCenter Hand', sending)}
            onClick={() => {
              if (sending) {
                return;
              }
              let { data, hasError } = customwidget.current.getSubmitData();
              if (hasError) {
                return;
              }
              infoLogin({
                state,
                receiveControls: data.map(formatControlToServer),
                autoLogin: isAutoLogin,
              }).then(res => {
                setAutoLoginKey({ ...res, appId });
                // accountResult 为1则代表正常登录，会返回sessoinId，accountId，appId，projectId，正常进行登录转跳即可；accountResult 为3代表待审核
                const { accountResult, sessionId, accountId, projectId } = res;
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
                  accountResultAction(res);
                }
              });
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
