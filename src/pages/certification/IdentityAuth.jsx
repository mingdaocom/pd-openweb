import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Icon, Input, LoadDiv } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import certificationApi from 'src/api/certification';
import preall from 'src/common/preall';
import { getRequest } from 'src/utils/common';
import { encrypt } from 'src/utils/common';
import { RESULT_TYPES, VERIFY_STATUS } from './constant';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  .tips {
    width: 100%;
    padding: 16px 24px;
    background: rgba(33, 150, 243, 0.03);
  }
  .paddingInline24 {
    padding: 0 24px;
  }
  .labelText {
    color: #757575;
    font-weight: 600;
    margin-bottom: 10px;
    margin-top: 24px;
  }
  .icon-check_circle1 {
    color: #1eaf08;
  }
  .icon-info {
    color: #fb0;
  }
  .nextBtn {
    height: 44px;
    line-height: 44px;
    border-radius: 25px !important;
    font-size: 15px;

    &.Button--disabled {
      background: #6dc5fd !important;
    }
  }
`;

function IdentityAuth() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [status, setStatus] = useState(VERIFY_STATUS.LOADING);
  const [token, setToken] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const { code, certState, certToken } = getRequest() || {};

  const handleFocus = e => {
    e.preventDefault();
    setTimeout(() => {
      e.target.focus();
    }, 200);
  };

  useEffect(() => {
    if (code !== undefined) {
      if (parseInt(code) === 0) {
        certificationApi.personalFaceCert({ token: certToken }).then(data => {
          if (data === 1) {
            setStatus(VERIFY_STATUS.SUCCESS);
          } else {
            setStatus(VERIFY_STATUS.NORMAL);
            alert(RESULT_TYPES[data] || _l('认证失败'), 2);
          }
        });
      } else {
        setTimeout(() => {
          alert(_l('认证失败'), 2);
          setStatus(VERIFY_STATUS.NORMAL);
        }, 500);
      }
    } else {
      certificationApi.getFaceCertToken({ state: certState }).then(res => {
        if (res.status === 1) {
          setToken(res.token);
          setStatus(VERIFY_STATUS.NORMAL);
        } else {
          setStatus(VERIFY_STATUS.RE_SCAN);
        }
      });
    }

    const handleShow = () => setSubmitLoading(false);
    window.addEventListener('pageshow', handleShow);

    return () => {
      window.removeEventListener('pageshow', handleShow);
    };
  }, []);

  const onGetFaceCertUrl = (captchaData = {}) => {
    if (!_.isEmpty(captchaData) && captchaData.ret !== 0) {
      setSubmitLoading(false);
      return;
    }

    certificationApi
      .getAdvFaceCertUrl({
        personalInfo: { fullName: encrypt(fullName), idNumber: encrypt(idNumber) },
        ticket: captchaData.ticket,
        randStr: captchaData.randstr,
        captchaType: md.global.getCaptchaType(),
        token: certToken || token,
      })
      .then(res => {
        switch (res.code) {
          case -1:
            setStatus(VERIFY_STATUS.RE_SCAN);
            break;
          case 0:
            location.href = res.url;
            break;
          case 1:
            new captcha(onGetFaceCertUrl, isOk => {
              if (isOk) return;
              setSubmitLoading(false);
            });
            break;
          case 2:
            alert(_l('图形验证码错误'), 2);
            break;
          case 3:
            alert(_l('今天人脸识别次数已用完'), 2);
            break;
          case 5:
            alert(_l('操作频繁，5分钟后再试'), 2);
            break;
          default:
            alert(_l('人脸识别链接获取失败'), 2);
            break;
        }
        ![0, 1].includes(res.code) && setSubmitLoading(false);
      })
      .catch(() => setSubmitLoading(false));
  };

  const onNext = () => {
    if (!fullName.trim()) {
      alert(_l('请输入姓名'), 3);
      return;
    }

    if (!idNumber.trim()) {
      alert(_l('请输入身份证号'), 3);
      return;
    }

    if (!/^[1-9]\d{5}(18|19|20|21)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idNumber)) {
      alert(_l('请输入有效的身份证号'), 3);
      return;
    }

    setSubmitLoading(true);
    onGetFaceCertUrl();
  };

  return status === VERIFY_STATUS.NORMAL ? (
    <Wrapper>
      <div className="tips">
        {_l(
          '请您填写本人正确的身份信息，系统会自动验证人脸同时保证您的隐私安全，若信息正确但未能有效通过认证，可联系在线客服或专属顾问。',
        )}
      </div>
      <div className="flex paddingInline24">
        <div className="labelText mTop32">{_l('姓名')}</div>
        <Input
          className="w100"
          placeholder={_l('请输入姓名')}
          value={fullName}
          onChange={value => setFullName(value)}
          onTouchStart={handleFocus}
        />
        <div className="labelText">{_l('身份证号')}</div>
        <Input
          className="w100"
          placeholder={_l('请输入身份证号')}
          value={idNumber}
          onChange={value => setIdNumber(value)}
          onTouchStart={handleFocus}
        />
      </div>
      <div className="paddingInline24 mBottom24">
        <Button fullWidth radius className="nextBtn" disabled={submitLoading} onClick={onNext}>
          {submitLoading ? _l('正在发起验证，请稍后…') : _l('下一步')}
        </Button>
      </div>
    </Wrapper>
  ) : (
    <Wrapper className="justifyContentCenter alignItemsCenter">
      {status === VERIFY_STATUS.LOADING ? (
        <LoadDiv />
      ) : (
        <React.Fragment>
          <Icon icon={status === VERIFY_STATUS.SUCCESS ? 'check_circle1' : 'info'} className="Font64" />
          <div className="mTop32 Font20 bold">
            {status === VERIFY_STATUS.SUCCESS ? _l('个人认证已通过') : _l('二维码已失效，请刷新后重新扫码')}
          </div>
        </React.Fragment>
      )}
    </Wrapper>
  );
}

const WrappedComp = preall(IdentityAuth, { allowNotLogin: true });
const root = createRoot(document.querySelector('#app'));

root.render(<WrappedComp />);
