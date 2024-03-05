import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { PICK_TYPE } from '../constant/enum';

export default function KcListEmpty(props) {
  const { isReadOnly, isRecycle, root, keywords, openUploadAssistant } = props;
  let iconClassName;
  let statusText;
  if (root === PICK_TYPE.RECENT) {
    iconClassName = 'recently';
  } else if (root === PICK_TYPE.STARED) {
    iconClassName = 'starFile';
  } else {
    iconClassName = 'noFile';
  }
  if (keywords) {
    statusText = _l('搜索无结果');
  } else if (root === PICK_TYPE.RECENT) {
    statusText = _l('您没有最近使用的文件');
  } else if (root === PICK_TYPE.STARED) {
    statusText = _l('您没有星标文件');
  } else {
    statusText = _l('您当前没有文件');
  }
  return (<ul className="clearPadding">
    <div className="clearStyle">
      <span className="noListMessage Relative">
        <span
          className={cx(
            iconClassName,
            { noUpload: isRecycle },
            { isReadOnly },
            { noSearchFile: keywords }
          )}
          onClick={
            !keywords && !isReadOnly && root !== PICK_TYPE.RECENT && root !== PICK_TYPE.STARED && !isRecycle
            ? openUploadAssistant
            : undefined
          }
        />
        <span className="Font17">
          { statusText }
        </span>
        {
          !keywords
          && !isRecycle
          && root !== PICK_TYPE.RECENT
          && root !== PICK_TYPE.STARED
          && !isReadOnly
          && <div className="Font14">
            {_l('点')}
            <span className="pointer" onClick={openUploadAssistant}>
              {_l('[添加]')}
            </span>
            {_l('在此目录添加内容')}
          </div>
        }
        {!isRecycle && root === PICK_TYPE.STARED && <div className="Font14">{_l('使用右键菜单，为重要的文件添加星标')}</div>}
      </span>
    </div>
    <div className="noListBG ThemeBG" />
  </ul>);
}

KcListEmpty.propTypes = {
  isReadOnly: PropTypes.bool,
  isRecycle: PropTypes.bool,
  root: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({}),
  ]),
  keywords: PropTypes.string,
  openUploadAssistant: PropTypes.func,
};

