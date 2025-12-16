import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv, QiniuUpload } from 'ming-ui';
import { BGTYPE, COLORS } from 'src/pages/Role/PortalCon/tabCon/util';
import { Wrap, WrapCon, WrapDemo } from './style';

export default function LoginSet(props) {
  const { appPkg = {}, onChangePortalSet } = props;
  const [portalSetModel, setPortalSetModel] = useState({});
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadBgLoading, setUploadBgLoading] = useState(false);

  useEffect(() => {
    let { portalSet = {} } = props;
    let { portalSetModel = {} } = portalSet;
    setPortalSetModel(portalSetModel);
  }, [props.portalSet]);

  const updataUrl = data => {
    props.onChangePortalSetModel(data);
  };

  const renderBgBtn = () => {
    const uploadParam = {
      options: {
        filters: {
          mime_types: [{ extensions: 'gif,png,jpg,jpeg,bmp' }],
        },
        max_file_size: '4m',
      },
      onAdd: up => {
        if (uploadBgLoading) return;
        setUploadBgLoading(true);
        up.disableBrowse();
      },
      onUploaded: (up, file) => {
        up.disableBrowse(false);
        updataUrl({
          backImageUrl: file.url || file.serverName + file.key,
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
      onAdd: up => {
        if (uploadLoading) return;
        setUploadLoading(true);
        up.disableBrowse();
      },
      onUploaded: (up, file) => {
        up.disableBrowse(false);
        updataUrl({
          logoImageUrl: file.url || file.serverName + file.key,
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
              type="cancel"
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
                    <Icon className="Font18 Hand ThemeColor3" type="check_circle" />
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
