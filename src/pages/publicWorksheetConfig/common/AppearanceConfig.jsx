import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Drawer } from 'antd';
import { QiniuUpload, Icon, ScrollView } from 'ming-ui';
import * as actions from '../redux/actions';
import PictureSelect from '../components/PictureSelect';
import { Hr, H1, H3, Absolute, CustomButton } from 'worksheet/components/Basics';
import { coverurls } from '../enum';
import _ from 'lodash';
import { Tooltip } from 'antd';
import { getThemeColors } from 'src/util';
import AddColorDialog from 'src/pages/AppHomepage/components/SelectIcon/AddColorDialog';
import cx from 'classnames';

const Con = styled.div`
  padding: 0 24px;
  width: 300px;
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
  }
`;

const UploadBtn = styled(CustomButton)`
  margin-top: 20px;
  .icon {
    display: inline-block;
    position: relative;
    top: 1px;
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

class AppearanceConfig extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    worksheetInfo: PropTypes.shape({}),
    updateWorksheetInfo: PropTypes.func,
    onClose: PropTypes.func,
    theme: PropTypes.string,
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

  @autobind
  changeCover(url) {
    const { updateWorksheetInfo } = this.props;
    updateWorksheetInfo({ coverUrl: url });
  }

  @autobind
  handleUploaded(up, file) {
    this.setState({
      isUploading: false,
    });
    this.changeCover(file.url);
    up.disableBrowse(false);
  }

  @autobind
  renderCustomColor(iconColor) {
    const { addColorDialogVisible, customColors } = this.state;
    const { updateWorksheetInfo } = this.props;
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
                className={cx({ isCurrentColor: item.toLocaleUpperCase() === iconColor.toLocaleUpperCase() })}
                style={{ backgroundColor: item }}
                onClick={() => updateWorksheetInfo({ themeBgColor: item })}
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
              updateWorksheetInfo({ themeBgColor: color });
            }}
            onCancel={() => this.setState({ addColorDialogVisible: false })}
          />
        )}
      </React.Fragment>
    );
  }

  render() {
    const { open, worksheetInfo, onClose, updateWorksheetInfo, theme } = this.props;
    const { coverUrl, projectId } = worksheetInfo;
    const { isUploading } = this.state;
    const COLORS = getThemeColors(projectId);
    return (
      <Drawer visible={open} width={300} bodyStyle={{ padding: 0 }} headerStyle={{ display: 'none' }} onClose={onClose}>
        <ScrollView>
          <Con>
            <Absolute right="24" top="-2">
              <Close onClick={onClose}>
                <i className="icon icon-close ThemeHoverColor3"></i>
              </Close>
            </Absolute>
            <H1>{_l('主题背景')}</H1>
            <H3>{_l('主题颜色')}</H3>
            <ThemeColorWrapper>
              {COLORS.map((item, index) => (
                <Tooltip key={item} color="#000" placement="bottom">
                  <li
                    className={cx({ isCurrentColor: item.toLocaleUpperCase() === theme.toLocaleUpperCase() })}
                    style={{ backgroundColor: item }}
                    onClick={() => updateWorksheetInfo({ themeBgColor: item })}
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
              <ClearCover height="28" borderRadius="14" onClick={() => this.changeCover('')}>
                {' '}
                {_l('清除图片')}{' '}
              </ClearCover>
            </div>
            <PictureSelect coverUrl={coverUrl} images={coverurls} onChange={url => this.changeCover(url)} />
            <QiniuUpload
              className="Block"
              options={{
                multi_selection: false,
                filters: {
                  mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
                },
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
            >
              <UploadBtn height="44" bg="#F3FAFF" color="#2196F3" hoverBg="#EBF6FE" style={{ margin: '10px 0' }}>
                {isUploading ? (
                  <i className="icon icon-loading_button rotate"></i>
                ) : (
                  <i className="icon icon-custom_insert_photo"></i>
                )}
                {_l('上传自定义图片')}
              </UploadBtn>
            </QiniuUpload>
          </Con>
        </ScrollView>
      </Drawer>
    );
  }
}

const mapStateToProps = state => ({ ..._.pick(state.publicWorksheet, ['worksheetInfo']) });

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AppearanceConfig);
