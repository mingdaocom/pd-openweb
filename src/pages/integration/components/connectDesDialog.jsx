import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import DialogLayer from 'mdDialog';
import { Icon, Button } from 'ming-ui';
import { useSetState } from 'react-use';
import withClickAway from 'ming-ui/decorators/withClickAway';
import ReactDom from 'react-dom';
import AvatorInfo from 'src/pages/Personal/personalInfo/modules/AvatorInfo.jsx';
import 'src/pages/Personal/personalInfo/modules/index.less';

const Wrap = styled.div`
  p,
  h5 {
    margin: 0;
  }
  padding: 20px;
  width: 640px;
  background: #ffffff;
  border: 1px solid #dddddd;
  box-shadow: 0px 4px 8px rgb(0, 0, 0, 0.16);
  border-radius: 3px;
  position: absolute;
  z-index: 10;
  left: 60px;
  top: 100px;
  .title {
    font-weight: 400;
    margin-top: 24px;
  }
  .upload,
  .logo {
    width: 58px;
    height: 58px;
    background: #ffffff;
    border: 1px solid #efefef;
    border-radius: 50%;
    margin-top: 8px;
    display: inline-block;
    line-height: 56px;
    text-align: center;
    cursor: pointer;
  }
  input,
  textarea {
    border: 1px solid #dddddd;
    padding: 8px 15px;
    border-radius: 3px;
    width: 100%;
    &:focus {
      border: 1px solid #2196f3;
    }
  }
  textarea {
    height: 72px;
    resize: none;
  }
  .btn {
    margin-top: 32px;
    padding: 8px 32px;
    background: #2196f3;
    color: #fff;
    line-height: 1em;
    border-radius: 3px;
    &:hover {
      background: #1764c0;
    }
  }
  .num {
    position: absolute;
    right: 8px;
    bottom: 10px;
    color: #9e9e9e;
  }
`;

function ConnectDesDia(props) {
  const [{ uploadLoading, iconName, name, explain }, setState] = useSetState({
    iconName: _.get(props, ['data', 'iconName']),
    name: _.get(props, ['data', 'name']),
    explain: _.get(props, ['data', 'explain']),
    uploadLoading: false,
  });

  //编辑详细资料
  const handleUploadImg = () => {
    if (props.data.type === 2) {
      // 安装的连接 不可修改连接LOGO
      return;
    }
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('上传logo'),
      },
      dialogBoxID: 'uploadAvatorDialogId',
      width: '460px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <AvatorInfo
          editAvatar={res => {
            setState({ iconName: res.url });
          }}
          avatar={(iconName || ' ').split('imageView2')[0]}
          closeDialog={() => {
            $('#uploadAvatorDialogId_container,#uploadAvatorDialogId_mask').remove();
          }}
          defaultType
        />
      </DialogLayer>,
      document.createElement('div'),
    );
  };

  return (
    <Wrap className="">
      <h5 className="Gray Font17 Bold">{_l('基础信息设置')}</h5>
      <p className="title pTop3">{_l('连接logo')}</p>
      {iconName ? (
        <img src={iconName} alt="" srcset="" className="logo InlineBlock mTop8" onClick={handleUploadImg} />
      ) : (
        <span className="upload" onClick={handleUploadImg}>
          <Icon icon="add" className="Gray_75 Font28 TxtMiddle" />
        </span>
      )}
      <p className="txt Gray_9e mTop6">{_l('支持png ,jpg格式图片，不小于80*80px')}</p>
      <p className="title">{_l('连接名称')}</p>
      <div className="Relative">
        <input
          type="text"
          value={name}
          className="Block mTop8"
          onChange={e => {
            let str = e.target.value;
            if (e.target.value.trim().length > 20) {
              str = e.target.value.trim().slice(0, 20);
            }
            setState({ name: str });
          }}
          placeholder={_l('例如：订单查询、物流查询')}
        />
        <span className="num">{(name || '').length}/20</span>
      </div>
      <p className="title">{_l('说明')}</p>
      <div className="Relative">
        <textarea
          type="text"
          value={explain}
          className="Block mTop8"
          onChange={e => {
            let str = e.target.value;
            if (e.target.value.trim().length > 200) {
              str = e.target.value.trim().slice(0, 200);
            }
            setState({ explain: str });
          }}
        />
        <span className="num">{(explain || '').length}/200</span>
      </div>
      <div
        className="btn Bold Right"
        onClick={e => {
          e.stopPropagation();
          props.onOk({
            iconName,
            name: !name.trim() ? '未命名连接' : name,
            explain,
          });
        }}
      >
        {_l('保存')}
      </div>
    </Wrap>
  );
}

export default withClickAway(ConnectDesDia);
