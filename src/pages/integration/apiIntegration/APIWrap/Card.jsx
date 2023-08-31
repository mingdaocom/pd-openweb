import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { Icon, Support, LoadDiv, Tooltip, Checkbox } from 'ming-ui';
import { useSetState } from 'react-use';
import { CardTopWrap, WrapBtn } from '../style';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import Detail from 'src/pages/workflow/WorkflowSettings/Detail';
import { FIELD_TYPE_LIST } from 'src/pages/workflow/WorkflowSettings/enum';
import { JSONAnalysis } from 'src/pages/workflow/WorkflowSettings/Detail/components';

const FIELD_TYPE = FIELD_TYPE_LIST.concat([{ text: _l('对象'), value: 10000006, en: 'object' }]);

const Wrap = styled.div`
  p {
    margin: 0;
  }
  .btn {
    margin-right: 0px;
  }
  width: 100%;
  background: #fff;
  // border: 1px solid #ebebeb;
  border-radius: 10px;
  max-width: 800px;
  margin: 0 auto 0;
  .Green_right {
    color: #4caf50;
  }
  .con {
    padding: 24px;
    border-top: 1px solid #ebebeb;
    .webhookList {
      li {
        // height: 34px;
        line-height: 34px;
        padding: 0 8px;
        &:hover {
          background: #f7f7f7;
        }
      }
      .w120 {
        width: 100px;
      }
    }
  }
  .workflowSettings {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
  .w180 {
    width: 180px;
  }
  .width100 {
    width: 100px;
  }
  .w200 {
    width: 200px;
  }
  .paramLi {
    // height: 34px;
    line-height: 34px;
    padding: 0 8px;
    &:hover {
      background: #f7f7f7;
    }
    & > div {
      flex-shrink: 0;
    }
  }
  .iconCon {
    text-align: center;
    line-height: 51px;
  }
`;

