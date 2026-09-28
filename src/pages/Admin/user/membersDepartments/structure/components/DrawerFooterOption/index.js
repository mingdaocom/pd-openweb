import React, { Fragment } from 'react';
import { Button } from 'ming-ui/antd-components';

const FOOTER_STYLE = { margin: '25px 24px 20px' };

export default function DrawerFooterOption(props) {
  const {
    actType,
    typeCursor,
    isUploading,
    agreeLoading,
    editCurrentUser = {},
    handleSubmit = () => {},
    saveFn = () => {},
    onClose = () => {},
  } = props;

  const { accountId } = editCurrentUser;

  return (
    <Fragment>
      {(typeCursor === 0 || typeCursor === 1) && actType === 'add' && (
        <div style={FOOTER_STYLE}>
          <Button type="primary" disabled={isUploading} onMouseDown={() => handleSubmit()}>
            {_l('添加')}
          </Button>
          <Button
            color="primary"
            variant="outlined"
            className="mLeft8"
            disabled={isUploading}
            onMouseDown={() => handleSubmit(true)}
          >
            {_l('继续添加')}
          </Button>
          <Button
            color="default"
            variant="text"
            className="mLeft8"
            onClick={() => {
              onClose(true);
            }}
          >
            {_l('取消')}
          </Button>
        </div>
      )}
      {(typeCursor === 0 || typeCursor === 1) && actType !== 'add' && (
        <div style={FOOTER_STYLE}>
          <Button type="primary" disabled={isUploading} onClick={saveFn}>
            {_l('保存')}
          </Button>
          <Button
            color="default"
            variant="text"
            className="mLeft8"
            onClick={() => {
              onClose(true);
            }}
          >
            {_l('取消')}
          </Button>
        </div>
      )}
      {typeCursor === 2 && (
        <div style={FOOTER_STYLE}>
          <Button type="primary" onClick={() => props.fetchReInvite([accountId], onClose)}>
            {_l('重新邀请')}
          </Button>
          <Button color="default" variant="text" className="mLeft8" onClick={onClose}>
            {_l('取消')}
          </Button>
        </div>
      )}
      {typeCursor === 3 && (
        <div style={FOOTER_STYLE}>
          <Button type="primary" loading={agreeLoading} onClick={props.agreeJoin}>
            {agreeLoading ? _l('处理中...') : _l('批准加入')}
          </Button>
          <Button
            color="default"
            variant="text"
            className="mLeft8"
            onClick={() => {
              onClose(true);
            }}
          >
            {_l('取消')}
          </Button>
        </div>
      )}
    </Fragment>
  );
}
