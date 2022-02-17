import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getSmsSignatrue } from 'src/api/externalPortal';
import { getStringBytes } from 'src/util';
import _ from 'lodash';
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
`;

let preSign = '';
export default function TextMessage(props) {
  const { appId, projectId = '' } = props;
  const [sign, setSign] = useState(''); //签名

  const getStrBytesLength = (str = '', bytesLength = 16) => {
    let result = '';
    let strlen = str.length; // 字符串长度
    let chrlen = str.replace(/[^\x00-\xff]/g, '**').length; // 字节长度
    if (chrlen <= bytesLength) {
      return str;
    }
    for (let i = 0, j = 0; i < strlen; i++) {
      let chr = str.charAt(i);
      if (/[\x00-\xff]/.test(chr)) {
        j++;
      } else {
        j += 2;
      }
      if (j <= bytesLength) {
        result += chr;
      } else {
        return result;
      }
    }
  };

  useEffect(() => {
    getSmsSignatrue({ appId }).then(res => {
      let mdSign = getStrBytesLength(
        ((_.get(md, ['global', 'Account', 'projects']) || []).find(o => o.projectId === projectId) || {}).companyName,
      );
      setSign(res || mdSign);
    });
  }, []);

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
              return alert(_l('请输入签名'));
            }
            if (!/^[\u4E00-\u9FA5A-Za-z]+$/.test(e.target.value)) {
              return alert(_l('只支持中英文'));
            }
            if (getStringBytes(e.target.value) > 16) {
              setSign(getStrBytesLength(e.target.value));
              return alert(_l('最多只能16个字节'));
            }
          }}
          onChange={e => {
            props.hasChange();
            setSign(e.target.value.trim());
          }}
        />
      </div>
      {props.footor &&
        props.footor({
          appId,
          smsSignature: sign,
        })}
    </Wrap>
  );
}