function AddNode(props) {
  const featureType = getFeatureStatus(localStorage.getItem('currentProjectId'), VersionProductType.codeBlockNode);
  if (!props.canEdit || !featureType) {
    return '';
  }
  return (
    <React.Fragment>
      <Icon icon={'arrow'} className="Font24 TxtCenter InlineBlock" style={{ color: '#ddd' }} />
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
export default function Card(props) {
  const [{ info, loading, showEdit, node, nodeInfo }, setState] = useSetState({
    info: props.info,
    node: props.nodeInfo,
    loading: true,
    showEdit: false,
  });
  useEffect(() => {
    getCardInfo();
  }, []);
  const getCardInfo = () => {
    flowNodeAjax
      .getNodeDetail(
        {
          processId: info.id,
          nodeId: node.id,
          flowNodeType: node.typeId,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({ node: { ...node, ...res }, loading: false });
      });
  };
  const update = node => {
    flowNodeAjax
      .saveNode(
        {
          ..._.pick(node, [
            'name',
            'selectNodeId',
            'sendContent',
            'body',
            'headers',
            'method',
            'contentType',
            'formControls',
            'settings',
            'testMap',
            'successCode',
            'errorMap',
            'errorMsg',
            'executeType',
          ]),
          processId: info.id,
          nodeId: node.id,
          flowNodeType: node.typeId,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({ node });
      });
  };
  if (loading) {
    return <LoadDiv />;
  }
  const getList = arr => {
    let list = [];
    const sortList = (array, source, level) => {
      var newArr = array.filter(item => {
        if (!source) {
          return !item.dataSource;
        }
        return item.dataSource === source;
      });
      newArr.map(v => {
        list.push({ ...v, level });
        sortList(array, v['controlId'], level + 1);
      });
    };
    sortList(arr, '', 0);
    return list;
  };
  const renderValue = (formulaValue, node) => {
    const arr = formulaValue.match(/\$[^ \r\n]+?\$/g);
    if (arr) {
      arr.forEach(obj => {
        formulaValue = formulaValue.replace(
          obj,
          `{${
            node.formulaMap[
              obj
                .replace(/\$/g, '')
                .split(/([a-zA-Z0-9#]{24,32})-/)
                .filter(item => item)[0]
            ].name
          }.${
            node.formulaMap[
              obj
                .replace(/\$/g, '')
                .split(/([a-zA-Z0-9#]{24,32})-/)
                .filter(item => item)[1]
            ].name
          }}`,
        );
      });
    }
    return formulaValue;
  };
  const renderCon = () => {
    const { controls = [], outputs = [] } = node || {};
    switch (props.typeId) {
      case 23:
        if (controls.length <= 0) {
          return '';
        }
        return (
          <div className="con">
            {getList(controls).map(o => {
              if ([10000007].includes((controls.find(it => it.controlId === o.dataSource) || {}).type)) {
                return null;
              }
              return (
                <div className="flexRow paramLi Hand">
                  <div className="w200 WordBreak" style={{ 'padding-left': (o.level || 0) * 20 }}>
                    <span className="WordBreak flex">{o.controlName}</span>
                    <span className="Gray_9e mLeft5 WordBreak">{o.alias}</span>
                  </div>
                  <div className="width100 Gray_75 WordBreak">{FIELD_TYPE.find(s => s.value === o.type).text}</div>
                  <div className="flex WordBreak">{o.desc}</div>
                </div>
              );
            })}
          </div>
        );
      case 8:
        if (!node.sendContent) {
          return '';
        }
        return (
          <div className="con">
            <div>
              <p className="WordBreak">{renderValue(node.sendContent + '', node)}</p>
            </div>
          </div>
        );
      case 21:
        if (outputs.length <= 0) {
          return '';
        }
        return (
          <div className="con">
            <JSONAnalysis list={outputs} json={node.json} isIntegration />
          </div>
        );
    }
  };
  const renderBtn = () => {
    const { controls = [], outputs = [] } = node || {};
    switch (props.typeId) {
      case 23:
        if (controls.length <= 0) {
          return _l('开始配置');
        }
        return _l('编辑');
      case 8:
        if (!node.sendContent) {
          return _l('开始配置');
        }
        return _l('编辑');
      case 21:
        if (outputs.length <= 0) {
          return _l('开始配置');
        }
        return _l('编辑');
    }
  };
  const renderTips = () => {
    switch (props.typeId) {
      case 21:
        if (!!node.appId && !!(node.outputs || []).length > 0) {
          return <Icon icon={'check_circle1'} className="Green_right tip" />;
        }
        return '';
      case 8:
        if (!node.controls && node.appId) {
          return <Icon icon="error1" className="Red tip" />;
        }
        if (node.controls) {
          return <Icon icon={'check_circle1'} className="Green_right tip" />;
        }
        return '';
      default:
        if (!!node.appId) {
          return <Icon icon={'check_circle1'} className="Green_right tip" />;
        }
        return '';
    }
  };

  return (
    <div className="flexColumn">
      <Wrap className={props.className}>
        <CardTopWrap className="flexRow flex">
          <div className={cx('iconCon')}>
            {renderTips()}
            <Icon icon={props.icon || 'parameter'} className="iconParam Font26" />
          </div>
          <div className="flex pLeft16">
            <p className="Font17 Bold">
              {!props.title ? (
                _l('输入参数')
              ) : [8].includes(props.typeId) && props.connectInfo.type === 2 ? (
                <div className="flexRow alignItemsCenter">
                  <div className="flex">{props.title}</div>
                  <div className="flexRow alignItemsCenter">
                    <Checkbox
                      className="checkBox InlineBlock Gray_75"
                      text={_l('使用网络代理')}
                      checked={node.settings.useProxy}
                      onClick={() => {
                        update({
                          ...node,
                          settings: { ...node.settings, useProxy: !node.settings.useProxy },
                        });
                      }}
                    />
                    <Tooltip
                      popupPlacement="topLeft"
                      text={<span>{_l('安装的API，允许在卡片上修改是否使用网络代理')}</span>}
                    >
                      <Icon icon="info_outline" className="Gray_75 Font16 mLeft10 mTop4" />
                    </Tooltip>
                  </div>
                </div>
              ) : (
                props.title
              )}
            </p>
            <p className="Font13 Gray_75 mTop4">
              <span className="TxtMiddle">
                {props.des || _l('输入参数用于在工作表或工作流中使用 API 查询时，可以传入动态值')}
              </span>
              <Support href={props.support} className="Gray_9e" type={3} text={_l('帮助')} />
            </p>
          </div>
          {/* 安装的连接 api 不支持编辑，只读显示 */}
          {props.canEdit && (
            <div
              className="btn Hand"
              onClick={() =>
                setState({
                  showEdit: true,
                })
              }
            >
              {renderBtn()}
            </div>
          )}
        </CardTopWrap>
        {renderCon(node)}
        {showEdit && props.canEdit && (
          <div className="workflowSettings">
            <Detail
              companyId={localStorage.getItem('currentProjectId')}
              processId={info.id}
              relationId={info.relationId}
              relationType={info.relationType}
              selectNodeId={node.id} //gengxindonghua
              selectNodeType={node.typeId}
              closeDetail={() => {
                setState({
                  showEdit: false,
                });
              }}
              isIntegration
              updateNodeData={data => {
                getCardInfo();
                props.hasChange();
                // setState({
                //   node: { ...node, ...data },
                // });
              }}
            />
          </div>
        )}
      </Wrap>
      {props.canAdd && (
        <AddNode
          {...props}
          onAdd={() => {
            props.onAddId(node.typeId);
          }}
        />
      )}
    </div>
  );
}
