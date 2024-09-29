import React, { useState, useEffect, useRef } from 'react';
import { Icon, Tooltip } from 'ming-ui';
import { useSetState } from 'react-use';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { WrapBtn } from 'src/pages/integration/apiIntegration/style.js';
import Item from 'src/pages/integration/apiIntegration/APIWrap/Item.jsx';
import { Wrap } from './style';

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
        <Tooltip
          popupPlacement="bottom"
          text={<span>{_l('可对前面节点输出的数据做处理，以供后面节点使用，如加密、解密等')}</span>}
        >
          <Icon icon="info_outline" className="Gray_bd Font16 mLeft5" />
        </Tooltip>
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
        onCancel={() => {
          setState({
            newPreId: props.node.typeId,
          });
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
