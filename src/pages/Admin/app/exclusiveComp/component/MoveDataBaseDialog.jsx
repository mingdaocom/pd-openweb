import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Empty } from 'antd';
import { Dialog } from 'ming-ui';
import projectAjax from 'src/api/project';

const MoveDataBaseDialogWrap = styled(Dialog)`
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
    border: 1px solid #2196f3;
  }
  .emptyWrap {
    margin-top: 94px;
  }
`;

function MoveDataBaseDialog(props) {
  const { visible = false, projectId, filterId, appId, onOk, onCancel } = props;

  const [select, setSelect] = useState(undefined);
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!visible || !projectId) return;

    projectAjax.getDBInstances({ projectId }).then(res => {
      setList(res.filter(l => l.id !== filterId));
    });
  }, []);

  return (
    <MoveDataBaseDialogWrap
      className="MoveDataBaseDialogWrap"
      visible={visible}
      width={600}
      title={<span className="Font17 bold">{_l('迁移到')}</span>}
      okText={_l('移动')}
      okDisabled={list.length === 0}
      onOk={() => {
        const dataBase = _.find(list, l => l.id === select);

        onOk({ ..._.pick(dataBase, ['id', 'name']) });
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
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={_l('没有可选数据库')}></Empty>
          </div>
        )}
        {list.map(item => (
          <li
            key={`moveDataBaseItem-${item.id}`}
            className={select === item.id ? 'active' : ''}
            onClick={() => setSelect(item.id)}
          >
            <div className="name Font15 Bold Gray mBottom13">{item.name}</div>
            <div className="host Font13 Gray_75">{item.host}</div>
          </li>
        ))}
      </ContentWrap>
    </MoveDataBaseDialogWrap>
  );
}

export default MoveDataBaseDialog;
