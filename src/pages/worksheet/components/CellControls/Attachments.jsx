import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import LoadDiv from 'ming-ui/components/LoadDiv';
import UploadFiles from 'src/components/UploadFiles';
import UploadFilesTrigger from 'src/components/UploadFilesTrigger';
import attachmentAjax from 'src/api/attachment';
import { FROM } from './enum';
import EditableCellCon from '../EditableCellCon';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getClassNameByExt } from 'src/util';

export default class Attachments extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    from: PropTypes.number,
    rowHeight: PropTypes.number,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    value: PropTypes.string,
    updateCell: PropTypes.func,
    onClick: PropTypes.func,
    updateEditingStatus: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: this.parseValue(props.cell.value),
    };
  }

  componentDidMount() {
    const { from } = this.props;
    if (from === FROM.LAND) {
      this.fetchAttachmentDetailList();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: this.parseValue(nextProps.cell.value) });
    }
  }

  editIcon = React.createRef();

  parseValue(valueStr, errCb) {
    let value = [];
    try {
      value = JSON.parse(valueStr);
      if (value.attachmentData && value.attachments && value.knowledgeAtts) {
        value = [...value.attachments, ...value.knowledgeAtts, ...value.attachmentData];
      }
      value = value.map(attachment =>
        attachment.createTime || !_.isUndefined(attachment.fileSize)
          ? {
              ext: attachment.ext || attachment.fileExt,
              fileID: attachment.fileID || attachment.fileId,
              originalFilename: attachment.originalFilename,
              previewUrl: attachment.previewUrl || attachment.viewUrl || `${attachment.serverName}${attachment.key}`,
              refId: attachment.refID || attachment.refId,
            }
          : attachment,
      );
    } catch (err) {
      return [];
    }
    return value;
  }

  fetchAttachmentDetailList() {
    const { cell } = this.props;
    const attachmentsData = this.parseValue(cell.value, () => {
      this.setState({ error: true });
    });
    if (!attachmentsData.length) {
      return;
    }
    attachmentAjax
      .getAttachmentToList({
        fileIds: attachmentsData.map(a => a.fileID),
      })
      .then(list => {
        this.setState({
          attachmentDetailList: list,
          loading: false,
        });
      })
      .fail(err => {
        alert(_l('获取附件信息失败'), 3);
      });
  }

  @autobind
  updateCellCallback(data) {
    const { cell } = this.props;
    let parsedValue = [];
    try {
      parsedValue = JSON.parse(data[cell.controlId]);
    } catch (err) {}
    this.setState({
      value: parsedValue.map(file => ({
        ext: file.ext,
        fileID: file.fileID,
        originalFilename: file.originalFilename,
        previewUrl: file.previewUrl,
        refId: file.refId,
      })),
    });
  }

  @autobind
  handleChange(array) {
    const { updateCell, updateEditingStatus } = this.props;
    const { value, temporaryAttachments, temporaryKnowledgeAtts } = this.state;
    const submitData = {};
    submitData.attachmentData = value;
    submitData.attachments = (temporaryAttachments || []).map(a => ({ ...a, isEdit: false }));
    submitData.knowledgeAtts = (temporaryKnowledgeAtts || []).map(a => ({ ...a, isEdit: false })) || [];
    updateCell(
      {
        editType: 1,
        value: JSON.stringify(submitData),
      },
      {
        callback: this.updateCellCallback,
      },
    );
    updateEditingStatus(false);
    this.setState({
      temporaryAttachments: [],
      temporaryKnowledgeAtts: [],
    });
  }

  previewAttachment(attachments, index) {
    require(['previewAttachments'], previewAttachments => {
      const { sheetSwitchPermit = [], viewId = '' } = this.props;
      const recordAttachmentSwitch = isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewId);
      let hideFunctions = ['editFileName'];
      if (!recordAttachmentSwitch) {
        /* 是否不可下载 且 不可保存到知识和分享 */
        hideFunctions.push('download', 'share', 'saveToKnowlege');
      }
      previewAttachments({
        index: index || 0,
        fromType: 4,
        attachments: attachments.map(attachment => {
          if (attachment.fileID.slice(0, 2) === 'o_') {
            return Object.assign({}, attachment, {
              previewAttachmentType: 'QINIU',
              path: attachment.previewUrl,
              name: (attachment.originalFilename || _l('图片')) + attachment.ext,
            });
          }
          return Object.assign({}, attachment, {
            previewAttachmentType: attachment.refId ? 'KC_ID' : 'COMMON_ID',
          });
        }),
        showThumbnail: true,
        hideFunctions: hideFunctions,
        disableNoPeimission: true,
      });
    });
  }

  renderLand(attachmentsData) {
    const { loading, attachmentDetailList } = this.state;
    return loading ? (
      <LoadDiv className="loadingCon" />
    ) : (
      <UploadFiles isUpload={false} attachmentData={attachmentDetailList} projectId={this.props.projectId} />
    );
  }

  renderCommon(attachmentsData) {
    const { rowHeight } = this.props;
    const attachmentLength = attachmentsData.length;
    if (attachmentLength > 11) {
      attachmentsData = attachmentsData.slice(0, 10);
    }
    const fileHeight = rowHeight - 10;
    const fileWidth = (fileHeight * 21) / 24;
    return (
      <React.Fragment>
        {attachmentsData.map((attachment, index) => (
          <div
            onClick={e => {
              this.previewAttachment(attachmentsData, index);
              e.stopPropagation();
            }}
            key={index}
            className={'cellAttachment ellipsis Hand rowHeight' + rowHeight}
            style={{ height: fileHeight }}
          >
            {File.isPicture(attachment.ext) ? (
              <img
                crossOrigin="anonymous"
                className="thumbnail"
                role="presentation"
                src={attachment.previewUrl.replace(
                  /\?(.*)/,
                  '?imageMogr2/auto-orient/interlace/1|imageView2/1/w/87/h/100',
                )}
                style={{ width: 'auto', height: fileHeight }}
              />
            ) : (
              <span
                className={`fileIcon ${getClassNameByExt(attachment.ext)}`}
                title={attachment.originalFilename + attachment.ext}
                style={{ width: fileWidth, height: fileHeight }}
              />
            )}
          </div>
        ))}
        {attachmentLength > 11 && (
          <span className="moreAttachment">
            <i className="icon icon-task-point-more" />
          </span>
        )}
      </React.Fragment>
    );
  }

  render() {
    const {
      isediting,
      from = 1,
      className,
      cell,
      style,
      popupContainer,
      onClick,
      updateEditingStatus,
      projectId,
    } = this.props;
    let { editable } = this.props;
    const { value } = this.state;
    const { strDefault = '10' } = cell;
    const [disableAlbum, onlyAllowMobileInput] = strDefault.split('');
    if (cell.type === 14 && onlyAllowMobileInput === '1') {
      editable = false;
    }
    return (
      <UploadFilesTrigger
        projectId={projectId}
        noWrap
        destroyPopupOnHide={!(navigator.userAgent.match(/[Ss]afari/) && !navigator.userAgent.match(/[Cc]hrome/))} // 不是 Safari
        popupVisible={isediting && editable}
        from={from}
        canAddLink={false}
        minWidth={130}
        showAttInfo={false}
        attachmentData={[]}
        onUploadComplete={isComplete => {
          this.setState({ isComplete });
        }}
        temporaryData={this.state.temporaryAttachments || []}
        onTemporaryDataUpdate={res => {
          this.setState({ temporaryAttachments: res });
        }}
        kcAttachmentData={this.state.temporaryKnowledgeAtts || []}
        onKcAttachmentDataUpdate={res => {
          this.setState({ temporaryKnowledgeAtts: res });
        }}
        getPopupContainer={() => document.body}
        onCancel={() => {
          updateEditingStatus(false);
        }}
        onClose={() => {
          updateEditingStatus(false);
        }}
        onOk={this.handleChange}
      >
        <EditableCellCon
          onClick={onClick}
          className={cx(className, { canedit: editable })}
          style={style}
          iconRef={this.editIcon}
          iconName="attachment"
          iconClassName="dateEditIcon"
          isediting={isediting && editable}
          onIconClick={() => {
            updateEditingStatus(true);
          }}
        >
          <div className="cellAttachments cellControl">
            {(from === FROM.COMMON || from === FROM.RELATE_WORKSHEET || from === FROM.CARD) && this.renderCommon(value)}
            {from === FROM.LAND && this.renderLand(value)}
          </div>
        </EditableCellCon>
      </UploadFilesTrigger>
    );
  }
}
