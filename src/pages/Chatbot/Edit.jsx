import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Input, QiniuUpload, Switch, Textarea } from 'ming-ui';
import processApi from 'src/pages/workflow/api/process';
import { AGENT_TOOLS } from 'src/pages/workflow/WorkflowSettings/enum';
import defaultProfile from './assets/profile.png';

const Wrap = styled.div`
  width: 360px;
  padding: 17px;
  border-left: 1px solid #e0e0e0;
  .title {
    color: var(--title-color);
  }
  .editContent {
    overflow-y: auto;
    overflow-x: hidden;
    margin: 0 -15px;
    padding: 0 15px;
  }
  .subTitle {
    font-size: 12px;
    color: var(--sub-title-color);
  }
  input,
  textarea {
    font-size: 13px !important;
    color: var(--title-color);
    background-color: var(--input-bg-color);
  }
  textarea {
    &:hover:not(:focus) {
      border-color: #bbb !important;
    }
    &:focus {
      border-color: #1e88e5 !important;
    }
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #dddddd;
    position: relative;
    .avatarHover,
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
    &:hover .avatarHover {
      display: flex;
    }
    .avatarHover {
      color: #fff;
      position: absolute;
      top: 0;
      left: 0;
      background: #00000080;
      display: none;
    }
  }
  .divider {
    width: 100%;
    height: 1px;
    background: #ddd;
  }
  .settingFlow {
    color: #fff;
    min-height: 40px;
    border-radius: 4px;
    justify-content: center;
    background-color: var(--app-primary-color);
    &:hover {
      background-color: var(--app-primary-hover-color);
    }
  }
`;

