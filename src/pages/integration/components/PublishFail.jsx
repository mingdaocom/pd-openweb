import React from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';

const EditShowNameCon = styled.div`
  .title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }
`;
export default function PublishFail(props) {
  const { name, onCancel, toNode, errorMsgList = [] } = props;
  return (
    <Dialog
      visible
      title={<span className="Red">{_l('数据同步“%0”发布失败', name)}</span>}
      onCancel={onCancel}
      okText={_l('前往修改')}
      buttonType="danger"
      onOk={id => {
        toNode(id);
      }}
    >
      <EditShowNameCon>
        {errorMsgList.map(o => {
          return (
            <div className="mTop16">
              <i className="icon-report Font18 Red TxtMiddle"></i>{' '}
              <span className="TxtMiddle Gray_75 mLeft8 Font14">{o}</span>
            </div>
          );
        })}
      </EditShowNameCon>
    </Dialog>
  );
}
