import React, { Fragment, useState } from 'react';
import { Dialog, Tooltip, Icon, FunctionWrap, Input } from 'ming-ui';
import LinkImg from './image/link.png';
import './index.less';

function addLinkFile(props) {
  const { isEdit, showTitleTip = true, data = {}, callback } = props;
  const [name, setName] = useState(data.name);
  const [link, setLink] = useState(data.originLinkUrl);

  const validate = str => {
    var illegalChars = /[\/\\\:\*\?\"\<\>\|]/g;
    var valid = illegalChars.test(str);
    if (valid) {
      alert(_l('链接名称不能包含以下字符：') + '\\ / : * ? " < > |', 3);
      return false;
    }
    return true;
  };

  const validateUrl = url => {
    if (!url.match('://') && !url.match(/^mailto:/)) {
      return true;
    } else if (url.match(/^http/)) {
      return true;
    }
    alert(_l('当前只支持 http:// 和 https:// 开头的链接'), 3);
    return false;
  };

  const save = () => {
    if (name === '') {
      alert(_l('链接名不能为空'), 3);
      return false;
    }
    if (!link) {
      alert(_l('链接url不能为空'), 3);
      return false;
    }
    if (!validate(name)) {
      return false;
    }
    if (!validateUrl(link)) {
      return false;
    }
    if (typeof callback === 'function') {
      callback({
        linkName: name,
        linkContent: link,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    $('.addLinkFileDialog').parent().remove();
  };

  return (
    <Dialog
      visible
      dialogClasses="addLinkFileDialog"
      width={540}
      okText={isEdit ? _l('保存') : _l('创建')}
      title={
        <Fragment>
          <div className="titleCon">
            <span className="Font17 mRight8">{isEdit ? _l('编辑链接') : _l('添加链接')}</span>
            {showTitleTip && (
              <Tooltip
                placement="bottom"
                title={_l('创建链接格式文件，保存一个链接。您可以分享此文件或建立文件夹来管理。')}
              >
                <Icon icon="help" className="icon" />
              </Tooltip>
            )}
          </div>
          <div className="HeaderImgCon">
            <img src={LinkImg} />
          </div>
        </Fragment>
      }
      onOk={save}
      onCancel={handleClose}
    >
      <div>
        <div className="linkItem mTop24">
          <div className="itemLabel">{_l('文件名')}</div>
          <div className="itemContent">
            <Input
              className="w100 addLinkInput"
              placeholder={_l('在下方贴入链接，自动读取标题')}
              value={name}
              onChange={value => setName(value)}
            />
          </div>
        </div>
        <div className="linkItem mTop24">
          <div className="itemLabel">{_l('链接')}</div>
          <div className="itemContent">
            <Input
              className="w100 addLinkInput"
              placeholder="http://"
              value={link}
              onChange={value => setLink(value)}
              onMouseUp={(evt) => {
                var target = evt.target;
                if (target.selectionEnd - target.selectionStart === 0) {
                  target.select();
                }
              }}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default props => {
  FunctionWrap(addLinkFile, { ...props, onClose: () => {} });
};
