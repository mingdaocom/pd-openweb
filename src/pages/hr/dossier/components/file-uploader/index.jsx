import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

import './style.less';

import Icon from 'ming-ui/components/Icon';

class FileUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 拖放激活状态
       */
      active: false,
    };

    /**
     * 拖放目标元素
     */
    this.target = null;
  }

  componentDidMount() {
    // bind drag&drop listeners
    this.target.addEventListener('dragenter', (event) => {
      event.stopPropagation();
      event.preventDefault();

      this.setState({
        active: true,
      });
    });

    this.target.addEventListener('dragover', (event) => {
      event.stopPropagation();
      event.preventDefault();
    });

    this.target.addEventListener('dragleave', (event) => {
      event.stopPropagation();
      event.preventDefault();

      this.setState({
        active: false,
      });
    });

    this.target.addEventListener('drop', (event) => {
      event.stopPropagation();
      event.preventDefault();

      this.setState({
        active: false,
      });

      this.upload(event.dataTransfer.files);
    });
  }

  /**
   * input onChange
   */
  fileInputOnChange = (event) => {
    this.upload(event.target.files);
  };

  isTypeOk = (ext) => {
    let ok = false;

    if (!this.props.type || !this.props.type.length) {
      ok = true;
    } else {
      this.props.type.map((item) => {
        if (item === ext) {
          ok = true;
        }
        return null;
      });
    }

    return ok;
  };

  /**
   * 上传文件
   */
  upload = (files) => {
    if (!files || !files.length) {
      return;
    }

    // 是否超出大小限制
    let overSize = false;
    // 类型是否合格
    let typeOk = true;
    let data = {
      file: files[0],
    };
    if (this.props.limit >= 2) {
      data = {
        files,
      };

      let allOk = true;
      files.map((item) => {
        if (this.props.maxSize && item.size > this.props.maxSize) {
          overSize = true;
        }
        if (!this.isTypeOk(item.type)) {
          allOk = false;
        }
        return null;
      });
      if (!allOk) {
        typeOk = false;
      }
    } else {
      if (this.props.maxSize && files[0].size > this.props.maxSize) {
        overSize = true;
      }
      if (!this.isTypeOk(files[0].type)) {
        typeOk = false;
      }
    }

    if (overSize) {
      alert(_l('文件大小超出限制'), 2);
      return;
    }

    if (!typeOk) {
      alert(_l('无法上传此类型的文件'), 2);
      return;
    }

    const formData = new FormData();
    for (const key in data) {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    }

    if (this.props.upload) {
      this.props.upload(formData);
    }
  };

  render() {
    return (
      <div
        className={cx('mui-fileuploader', this.state.active ? 'ThemeBGColor5' : 'ThemeBGColor6 ThemeHoverBGColor5', {
          'mui-fileuploader-disabled': this.props.disabled,
        })}
      >
        <div className="mui-fileuploader-bg">
          <Icon icon="knowledge-cloud" className="ThemeColor4" />
          <span>拖放或点击选择文件</span>
        </div>
        <label
          ref={(elmt) => {
            this.target = elmt;
          }}
          className={cx('ThemeHoverBorderColor4', this.state.active ? 'ThemeBorderColor3' : 'ThemeBorderColor5')}
        >
          <input
            type="file"
            disabled={this.props.disabled}
            onChange={(event) => {
              this.fileInputOnChange(event);
            }}
          />
        </label>
      </div>
    );
  }
}

FileUploader.propTypes = {
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 限制数量
   */
  limit: PropTypes.number,
  /**
   * 上传方法
   * @param {Object} data - 上传的数据
   */
  upload: PropTypes.func,
  /**
   * 文件大小限制
   */
  maxSize: PropTypes.number,
  /**
   * 文件类型 [MIME]
   */
  type: PropTypes.any,
};

FileUploader.defaultProps = {
  disabled: false,
  limit: 1,
  upload: (data) => {
    //
  },
  maxSize: 0,
  type: [],
};

export default FileUploader;
