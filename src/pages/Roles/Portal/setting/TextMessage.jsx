import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getStrBytesLength } from 'src/pages/Roles/Portal/list/util';
import { getStringBytes } from 'src/util';
import { Input } from 'antd';
const { TextArea } = Input;
const Wrap = styled.div`
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
    .sign {
      width: 200px;
      height: 36px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 3px;
      padding: 0 14px;
      &:hover {
        border: 1px solid #bdbdbd;
      }
      &:focus {
        border: 1px solid #2196f3;
      }
    }
  }
  textarea {
    margin-top: 10px;
    width: 100%;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    padding: 12px;
    border-radius: 3px;
    height: 90px;
    resize: none;
  }
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: none;
    border: 1px solid #2196f3;
  }
`;

let preSign = '';
export default function TextMessage(props) {
  const { appId, projectId = '' } = props;
  let { portalSet = {}, onChangePortalSet } = props;
  const [sign, setSign] = useState(''); //签名
  const [data, setData] = useState('');
  const [focusId, setFocusId] = useState(''); //
  const [portalSetModel, setPortalSetModel] = useState({});
  const [approvedSms, setapprovedSms] = useState('');
  const [refusedSms, setrefusedSms] = useState('');
  const [inviteSms, setinviteSms] = useState('');

  useEffect(() => {
    let { portalSet = {} } = props;
    let { portalSetModel = {} } = portalSet;
    setPortalSetModel(portalSetModel);
    setSign(portalSetModel.smsSignature);
    setapprovedSms(portalSetModel.approvedSms);
    setrefusedSms(portalSetModel.refusedSms);
    setinviteSms(portalSetModel.inviteSms);
  }, [props]);

  // useEffect(() => {
  //   // let mdSign = getStrBytesLength(
  //   //   ((_.get(md, ['global', 'Account', 'projects']) || []).find(o => o.projectId === projectId) || {}).companyName,
  //   // );
  //   // setSign(portalSetModel.smsSignature);
  // }, []);
  const getStrip = n => {
    if (n > 70) {
      return Math.ceil(n / 67);
    } else {
      return 1;
    }
  };

  return (
    <Wrap>
      <div className="content">
        <h6 className="Font16 Gray Bold mBottom0">{_l('短信签名')}</h6>
        <div className="mTop6 Gray_9e">
          {_l(
            '请谨慎填写您的组织简称、网站名、品牌名，2-8个汉字。如签名不符合规范，将会被运营商拦截。此签名适用于外部门户的短信场景：邀请外部用户注册、外部用户审核（通过/拒绝）',
          )}
        </div>
        <input
          type="text"
          className="sign mTop6"
          placeholder={_l('请输入签名')}
          value={sign}
          onFocus={() => {
            preSign = sign;
          }}
          onBlur={e => {
            if (!e.target.value.trim()) {
              setSign(preSign);
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  smsSignature: preSign,
                },
              });
              return alert(_l('请输入签名'));
            }
            if (!/^[\u4E00-\u9FA5A-Za-z]+$/.test(e.target.value)) {
              return alert(_l('只支持中英文'));
            }
            if (getStringBytes(e.target.value) > 16) {
              setSign(getStrBytesLength(e.target.value));
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  smsSignature: getStrBytesLength(e.target.value),
                },
              });
              return alert(_l('最多只能16个字节'));
            }
          }}
          onChange={e => {
            setSign(e.target.value.trim());
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                smsSignature: getStrBytesLength(e.target.value.trim()),
              },
            });
          }}
        />
        <h6 className="Font16 Gray Bold mBottom0 mTop32">{_l('短信通知内容设置')}</h6>
        <div className="mTop6 Gray_9e">
          {_l(
            '注册开启审核后，审核结果（通过、拒绝）会短信告知注册用户；外部门户类型设为私有后再添加用户后也会发送邀请通知，支持对短信内容自定义；针对相应的短信会进行收费收费标准：短信0.05元/条，自动从企业账务中心扣费。70字计一条短信，超过70字以67字每条计费。每个标点、空格、英文字母都算一个字。短信实际发送可能有10-20分钟的延时。',
          )}
        </div>
        <p className=" Bold mBottom0 mTop24">
          {_l('通知：')}
          <span className="Green">{_l('审核通过')}</span>
        </p>
        <TextArea
          id="1"
          autoSize
          minHeight={36}
          value={focusId !== 1 ? `[${sign}]${approvedSms || ''}` : approvedSms || ''}
          onChange={e => {
            setapprovedSms(e.target.value);
          }}
          onBlur={e => {
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                approvedSms: e.target.value,
              },
            });
            setFocusId(0);
          }}
          onFocus={() => {
            setFocusId(1);
          }}
          className="Block "
        />
        <p className="Gray_9e mTop10">
          {_l(
            '已输入 %0  个字（含签名），按 %1 条计费',
            `[${sign}]${approvedSms || ''}`.length,
            getStrip(`[${sign}]${approvedSms || ''}`.length),
          )}
        </p>
        <p className=" Bold mBottom0 mTop24">
          {_l('通知：')}
          <span className="Red">{_l('审核拒绝')}</span>
        </p>

        <TextArea
          id="2"
          autoSize
          minHeight={36}
          value={focusId !== 2 ? `[${sign}]${refusedSms || ''}` : refusedSms || ''}
          onChange={e => {
            setrefusedSms(e.target.value);
          }}
          onBlur={e => {
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                refusedSms: e.target.value,
              },
            });
            setFocusId(0);
          }}
          onFocus={() => {
            setFocusId(2);
          }}
          className="Block "
        />
        <p className="Gray_9e mTop10">
          {_l(
            '已输入 %0  个字（含签名），按 %1 条计费',
            `[${sign}]${refusedSms || ''}`.length,
            getStrip(`[${sign}]${refusedSms || ''}`.length),
          )}
        </p>
        <p className=" Bold mBottom0 mTop24">{_l('邀请用户注册')}</p>
        <TextArea
          autoSize
          id="3"
          minHeight={36}
          value={focusId !== 3 ? `[${sign}]${inviteSms || ''}` : inviteSms || ''}
          onChange={e => {
            setinviteSms(e.target.value);
          }}
          onBlur={e => {
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                inviteSms: e.target.value,
              },
            });
            setFocusId(0);
          }}
          onFocus={() => {
            setFocusId(3);
          }}
          className="Block "
        />
        <p className="Gray_9e mTop10">
          {_l(
            '已输入 %0  个字（含签名），按 %1 条计费',
            `[${sign}]${inviteSms || ''}`.length,
            getStrip(`[${sign}]${inviteSms || ''}`.length),
          )}
        </p>
      </div>
    </Wrap>
  );
}
