import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import ExistSourceModal from 'src/pages/integration/dataIntegration/components/ExistSourceModal';
import { DATABASE_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import { getNodeName } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/util.js';

const Wrap = styled.div`
  .addSource {
    background: var(--color-background-primary);
    border: 1px dashed var(--color-border-primary);
    border-radius: 4px;
    color: var(--color-primary);
    &:hover {
      border: 1px dashed var(--color-primary);
    }
  }
  .sourceCard {
    padding: 12px 20px;
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-secondary);
    border-radius: 4px;
    .imgCon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
`;
const PopupWrap = styled.div(
  ({ width }) => `
  padding: 6px 0;
  box-shadow: var(--shadow-lg);
  opacity: 1;
  background: var(--color-background-primary);
  border-radius: 4px;
  width:${width}px;
  .item {
    padding: 12px 20px;
    background: var(--color-background-primary);
    .title {
      font-size: 15px;
      font-weight: 500;
    }
    .des {
      font-size: 13px;
      font-weight: 400;
      color: var(--color-text-tertiary);
    }
    &.isCur,
    &:hover {
      background: var(--color-background-hover);
    }
  }
`,
);
//新增源|目的地

function AddSourceOrDest(props) {
  const { onUpdate, node = {}, onUpdateFlowDatasources, flowData } = props;
  const { nodeType = '' } = node;
  const { dsType, tableName, iconBgColor, className } = _.get(node, ['nodeConfig', 'config']) || {};
  const [{ visible, show }, setState] = useSetState({
    visible: false,
    sourceFormData: {},
  });

  const renderPopup = () => {
    return (
      <PopupWrap width={props.width}>
        <div
          className="item Hand"
          onClick={() => {
            onUpdate({
              ...node,
              nodeConfig: {
                ...(node.nodeConfig || {}),
                config: {
                  ...(_.get(node, 'nodeConfig.config') || {}),
                  dsType: DATABASE_TYPE.APPLICATION_WORKSHEET,
                  dbName: '',
                  tableName: '',
                  schema: '',
                  className: 'table',
                  iconBgColor: '#E8F4FE',
                  workSheetId: '',
                  appId: '',
                },
              },
            });
            setState({
              visible: false,
            });
          }}
        >
          <div className="title">{_l('工作表数据')}</div>
          <div className="des">{_l('从当前用户作为管理员的应用工作表实时同步')}</div>
        </div>
        <div
          className="item Hand"
          onClick={() => {
            setState({
              show: true,
              visible: false,
            });
          }}
        >
          <div className="title">{_l('外部数据源')}</div>
          <div className="des">{_l('从本地数据库，云数据库或消息队列服务器读取数据并实时同步')}</div>
        </div>
      </PopupWrap>
    );
  };
  return (
    <Wrap>
      <Trigger
        popupVisible={visible}
        action={['click']}
        popupClassName="dropTriggerWrap"
        popup={renderPopup()}
        getPopupContainer={() => document.body}
        onPopupVisibleChange={visible => {
          props.canEdit && setState({ visible });
        }}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 0],
          overflow: { adjustX: true, adjustY: true },
        }}
      >
        {!dsType ? (
          <div
            className="addSource Bold Hand TxtCenter"
            style={{ height: `${props.height || 58}px`, lineHeight: `${props.height || 58}px` }}
          >
            <i className="icon icon-add_circle_outline  mRight5" />
            {_l('选择数据源')}
          </div>
        ) : (
          <div className="sourceCard flexRow mTop12">
            <div className="imgCon flexRow alignItemsCenter justifyContentCenter" style={{ background: iconBgColor }}>
              <svg className="icon svg-icon" aria-hidden="true">
                <use xlinkHref={`#icon${className}`}></use>
              </svg>
            </div>
            <div className="flex mLeft8">
              <div className="name Bold flexRow alignItemsCenter">
                {getNodeName(flowData, node)}
                {dsType !== DATABASE_TYPE.APPLICATION_WORKSHEET && (
                  <Icon
                    icon="task-new-detail"
                    className="mLeft10 Font12 ThemeColor3 ThemeHoverColor2 Hand"
                    onClick={e => {
                      e.stopPropagation();
                      const infoTxt = nodeType === 'SOURCE_TABLE' ? 'datasourceId' : 'dataDestId';
                      window.open(`/integration/sourceDetail/${(_.get(node, 'nodeConfig.config') || {})[infoTxt]}`); //数据源落地页地址
                    }}
                  />
                )}
              </div>
              <div className="des textTertiary">{tableName}</div>
            </div>
            {props.canEdit && <i className="icon icon-expand_more Font20 Hand Block" />}
          </div>
        )}
      </Trigger>
      {show && (
        <ExistSourceModal
          {...props}
          roleType={nodeType === 'SOURCE_TABLE' ? 'source' : 'dest'}
          onClose={() => {
            setState({
              show: false,
            });
          }}
          setConnectorConfigData={data => {
            const infoTxt = nodeType === 'SOURCE_TABLE' ? 'source' : 'dest';
            const { className, id, iconBgColor, type, sourceName, formData } = data[infoTxt];
            onUpdateFlowDatasources({ ...data[infoTxt], name: sourceName });
            let param = {};
            if (nodeType !== 'SOURCE_TABLE') {
              param = {
                dataDestId: id,
              };
            } else {
              param = {
                datasourceId: id,
              };
              if (className === 'kafka') {
                param.dbName = _.get(formData, 'extraParams.topic');
                param.tableName = _.get(formData, 'extraParams.topic');
              }
            }
            let config = {
              ...(_.get(node, 'nodeConfig.config') || {}),
              dbName: '',
              tableName: '',
              dsType: type,
              schema: '',
              className,
              iconBgColor,
              workSheetId: '',
              appId: '',
              sourceName,
              ...param,
            };
            if ('SOURCE_TABLE' === nodeType) {
              config = { ...config, fields: [] };
            } else {
              config = { ...config, fieldsMapping: [] };
            }
            onUpdate({
              ...node,
              nodeConfig: {
                ...(node.nodeConfig || {}),
                config,
                fields: [],
              },
            });
          }}
        />
      )}
    </Wrap>
  );
}

export default autoSize(AddSourceOrDest);
