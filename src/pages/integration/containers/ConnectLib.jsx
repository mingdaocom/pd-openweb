import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import Card from '../components/Card';
import { useSetState } from 'react-use';
import InstallDialog from '../components/InstallDialog';

import { LoadDiv } from 'ming-ui';
const Wrap = styled.div`
  .lib {
    margin: 0 auto;
  }
  .noData {
    .iconCon {
      width: 130px;
      height: 130px;
      line-height: 130px;
      background: #f5f5f5;
      border-radius: 50%;
      margin: 120px auto 0;
      color: #9e9e9e;
    }
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
      <div className="lib mTop24">
        {props.list.length <= 0 && (
          <div className="noData TxtCenter">
            <span className="iconCon InlineBlock TxtCenter ">
              <i className={`icon-connect Font64 TxtMiddle`} />
            </span>
            <p className="Gray_9e mTop20 mBottom0">
              {props.keywords ? _l('未搜索到API，换个关键词试试吧') : _l('暂无相关数据')}
            </p>
          </div>
        )}
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
