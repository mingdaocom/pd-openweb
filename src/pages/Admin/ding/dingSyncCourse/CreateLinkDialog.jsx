import React, { Fragment, useState } from 'react';
import { Icon, Button, Dialog, Input } from 'ming-ui';
import copy from 'copy-to-clipboard';
import { isUrlRequest } from 'src/util';

const CreateLinkDialog = props => {
  const { visible, onCancel } = props;
  const { baseUrl, projectId, isWX } = props;
  const [appLink, setAppLink] = useState('');
  const [ssoLink, setSsoLink] = useState('');
  const title = isWX ? _l('企业微信') : _l('钉钉');

  const handleCreateLink = () => {
    if (!isUrlRequest(appLink)) {
      alert(_l('url 格式不正确'), 3);
      return;
    }
    if (isWX) {
      const url = `${baseUrl}?p=${projectId}&url=${encodeURIComponent(appLink)}`;
      setSsoLink(url);
    } else {
      const { pathname } = new URL(appLink);
      const ret = pathname.replace(/^\//, '');
      const url = `${baseUrl}&p=${projectId}&ret=${encodeURIComponent(ret)}`;
      setSsoLink(url);
    }
  }

  return (
    <Dialog
      visible={visible}
      width={640}
      className="createLinkDialog"
      title={_l('生成%0链接', title)}
      footer={null}
      onCancel={onCancel}
    >
      <div className="flexRow valignWrapper mBottom15 mTop15">
        <div className="Gray_9e label">{_l('应用内链接')}</div>
        <Input value={appLink} onChange={value => setAppLink(value)} className="flex mLeft15 mRight10" placeholder={_l('可以使用应用、视图、自定义页面、表单等链接')}/>
        <Button
          className="pLeft10 pRight10"
          onClick={handleCreateLink}
        >
          {_l('生成链接')}
        </Button>
      </div>
      <div className="flexRow valignWrapper mBottom20">
        <div className="Gray_9e label">{_l('%0链接', title)}</div>
        <Input className="flex mLeft15 mRight10 readonly" value={ssoLink} readOnly />
        <Button
          className="pLeft10 pRight10"
          type="danger"
          onClick={() => {
            if (ssoLink) {
              copy(ssoLink);
              alert(_l('复制成功'));
            }
          }}
        >
          {_l('复制')}
        </Button>
      </div>
    </Dialog>
  );
}

export default CreateLinkDialog;
