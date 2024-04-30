import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { useSetState } from 'react-use';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { WrapBtn } from 'src/pages/integration/apiIntegration/style.js';
import Item from 'src/pages/integration/apiIntegration/APIWrap/Item.jsx';

const Wrap = styled.div`
  p {
    margin: 0;
  }
  .Bold400 {
    font-weight: 400;
  }
  .Green_right {
    color: #4caf50;
  }
  .iconCon {
    width: 44px;
    height: 44px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    position: relative;
    text-align: center;
    line-height: 50px;
  }
  width: 880px;
  margin: 0 auto;
  background: #ffffff;
  // border: 1px solid #dddddd;
  border-radius: 10px;
  .con {
    padding: 20px 24px;
    .title {
      width: 130px;
      padding-right: 20px;
    }
  }
  .workflowSettings {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
  .line {
    padding: 10px 0;
    border-bottom: 1px solid #f2f2f2;
  }
  .btn {
    &.disable {
      background: #f5f5f5;
      color: #bdbdbd;
      border: 1px solid #bdbdbd;
    }
  }
`;
function AddNode(props) {
  const featureType = getFeatureStatus(localStorage.getItem('currentProjectId'), VersionProductType.codeBlockNode);
  if (!props.canEdit || !featureType) {
    return '';
  }
  return (
    <React.Fragment>
      <WrapBtn
        className="Hand flexRow alignItemsCenter"
        onClick={() => {
          if (featureType === '2') {
            buriedUpgradeVersionDialog(localStorage.getItem('currentProjectId'), VersionProductType.codeBlockNode);
            return;
          }
          props.onAdd();
        }}
      >
        <Icon icon="worksheet_API" className="Font17" />
        <span className="mLeft3">{_l('插入代码')}</span>
      </WrapBtn>
    </React.Fragment>
  );
}

//连接代码块
function ConnectItem(props) {
  const [{ newPreId }, setState] = useSetState({
    newPreId: props.node.typeId,
  });
  useEffect(() => {
    setState({
      newPreId: props.node.typeId,
    });
  }, [props.node]);

  if (!newPreId) {
    return (
      <AddNode
        {...props}
        onAdd={() => {
          setState({
            newPreId: 14, //node.typeId
          });
        }}
      />
    );
  }
  return (
    <Wrap className={props.className}>
      <Item
        {...props}
        nodeInfo={props.node}
        hasChange={() => {
          props.onChange();
        }}
        maxW="auto"
        isNew={!props.node.id}
        des={_l('编写代码对连接参数进行处理后用于鉴权认证')}
        canEdit={props.canEdit}
        title={_l('代码块')}
        icon={'worksheet_API'}
        support={'https://help.mingdao.com/integration/api#enter-parameters'}
      />
    </Wrap>
  );
}

export default ConnectItem;
