import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { useSetState } from 'react-use';
import ConnectParam from '../../components/ConnectParam';
import ConnectAuth from '../../components/ConnectAuth';
import { LoadDiv, Icon } from 'ming-ui';
const Wrap = styled.div``;

//连接设置
function ConnectSet(props) {
  const [{ data1, data2, loading }, setState] = useSetState({
    data1: {},
    data2: {},
    loading: true,
  });
  useEffect(() => {
    setState({
      data1: props.flowNodeMap && props.startEventId ? props.flowNodeMap[props.startEventId] : null,
      data2:
        props.flowNodeMap && props.startEventId
          ? props.flowNodeMap[props.flowNodeMap[props.startEventId].nextId]
          : null,
      loading: false,
    });
  }, []);
  if (loading) {
    return <LoadDiv />;
  }
  return (
    <Wrap className="flexColumn">
      <ConnectParam
        {...props}
        id={props.id}
        node={data1}
        connectType={props.connectType}
        onChange={v => {
          setState({ data1: { ...data1, ...v } });
          props.hasChange();
        }}
        canEdit={props.isConnectOwner}
      />
      {data2.appType !== 30 && (
        <React.Fragment>
          <Icon icon={'arrow'} className="Font24 TxtCenter InlineBlock" style={{ color: '#ddd' }} />
          <ConnectAuth
            {...props}
            id={props.id}
            node={data2}
            connectType={props.connectType}
            onChange={v => {
              setState({ data2: { ...data2, ...v } });
              props.hasChange();
            }}
            canEdit={props.isConnectOwner}
          />
        </React.Fragment>
      )}
    </Wrap>
  );
}

export default ConnectSet;
