import React, { useState, useEffect } from 'react';
import { Dropdown } from 'ming-ui';
import oauth2 from '../../../../api/oauth2';
import styled from 'styled-components';

const DropdownBox = styled(Dropdown)`
  min-width: 0;
  width: 100%;
  .Dropdown--border {
    padding: 5px 10px;
    border-color: #ddd;
  }
  .value {
    display: inline-flex;
    align-items: center;
  }
  .ming.Menu {
    width: 100%;
  }
`;

export default ({ className, authId, connectId, apiId, required = false, onChange = () => {} }) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    oauth2.getMyTokenList({ id: connectId, apiId }, { isIntegration: true }).then(res => {
      setList(res.map(o => ({ text: o.name, value: o.id })));
    });
  }, [connectId, apiId]);

  return (
    <div className={className}>
      <div className="Font13">
        {_l('选择账户')}
        {required && (
          <span className="mLeft5" style={{ color: '#f44336' }}>
            *
          </span>
        )}
      </div>
      <DropdownBox
        className="mTop10"
        data={list}
        value={authId || undefined}
        openSearch
        renderTitle={
          authId && list.length && !list.find(o => o.value === authId)
            ? () => {
                return <span style={{ color: '#f44336' }}>{_l('账户已删除')}</span>;
              }
            : null
        }
        border
        noData={_l('请先在集成中心添加账户')}
        onChange={onChange}
      />
    </div>
  );
};
