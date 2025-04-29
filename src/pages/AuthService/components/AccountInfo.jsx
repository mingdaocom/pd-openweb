import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import AjaxLogin from 'src/api/login.js';
import { useSetState } from 'react-use';
import { getRequest } from 'src/util';

const Wrap = styled.div`
  .userAvatar {
    width: 44px;
    height: 44px;
    border: 1px solid #707070;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 50%;
  }
`;

const types = {
  1: _l('微信'),
  2: 'QQ',
  13: 'Google',
  14: 'Microsoft'
};
export default function (props) {
  const [{ loading, name, avatar }, setState] = useSetState({ loading: true, name: '', avatar: '' });
  useEffect(() => {
    const { unionId, state, tpType } = getRequest();
    AjaxLogin.getTPUserInfo({
      unionId,
      state,
      tpType,
    }).then(res => setState({ ...res, loading: false }));
  }, []);
  if (loading) return '';
  const { tpType } = getRequest();
  const str = types[tpType] || _l('平台');
  return (
    <Wrap className="flexRow mTop20">
      <div className="flex">
        <div className="Gray_75 Font14 Bold">{_l('并绑定您的%0账号', str)}</div>
        {name && <div className="Gray Font18 Bold">{name}</div>}
      </div>
      {avatar && <div className="userAvatar" style={{ backgroundImage: `url(${avatar})` }} />}
    </Wrap>
  );
}
