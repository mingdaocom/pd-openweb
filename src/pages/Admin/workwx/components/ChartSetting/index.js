import React, { useState, useRef } from 'react';
import { Input, Button } from 'ming-ui';
import copy from 'copy-to-clipboard';
import styled from 'styled-components';

const Wrap = styled.div`
  padding: 20px 24px 0;
  .ming.Button {
    padding: 0 16px !important;
    width: 116px !important;
  }
  input {
    font-size: 12px !important;
    &::-webkit-input-placeholder,
    &:-moz-placeholder,
    &::-moz-placeholder,
    &:-ms-input-placeholder {
      color: #bdbdbd;
    }
  }
`;

export default function ChartSetting(props) {
  const { projectId } = props;
  const [copyValue, setCopyValue] = useState();
  const [url, setUrl] = useState();
  const inputRef = useRef();
  const newURL = _.trim(url);

  return (
    <Wrap>
      <div className="bold mBottom24">{_l('聊天工具栏配置')}</div>
      <div className="Gray_9e LineHeight28">
        <div>
          {_l(
            '此配置为了获取企业微信当前聊天的外部联系人ID（单聊）、客户群ID（群聊），可与聊天工具栏的页面实现互通。使用场景：在 CRM 业务场景中通过企业微信与客户沟通，将客户表视图页面配置在企业微信工具栏中，可以在与客户聊天中右侧工具栏的视图页面展示当前客户的详情信息，便于维护客户关系。',
          )}
        </div>
        <div>
          {_l('1、使用此配置功能之前需要先将企业微信的')}
          <span className="Gray_75">{_l('外部联系人ID（external_userid）和客户群ID（chat_id）')}</span>
          {_l('同步到平台内的工作表中')}
        </div>
        <div>
          {_l(
            '2、将需要展示在工具栏的页面视图链接复制到此处，系统会自动生成能够获取外部联系人ID /客户群ID的链接 /客户群ID的链接',
          )}
        </div>
        <div>{_l('3、将生成的链接复制到企业微信工具栏的自定义页面内')}</div>
        <div>
          {_l(
            '4、配置视图-链接参数内需要增加两个参数，名称为：external_userid、chat_id；用过视图过滤筛选在企业微信工具栏页面展示对应的客户信息',
          )}
        </div>
      </div>
      <div className="bold mBottom24 mTop24">{_l('视图链接')}</div>
      <div className="flexRow mBottom20">
        <Input
          ref={inputRef}
          placeholder={_l('将视图链接复制到输入框内')}
          className="flex"
          value={url}
          onChange={val => setUrl(val)}
        />
        <Button
          disabled={!newURL}
          className="mLeft20"
          onClick={() => {
            setCopyValue(`${location.origin}/auth/chatTools?p=${projectId}&url=${newURL.split('?')[0]}`);
          }}
        >
          {_l('生成企微链接')}
        </Button>
      </div>
      <div className="flexRow">
        <Input disabled={true} className="flex" value={copyValue} />
        <Button
          disabled={!copyValue}
          className="mLeft20"
          onClick={() => {
            copy(copyValue);
            alert(_l('复制成功'));
          }}
        >
          {_l('复制')}
        </Button>
      </div>
    </Wrap>
  );
}