const Edit = props => {
  const { chatbotConfig, onChatbotConfig } = props;
  const { data, onClose } = props;
  const previewIconUrl = chatbotConfig.previewIconUrl || chatbotConfig.iconUrl;
  const [originalChatbotConfig, setOriginalChatbotConfig] = useState({});
  const DEFAULT_TOOLS_NAMES = {
    1: _l('新增记录'),
    2: _l('更新记录'),
    3: _l('查询记录'),
    4: _l('汇总'),
  };
  const allowUploadImage = chatbotConfig.uploadPermission.split('')[0] === '1';
  const allowUploadOffice = chatbotConfig.uploadPermission.split('')[1] === '1';

  const handleSave = param => {
    processApi
      .saveChatbotConfig({
        chatbotId: data.chatbotId,
        ...chatbotConfig,
        ...param,
      })
      .then(() => {
        const data = {
          ...chatbotConfig,
          ...param,
        };
        onChatbotConfig(data);
        setOriginalChatbotConfig(data);
      });
  };

  useEffect(() => {
    setOriginalChatbotConfig(chatbotConfig);
  }, []);

  return (
    <Wrap className="flexColumn">
      <div className="header flexRow alignItemsCenter mBottom20">
        <div className="title Font17 bold flex">{_l('编辑对话机器人')}</div>
        <Icon icon="close" className="Gray_75 pointer Font20" onClick={onClose} />
      </div>
      <div className="flex editContent">
        <div className="mBottom20">
          <div className="title mBottom8 bold">{_l('名称')}</div>
          <Input
            className="w100"
            value={chatbotConfig.name}
            onChange={value => {
              onChatbotConfig(values => ({ ...values, name: value }));
            }}
            onBlur={event => {
              const { value } = event.target;
              if (value) {
                handleSave({ name: value.trim() });
              } else {
                onChatbotConfig(values => ({ ...values, name: originalChatbotConfig.name }));
                alert(_l('%0不允许为空', _l('名称')), 3);
              }
            }}
          />
        </div>
        <div className="mBottom20">
          <div className="title mBottom8 bold">{_l('头像')}</div>
          <QiniuUpload
            options={{
              multi_selection: false,
              filters: {
                mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
              },
              type: 70,
              max_file_size: '5m',
            }}
            onUploaded={(up, file) => {
              up.disableBrowse(false);
              const url = file.serverName + file.key;
              handleSave({ iconUrl: url, previewIconUrl: file.url });
            }}
            onAdd={up => {
              up.disableBrowse();
            }}
            onError={(up, err, errTip) => {
              alert(errTip, 2);
            }}
          >
            <div className="avatar pointer">
              <img src={previewIconUrl || defaultProfile} />
              <div className="flexRow alignItemsCenter justifyContentCenter avatarHover">
                <Icon icon="upload_pictures" className="Font18" />
              </div>
            </div>
          </QiniuUpload>
        </div>
        <div className="mBottom20">
          <div className="title mBottom6 bold">{_l('欢迎语')}</div>
          <div className="subTitle mBottom8">{_l('机器人在对话开始时自动发送的问候或提示语')}</div>
          <Input
            className="w100"
            value={chatbotConfig.welcomeText}
            onChange={value => {
              onChatbotConfig(values => ({ ...values, welcomeText: value }));
            }}
            onBlur={event => {
              const { value } = event.target;
              if (value) {
                handleSave({ welcomeText: value.trim() });
              } else {
                onChatbotConfig(values => ({ ...values, welcomeText: originalChatbotConfig.welcomeText }));
                alert(_l('%0不允许为空', _l('欢迎语')), 3);
              }
            }}
          />
        </div>
        <div className="mBottom20">
          <div className="title mBottom6 bold">{_l('预设提问')}</div>
          <div className="subTitle mBottom8">
            {_l(
              '预设提问用于引导用户，帮助用户快速选择提问方向并进入流程。预设提问按行展示，一行对应一个。预设提问最多可配置 5 个。',
            )}
          </div>
          <Textarea
            className="w100"
            value={chatbotConfig.presetQuestion}
            onChange={value => {
              onChatbotConfig(values => ({ ...values, presetQuestion: value }));
            }}
            onBlur={event => {
              const { value } = event.target;
              if (value) {
                const list = value.split('\n').filter(item => item.trim());
                if (list.length > 5) {
                  alert(_l('预置提问最多设置5个'), 3);
                  onChatbotConfig(values => ({ ...values, presetQuestion: originalChatbotConfig.presetQuestion }));
                } else {
                  handleSave({ presetQuestion: value.trim() });
                }
              } else {
                onChatbotConfig(values => ({ ...values, presetQuestion: originalChatbotConfig.presetQuestion }));
                alert(_l('%0不允许为空', _l('预设提问')), 3);
              }
            }}
          />
        </div>
        <div className="mBottom20">
          <div className="title mBottom6 bold">{_l('其他')}</div>
          <div className="flexRow alignItemsCenter mBottom10">
            <div className="flex flexRow alignItemsCenter">{_l('上传图片')}</div>
            <Switch
              size="small"
              checked={allowUploadImage}
              onClick={() => {
                const res = chatbotConfig.uploadPermission
                  .split('')
                  .map((item, index) => (index === 0 ? (allowUploadImage ? '0' : '1') : item))
                  .join('');
                handleSave({
                  uploadPermission: res,
                });
              }}
            />
          </div>
          <div className="flexRow alignItemsCenter mBottom10">
            <div className="flex flexRow alignItemsCenter">{_l('上传文档')}</div>
            <Switch
              size="small"
              checked={allowUploadOffice}
              onClick={() => {
                const res = chatbotConfig.uploadPermission
                  .split('')
                  .map((item, index) => (index === 1 ? (allowUploadOffice ? '0' : '1') : item))
                  .join('');
                handleSave({
                  uploadPermission: res,
                });
              }}
            />
          </div>
          <div className="flexRow alignItemsCenter">
            <div className="flex flexRow alignItemsCenter">{_l('分享对话')}</div>
            <Switch
              size="small"
              checked={chatbotConfig.allowShare}
              onClick={() => {
                handleSave({ allowShare: !chatbotConfig.allowShare });
              }}
            />
          </div>
        </div>
        {!_.isEmpty(chatbotConfig.agentNodes) && (
          <Fragment>
            <div className="divider mTop10 mBottom20" />
            <div className="mBottom16">
              <div className="title mBottom6 bold">{_l('工具')}</div>
              <div className="subTitle mBottom8">{_l('当前机器人可调用的工具，需在流程中配置')}</div>
            </div>
            {chatbotConfig.agentNodes.map(node => (
              <div className="mBottom20" key={node.id}>
                {chatbotConfig.agentNodes.length > 1 && <div className="title mBottom6 bold">{node.name}</div>}
                {node.toolNodes.map(tool => (
                  <div key={tool.toolId} className="flexRow alignItemsCenter mBottom5">
                    <i className={cx(AGENT_TOOLS[tool.type].icon, 'Gray_9e Font16')} />
                    <div className="flex mLeft5">
                      <span className="mRight3">
                        {_.includes([1, 2, 3, 4], tool.type) ? DEFAULT_TOOLS_NAMES[tool.type] : tool.name}
                      </span>
                      <span className="Gray_9e">
                        ({tool.apps.length ? tool.apps.map(app => app.name).join('、') : _l('全部')})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Fragment>
        )}
      </div>
      <div
        className="settingFlow flexRow alignItemsCenter pointer bold"
        onClick={() => {
          window.open(`/workflowedit/${data.chatbotId}`);
        }}
      >
        {_l('配置流程')}
      </div>
    </Wrap>
  );
};

export default Edit;
