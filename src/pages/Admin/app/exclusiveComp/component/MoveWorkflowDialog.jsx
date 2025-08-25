import React, { useEffect, useState } from 'react';
import { Empty } from 'antd';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import projectAjax from 'src/api/project';
import Status from './Status';

const MoveWorkflowDialogWrap = styled(Dialog)`
  min-height: 400px;
`;

const ContentWrap = styled.ul`
  height: 100%;
  overflow-y: scroll;
  > li {
    margin-bottom: 20px;
    padding: 16px 20px;
    border-radius: 6px 6px 6px 6px;
    border: 1px solid #eaeaea;
    cursor: pointer;
  }
  > li.active,
  > li:hover {
    background: rgba(33, 150, 243, 0.11);
    border: 1px solid #1677ff;
  }
  .emptyWrap {
    margin-top: 94px;
  }
`;

function MoveWorkflowDialog(props) {
  const { visible = false, onOk, onCancel, projectId, sourceResourceId } = props;

  const [select, setSelect] = useState(undefined);
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!visible || !projectId) return;

    projectAjax.getComputingInstances({ projectId }).then(res => {
      setList(res.filter(l => l.resourceId !== sourceResourceId && l.status === 2));
    });
  }, [visible]);

  return (
    <MoveWorkflowDialogWrap
      className="moveWorkflowDialog"
      visible={visible}
      width={600}
      title={<span className="Font17 bold">{_l('移动到')}</span>}
      okText={_l('移动')}
      okDisabled={list.length === 0}
      onOk={() => {
        let _select = select;
        onOk(_select);
        setSelect(undefined);
      }}
      onCancel={() => {
        setSelect(undefined);
        onCancel();
      }}
    >
      <ContentWrap>
        {list.length === 0 && (
          <div className="emptyWrap">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={_l('没有可选算力')}></Empty>
          </div>
        )}
        {list.map(item => (
          <li
            key={`moveExplainItem-${item.id}`}
            className={select === item.resourceId ? 'active' : ''}
            onClick={() => {
              setSelect(item.resourceId);
            }}
          >
            <div className="Font15 bold mBottom12">{item.name}</div>
            <div className="Font13 flexRow">
              <Status value={item.status} className="mRight12" />
              <span className="Gray_75">{`${item.specification.concurrency}${_l('并发数')} | ${_l(
                '%0核',
                item.specification.core,
              )} | ${item.specification.memory / 1024}GiB`}</span>
            </div>
          </li>
        ))}
      </ContentWrap>
    </MoveWorkflowDialogWrap>
  );
}

export default MoveWorkflowDialog;
