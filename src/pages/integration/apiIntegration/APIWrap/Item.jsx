import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, LoadDiv, Menu, Radio, Support } from 'ming-ui';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import { TYPENODE } from 'src/pages/integration/config';
import CodeSnippet from 'src/pages/workflow/components/CodeSnippet/index.jsx';
import Detail from 'src/pages/workflow/WorkflowSettings/Detail';
import { CardTopWrap } from '../style';
import { ActWrap, RedMenuItemWrap } from '../style';

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
  max-width: ${props => `${props.maxW || '800px'}`};
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
      background: #1677ff;
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
const WrapBtn = styled.div`
  .btnCon {
    padding: 11px 50px;
    background: #1677ff;
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
`;
export default function Item(props) {
  const { onCancel = () => {} } = props;
  const [{ info, loading, showEdit, node, showMenu, showCodeSnippetDialog }, setState] = useSetState({
    info: props.info,
    node: props.nodeInfo ? props.nodeInfo : {},
    loading: true,
    showEdit: false,
    showMenu: false,
    showCodeSnippetDialog: false,
  });
  const [actionId, setActionId] = useState(_.get(props, 'nodeInfo.actionId') || '102');
  useEffect(() => {
    props.isNew
      ? setState({
          loading: false,
        })
      : getCardInfo();
  }, []);
  useEffect(() => {
    if (!_.get(props, 'nodeInfo.id')) {
      setState({
        node: {},
      });
    } else {
      getCardInfo(props.nodeInfo);
    }
  }, [props.nodeInfo]);
  const getCardInfo = (data = node) => {
    if (!data.id) {
      return;
    }
    flowNodeAjax
      .getNodeDetail(
        {
          processId: info.id,
          nodeId: data.id,
          flowNodeType: data.typeId,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({
          node: { ...data, ...res },
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
      .then(() => {
        props.hasChange();
      });
  };

  const delNode = () => {
    flowNodeAjax.delete({ nodeId: node.id, processId: info.id }, { isIntegration: true }).then(() => {
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
          <WrapBtn className="TxtCenter mTop40">
            <span
              className="Hand Gray_75 Bold ThemeHoverColor3"
              onClick={() => {
                onCancel();
              }}
            >
              {_l('取消')}
            </span>
            <span
              className={cx('btnCon Hand Bold mLeft20')}
              onClick={() => {
                addNode(actionId);
              }}
            >
              {_l('保存并继续')}
            </span>
          </WrapBtn>
        </div>
      );
    } else {
      let typeInfo = TYPENODE.find(o => o.actionId === actionId) || {};
      return <div className="con Gray_75 TxtLeft">{typeInfo.txt}</div>;
    }
  };
  const renderTips = () => {
    if (node.code) {
      return <Icon icon="check_circle" className="Green_right tip" />;
    }
    return '';
  };

  return (
    <div className="flexColumn">
      <Wrap className={props.className} maxW={props.maxW}>
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
              </div>
              <Trigger
                action={['click']}
                popup={
                  <Menu>
                    <RedMenuItemWrap
                      icon={<Icon icon="trash" className="Font17 mLeft5" />}
                      onClick={() => {
                        setState({
                          showMenu: false,
                        });
                        delNode();
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
              addNode(actionId, JSON.stringify({ inputData, code: btoa(unescape(encodeURIComponent(code))) }));
              setState({ showCodeSnippetDialog: false });
            }}
            onClose={() => setState({ showCodeSnippetDialog: false })}
          />
        )}
      </Wrap>
    </div>
  );
}
