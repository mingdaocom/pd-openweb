import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import styled from 'styled-components';
import { QiniuUpload } from 'ming-ui';

const Con = styled.div`cursor: pointer; width: 140px; height: 60px; background: #F7F7F7; border: 2px dashed #E0E0E0; border-radius: 4px; margin-top: 32px;
  color: #BDBDBD;
  font-size: 20px;
  text-align: center;
  line-height: 60px;
  letter-spacing: 3px;
  user-select: none;
  .icon { width: 1em; display: inline-block; }
  :hover { background: #F4F4F4; }
`;

const ImgCon = styled.div`
  position: relative;
  display: inline-block;
  margin-top: 32px;
  img { height: 59px; }
  .icon {
    cursor: pointer;
    position: absolute;
    top: -15px;
    right: -15px;
    font-size: 18px;
    color: #BDBDBD;
  }
`;
export default class Logo extends React.Component {
  static propTypes = {
    url: PropTypes.string,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      isUploading: false,
    };
  }

  @autobind
  handleUploaded(up, file) {
    const { onChange } = this.props;
    this.setState({
      isUploading: false,
    });
    up.disableBrowse(false);
    onChange(file.url);
  }

  @autobind
  handleRemove(e) {
    const { onChange } = this.props;
    this.setState({ logourl: '' });
    onChange('');
  }

  render() {
    const { url } = this.props;
    const { isUploading } = this.state;
    return <React.Fragment>
      {
        !url && <QiniuUpload
          className="InlineBlock"
          options={{
            multi_selection: false,
            filters: {
              mime_types: [
                { title: 'image', extensions: 'jpg,jpeg,png' },
              ],
            },
          }}
          bucket={2}
          onUploaded={this.handleUploaded}
          onAdd={(up, files) => {
            this.setState({ isUploading: true });
            up.disableBrowse();
          }}
          onError={() => {}}
        >
          <Con>{ isUploading ? <i className="icon icon-loading_button rotate"></i> : 'LOGO' }</Con>
        </QiniuUpload>
      }
      { url && <ImgCon>
        <img src={url} />
        <i className="icon icon-closeelement-bg-circle" onClick={this.handleRemove}></i>
      </ImgCon>}
    </React.Fragment>;
  }
}
