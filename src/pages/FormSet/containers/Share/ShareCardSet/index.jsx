import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, QiniuUpload } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import sheetSetAjax from 'src/api/worksheetSetting';
import { getDynamicValue } from 'src/components/Form/core/formUtils';
import { SHARECARDTYPS, VIEW_TYPE_ICON_LIST, WX_ICON_LIST } from 'src/components/ShareCardConfig/config';
import Input from './Input';
import { Con, UploadBtn } from './style';

const ShareCardSet = forwardRef((props, ref) => {
  const {
    showTips,
    showBaseImg,
    type,
    worksheetId,
    defaultValue,
    canUseControl,
    controls,
    worksheetInfo,
    appId,
    autoSave,
    handleSettingChanged = () => {},
  } = props;
  const [shareConfigValue, setConfig] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const shareData = useRef({ ...shareConfigValue, title: shareConfigValue?.title });

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    onSave,
    shareConfigValue,
  }));

  useEffect(() => {
    type && getShareCardSet();
  }, [type]);

  const getShareCardSet = () => {
    if (worksheetId) {
      sheetSetAjax.getShareCardSetting({ shareCardId: `${worksheetId}_${type}` }).then(res => {
        setConfig({
          ...res,
          title:
            res.title ||
            (type === SHARECARDTYPS.PUBLICWORKSHEET ? `${worksheetInfo.worksheetName} - ${_l('公开填写')}` : ''),
          desc: res.desc || (type === SHARECARDTYPS.PUBLICWORKSHEET ? _l('请填写内容') : ''),
        });
        setLoading(false);
      });
    }
  };

  const onSave = (info, shareCardId) => {
    sheetSetAjax
      .shareCardSetting({
        ..._.omit(info, ['iconUrl']),
        appId,
        appItemId: worksheetId,
        shareCardId,
      })
      .then(res => {
        if (!res) {
          alert(_l('保存失败'), 2);
        }
      });
  };

  const handleUpdateData = info => {
    setConfig(prevConfig => ({ ...prevConfig, ...info }));
    handleSettingChanged();
    autoSave && onSave(info, `${worksheetId}_${type}`);
  };

  const handleUploaded = (up, file) => {
    setIsUploading(false);
    handleUpdateData({ icon: file.key, iconUrl: file.url });
    up.disableBrowse(false);
  };

  const getIconUrl = () => {
    return shareConfigValue?.icon
      ? shareConfigValue?.icon.indexOf('http') < 0
        ? shareConfigValue?.iconUrl
        : shareConfigValue?.icon
      : '';
  };

  const renderUpload = () => {
    const iconUrl = getIconUrl();
    const { pathname } = iconUrl ? new URL(iconUrl) : {};
    const isCustomImg = pathname ? ![...WX_ICON_LIST, ...VIEW_TYPE_ICON_LIST].includes(pathname.slice(1)) : false;

    return (
      <Fragment>
        <QiniuUpload
          options={{
            multi_selection: false,
            filters: {
              mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
            },
            max_file_size: '1m',
            error_callback: () => {
              alert(_l('有不合法的文件格式，请重新选择图片上传'), 3);
              return;
            },
            type: 30,
          }}
          bucket={4}
          onUploaded={handleUploaded}
          onAdd={up => {
            setIsUploading(true);
            up.disableBrowse();
          }}
          onError={(up, err) => {
            if (err.code === -600) alert(_l('上传失败，只允许上传1M以内的文件'), 2);
          }}
        >
          <UploadBtn
            className={isUploading ? 'disabled' : ''}
            height="44"
            bg="#fff"
            color="#151515"
            hoverBg="#f5f5f5"
            borderRadius="6"
          >
            <Icon
              icon={isUploading ? 'loading_button' : 'file_upload'}
              className={cx('Gray_9e', { rotate: isUploading })}
            />
            <span className="Bold">{_l('上传自定义图标')}</span>
          </UploadBtn>
        </QiniuUpload>
        {isCustomImg && (
          <div className="customImgWrap mTop8 flexRow alignItemsCenter justifyContentCenter">
            <img className="fileImage" src={iconUrl} />
            <div className="mask">
              <div className="deleteBtn Hand" onClick={() => handleUpdateData({ icon: '', iconUrl: '' })}>
                <Icon icon="trash" className="Gray_9e Font17" />
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  };

  if (loading) return <LoadDiv />;

  const renderTxt = value => {
    if (!value || !(value || '').startsWith('[')) {
      return value;
    }
    return getDynamicValue(controls, {
      type: 2,
      advancedSetting: {
        defsource: value,
      },
    });
  };

  return (
    <Con>
      <>
        <div className="Font13 Gray mBottom10 LineHeight1em Bold">{props.titleTxt || _l('分享标题')}</div>
        <Input
          worksheetInfo={worksheetInfo}
          canUseControl={canUseControl}
          controls={controls}
          className="w100 fillInput"
          placeholder={props.titlePlaceholder || _l('请输入')}
          defaultValue={shareConfigValue?.title}
          onChangeValue={value => {
            handleUpdateData({ title: value });
            shareData.current.title = value;
          }}
        />
        <div className="Font13 Gray mBottom10 LineHeight1em valignWrapper mTop24">
          <span className="Bold">{props.desTxt || _l('分享描述')}</span>
          {showTips && (
            <Tooltip title={_l('分享描述的内容只在聊天分享中展示')}>
              <Icon icon="help" className="Font16 Gray_9e mLeft10" />
            </Tooltip>
          )}
        </div>
        <Input
          worksheetInfo={worksheetInfo}
          canUseControl={canUseControl}
          controls={controls}
          className="w100 fillInput"
          placeholder={props.desPlaceholder || _l('请输入')}
          defaultValue={shareConfigValue?.desc}
          onChangeValue={value => {
            handleUpdateData({ desc: value });
            shareData.current.desc = value;
          }}
        />
        <div className="Font13 Gray mBottom10 LineHeight1em Bold mTop24">{_l('自定义图标')}</div>
        {showBaseImg && (
          <ul className="wxPublicWrap mBottom10">
            {WX_ICON_LIST.map(l => {
              const imgUrl = `${md.global.FileStoreConfig.pubHost}/${l}`;
              const iconUrl = (getIconUrl() || md.global.FileStoreConfig.pubHost + '/' + WX_ICON_LIST[0]).split('?')[0];
              return (
                <li key={`wx_public_${l}`} onClick={() => handleUpdateData({ icon: imgUrl, iconUrl: imgUrl })}>
                  <img src={imgUrl} />
                  <div className={cx('current', { visible: iconUrl === imgUrl })}>
                    {iconUrl === imgUrl && <Icon icon="done" className="Font24 Bold TxtMiddle" />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {renderUpload()}
        <div className="Font12 Gray_9e mTop10 mBottom24">{_l('建议上传图标尺寸100×100px，大小限制1M以内。')}</div>
        <div className="Font13 Gray mBottom10 LineHeight1em Bold">{_l('预览')}</div>
        <div className="shareCard">
          <div className="card">
            <div className="title Font15 bold mBottom8">
              {renderTxt(shareConfigValue?.title) || defaultValue?.title}
            </div>
            <div className="content">
              <div className="desc flex WordBreak Font13 Gray_9e">
                {renderTxt(shareConfigValue?.desc) || defaultValue?.desc || ''}
              </div>
              <div className="iconWrap flexRow alignItemsCenter justifyContentCenter">
                <img
                  src={
                    getIconUrl() ||
                    `${md.global.FileStoreConfig.pubHost}/` +
                      (type === SHARECARDTYPS.VIEW ? VIEW_TYPE_ICON_LIST[0] : WX_ICON_LIST[0])
                  }
                />
              </div>
            </div>
          </div>
          <div className="arrow">
            <span className="arrow-content"></span>
          </div>
        </div>
      </>
    </Con>
  );
});

export default ShareCardSet;
