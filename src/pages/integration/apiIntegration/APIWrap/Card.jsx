import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon, LoadDiv, Support } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { renderValue } from 'src/pages/integration/apiIntegration/util';
import Detail from 'src/pages/workflow/WorkflowSettings/Detail';
import { JSONAnalysis } from 'src/pages/workflow/WorkflowSettings/Detail/components';
import { FIELD_TYPE_LIST } from 'src/pages/workflow/WorkflowSettings/enum';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { CardTopWrap, WrapBtn } from '../style';

const FIELD_TYPE = FIELD_TYPE_LIST.concat([{ text: _l('对象'), value: 10000006, en: 'object' }]);

const Wrap = styled.div`
  p {
    margin: 0;
  }
  .btn {
    margin-right: 0px;
  }
  background: var(--color-background-primary);
  // border: 1px solid var(--color-border-secondary);
  border-radius: 10px;
  max-width: 800px;
  .Green_right {
    color: var(--color-success);
  }
  .con {
    padding: 24px;
    border-top: 1px solid var(--color-border-secondary);
    .webhookList {
      li {
        // height: 34px;
        line-height: 34px;
        padding: 0 8px;
        &:hover {
          background: var(--color-background-hover);
        }
      }
      .w180 {
        width: 180px;
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
  .w30 {
    width: 30px;
  }
  .w150 {
    width: 150px;
  }
  .paramLi {
    // height: 34px;
    line-height: 34px;
    padding: 0 8px;
    &:not(.disabled):hover {
      background: var(--color-background-secondary);
    }
    & > div {
      flex-shrink: 0;
    }
    .titileIcon {
      opacity: 0;
    }
    &:hover .titileIcon {
      opacity: 1;
    }
  }
  .iconCon {
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
      <Icon icon={'arrow'} className="Font24 TxtCenter InlineBlock" style={{ color: 'var(--color-border-primary)' }} />
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
        <Tooltip placement="bottom" title={_l('可对前面节点输出的数据做处理，以供后面节点使用，如加密、解密等')}>
          <Icon icon="info_outline" className="textDisabled Font16 mLeft5" />
        </Tooltip>
      </WrapBtn>
    </React.Fragment>
  );
}
export default function Card(props) {
  const [{ info, loading, showEdit, node }, setState] = useSetState({
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
            'controls',
          ]),
          processId: info.id,
          nodeId: node.id,
          flowNodeType: node.typeId,
        },
        { isIntegration: true },
      )
      .then(() => {
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
  const renderCon = () => {
    const { controls = [], outputs = [] } = node || {};
    switch (props.typeId) {
      case 23:
        if (controls.length <= 0) {
          return '';
        }
        return (
          <div className="con">
            <div className="flexRow paramLi bold disabled">
              <div className="w30 WordBreak"></div>
              <div className="w150 WordBreak">{_l('字段名/参数名')}</div>
              <div className="w150 WordBreak">{_l('类型')}</div>
              <div className="w150 WordBreak">{_l('默认值')}</div>
              <div className="flex WordBreak">{_l('说明')}</div>
            </div>

            {getList(controls).map(o => {
              if ([10000007].includes((controls.find(it => it.controlId === o.dataSource) || {}).type)) {
                return null;
              }
              const canEdit = props.isConnectOwner || props.canEdit;
              return (
                <Fragment key={o.controlId}>
                  <div className="flexRow paramLi">
                    <div className="w30 WordBreak">
                      {o.level <= 0 && !_.includes([22, 36], o.type) && o.type < 10000000 && !o.dataSource && (
                        <Icon
                          icon="ic_title"
                          className={cx('Font16', o.attribute === 1 ? 'ThemeColor3' : 'textDisabled titileIcon', {
                            Hand: canEdit,
                          })}
                          onClick={() => {
                            if (!canEdit) return;
                            update({
                              ...node,
                              controls: controls.map(item => {
                                if (item.controlId === o.controlId) {
                                  return { ...item, attribute: item.attribute === 1 ? 0 : 1 };
                                }
                                return { ...item, attribute: 0 };
                              }),
                            });
                          }}
                        />
                      )}
                    </div>
                    <div className="w150 WordBreak pRight5" style={{ 'padding-left': (o.level || 0) * 20 }}>
                      <span className="WordBreak">
                        {o.required ? <span className="Red">*</span> : ''}
                        {o.controlName}
                        <span className="textTertiary mLeft5">{o.alias}</span>
                      </span>
                    </div>
                    <div className="w150 textSecondary WordBreak">
                      {(FIELD_TYPE.find(s => s.value === o.type) || {}).text}
                    </div>
                    <div className="w150 WordBreak">{o.workflowDefaultValue}</div>
                    <div className="flex WordBreak">{o.desc}</div>
                  </div>
                  {o.type === 9 &&
                    o.options.map(item => (
                      <div className="flexRow paramLi Hand" key={item.key}>
                        <div className="w150 WordBreak"></div>
                        <div className="w150 textSecondary WordBreak">{item.value}</div>
                        <div className="flex WordBreak">{item.key}</div>
                      </div>
                    ))}
                </Fragment>
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
          return <Icon icon="check_circle" className="Green_right tip" />;
        }
        return '';
      case 8:
        if (!node.controls && node.appId) {
          return <Icon icon="error1" className="Red tip" />;
        }
        if (node.controls) {
          return <Icon icon="check_circle" className="Green_right tip" />;
        }
        return '';
      default:
        if (node.appId) {
          return <Icon icon="check_circle" className="Green_right tip" />;
        }
        return '';
    }
  };

  return (
    <div className="flexColumn">
      <Wrap className={cx(props.className, 'w100 divCenter')}>
        <CardTopWrap className="flexRow flex">
          <div className={cx('iconCon TxtCenter')}>
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
                      className="checkBox InlineBlock textSecondary"
                      text={_l('使用网络代理')}
                      checked={node.settings.useProxy}
                      onClick={() => {
                        update({
                          ...node,
                          settings: { ...node.settings, useProxy: !node.settings.useProxy },
                        });
                      }}
                    />
                    <Tooltip placement="topLeft" title={_l('安装的API，允许在卡片上修改是否使用网络代理')}>
                      <Icon icon="info_outline" className="textSecondary Font16 mLeft10 mTop4" />
                    </Tooltip>
                  </div>
                </div>
              ) : (
                props.title
              )}
            </p>
            <p className="Font13 textSecondary mTop4">
              <span className="TxtMiddle">
                {props.des || _l('输入参数用于在工作表或工作流中使用 API 查询时，可以传入动态值')}
              </span>
              <Support href={props.support} className="textTertiary" type={3} text={_l('帮助')} />
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
        {renderCon()}
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
              customNodeName={props.title}
              isIntegration
              updateNodeData={() => {
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
