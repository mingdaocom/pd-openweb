import React, { useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, LoadDiv, QiniuUpload } from 'ming-ui';
import { Popover } from 'ming-ui/antd-components';
import groupAjax from 'src/api/group';

const PopupWrap = styled.div`
  text-align: left;
  width: 400px;

  .settingPictureLayerTitle {
    font-size: 13px;
    padding: 12px 0 0 15px;
    color: var(--color-text-tertiary);
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
  const uploaderRef = useRef(null);

  const [{ avatarSelect, loading, visible }, setState] = useSetState({
    avatarSelect: {},
    loading: false,
    visible: false,
  });

  useEffect(() => {
    if (avatarSelect.basePath || !visible) return;

    groupAjax.getGroupAvatarSelectList().then(res => {
      setState({ avatarSelect: res });
    });
  }, [avatarSelect.basePath, setState, visible]);

  const refreshUploader = useCallback(() => {
    uploaderRef.current?.uploader?.refresh();
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Popover 动画和头像列表异步渲染都会改变入口位置，需要同步 plupload 的透明文件选择层。
    const animationFrame = requestAnimationFrame(refreshUploader);
    return () => cancelAnimationFrame(animationFrame);
  }, [avatarSelect.basePath, refreshUploader, visible]);

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
          ref={uploaderRef}
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
          className="Font20 pointer textTertiary hoverColorPrimary closeIcon"
          onClick={() => setState({ visible: false })}
        />
      </PopupWrap>
    );
  };

  return (
    <Popover
      noPadding
      trigger="click"
      open={visible}
      onOpenChange={value => setState({ visible: value })}
      afterOpenChange={value => value && refreshUploader()}
      placement="bottom"
      content={renderPopup()}
    >
      {children || <span>{_l('修改')}</span>}
    </Popover>
  );
}
