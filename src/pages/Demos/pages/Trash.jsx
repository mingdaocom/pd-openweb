import React, { Fragment, useRef, useState } from 'react';
import { VerifyPasswordConfirm } from 'ming-ui';
import AppTrash from 'src/pages/worksheet/common/Trash/AppTrash';
import AppItemTrash from 'src/pages/worksheet/common/Trash/AppItemTrash';
import styled from 'styled-components';

const Con = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
`;

export default function D(props) {
  return (
    <Con>
      {/* <button
        onClick={() => {
          VerifyPasswordConfirm.confirm({
            title: (
              <div className="Bold" style={{ color: '#f44336' }}>
                <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }}></i>
                {_l('删除应用 “%0”', 'test')}
              </div>
            ),
            description: (
              <div className="Font14 Gray_75">
                {_l('应用为极其重要的数据，彻底删除应用数据时需要验证身份。彻底删除该数据后，将无法恢复。')}
              </div>
            ),
            passwordPlaceHolder: _l('请输入密码确认删除'),
            onOk: () => {
              console.log('OK');
            },
          });
        }}
      >
        confirm
      </button> */}
      <AppTrash />
      {/* <AppItemTrash /> */}
    </Con>
  );
}
