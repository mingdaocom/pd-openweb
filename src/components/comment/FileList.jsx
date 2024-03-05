import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UploadFiles from 'src/components/UploadFiles';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Button from 'ming-ui/components/Button';
import _ from 'lodash';
import AjaxRequest from 'src/api/discussion';
import { SOURCE_TYPE } from './config';

export default class FileList extends Component {
  static TYPES = SOURCE_TYPE;

  static propTypes = {
    sourceType: PropTypes.oneOf(_.values(SOURCE_TYPE)),
    sourceId: PropTypes.string.isRequired,
    appId: PropTypes.string.isRequired,
    manualRef: PropTypes.func,
  };

  static defaultProps = {
    manualRef: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      files: [],
      isLoading: false,
      isUploadComplete: true,
      isShowBtns: false,
      attachmentData: [],
      kcAttachmentData: [],
    };

    this.submit = _.debounce(this.submit.bind(this), 500);
    this.cancel = this.cancel.bind(this);
  }

  componentDidMount() {
    this.getFiles();
    this.props.manualRef(this);
  }

  cancel() {
    this.setState({
      isShowBtns: false,
      attachmentData: [],
      kcAttachmentData: [],
    });
  }

  submit() {
    const { isUploadComplete, attachmentData, kcAttachmentData } = this.state;
    const { sourceId, sourceType, appId } = this.props;
    if (!isUploadComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return;
    }

    AjaxRequest.addDiscussion({
      sourceId,
      sourceType,
      message: _l('上传了附件'),
      attachments: JSON.stringify(attachmentData),
      knowledgeAtts: JSON.stringify(kcAttachmentData),
      appId,
    }).then(source => {
      if (source.code === 1) {
        // reset state
        this.cancel();
        this.getFiles();
      } else {
        alert(_l('操作失败，请稍后重试'), 2);
      }
    });
  }

  getFiles() {
    const { sourceId, sourceType, updateFiles } = this.props;

    this.setState({
      isLoading: true,
    });

    this.promise = AjaxRequest.getSourceAtts({
      sourceId,
      sourceType,
    });

    this.promise.then(({ data, code }) => {
      if (code === 1) {
        this.setState({ files: data });
      } else {
        alert(_l('获取附件失败'), 2);
      }
      this.setState({
        isLoading: false,
      });
    });
  }

  onTemporaryDataUpdate(res) {
    this.setState({
      attachmentData: res,
      isShowBtns: this.state.kcAttachmentData.length + res.length > 0,
    });
  }

  onKcAttachmentDataUpdate(res) {
    this.setState({
      kcAttachmentData: res,
      isShowBtns: this.state.attachmentData.length + res.length > 0,
    });
  }

  renderList() {
    const { files } = this.state;

    return files.length ? <UploadFiles column={3} isUpload={false} attachmentData={files} /> :
      <div className="Gray_c pTop10 pBottom10 noneContent">{_l('暂无文件')}</div>;
  }

  render() {
    const { isLoading, isShowBtns } = this.state;
    return (
      <div className="fileContent mTop10">
        <UploadFiles
          arrowLeft={16}
          column={3}
          onUploadComplete={res => this.setState({ isUploadComplete: res })}
          temporaryData={this.state.attachmentData}
          kcAttachmentData={this.state.kcAttachmentData}
          onTemporaryDataUpdate={this.onTemporaryDataUpdate.bind(this)}
          onKcAttachmentDataUpdate={this.onKcAttachmentDataUpdate.bind(this)}
        />
        {isShowBtns ? (
          <div className="TxtRight">
            <Button className="mRight15" size="small" type="ghost" onClick={this.cancel}>
              {_l('取消')}
            </Button>
            <Button size="small" onClick={this.submit}>
              {_l('确定')}
            </Button>
          </div>
        ) : null}
        {isLoading ? <LoadDiv /> : this.renderList()}
      </div>
    );
  }
}
