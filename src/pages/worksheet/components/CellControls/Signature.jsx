import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import SignatureComp from 'src/components/Form/DesktopForm/widgets/Signature';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { WORKSHEETTABLE_FROM_MODULE } from 'src/utils/domain/worksheet/constants';
import { FROM } from 'src/utils/domain/worksheet/relation';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { compatibleMDJS } from 'src/utils/services/project';
import EditableCellCon from '../EditableCellCon';

export default class Signature extends React.Component {
  static contextType = RecordInfoContext;
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    rowHeight: PropTypes.number,
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    value: PropTypes.string,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.cell.value !== prevProps.cell.value) {
        this.setState({
          value: this.props.cell.value,
        });
      }
    }
  }

  editIcon = React.createRef();
  editRef = React.createRef();

  handleTableKeyDown = e => {
    const { updateEditingStatus } = this.props;

    switch (e.key) {
      case 'Escape':
        updateEditingStatus(false);
        break;
      case 'Enter':
        if (_.get(this, 'editRef.current.state.isEdit') && _.isFunction(_.get(this, 'editRef.current.saveSignature'))) {
          _.get(this, 'editRef.current.saveSignature')();
        }

        break;
      default:
        break;
    }
  };

  handleChange = value => {
    const { updateCell, updateEditingStatus, onValidate } = this.props;

    updateCell({ value });
    this.setState({ value });
    // 签名通过浮层即时提交，不走输入/失焦校验流程；必填报错后重新签名需主动重新校验，
    // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
    if (_.isFunction(onValidate)) {
      onValidate(value);
    }

    updateEditingStatus(false);
  };

  previewAttachment(value) {
    const {
      cell: { controlName },
    } = this.props;

    compatibleMDJS('previewSignature', { url: value }, () => {
      const openPreviewAttachments = this.context?.openPreviewAttachments || previewAttachments;

      openPreviewAttachments({
        index: 0,
        attachments: [
          {
            name: controlName + '.png',
            path: value,
            previewAttachmentType: 'QINIU',
          },
        ],
        showThumbnail: true,
        hideFunctions: ['editFileName'],
      });
    });
  }

  renderCommon() {
    const { rowHeight = 34 } = this.props;
    const { value } = this.state;

    return (
      <div className="cellAttachment cellAttachmentSignature ellipsis Hand" style={{ height: rowHeight - 10 }}>
        <img
          style={{ height: rowHeight - 10, backgroundColor: '#ffffff' }}
          crossOrigin="anonymous"
          className="thumbnail"
          role="presentation"
          src={value}
          onClick={e => {
            this.previewAttachment(value);
            e.stopPropagation();
          }}
        />
      </div>
    );
  }

  render() {
    const {
      projectId,
      appId,
      worksheetId,
      from,
      cell,
      tableFromModule,
      className,
      style,
      popupContainer,
      editable,
      isediting,
      updateEditingStatus,
      fromEmbed,
    } = this.props;
    const { value } = this.state;

    if (from === FROM.CARD || (from === FROM.DRAFT && browserIsMobile())) {
      return value ? <div className="cellAttachments cellControl"> {this.renderCommon()} </div> : <span />;
    }

    return (
      <EditableCellCon
        onClick={this.props.onClick}
        className={cx(className, { canedit: editable })}
        style={style}
        iconRef={this.editIcon}
        iconName="hr_edit"
        iconClassName="dateEditIcon"
        isediting={isediting}
        onIconClick={() => {
          updateEditingStatus(true);
        }}
      >
        <SignatureComp
          projectId={projectId}
          appId={appId}
          worksheetId={worksheetId}
          controlId={cell.controlId}
          ref={this.editRef}
          onlySignature
          isEdit
          advancedSetting={cell.advancedSetting}
          destroyPopupOnHide={!window.isSafari} // 不是 Safari
          visible={isediting}
          popupContainer={
            tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ||
            tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD ||
            fromEmbed
              ? document.body
              : popupContainer()
          }
          onClose={() => {
            updateEditingStatus(false);
          }}
          onChange={this.handleChange}
        >
          {value ? (
            <div className="cellAttachments cellControl"> {this.renderCommon()} </div>
          ) : (
            <div className="w100 h100"></div>
          )}
        </SignatureComp>
      </EditableCellCon>
    );
  }
}
