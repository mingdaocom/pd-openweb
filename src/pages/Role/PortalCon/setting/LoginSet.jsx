import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv, SvgIcon, QiniuUpload } from 'ming-ui';
import cx from 'classnames';
import { COLORS, BGTYPE } from 'src/pages/Role/PortalCon/tabCon/util';
import cbg from './img/center.png';
import cCbg from './img/centerC.png';
import rbg from './img/right.png';
import rCbg from './img/rightC.png';
const Wrap = styled.div`
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
  }
  .pageTitle {
    width: 592px;
    height: 36px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    padding: 0 14px;
    &:hover {
      border: 1px solid #bdbdbd;
    }
    &:focus {
      border: 1px solid #2196f3;
    }
  }
  .uploadLogo {
    width: 240px;
    height: 80px;
    background: #ffffff;
    border: 2px dashed #e0e0e0;
    border-radius: 4px;
    line-height: 80px;
    position: relative;
    color: #2196f3;
    padding: 6px;
    .upload_logo {
      height: 100%;
      width: 100%;
      font-weight: 500;
      i {
        vertical-align: top;
        display: inline-block;
        line-height: 62px;
      }
      span {
        font-size: 16px;
        vertical-align: top;
        display: inline-block;
        line-height: 64px;
      }
    }
    .delete {
      position: absolute;
      right: -9px;
      top: -9px;
      color: #9e9e9e;
      display: none;
      background: #fff;
      border-radius: 50%;
      &:hover {
        color: #2196f3;
      }
    }
    &:hover {
      background: rgba(33, 150, 243, 0.1);
      border: 2px dashed #2196f3;
      .delete {
        display: block;
      }
    }
    img {
      height: 64px;
      vertical-align: top;
      max-width: 100%;
      object-fit: contain;
    }
  }
  .pageMode {
    li {
      .iconBox {
        width: 80px;
        height: 58px;
        background: #f7f7f7;
        border-radius: 6px;
        position: relative;
        background: url(${cbg}) no-repeat;
        background-size: contain;
        i {
          padding: 1px;
          position: absolute;
          right: -9px;
          top: -9px;
          background: #fff;
          border-radius: 50%;
        }
      }
      &.rightIconBox {
        .iconBox {
          background: url(${rbg}) no-repeat;
          background-size: contain;
        }
      }
      &.current,
      &:hover {
        .iconBox {
          background: url(${cCbg}) no-repeat;
          background-size: contain;
        }
        &.rightIconBox {
          .iconBox {
            background: url(${rCbg}) no-repeat;
            background-size: contain;
          }
        }
      }
      &.current {
        .iconBox {
          box-shadow: none;
        }
      }
      &:hover {
        .iconBox {
          box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
        }
      }
    }
  }
  .bgTypeUl {
    .bgTypeUlLi {
      height: 36px;
      padding: 0 20px;
      background: #ffffff;
      border: 1px solid #f5f5f5;
      border-radius: 0px 3px 3px 0px;
      line-height: 34px;
      text-align: center;
      margin-right: -1px;
      &:nth-child(1) {
        border-radius: 3px 0px 0px 3px;
      }
      &.current {
        background: #2196f3;
        color: #fff;
        position: relative;
        z-index: 1;
      }
    }
  }
  .colorLi {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    margin-right: 14px;
    text-align: center;
    line-height: 28px;
    vertical-align: top;
    transition: all 0.4s ease;
    margin-top: 14px;
    &:hover,
    &.current {
      transform: scale(1.22);
    }

    .check {
      color: #fff;
      vertical-align: middle;
      font-size: 18px;
    }
  }
  .upload_imageBg {
    padding: 0 16px;
    background: #f3faff;
    border-radius: 6px;
    color: #2196f3;
    display: inline-block;
    height: 44px;
    line-height: 44px;
    min-width: 240px;
    font-weight: 500;
    &:hover {
      background: #ebf6fe;
    }
  }
  .hideUploadBgTxt {
    color: #9e9e9e;
    a {
      color: #2196f3;
    }
  }
  .loginDemo {
    position: fixed;
    left: 0;
    top: 50px;
    bottom: 0;
    right: 640px;
  }
`;
const WrapDemo = styled.div`
  @media (max-width: 1000px) {
    display: none;
  }
  display: flex;
  background-color: rgb(245, 245, 245);
  width: calc(100% - 64px);
  height: 80%
  border-radius:8px;
  position: relative;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  background-repeat: no-repeat;
  background-size: cover;
  overflow: auto;
  .backImageUrl {
    flex: 1;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
  }
`;
const WrapCon = styled.div`
  background: #ffffff;
  width: 50%;
  padding: 50px;
  p {
    margin: 0;
    padding: 0;
  }
  img {
    max-width: 100%;
    object-fit: contain;
  }
  .logoImageUrlIcon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    div {
      height: 28px;
    }
  }
  &.isCenterCon {
    padding: 32px 32px 40px;
    width: 320px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .pageTitleDeme {
    font-size: 16px;
    font-weight: 600;
  }

  .txtMobilePhone {
    max-width: 360px;
    height: 32px;
    background: #f8f8f8;
    border-radius: 3px;
    max-width: 100%;
  }
  .loginBtn {
    max-width: 360px;
    width: 100%;
    height: 32px;
    background: #d3ebff;
    opacity: 1;
    border-radius: 3px;
  }
  &.isR {
    .btnCon {
      max-width: 360px;
      margin: 0 auto;
      padding-top: 90px;
    }
  }
`;
export default function LoginSet(props) {
  const { appId, appPkg = {}, onChangePortalSet } = props;
  const [portalSetModel, setPortalSetModel] = useState({});
  const {
    iconColor = '#00bcd4',
    iconUrl = md.global.FileStoreConfig.pubHost.replace(/\/$/, '') + '/customIcon/0_lego.svg',
  } = appPkg;
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadBgLoading, setUploadBgLoading] = useState(false);

  useEffect(() => {
    let { portalSet = {} } = props;
    let { portalSetModel = {} } = portalSet;
    setPortalSetModel(portalSetModel);
  }, [props.portalSet]);

  const updataUrl = data => {
    props.onChangeImg(data);
  };

  const renderBgBtn = () => {
    const uploadParam = {
      options: {
        filters: {
          mime_types: [{ extensions: 'gif,png,jpg,jpeg,bmp' }],
        },
        max_file_size: '4m',
      },
      onAdd: (up, files) => {
        if (uploadBgLoading) return;
        setUploadBgLoading(true);
        up.disableBrowse();
      },
      onUploaded: (up, file, response) => {
        up.disableBrowse(false);
        updataUrl({
          backImageUrl: file.serverName + file.key,
          backImagePath: file.key,
        });
        setUploadBgLoading(false);
      },
      onError: () => {
        alert(_l('文件上传失败'), 2);
      },
    };
    return (
      <React.Fragment>
        <QiniuUpload {...uploadParam} className={cx('Hand TxtMiddle InlineBlock mTop16 upload_imageBg')}>
          <Icon className="Font18 TxtMiddle mRight10" type="picture" /> {_l('上传自定义图片')}
          {uploadBgLoading ? (
            <LoadDiv className="mBottom10 mLeft60 InlineBlock" size="small" />
          ) : (
            portalSetModel.backImageUrl && <Icon className="Font18 TxtMiddle mLeft60" type={'done'} />
          )}
        </QiniuUpload>
        <div className="hideUploadBgTxt mTop8">
          {_l('建议上传不小于1920*1080px的封面图片，更利于首页展示，推荐免费图库')}
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">
            https://unsplash.com
          </a>
        </div>
      </React.Fragment>
    );
  };

  const renderLogoCon = () => {
    const uploadParam = {
      options: {
        filters: {
          mime_types: [{ extensions: 'gif,png,jpg,jpeg,bmp' }],
        },
        max_file_size: '4m',
      },
      onAdd: (up, files) => {
        if (uploadLoading) return;
        setUploadLoading(true);
        up.disableBrowse();
      },
      onUploaded: (up, file, response) => {
        up.disableBrowse(false);
        updataUrl({
          logoImageUrl: file.serverName + file.key,
          logoImagePath: file.key,
        });
        setUploadLoading(false);
      },
      onError: () => {
        alert(_l('文件上传失败'), 2);
      },
    };
    return (
      <QiniuUpload {...uploadParam} className="w100 h100">
        {portalSetModel.logoImageUrl ? (
          <img src={portalSetModel.logoImageUrl} />
        ) : (
          <span className="Hand upload_logo InlineBlock" id="upload_image">
            <Icon className="Font18" type="add1" />
            <span>{_l('点击上传')}</span>
          </span>
        )}
      </QiniuUpload>
    );
  };
  return (
    <Wrap>
      <div className="content">
        <h6 className="Font16 Gray Bold mBottom0">{_l('登录页名称')}</h6>
        <input
          type="text"
          className="pageTitle mTop6"
          placeholder={_l('请输入')}
          value={portalSetModel.pageTitle}
          onFocus={() => {}}
          onBlur={e => {
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                pageTitle: e.target.value.trim() || appPkg.name, //允许输入空格
              },
            });
          }}
          onChange={e => {
            setPortalSetModel({ ...portalSetModel, pageTitle: e.target.value });
          }}
        />
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('登录页Logo')}</h6>
        <div className="uploadLogo TxtCenter TxtMiddle mTop16">
          {portalSetModel.logoImageUrl && (
            <Icon
              className="delete Font18 Hand"
              type="delete_out"
              onClick={() => {
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    logoImageUrl: '',
                    logoImagePath: '',
                  },
                });
              }}
            />
          )}
          {renderLogoCon()}
        </div>
        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('登录页面结构')}</h6>
        <ul className="pageMode mTop16">
          {[0, 1].map(o => {
            return (
              <li
                className={cx('InlineBlock center', {
                  rightIconBox: o === 1,
                  current: portalSetModel.pageMode / 3 - 1 === o,
                  mRight60: o === 0,
                })}
              >
                <span
                  className={cx('iconBox Block Hand')}
                  onClick={() => {
                    if (o !== 0) {
                      onChangePortalSet({
                        portalSetModel: {
                          ...portalSetModel,
                          pageMode: (o + 1) * 3,
                          backGroundType: 6,
                        },
                      });
                    } else {
                      onChangePortalSet({
                        portalSetModel: {
                          ...portalSetModel,
                          pageMode: (o + 1) * 3,
                        },
                      });
                    }
                  }}
                >
                  {portalSetModel.pageMode / 3 - 1 === o && (
                    <Icon className="Font18 Hand ThemeColor3" type="plus-interest" />
                  )}
                </span>
                <span className="txt Block TxtCenter mTop13">{o === 0 ? _l('居中') : _l('左右')}</span>
              </li>
            );
          })}
        </ul>
        {portalSetModel.pageMode !== 6 ? (
          <React.Fragment>
            <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('背景设置')}</h6>
            <ul className="bgTypeUl mTop16">
              {BGTYPE.map((o, i) => {
                return (
                  <li
                    className={cx('InlineBlock bgTypeUlLi Hand', {
                      current: portalSetModel.backGroundType / 3 - 1 === i,
                    })}
                    onClick={() => {
                      onChangePortalSet({
                        portalSetModel: {
                          ...portalSetModel,
                          backGroundType: (i + 1) * 3,
                        },
                      });
                    }}
                  >
                    {o}
                  </li>
                );
              })}
            </ul>
            {portalSetModel.backGroundType / 3 - 1 === 0 ? (
              <React.Fragment>
                <ul className="mTop6" style={{ 'max-width': 400 }}>
                  {COLORS.map((item, i) => {
                    return (
                      <li
                        className={cx('colorLi InlineBlock Hand', { current: portalSetModel.backColor === item })}
                        style={{ backgroundColor: item }}
                        onClick={() => {
                          onChangePortalSet({
                            portalSetModel: {
                              ...portalSetModel,
                              backColor: item,
                            },
                          });
                        }}
                      >
                        {portalSetModel.backColor === item && (
                          <Icon icon="ok" className={cx('check', { Gray_75: i < COLORS.length / 2 })} />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </React.Fragment>
            ) : (
              renderBgBtn()
            )}
          </React.Fragment>
        ) : (
          renderBgBtn()
        )}
      </div>
      <div className="loginDemo">
        <WrapDemo
          style={
            portalSetModel.backGroundType === 3
              ? { 'background-color': portalSetModel.backColor }
              : portalSetModel.pageMode === 3
                ? { 'background-image': `url(${portalSetModel.backImageUrl})` }
                : {}
          }
          className={cx('Relative', { isCenter: portalSetModel.pageMode === 3 })}
        >
          {portalSetModel.pageMode !== 3 && (
            <div className="backImageUrl" style={{ 'background-image': `url(${portalSetModel.backImageUrl})` }}></div>
          )}
          <WrapCon className={cx({ isCenterCon: portalSetModel.pageMode === 3, isR: portalSetModel.pageMode !== 3 })}>
            {portalSetModel.logoImageUrl ? <img src={portalSetModel.logoImageUrl} height={32} /> : ''}
            {portalSetModel.pageTitle && (
              <p className="Font24 Gray mAll0 mTop20 Bold pageTitleDeme ellipsis">{portalSetModel.pageTitle}</p>
            )}
            <div className="btnCon">
              <div className="txtMobilePhone mTop28"></div>
              <div className="txtMobilePhone mTop8"></div>
              <div className="loginBtn mTop20"></div>
            </div>
          </WrapCon>
        </WrapDemo>
      </div>
    </Wrap>
  );
}
