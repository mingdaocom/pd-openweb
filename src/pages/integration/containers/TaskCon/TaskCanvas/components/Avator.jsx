import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { NODE_TYPE_LIST, ACTION_LIST, JOIN_TYPE, UNION_TYPE_LIST } from '../config';
import _ from 'lodash';
import cx from 'classnames';
const Wrap = styled.div(
  ({ width, height }) => `{
    text-align: center;
    width: ${width || 28}px;
    height: ${height || 28}px;
    line-height: 28px;
    position: relative;
    .iconImg {
      width: 100%;
      height: 100%;
    }
    i {
      z-index: 1;
    }
    .bg {
      width: 100%;
      height: 100%;
      opacity: 0.08;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
    }
    &.defaultImg {
      color: #fff;
      // background: #dddddd;
      svg{
        width:28px;
        height:28px;
      }
    }
  }
`,
);
export default function Avator(props) {
  const { width, height } = props;
  const [{ nodeData, isAct, defaultInfo }, setState] = useSetState({
    nodeData: props.nodeData,
    isAct: ACTION_LIST.map(o => o.type).includes(props.nodeData.nodeType),
    defaultInfo: NODE_TYPE_LIST.find(it => it.nodeType === props.nodeData.nodeType),
  });
  useEffect(() => {
    const { nodeData } = props;
    setState({
      nodeData,
      isAct: ACTION_LIST.map(o => o.type).includes(nodeData.nodeType),
      defaultInfo: NODE_TYPE_LIST.find(it => it.nodeType === nodeData.nodeType),
    });
  }, [props.nodeData]);
  return isAct ? (
    <Wrap className="iconCon flexColumn justifyContentCenter mLeft10">
      {nodeData.nodeType === 'UNION' ? (
        <div
          className={cx(
            `iconImg ${
              UNION_TYPE_LIST.find(o => o.type === (_.get(nodeData, ['nodeConfig', 'config', 'unionType']) || 'UNION'))
                .img
            }`,
          )}
        ></div>
      ) : nodeData.nodeType === 'JOIN' ? (
        <div
          className={cx(
            `iconImg ${
              JOIN_TYPE.find(o => o.type === (_.get(nodeData, ['nodeConfig', 'config', 'joinType']) || 'INNER_JOIN'))
                .img
            }`,
          )}
        ></div>
      ) : (
        <Icon className="Font28 Gray_75 flex flexColumn justifyContentCenter" type={defaultInfo.icon} />
      )}
    </Wrap>
  ) : (
    //源｜目的地 有配置
    <Wrap
      className="iconCon defaultImg flexRow alignItemsCenter justifyContentCenter"
      style={{
        width: '58px',
        height: '100%',
        color: nodeData.color,
        background: _.get(nodeData, ['nodeConfig', 'config', 'iconBgColor']) || '#dddddd',
      }}
    >
      <div className="bg"></div>
      {!_.get(nodeData, ['nodeConfig', 'config', 'className']) ? (
        <Icon
          className="Font28 flex"
          type={nodeData.icon || NODE_TYPE_LIST.find(o => o.nodeType === nodeData.nodeType).icon}
        />
      ) : (
        <svg className="icon svg-icon" aria-hidden="true">
          <use xlinkHref={`#icon${_.get(nodeData, ['nodeConfig', 'config', 'className'])}`}></use>
        </svg>
      )}
    </Wrap>
  );
}
