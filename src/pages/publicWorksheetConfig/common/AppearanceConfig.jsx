import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Drawer, QiniuUpload } from 'ming-ui';
import * as actions from '../redux/actions';
import PictureSelect from '../components/PictureSelect';
import { Hr, H1, H3, Absolute, Circle, CustomButton } from 'worksheet/components/Basics';
import { themes, coverurls } from '../enum';
import _ from 'lodash';

const Con = styled.div`
  padding: 0 24px;
`;
const Close = styled.span`
  font-size: 18px;
  color: #9e9e9e;
  cursor: pointer;
`;
const ColorCircle = styled(Circle)`
  cursor: pointer;
  margin-right: 6px;
  color: #fff;
  font-size: 18px;
  text-align: center;
  transition: 0.4s ease;
  background: ${({ bg }) => bg};
  :last-child {
    margin: 0;
  }
  .icon {
    position: absolute;
    left: 4px;
    top: 4px;
  }
  :hover {
    transform: scale(1.15);
  }
  ${({ active }) => active && 'transform: scale(1.15);'};
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
  };

  constructor(props) {
    super(props);
    this.state = {
      isUploading: false,
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

  render() {
    const { open, worksheetInfo, onClose, updateWorksheetInfo } = this.props;
    const { themeIndex, coverUrl } = worksheetInfo;
    const { isUploading } = this.state;
    return (
      <Drawer open={open} style={{ position: 'absolute', top: 0, width: 300 }} onRequestClose={onClose}>
        <Con>
          <Absolute right="24" top="-2">
            <Close onClick={onClose}>
              <i className="icon icon-close ThemeHoverColor3"></i>
            </Close>
          </Absolute>
          <H1>{_l('主题背景')}</H1>
          <H3>{_l('主题颜色')}</H3>
          <div className="themePicker">
            {themes.map((theme, i) => (
              <ColorCircle
                width="26"
                key={i}
                bg={theme.main}
                active={i === themeIndex}
                onClick={() => updateWorksheetInfo({ themeIndex: i })}
              >
                {i === themeIndex && <i className="icon icon-hr_ok"></i>}
              </ColorCircle>
            ))}
          </div>
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
            bucket={2}
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
      </Drawer>
    );
  }
}

const mapStateToProps = state => ({ ..._.pick(state.publicWorksheet, ['worksheetInfo']) });

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AppearanceConfig);
