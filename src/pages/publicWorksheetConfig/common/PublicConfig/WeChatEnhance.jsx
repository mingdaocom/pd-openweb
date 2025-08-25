import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Input, QiniuUpload, Tooltip } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import { CustomButton } from 'worksheet/components/Basics';
import { WX_ICON_LIST } from '../../enum';
import SectionTitle from './SectionTitle';
import WeChatSettings from './WeChatSettings';

const Con = styled.div`
  .shareCard {
    position: relative;
    width: 320px;
    min-height: 110px;
    border-radius: 3px;
    .card {
      width: 100%;
      min-height: 110px;
      background-color: #fff;
      background-clip: padding-box;
      padding: 19px 19px 18px 16px;
      position: relative;
      z-index: 9;
      box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
      display: flex;
      flex-direction: column;
      .desc {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 24px;
      }
      .title {
        line-height: 17px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .content {
      gap: 10px;
      display: flex;
    }
    .iconWrap {
      width: 48px;
      height: 48px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .arrow {
      position: absolute;
      display: block;
      width: 22px;
      height: 22px;
      overflow: hidden;
      background: 0 0;
      pointer-events: none;
      left: 0;
      transform: translate(-100%);
      top: 12px;
      z-index: 9;
      > span {
        box-shadow: 3px 3px 7px rgba(0, 0, 0, 0.16);
        transform: translate(11px) rotate(135deg);
        position: absolute;
        inset: 0;
        display: block;
        width: 11.3137085px;
        height: 11.3137085px;
        margin: auto;
        content: '';
        pointer-events: auto;
        border-radius: 0 0 2px;
        pointer-events: none;
        &::before {
          position: absolute;
          top: -11.3137085px;
          left: -11.3137085px;
          width: 33.9411255px;
          height: 33.9411255px;
          background: #fff;
          background-repeat: no-repeat;
          background-position: -10px -10px;
          content: '';
          clip-path: path(
            'M 9.849242404917499 24.091883092036785 A 5 5 0 0 1 13.384776310850237 22.627416997969522 L 20.627416997969522 22.627416997969522 A 2 2 0 0 0 22.627416997969522 20.627416997969522 L 22.627416997969522 13.384776310850237 A 5 5 0 0 1 24.091883092036785 9.849242404917499 L 23.091883092036785 9.849242404917499 L 9.849242404917499 23.091883092036785 Z'
          );
        }
      }
    }
  }
  .wxPublicWrap {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
    li {
      width: 60px;
      height: 60px;
      border-radius: 3px;
      border: 1px solid #e8e8e8;
      text-align: center;
      position: relative;
      &:hover {
        .current {
          opacity: 1;
        }
      }
      img {
        height: 100%;
        width: auto;
      }
      .current {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        line-height: 60px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
        opacity: 0;
        &.visible {
          opacity: 1;
        }
        .Icon {
          color: #fff;
        }
      }
    }
  }
  .fillInput {
    border-color: #ddd !important;
    &:hover {
      border-color: #ccc !important;
    }
    &:focus {
      border-color: #1e88e5 !important;
    }
  }
  .customImgWrap {
    width: 58px;
    height: 58px;
    position: relative;
    .fileImage {
      width: 100%;
      height: 100%;
    }
    .mask {
      opacity: 0;
      background-color: rgba(0, 0, 0, 0.6);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      .deleteBtn {
        width: 32px;
        height: 24px;
        background: #fff;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: 12px;
        bottom: 12px;
        &:hover {
          .Icon {
            color: red !important;
          }
        }
      }
    }
    &:hover {
      .mask {
        opacity: 1;
      }
    }
  }
`;

const UploadBtn = styled(CustomButton)`
  border: 1px solid #e0e0e0;
  width: fit-content;
  &.disabled {
    cursor: not-allowed;
    background-color: #f5f5f5;
  }
  .icon {
    display: inline-block;
    position: relative;
    top: 3px;
    margin-right: 4px;
    font-size: 20px;
  }
`;

