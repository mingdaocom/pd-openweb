import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import { Button, Icon, Tooltip } from 'ming-ui';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { Dropdown, Input } from 'antd';
import { FlexCenter, genUrl, parseLink } from '../../util';
import PreviewWraper from '../previewContent';
import { connect } from 'react-redux';
import LinkPara from './LinkPara';
import { Header } from '../../styled';

const ContentWrap = styled(FlexCenter)`
  padding-top: 54px;
  box-sizing: border-box;
  height: 100%;
  align-items: initial;
  .previewWrap {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9e9e9e;
    font-size: 15px;
    flex: 1;
    background-color: #eaeaea;
    padding: 24px;
  }
  .configWrap {
    box-sizing: border-box;
    width: 360px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #f5f5f5;
    overflow: auto;
  }
  .content {
    p {
      font-weight: bold;
      font-size: 16px;
      margin: 0 0 16px 0;
    }
  }
  .urlInput {
    margin-bottom: 12px;
    width: 100%;
  }
  .previewBtn {
    box-sizing: border-box;
    width: 76px !important ;
    min-width: unset;
    min-height: unset;
    height: 32px;
    padding: 0;
    text-align: center;
    line-height: 32px;
    border-radius: 18px;
    background-color: #fff;
    color: #2196f3;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.24);
    &:hover {
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
`;

function EmbedUrl({ onClose, onEdit, widget = {}, info }) {
  const [url, setUrl] = useState(widget.value || '');
  const [preview, setPreview] = useState(!!widget.value);

  const [paras, setParas] = useState(widget.param || []);
  const [config, setConfig] = useState(widget.config || {});
  const { reload = false, newTab = false } = config;
  let urlWithPara = genUrl(url, paras, info);
  return (
    <Dialog
      className="editWidgetDialogWrap"
      visible
      onClose={onClose}
      closeIcon={<Icon icon="close Font26 Gray_75 ThemeHoverColor3" />}
    >
      <Header>
        <div className="typeName">{_l('嵌入url')}</div>
        <Button
          className="saveBtn"
          onClick={() => {
            if (!url) {
              alert(_l('url不能为空'));
              return;
            }
            onEdit({ value: url, param: paras, config });
          }}
        >
          {_l('保存')}
        </Button>
      </Header>
      <ContentWrap>
        <div className="previewWrap">
          {preview ? (
            <PreviewWraper
              reload={reload}
              newTab={newTab}
              value={urlWithPara}
              param={widget.param}
            />
          ) : (
            _l('嵌入网页、视频、图片链接, 你也可以嵌入一个视图、记录的分享链接')
          )}
        </div>
        <div className="configWrap">
          <div className="content">
            <p>{_l('输入url')}</p>
            <Input.TextArea
              className="urlInput"
              autoSize={{ minRows: 4, maxRows: 30 }}
              value={url}
              onChange={e => {
                const value = e.target.value;
                setPreview(false);
                setUrl(value);
              }}
            />
            <Button
              disabled={!url}
              className="previewBtn"
              onClick={() => {
                if (!url) return;
                setPreview(true);
              }}
            >
              {_l('预览')}
            </Button>
            <LinkPara showActionBar paras={paras} setParas={setParas} config={config} setConfig={setConfig} />
            <div className="parasConfigWrap"></div>
          </div>
        </div>
      </ContentWrap>
    </Dialog>
  );
}
export default connect(({ sheet, appPkg, customPage }) => ({
  info: {
    ...sheet.base,
    projectId: appPkg.projectId,
    itemId: customPage.pageId,
  },
}))(EmbedUrl);
