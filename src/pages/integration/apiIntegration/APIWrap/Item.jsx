import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Support, LoadDiv, Menu, Radio } from 'ming-ui';
import { useSetState } from 'react-use';
import { CardTopWrap } from '../style';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import Detail from 'src/pages/workflow/WorkflowSettings/Detail';
import Trigger from 'rc-trigger';
import { RedMenuItemWrap, ActWrap } from '../style';
import { TYPENODE } from 'src/pages/integration/config';
import CodeSnippet from 'src/pages/workflow/components/CodeSnippet/index.jsx';
import { Base64 } from 'js-base64';

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
    text-align: center;
    .chooseTypeCon {
    }
    .btn {
      margin: 40px auto 0;
      padding: 11px 50px;
      background: #2196f3;
      color: #fff;
      line-height: 1em;
      border-radius: 30px;
      &.disabled {
        opacity: 0.5;
      }
      &:hover {
        background: #1764c0;
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
  .w200 {
    width: 200px;
  }
  .paramLi {
    height: 34px;
    line-height: 34px;
    padding: 0 8px;
    &:hover {
      background: #f7f7f7;
    }
  }
  .iconCon {
    text-align: center;
    line-height: 51px;
  }
`;
export default function Item(props) {
  const [{ info, loading, showEdit, node, showMenu, showCodeSnippetDialog }, setState] = useSetState({
    info: props.info,
    node: props.nodeInfo ? props.nodeInfo : {},
    loading: true,
    showEdit: false,
    showMenu: false,
    showCodeSnippetDialog: false,
  });
  const [actionId, setActionId] = useState(props.nodeInfo ? props.nodeInfo.actionId : '102');
  useEffect(() => {
    props.isNew
      ? setState({
          loading: false,
        })
      : getCardInfo();
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
        setState({
          node: { ...node, ...res },
          loading: false,
        });
      });
  };
  if (loading) {
    return <LoadDiv className="mTop24" />;
  }

  const addNode = (id = actionId, appId) => {
    let typeInfo = TYPENODE.find(o => o.actionId === id) || {};
    flowNodeAjax
      .add(
        {
          processId: info.id,
          actionId: id,
          name: '代码块',
          prveId: props.prveId,
          typeId: typeInfo.typeId,
          appId,
        },
        { isIntegration: true },
      )
      .then(res => {
        props.hasChange();
      });
  };

  const deleNode = () => {
    flowNodeAjax.delete({ nodeId: node.id, processId: info.id }, { isIntegration: true }).then(res => {
      props.hasChange();
    });
  };

  const renderCon = () => {
    if (props.isNew) {
      return (
        <div className="con">
          <div className="mTop30">
            {[...TYPENODE, { txt: _l('从代码片段库中选择'), key: 'codeSnippet' }].map(o => {
              return (
                <span className="chooseTypeCon">
                  <Radio
                    className=""
                    text={o.txt}
                    checked={actionId === o.actionId}
                    onClick={() => {
                      if (o.key === 'codeSnippet') {
                        setState({
                          showCodeSnippetDialog: true,
                        });
                      } else {
                        setActionId(o.actionId);
                      }
                    }}
                  />
                </span>
              );
            })}
          </div>
          <div
            className={cx('btn Bold')}
            onClick={e => {
              addNode(actionId);
            }}
          >
            {_l('保存并继续')}
          </div>
        </div>
      );
    } else {
      let typeInfo = TYPENODE.find(o => o.actionId === actionId) || {};
      return <div className="con Gray_75 TxtLeft">{typeInfo.txt}</div>;
    }
  };
  const renderTips = () => {
    if (!!node.code) {
      return <Icon icon={'check_circle1'} className="Green_right tip" />;
    }
    return '';
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
            <p className="Font17 Bold">{props.title || _l('输入参数')}</p>
            <p className="Font13 Gray_75 mTop4">
              <span className="TxtMiddle">
                {props.des || _l('输入参数用于在工作表或工作流中使用 API 查询时，可以传入动态值')}
              </span>
              <Support href={props.support} className="Gray_9e" type={3} text={_l('代码示例')} />
            </p>
          </div>
          {/* 安装的连接 api 不支持编辑，只读显示 */}
          {props.canEdit && !props.isNew && (
            <React.Fragment>
              <div
                className="btn Hand"
                onClick={() =>
                  setState({
                    showEdit: true,
                  })
                }
              >
                {_l('编辑')}
              </div>{' '}
              <Trigger
                action={['click']}
                popup={
                  <Menu>
                    <RedMenuItemWrap
                      icon={<Icon icon="task-new-delete" className="Font17 mLeft5" />}
                      onClick={() => {
                        setState({
                          showMenu: false,
                        });
                        deleNode();
                      }}
                    >
                      <span>{_l('删除')}</span>
                    </RedMenuItemWrap>
                  </Menu>
                }
                popupClassName={cx('dropdownTrigger')}
                popupVisible={showMenu}
                onPopupVisibleChange={visible => {
                  setState({
                    showMenu: visible,
                  });
                }}
                popupAlign={{
                  points: ['tl', 'bl'],
                  overflow: {
                    adjustX: true,
                    adjustY: true,
                  },
                }}
              >
                <ActWrap
                  className="act InlineBlock TxtMiddle TxtCenter"
                  onClick={() => {
                    setState({
                      showMenu: true,
                    });
                  }}
                >
                  <i className={'icon-more_horiz Font22 TxtMiddle Gray_9d'} />
                </ActWrap>
              </Trigger>
            </React.Fragment>
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
                // getCardInfo();
                props.hasChange();
              }}
            />
          </div>
        )}
        {showCodeSnippetDialog && (
          <CodeSnippet
            projectId={localStorage.getItem('currentProjectId')}
            onSave={({ actionId, inputData, code }) => {
              addNode(actionId, JSON.stringify({ inputData, code: Base64.encode(code) }));
              setState({ showCodeSnippetDialog: false });
            }}
            onClose={() => setState({ showCodeSnippetDialog: false })}
          />
        )}
      </Wrap>
    </div>
  );
}
