import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { QiniuUpload } from 'ming-ui';

const Con = styled.div`
  cursor: pointer;
  width: 140px;
  height: 60px;
  background: var(--color-background-secondary);
  border: 2px dashed var(--color-border-secondary);
  border-radius: 4px;
  color: var(--color-text-disabled);
  font-size: 20px;
  text-align: center;
  line-height: 60px;
  letter-spacing: 3px;
  user-select: none;
  .icon {
    width: 1em;
    display: inline-block;
  }
  :hover {
    background: var(--color-background-disabled);
  }
`;

const ImgCon = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 7px;
  img {
    height: 59px;
    max-width: 100%;
    object-fit: contain;
  }
  .icon {
    cursor: pointer;
    position: absolute;
    top: -15px;
    right: -15px;
    font-size: 18px;
    color: var(--color-text-disabled);
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

  handleUploaded = (up, file) => {
    const { onChange } = this.props;
    this.setState({
      isUploading: false,
    });
    up.disableBrowse(false);
    onChange(file.url);
  };

  handleRemove = () => {
    const { onChange } = this.props;
    this.setState({ logourl: '' });
    onChange('');
  };

  render() {
    const { url } = this.props;
    const { isUploading } = this.state;
    return (
      <React.Fragment>
        {!url && (
          <QiniuUpload
            className="InlineBlock"
            options={{
              multi_selection: false,
              filters: {
                mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
              },
              type: 30,
            }}
            bucket={4}
            onUploaded={this.handleUploaded}
            onAdd={up => {
              this.setState({ isUploading: true });
              up.disableBrowse();
            }}
            onError={() => {}}
          >
            <Con>{isUploading ? <i className="icon icon-loading_button rotate"></i> : 'LOGO'}</Con>
          </QiniuUpload>
        )}
        {url && (
          <ImgCon>
            <img src={url} />
            <i className="icon icon-cancel" onClick={this.handleRemove}></i>
          </ImgCon>
        )}
      </React.Fragment>
    );
  }
}
