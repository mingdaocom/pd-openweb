import React, { Fragment } from 'react';
import appManagementApi from 'src/api/appManagement';
import styled from 'styled-components';
import _ from 'lodash';

const Wrap = styled.div`
  width: 100%;
  height: 40px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 16px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: #fff;
  background-color: #585858;
`;

export default function DebugInfo({ appId, debugRoles = [] }) {
  const setDebugRoles = () => {
    appManagementApi.setDebugRoles({ appId, roleIds: [] }).then(res => {
      if (res) {
        location.reload();
      }
    });
  };

  if (_.isEmpty(debugRoles)) return null;

  return (
    <Wrap>
      <div className="flex ellipsis">
        {_l('角色调试：')}
        {debugRoles.map((r, index) => (
          <Fragment>
            {r.name}
            {index < debugRoles.length - 1 ? '、' : ''}
          </Fragment>
        ))}
      </div>
      <i className="icon-exit Hand Font16 mLeft5" onClick={setDebugRoles} />
    </Wrap>
  );
}