function WeChatEnhance(props) {
  const {
    worksheetInfo = {},
    data,
    shareConfig = '{}',
    setState,
    addWorksheetControl,
    handleUpdateExpandDatas,
  } = props;
  const shareConfigValue = safeParse(shareConfig, 'object');
  const [weChatBind, setWeChatBind] = useState({ isBind: false });
  const [expandKeys, setExpandKeys] = useState({ share: false });
  const [isUploading, setIsUploading] = useState(false);
  const title = _.get(shareConfigValue, 'title');
  const desc = _.get(shareConfigValue, 'desc');
  const shareData = useRef({ ...shareConfigValue, title });

  useEffect(() => {
    getWeiXinBindingInfo();
  }, []);

  const getWeiXinBindingInfo = () => {
    appManagementApi.getWeiXinBindingInfo({ appId: worksheetInfo.appId }).then(res => {
      const value = { isBind: res && res.length, name: (res[0] || {}).nickName };
      setWeChatBind(value);
      setState({ weChatBind: value }, false);
    });
  };

  const handleUploaded = (up, file) => {
    setIsUploading(false);
    handleUpdateExpandDatas({ shareConfig: JSON.stringify({ ...shareData.current, icon: file.url }) });
    up.disableBrowse(false);
  };

  const renderUpload = () => {
    const { pathname } = shareConfigValue.icon ? new URL(shareConfigValue.icon) : {};
    const isCustomImg = pathname ? !WX_ICON_LIST.includes(pathname.slice(1)) : false;

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
          <div className="customImgWrap mTop8">
            <img className="fileImage" src={shareConfigValue.icon} />
            <div className="mask">
              <div
                className="deleteBtn Hand"
                onClick={() =>
                  handleUpdateExpandDatas({
                    shareConfig: JSON.stringify({
                      ...shareData.current,
                      icon: md.global.FileStoreConfig.pubHost + WX_ICON_LIST[0],
                    }),
                  })
                }
              >
                <Icon icon="trash" className="Gray_9e Font17" />
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <Con>
      {!md.global.SysSettings.hideWeixin && (
        <WeChatSettings
          projectId={worksheetInfo.projectId}
          data={data}
          weChatBind={weChatBind}
          setState={setState}
          addWorksheetControl={addWorksheetControl}
        />
      )}
      <SectionTitle
        title={_l('分享卡片')}
        isFolded={expandKeys.share}
        onClick={() => setExpandKeys({ ...expandKeys, share: !expandKeys.share })}
      />
      {!expandKeys.share && (
        <div className="mLeft25">
          <div className="Font13 Gray mBottom10 LineHeight1em Bold">{_l('分享标题')}</div>
          <Input
            className="w100 mBottom24 fillInput"
            placeholder={_l('请输入')}
            value={title}
            onChange={value => {
              handleUpdateExpandDatas({ shareConfig: JSON.stringify({ ...shareConfigValue, title: value }) });
              shareData.current.title = value;
            }}
          />
          <div className="Font13 Gray mBottom10 LineHeight1em valignWrapper">
            <span className="Bold">{_l('分享描述')}</span>
            <Tooltip text={_l('分享描述的内容只在聊天分享中展示')}>
              <Icon icon="help" className="Font16 Gray_9e mLeft10" />
            </Tooltip>
          </div>
          <Input
            className="w100 mBottom24 fillInput"
            placeholder={_l('请输入')}
            value={desc}
            onChange={value => {
              handleUpdateExpandDatas({ shareConfig: JSON.stringify({ ...shareConfigValue, desc: value }) });
              shareData.current.desc = value;
            }}
          />
          <div className="Font13 Gray mBottom10 LineHeight1em Bold">{_l('自定义图标')}</div>
          <ul className="wxPublicWrap mBottom10">
            {WX_ICON_LIST.map(l => {
              const imgUrl = md.global.FileStoreConfig.pubHost + l;
              const iconUrl = (shareConfigValue.icon || md.global.FileStoreConfig.pubHost + WX_ICON_LIST[0]).split(
                '?',
              )[0];

              return (
                <li
                  key={`wx_public_${l}`}
                  onClick={() =>
                    handleUpdateExpandDatas({ shareConfig: JSON.stringify({ ...shareData.current, icon: imgUrl }) })
                  }
                >
                  <img src={imgUrl} />
                  <div className={cx('current', { visible: iconUrl === imgUrl })}>
                    {iconUrl === imgUrl && <Icon icon="done" className="Font24 Bold TxtMiddle" />}
                  </div>
                </li>
              );
            })}
          </ul>
          {renderUpload()}
          <div className="Font12 Gray_9e mBottom24">{_l('建议上传图标尺寸100×100px，大小限制1M以内。')}</div>
          <div className="Font13 Gray mBottom10 LineHeight1em Bold">{_l('预览')}</div>
          <div className="shareCard">
            <div className="card">
              <div className="title Font15 bold mBottom8">{title}</div>
              <div className="content">
                <div className="desc flex WordBreak Font13 Gray_9e">{desc || ''}</div>
                <div className="iconWrap">
                  <img src={shareConfigValue.icon || md.global.FileStoreConfig.pubHost + WX_ICON_LIST[0]} />
                </div>
              </div>
            </div>
            <div className="arrow">
              <span className="arrow-content"></span>
            </div>
          </div>
        </div>
      )}
    </Con>
  );
}

export default WeChatEnhance;
