import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { ACTION_LIST, JOIN_TYPE, NODE_TYPE_LIST, UNION_TYPE_LIST } from '../config';

export default function Des(props) {
  const [{ nodeData, isAct }, setState] = useSetState({
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

  const renderDes = () => {
    let txt = '';
    switch (nodeData.nodeType) {
      case 'UNION':
        txt = (UNION_TYPE_LIST.find(o => o.type === (_.get(nodeData, 'nodeConfig.config.unionType') || 'UNION')) || {})
          .txt;
        break;
      case 'JOIN':
        txt = (JOIN_TYPE.find(o => o.type === (_.get(nodeData, 'nodeConfig.config.joinType') || 'INNER_JOIN')) || {})
          .txt;
        break;
      case 'FILTER':
        let items = _.get(nodeData, 'nodeConfig.config.items') || [];
        let data = [];
        (items || []).map(o => {
          if (o.isGroup) {
            data = [...data, ...o.groupFilters];
          } else {
            data = [...data, o];
          }
        });
        items = data.filter(o => !!o);
        if (items.length > 0) {
          txt = _l('%0个筛选条件', items.length);
        } else {
          txt = <span className="ThemeColor3">{_l('设置此节点')}</span>;
        }
        break;
      case 'AGGREGATE':
        let groupFields = _.get(nodeData, 'nodeConfig.config.groupFields') || [];
        let aggregateFields = _.get(nodeData, 'nodeConfig.config.aggregateFields') || [];
        if (groupFields.length > 0 && aggregateFields.length > 0) {
          txt = _l('分类 %0个字段，汇总 %1个字段', groupFields.length, aggregateFields.length);
        } else if (groupFields.length > 0) {
          txt = _l('分类 %0个字段', groupFields.length);
        } else if (aggregateFields.length > 0) {
          txt = _l('汇总 %0个字段', aggregateFields.length);
        }
        break;
    }
    if (!txt) {
      if (props.showEdit) {
        return <div className="des Font12 ThemeColor3 overflow_ellipsis WordBreak"> {_l('设置此节点')}</div>;
      } else {
        return '';
      }
    }
    return <div className={`des overflow_ellipsis WordBreak ${props.className}`}>{txt}</div>;
  };
  if (isAct) {
    return renderDes();
  }
  let tableName = _.get(nodeData, 'nodeConfig.config.tableName');
  return tableName ? ( //工作表名称
    <div className={`des overflow_ellipsis WordBreak ${props.className}`}>{tableName}</div>
  ) : (
    ''
  );
}
