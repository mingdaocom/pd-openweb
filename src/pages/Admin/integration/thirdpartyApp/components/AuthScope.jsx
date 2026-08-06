import React from 'react';
import styled from 'styled-components';
import ApiScopeList from 'src/pages/Admin/components/ApiScopeList';

const AuthScopeWrap = styled.div`
  flex: 1;
  min-height: 0;
  padding: 18px 0 18px 16px;
  overflow: hidden;
`;

export default function AuthScope(props) {
  const { scopes = [], scopeCodes = [] } = props;

  return (
    <AuthScopeWrap className="h100 flexColumn">
      <div>{_l('权限')}</div>
      <ApiScopeList scopes={scopes} codes={scopeCodes} className="pRight16" />
    </AuthScopeWrap>
  );
}
