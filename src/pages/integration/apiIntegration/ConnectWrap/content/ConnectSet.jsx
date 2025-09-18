import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import AuthParam from 'src/pages/integration/components/AuthParam';
import ConnectAuth from 'src/pages/integration/components/ConnectAuth';
import ConnectItem from 'src/pages/integration/components/ConnectItem';
import ConnectParam from 'src/pages/integration/components/ConnectParam';
import EditIntro from 'src/pages/integration/components/EditDes';
import { getNodeList } from '../util';

const Wrap = styled.div`
  .descContainer {
    width: 880px;
    margin: 24px auto 0;
    border-radius: 10px
    background: #ffffff;
    .mdEditorHeader {
    }
    .appIntroHeader {
      box-sizing: border-box;
      height: 55px;
      display: flex;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid #eaeaea;
      .caption {
        font-size: 17px;
        font-weight: bold;
        color: #151515;
      }
      .editAppIntro {
        cursor: pointer;
        color: #757575;
        margin-right: 8px;
        span {
          margin-left: 5px;
        }
      }
    }
    .mdEditor {
      position: relative;
      width: 100%;
      .editorNull {
        padding: 0 24px;
        color: #ccc;
        border: 1px solid #fff;
        border-radius: 0 0 10px 10px;
      }
      .editorContent {
        overflow: hidden !important;
        .ck-content {
          padding: 12px 24px;
          box-sizing: border-box;
          border-radius: 0 0 10px 10px!important;
        }
        .ck-editor {
          min-height: 100%;
          height: 100%;
          box-sizing: border-box;
        }
        .ck-editor__main {
          box-sizing: border-box;
          overflow: auto;
        }
        .ck-focused {
          background: #fff !important;
          border: 1px solid #1677ff !important;
          border-radius: 0 0 10px 10px!important;
        }
      }
      .mdEditorContent {
        font-size: 14px;
        overflow: auto;
        word-break: break-all;
        img {
          max-width: 100%;
        }
        p {
          padding: 0;
          margin: 0;
          min-height: 20px;
        }
        ul {
          list-style-type: disc;
          margin-left: 16px;
          font-size: 14px;
        }
        ol {
          margin-left: 16px;
          font-size: 14px;
          list-style-type: decimal;

          li {
            list-style-position: outside;
          }
        }
      }
      #editorFiles {
        visibility: hidden;
        position: absolute;
      }
      .mdEditorHeader {
        box-sizing: border-box;
        height: 55px;
        align-items: center;
        padding: 0 24px;
        .caption {
          font-size: 17px;
          font-weight: bold;
          color: #151515;
        }
        .mdEditorTipColor {
          color: #9e9e9e;
        }
        .mdEditorCancel {
          font-size: 13px;
          cursor: pointer;

          &:not(:hover) {
            color: #9e9e9e !important;
          }
        }
        .mdEditorSave {
          font-size: 13px;
          cursor: pointer;
          color: #fff;
          border-radius: 3px;
          margin-left: 32px;
          height: 32px;
          line-height: 32px;
          padding: 0 22px;
        }
      }
    }
  }
`;

//连接设置
function ConnectSet(props) {
  const { updateIntroduce } = props;
  const [{ data1, flowDts, dataCode, loading }, setState] = useSetState({
    data1: {},
    flowDts: [],
    dataCode: {},
    loading: true,
  });
  useEffect(() => {
    const nodeList = getNodeList(props);
    const flowDts = nodeList.filter(o => o.typeId === 22);
    setState({
      data1: nodeList.find(o => o.typeId === 0),
      flowDts: flowDts,
      dataCode: nodeList.find(o => o.typeId === 14) || {},
      loading: false,
    });
  }, [props.flowNodeMap]);

  if (loading) {
    return <LoadDiv />;
  }
  const renderFlowDts = (data, notAuthCode, index) => {
    if (data.appType === 30) {
      return null;
    }
    if (notAuthCode) {
      return (
        <React.Fragment>
          {data.appType === 32 && props.connectType === 1 && (
            <React.Fragment>
              <Icon icon={'arrow'} className="Font24 TxtCenter InlineBlock" style={{ color: '#ddd' }} />
              <ConnectItem
                {...props}
                info={{ id: props.id, relationId: props.relationId, relationType: props.relationType }}
                prveId={data1.id}
                id={props.id}
                node={dataCode}
                connectType={props.connectType}
                onChange={() => {
                  props.fetchInfo();
                }}
                canEdit={props.isConnectOwner}
                showAdd={true}
              />
            </React.Fragment>
          )}
          <Icon icon={'arrow'} className="Font24 TxtCenter InlineBlock" style={{ color: '#ddd' }} />
          <ConnectAuth
            {...props}
            id={props.id}
            node={data}
            connectType={props.connectType}
            onChange={v => {
              setState({ flowDts: flowDts.map(o => (o.id === data.id ? { ...data, ...v } : o)) });
              props.hasChange();
            }}
            canEdit={props.isConnectOwner}
            forIntegration
          />
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Icon icon={'arrow'} className="Font24 TxtCenter InlineBlock" style={{ color: '#ddd' }} />
        <AuthParam
          {...props}
          id={props.id}
          node={data}
          href={'https://help.mingdao.com/integration/api#enter-parameters'}
          index={index}
          connectType={props.connectType}
          onChange={v => {
            setState({ flowDts: flowDts.map(o => (o.id === data.id ? { ...data, ...v } : o)) });
            props.hasChange();
          }}
          canEdit={props.isConnectOwner}
        />
      </React.Fragment>
    );
  };
  return (
    <Wrap className="flexColumn">
      {props.hasAuth && !props.isConnectOwner ? null : (
        <>
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
          {props.hasAuth ? flowDts.map((o, i) => renderFlowDts(o, false, i)) : renderFlowDts(flowDts[0], true)}
        </>
      )}
      {((!props.introduce && props.connectType === 1 && props.isConnectOwner) || !!props.introduce) && (
        <div className="descContainer">
          <EditIntro
            key={props.id}
            summary={props.introduce}
            canEditing={props.isConnectOwner && props.connectType !== 2}
            cacheKey={'remarkDes_description' + props.id}
            onSave={value => {
              updateIntroduce(value);
            }}
            // maxHeight={320}
            minHeight={320}
            title={_l('使用说明')}
          />
        </div>
      )}
    </Wrap>
  );
}

export default ConnectSet;
