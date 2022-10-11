import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { checkCreateCompany } from 'src/api/register';

const Abnormal = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 450px;
  font-size: 15px;
  color: #555;
  > i {
    font-size: 66px;
    color: #f78c00;
  }
`;
export default function createPermissionCheckWrapper(Comp) {
  return function (props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    useEffect(() => {
      checkCreateCompany().then(able => {
        if (able) {
          setLoading(false);
        } else {
          setError(
            _l('抱歉，操作过于频繁或者创建的组织已经达到上限，请升级版本！'),
          );
          setLoading(false);
        }
      });
    }, []);
    if (loading) {
      return <span />;
    }
    if (error) {
      return (
        <Abnormal>
          <i className="icon-task-folder-message"></i>
          <div className="mTop10">{error}</div>
        </Abnormal>
      );
    }
    return <Comp {...props} />;
  };
}
