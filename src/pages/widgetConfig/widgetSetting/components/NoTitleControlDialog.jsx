import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Button, Dialog, Support } from 'ming-ui';
import img from '../../image/setAsTitle.png';

const NoTitleControlWrap = styled.div`
  .closeText {
    display: flex;
    margin: auto 0 auto auto;
  }
  .imgContent {
    width: 80%;
    text-align: center;
    margin: 24px auto;
    position: relative;
    img {
      display: block;
      width: 100%;
    }
    .imgText {
      position: absolute;
      top: 8px;
      right: 125px;
      color: #3e6483;
    }
  }
`;

export default function NoTitleControlDialog({ onClose }) {
  return (
    <Dialog
      visible
      title={<span style={{ color: '#000' }}>{_l('标题字段已删除，请重新设置')}</span>}
      footer={null}
      onCancel={onClose}
    >
      <NoTitleControlWrap>
        <Fragment>
          <span style={{ color: '#757575' }}>
            {_l(
              '标题字段可以快速识别一条记录。用于记录详情、关联记录、和消息通知等功能场景中。在字段上点击下方图标进行设置。',
            )}
          </span>
          <Support type={3} href="https://help.mingdao.com/worksheet/title-field" text={_l('帮助')} />
        </Fragment>
        <div className="imgContent">
          <span className="imgText">{_l('点击设为标题字段')}</span>
          <img src={img} alt={_l('如何设置标题控件')} />
        </div>
        <Button type="primary" onClick={onClose} className="closeText">
          {_l('前往设置')}
        </Button>
      </NoTitleControlWrap>
    </Dialog>
  );
}
