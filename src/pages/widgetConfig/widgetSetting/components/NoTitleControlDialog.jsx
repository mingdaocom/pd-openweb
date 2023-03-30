import React, { Fragment } from 'react';
import { Dialog, Support } from 'ming-ui';
import styled from 'styled-components';
import img from '../../image/setAsTitle.png';

const NoTitleControlWrap = styled.div`
  .closeText {
    text-align: right;
    color: #2196f3;
    cursor: pointer;
  }
  img {
    display: block;
    width: 80%;
    text-align: center;
    margin: 24px auto;
  }
`;

export default function NoTitleControlDialog({ onClose }) {
  return (
    <Dialog
      visible
      title={<span style={{ color: '#000' }}>{_l('没有支持设为标题的字段')}</span>}
      footer={null}
      onCancel={onClose}
    >
      <NoTitleControlWrap>
        <Fragment>
          <span style={{ color: '#757575' }}>
            {_l(
              '请添加一个支持设为标题的字段。标题字段可以帮助快速识别记录，在视图、记录详情页、关联记录等功能中均会使用到。如：联系人表中，可以使用联系人姓名作为标题字段。',
            )}
          </span>
          <Support
            type={3}
            href="https://help.mingdao.com/zh/sheet9.html"
            text={_l('哪些字段可以设为标题？')}
          />
        </Fragment>
        <img src={img} alt={_l('如何设置标题控件')} />
        <div className="closeText" onClick={onClose}>
          {_l('我知道了')}
        </div>
      </NoTitleControlWrap>
    </Dialog>
  );
}
