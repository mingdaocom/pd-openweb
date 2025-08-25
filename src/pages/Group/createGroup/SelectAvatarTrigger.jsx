import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, LoadDiv, QiniuUpload } from 'ming-ui';
import groupAjax from 'src/api/group';

const PopupWrap = styled.div`
  background: #fff;
  border-radius: 4px;
  text-align: left;
  width: 400px;
  box-shadow:
    0 5px 11px 0 rgba(0, 0, 0, 0.12),
    0 4px 15px 0 rgba(0, 0, 0, 0.1);

  .settingPictureLayerTitle {
    font-size: 13px;
    padding: 12px 0 0 15px;
    color: #999;
  }

  .settingPictureLayerImg {
    padding: 0 0 0 16px;
    position: relative;
    z-index: 1;
  }

  .settingPictureLayerImg img {
    float: left;
    width: 68px;
    height: 68px;
    margin: 7px 7px 0 0;
  }

  .settingPictureLayerImg img:hover {
    transition: transform 0.5s;
    transform: scale(1.1);
  }

  .closeIcon {
    position: absolute;
    right: 5px;
    top: 5px;
  }

  .insertGroupImg {
    font-size: 13px;
    line-height: 45px;
    height: 45px;
    padding-left: 20px;
  }
`;

export default function SelectAvatarTrigger(props) {
  const { children, onChange } = props;

  const [{ avatarSelect, loading, visible }, setState] = useSetState({
    avatarSelect: {},
    loading: false,
    visible: false,
  });

  useEffect(() => {
    if (avatarSelect.basePath || !visible) return;

    getGroupAvatarSelectList();
  }, [visible]);

  const getGroupAvatarSelectList = () => {
    groupAjax.getGroupAvatarSelectList().then(res => {
      setState({ avatarSelect: res });
    });
  };

  const renderPopup = () => {
    return (
      <PopupWrap className="settingPictureLayer">
        <div className="settingPictureLayerTitle">{_l('系统头像')}</div>
        {avatarSelect.basePath ? (
          <div className="settingPictureLayerImg clearfix">
            {avatarSelect.names.map((l, i) => (
              <img
                data-name={l}
                key={`select-avatar-group-${l}-${i}`}
                src={`${avatarSelect.basePath}${l}?imageView2/1/w/100/h/100/q/90`}
                class="Hand singleHead"
                onClick={() => onChange({ avatar: avatarSelect.basePath + l, avatarName: l })}
              />
            ))}
          </div>
        ) : (
          <LoadDiv />
        )}
        <QiniuUpload
          options={{
            multi_selection: false,
            filters: {
              mime_types: [{ extensions: 'gif,png,jpg,jpeg,bmp' }],
            },
            max_file_size: '2m',
            type: 2,
          }}
          bucket={4}
          onUploaded={(up, file) => {
            setState({ loading: false });
            onChange({ avatar: file.url, avatarName: file.fileName });
            up.disableBrowse(false);
          }}
          onAdd={up => {
            setState({ loading: true });
            up.disableBrowse();
          }}
          onUploadComplete={up => {
            setState({ loading: false });
            up.disableBrowse(false);
          }}
          onError={(up, err, errTip) => {
            setState({ loading: false });
            alert(errTip, 2);
            up.disableBrowse(false);
          }}
        >
          <div className="insertGroupImg">
            <a href="javascript:void(0);">{loading ? _l('上传中...') : _l('使用自定义头像')}</a>
          </div>
        </QiniuUpload>
        <Icon
          icon="close"
          className="Font20 pointer Gray_9e ThemeHoverColor3 closeIcon"
          onClick={() => setState({ visible: false })}
        />
      </PopupWrap>
    );
  };

  return (
    <Trigger
      action={['click']}
      zIndex={1000}
      popupVisible={visible}
      onPopupVisibleChange={value => setState({ visible: value })}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [-200, 10],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={renderPopup()}
    >
      {children || <span>{_l('修改')}</span>}
    </Trigger>
  );
}
