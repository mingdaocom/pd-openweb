import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import Card from '../components/Card';
import { useSetState } from 'react-use';
import InstallDialog from '../components/InstallDialog';

import { LoadDiv } from 'ming-ui';
const Wrap = styled.div`
  padding: 33px 50px;
  max-width: 1600px;
  @media screen and (min-width: 1600px) {
    // padding: 33px 0;
  }
  margin: 0 auto;
  .lib {
    margin: 0 auto;
  }
`;

function ConnectLib(props) {
  const [{ show, info }, setState] = useSetState({
    show: false,
    info: {},
  });
  if (props.loading && props.pageIndex <= 1) {
    return <LoadDiv />;
  }
  return (
    <Wrap>
      <h5 className="Bold Font17">{_l('API 库')}</h5>
      <div className="lib">
        {props.list.length <= 0 && <p className="TxtCenter Gray_9e mTop20">{_l('暂无相关数据')}</p>}
        {props.list.map((o, i) => {
          return (
            <Card
              {...props}
              {...o}
              w={(props.width >= 1600 ? 1600 : props.width) - 50 * 2} //max-width: 1600px; padding: 33px 50px;
              i={i + 1}
              onClick={() => {
                setState({ show: true, info: o });
              }}
            />
          );
        })}
        {props.loading && props.pageIndex > 1 && <LoadDiv />}
        {show && (
          <InstallDialog
            info={info}
            onCancel={() => {
              setState({ show: false, info: {} });
            }}
            callback={id => {
              props.onShowConnect(id);
              setState({ show: false, info: {} });
            }}
          />
        )}
      </div>
    </Wrap>
  );
}
export default ConnectLib;
