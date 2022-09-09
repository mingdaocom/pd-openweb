import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { ConfigProvider, Button, Tooltip } from 'antd';
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
    height: 36px;
    padding: 0 15px;
    color: #40a9ff;
    border: none;
    border-radius: 24px;
    &:hover {
      color: #1079cc;
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
  const handleSave = () => {
    if (!url) {
      alert(_l('url不能为空'));
      return;
    }
    onEdit({ value: url, param: paras, config });
  }
  return (
    <Dialog
      className="editWidgetDialogWrap"
      visible
      onClose={onClose}
    >
      <ConfigProvider autoInsertSpaceInButton={false}>
        <Header>
          <div className="typeName">{_l('嵌入url')}</div>
          <div className="flexRow valignWrapper">
            <Button block className="save" shape="round" type="primary" onClick={handleSave}>
              {_l('保存')}
            </Button>
            <Tooltip title={_l('关闭')} placement="bottom">
              <Icon icon="close" className="Font24 pointer mLeft16 Gray_9e" onClick={onClose} />
            </Tooltip>
          </div>
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
                className="previewBtn"
                onClick={() => {
                  if (!url) return;
                  setPreview(true);
                }}
              >
                <span className="bold">{_l('预览')}</span>
              </Button>
              <LinkPara showActionBar paras={paras} setParas={setParas} config={config} setConfig={setConfig} />
              <div className="parasConfigWrap"></div>
            </div>
          </div>
        </ContentWrap>
      </ConfigProvider>
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
