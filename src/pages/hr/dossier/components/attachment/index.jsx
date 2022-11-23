import PropTypes from 'prop-types';
import React, { Component } from 'react';
import plupload from '@mdfe/jquery-plupload';

import './style.less';

import Icon from 'ming-ui/components/Icon';

class Attachment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 文件数据
       */
      data: this.props.data || null,
      /**
       * 显示模式
       * upload - 待上传
       * view - 呈现
       */
      mode: this.props.data ? 'view' : 'upload',
      /**
       * 图片名称是否为编辑模式
       */
      editName: false,
    };

    /**
     * upload trigger element
     */
    this.trigger = null;
  }

  componentDidMount() {
    // init
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        data: nextProps.data,
        mode: nextProps.data ? 'view' : 'upload',
      });
    }
  }

  /**
   * input keydown
   */
  onKeyDown = (event) => {
    if (event.keyCode === 13) {
      // 保存名称并退出名称编辑模式
      this.setState({
        editName: false,
      });
    }
  };

  /**
   * 进入名称编辑模式
   */
  enterEditNameMode = (event) => {
    this.setState({
      editName: true,
    });
  };

  render() {
    let upload = null;
    if (this.state.mode === 'upload') {
      upload = (
        <div
          className="mui-attachment-viewer-upload"
          ref={(elmt) => {
            this.trigger = elmt;
          }}
        >
          {_l('点击上传')}
        </div>
      );
    }

    let img = null;
    let mask = null;
    if (this.state.mode === 'view') {
      img = <img src="https://www.mingdao.com/src/staticPages/download/img/mobile.png" alt="" />;

      // 'https://pic.mingdao.com/UserAvatar/10761e16-831a-4c11-ba31-002ec1cca4a4.jpg?imageView2/1/w/100/h/100/q/90'
      // 'http://localhost:30001/src/staticPages/business/img/2x/qiye5.png'
      // 'https://www.mingdao.com/src/staticPages/download/img/mobile.png'

      mask = (
        <div className="mui-attachment-viewer-mask">
          <div className="mui-attachment-toolbar">
            <button type="button" className="mui-attachment-btn-view">
              <Icon icon="eye" />
            </button>
            <button type="button" className="mui-attachment-btn-delete">
              <Icon icon="task-new-delete" />
            </button>
          </div>
        </div>
      );
    }

    let name = (
      <div className="mui-attachment-info-name">
        <span>name</span>
        <Icon
          icon="edit"
          onClick={(event) => {
            this.enterEditNameMode(event);
          }}
        />
      </div>
    );
    if (this.state.editName) {
      name = (
        <div className="mui-attachment-info-name">
          <input
            type="text"
            className="mui-textinput"
            value={this.name}
            onKeyDown={(event) => {
              this.onKeyDown(event);
            }}
          />
        </div>
      );
    }
    const imgInfo = (
      <div className="mui-attachment-info-info">
        <span>xxx 上传于 2017-09-13 18:00</span>
      </div>
    );
    let info = <div className="mui-attachment-info" />;
    if (this.state.mode === 'view') {
      info = (
        <div className="mui-attachment-info">
          {name}
          {imgInfo}
        </div>
      );
    }

    return (
      <div className="mui-attachment">
        <div className="mui-attachment-viewer">
          {upload}
          {img}
          {mask}
        </div>
        {info}
      </div>
    );
  }
}

Attachment.propTypes = {
  /**
   * 文件数据
   */
  data: PropTypes.any,
  /**
   * 【回调】文件数据发生改变
   * @param {Event} event - 触发改变的事件
   * @param {Object} data - 文件数据
   */
  onChange: PropTypes.func,
};

Attachment.defaultProps = {
  data: null,
  onChange: (event, data) => {
    //
  },
};

export default Attachment;
