import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Drawer } from 'antd';
import { QiniuUpload, Icon, ScrollView, Radio, Switch } from 'ming-ui';
import * as actions from '../redux/actions';
import PictureSelect from '../components/PictureSelect';
import { Hr, H1, H3, Absolute, CustomButton } from 'worksheet/components/Basics';
import { coverurls, LAYOUT_OPTIONS } from '../enum';
import _ from 'lodash';
import { Tooltip } from 'antd';
import { getThemeColors } from 'src/util';
import AddColorDialog from 'src/pages/AppHomepage/components/SelectIcon/AddColorDialog';
import cx from 'classnames';
import { getPageConfig } from '../utils';
import { TinyColor } from '@ctrl/tinycolor';

const Con = styled.div`
  padding: 0 24px;
  width: 640px;
  .customImgWrap {
    width: 90px;
    height: 70px;
    position: relative;
    .fileImage {
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-position: center;
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
const Close = styled.span`
  font-size: 18px;
  color: #9e9e9e;
  cursor: pointer;
`;

const ThemeColorWrapper = styled.ul`
  display: flex;
  flex-wrap: wrap;

  li {
    position: relative;
    width: 30px;
    height: 30px;
    margin: 0 12px 12px 0;
    line-height: 30px;
    text-align: center;
    border-radius: 50%;
    cursor: pointer;
    &:not(.isCurrentColor):hover {
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
    & > .icon {
      color: #fff;
      font-size: 18px;
      line-height: 30px;
    }
    &.isLight {
      & > .icon {
        color: rgba(0, 0, 0, 0.45);
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
    margin-right: 7px;
    font-size: 20px;
  }
`;

const ClearCover = styled(CustomButton)`
  :hover {
    background-color: #feecea;
    color: #f44336;
  }
`;

const LayoutSettingWrap = styled.div`
  .layoutRadio.ming.Radio {
    line-height: 1;
    .Radio-text {
      font-size: 13px !important;
      font-weight: bold !important;
    }
    .Radio-box {
      margin-right: 6px !important;
    }
  }
  .desc {
    line-height: 1;
  }
  .explainImg {
    width: 120px;
    height: auto;
    margin-bottom: 16px;
    border-radius: 3px;
    &:hover {
      box-shadow: 0 4px 20px #00000021, 0 2px 6px #0000001a;
    }
  }
`;

class AppearanceConfig extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    worksheetInfo: PropTypes.shape({}),
    updateWorksheetInfo: PropTypes.func,
    onClose: PropTypes.func,
    theme: PropTypes.string,
    pageConfigs: PropTypes.string,
    pageConfigKey: PropTypes.string,
    saveExtendDatas: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const { projectId } = props.worksheetInfo;
    const COLORS = getThemeColors(projectId);
    this.state = {
      isUploading: false,
      customColors: (_.find(
        COLORS.concat((localStorage.getItem('customColors') || '').split(',').filter(_ => _)),
        color => color.toLocaleUpperCase() === this.props.theme.toLocaleUpperCase(),
      )
        ? []
        : [this.props.theme]
      ).concat((localStorage.getItem('customColors') || '').split(',').filter(_ => _)),
      addColorDialogVisible: false,
    };
  }

  handleChangePageConfig = value => {
    const { pageConfigs = '[]', pageConfigKey = '', saveExtendDatas } = this.props;
    const configs = safeParse(pageConfigs);
    const index = _.findIndex(configs, l => l.key === pageConfigKey);
    configs[index < 0 ? configs.length : index] = { ...configs[index < 0 ? 0 : index], ...value, key: pageConfigKey };

    saveExtendDatas({ pageConfigs: JSON.stringify(configs) });
  };

  handleUploaded = (up, file) => {
    this.setState({
      isUploading: false,
    });
    this.handleChangePageConfig({ cover: file.url });
    up.disableBrowse(false);
  };

  renderCustomColor = iconColor => {
    const { addColorDialogVisible, customColors } = this.state;

    return (
      <React.Fragment>
        <div className="Gray_9e">{_l('自定义')}</div>
        <ThemeColorWrapper className="pTop12">
          <li className="isCurrentColor">
            <Icon
              icon="task-add-member-circle"
              className="Gray_bd Font30 pointer"
              onClick={() => this.setState({ addColorDialogVisible: true })}
            />
          </li>
          {customColors.map((item, index) => (
            <Tooltip key={index} title={item} color="#000" placement="bottom">
              <li
                className={cx({
                  isCurrentColor: item.toLocaleUpperCase() === iconColor.toLocaleUpperCase(),
                  isLight: new TinyColor(item).isLight(),
                })}
                style={{ backgroundColor: item }}
                onClick={() => this.handleChangePageConfig({ themeBgColor: item })}
              >
                {item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() && <Icon icon="hr_ok" />}
              </li>
            </Tooltip>
          ))}
        </ThemeColorWrapper>
        {addColorDialogVisible && (
          <AddColorDialog
            onSave={color => {
              const colors = [color].concat(customColors).slice(0, 5);
              this.setState({ customColors: colors });
              localStorage.setItem('customColors', colors);
              this.handleChangePageConfig({ themeBgColor: color });
            }}
            onCancel={() => this.setState({ addColorDialogVisible: false })}
          />
        )}
      </React.Fragment>
    );
  };

  renderLayoutSetting = () => {
    const { pageConfigs = '[]', pageConfigKey = '' } = this.props;
    const config = getPageConfig(pageConfigs, pageConfigKey);

    return (
      <LayoutSettingWrap>
        <H3 className="mBottom16">{_l('布局方式')}</H3>
        <div className="flexRow">
          {LAYOUT_OPTIONS.map((l, i) => {
            const checked = config.layout === l.value;

            return (
              <div className="flex Hand" onClick={() => !checked && this.handleChangePageConfig({ layout: l.value })}>
                <div>
                  <img className="explainImg" src={checked ? l.bgActive : l.bg} />
                </div>
                <Radio
                  className="layoutRadio"
                  size="small"
                  text={l.title}
                  checked={checked}
                  onClick={() => !checked && this.handleChangePageConfig({ layout: l.value })}
                />
                <div className="desc mTop6 Font12 Gray_75">{l.desc}</div>
              </div>
            );
          })}
        </div>
      </LayoutSettingWrap>
    );
  };

  renderUpload = () => {
    const { pageConfigs = '[]', pageConfigKey = '' } = this.props;
    const config = getPageConfig(pageConfigs, pageConfigKey);
    const cover = config.cover;
    const { isUploading } = this.state;
    const { pathname } = cover ? new URL(cover) : {};
    const isCustomImg = pathname ? !coverurls.includes(pathname.slice(1)) : false;

    return (
      <Fragment>
        <QiniuUpload
          options={{
            multi_selection: false,
            filters: {
              mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
            },
            max_file_size: '5m',
            error_callback: () => {
              alert(_l('有不合法的文件格式，请重新选择图片上传'), 3);
              return;
            },
          }}
          bucket={4}
          onUploaded={this.handleUploaded}
          onAdd={(up, files) => {
            this.setState({ isUploading: true });
            up.disableBrowse();
          }}
          onError={(up, err) => {
            if (err.code === -600) alert(_l('上传失败，只允许上传5M以内的文件'), 2);
          }}
        >
          <UploadBtn
            className={cx('mTop10', { disabled: isUploading })}
            height="44"
            bg="#fff"
            color="#151515"
            hoverBg="#f5f5f5"
            borderRadius="6"
          >
            {isUploading ? (
              <i className="icon icon-loading_button rotate Gray_9e"></i>
            ) : (
              <i className="icon icon-file_upload Gray_9e"></i>
            )}
            <span className="Bold">{_l('上传自定义封面图片')}</span>
          </UploadBtn>
        </QiniuUpload>
        <div className="Font12 Gray_9e mBottom24">{_l('建议上传图片大小限制5M以内。')}</div>
        {isCustomImg && (
          <div className="customImgWrap mTop8">
            <div className="fileImage" style={{ backgroundImage: `url(${cover}&imageView2/1/w/160)` }} />
            <div className="mask">
              <div className="deleteBtn Hand" onClick={() => this.handleChangePageConfig({ cover: '' })}>
                <Icon icon="task-new-delete" className="Gray_9e Font17" />
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  };

  render() {
    const { open, worksheetInfo, onClose, theme, pageConfigs = '[]', pageConfigKey = '' } = this.props;
    const { projectId } = worksheetInfo;
    const COLORS = getThemeColors(projectId);
    const config = getPageConfig(pageConfigs, pageConfigKey);

    return (
      <Drawer visible={open} width={640} bodyStyle={{ padding: 0 }} headerStyle={{ display: 'none' }} onClose={onClose}>
        <ScrollView>
          <Con>
            <Absolute right="24" top="-2">
              <Close onClick={onClose}>
                <i className="icon icon-close ThemeHoverColor3"></i>
              </Close>
            </Absolute>
            <H1>{_l('设置封面')}</H1>
            <H3>{_l('主题颜色')}</H3>
            <ThemeColorWrapper>
              {COLORS.map((item, index) => (
                <Tooltip key={item} color="#000" placement="bottom">
                  <li
                    className={cx({ isCurrentColor: item.toLocaleUpperCase() === theme.toLocaleUpperCase() })}
                    style={{ backgroundColor: item }}
                    onClick={() => this.handleChangePageConfig({ themeBgColor: item })}
                  >
                    {item.toLocaleUpperCase() === theme.toLocaleUpperCase() && <Icon icon="hr_ok" />}
                  </li>
                </Tooltip>
              ))}
            </ThemeColorWrapper>
            {this.renderCustomColor(theme)}
            <Hr />
            <div className="flexRow">
              <H3 className="flex" style={{ margin: '4px 0' }}>
                {_l('封面图片')}
              </H3>
              <ClearCover height="28" borderRadius="14" onClick={() => this.handleChangePageConfig({ cover: '' })}>
                {_l('清除图片')}
              </ClearCover>
            </div>
            {this.renderLayoutSetting()}
            <H3 className="mTop32">{_l('图片')}</H3>
            <PictureSelect
              coverUrl={config.cover}
              images={coverurls}
              onChange={url => this.handleChangePageConfig({ cover: url })}
            />
            {this.renderUpload()}
            <Hr />
            <H3>{_l('其他')}</H3>
            <div className="flexCenter mBottom40">
              <Switch
                checked={config.showQrcode}
                onClick={() => this.handleChangePageConfig({ showQrcode: !config.showQrcode })}
                size={'small'}
              />
              <span className="Font13 Gray mLeft12">{_l('显示公开表单访问二维码')}</span>
            </div>
          </Con>
        </ScrollView>
      </Drawer>
    );
  }
}

const mapStateToProps = state => ({ ..._.pick(state.publicWorksheet, ['worksheetInfo']) });

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AppearanceConfig);
