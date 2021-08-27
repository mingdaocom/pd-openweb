import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import 'emotion';
import { addSuccess } from '../../redux/postActions';
import { connect } from 'react-redux';
import UploadFiles from 'src/components/UploadFiles';
import './updater.css';

/**
 * 动态发布器
 */
class Updater extends React.Component {
  static propTypes = {
    defaultGroup: PropTypes.string,
    projectId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.MyUpdater = null;

    this.state = {
      kcAttachmentData: [],
      temporaryData: [],
      isUploadComplete: true,
    };
  }

  clearFilesData = () => {
    this.setState({
      kcAttachmentData: [],
      temporaryData: [],
      isUploadComplete: true,
    });
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    const comp = this;
    require(['myupdater'], (MyUpdater) => {
      $(() => {
        $('.myUpdateItem_Content a').each(function () {
          if ($(this).data('targetdiv')) {
            $(this).attr('targetdiv', $(this).data('targetdiv'));
          }
        });
        this.MyUpdater = MyUpdater;
        MyUpdater.Init({
          clearFilesData: () => {
            this.clearFilesData();
          },
          projectId: comp.props.projectId,
          group: { groupId: comp.props.groupId, isJoin: true },
        });
      });
    });
    this.initEmotion();
    $('#hidden_UpdaterType').val('0');
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.temporaryData.length !== this.state.temporaryData.length || nextState.kcAttachmentData.length !== this.state.kcAttachmentData.length) {
      return true;
    }
    if (nextProps.groupId !== this.props.groupId || nextProps.projectId !== this.props.projectId) {
      require(['myupdater'], (MyUpdater) => {
        this.MyUpdater = MyUpdater;
        MyUpdater.Init({ clearFilesData: this.clearFilesData.bind(this), projectId: nextProps.projectId, group: { groupId: nextProps.groupId } });
      });
    }
    return false;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  post = () => {
    if (!this.state.isUploadComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return;
    }
    const addPost = postItem => this.props.dispatch(addSuccess(postItem));
    const resultData = {
      attachmentData: this.state.temporaryData,
      kcAttachmentData: this.state.kcAttachmentData,
      isUploadComplete: this.state.isUploadComplete,
    };
    require(['myupdater'], (MyUpdater) => {
      if (!this._isMounted) {
        return;
      }
      MyUpdater.PostUpdater(resultData, this.postBtn, (result) => {
        addPost(result.post);
        this.setState({
          kcAttachmentData: [],
          temporaryData: [],
          isUploadComplete: true,
        });
        $('body').click(); // 发布器收起
      });
    });
  };

  initEmotion = () => {
    $(this.faceBtn).emotion({
      input: '#textarea_Updater',
      placement: 'right bottom',
      mdBear: false,
      relatedLeftSpace: 22,
      onSelect: (...args) => {
        const textBox = $('#textarea_Updater')[0];
        if (
          textBox.value === _l('知会工作是一种美德') + '...' ||
          textBox.value === _l('上传附件') + '...' ||
          textBox.value === _l('分享网站') + '...' ||
          textBox.value === _l('分享网站') + '...' ||
          textBox.value === _l('请输入投票问题') + '...'
        ) {
          textBox.value = '';
        }
      },
    });
  };

  viewLink = () => {
    require(['myupdater'], (MyUpdater) => {
      if (!this._isMounted) {
        return;
      }
      MyUpdater.ViewLink(this.linkBtn);
    });
  };

  handleMouseover = () => {
    $(this.faceBtn).addClass('icon-smilingFace');
  };

  handleMouseout = () => {
    $(this.faceBtn).removeClass('icon-smilingFace');
  };

  textareaFocus = () => {
    $('#textarea_Updater').focus();
  };

  handleOpen = (res) => {
    const $Attachment_updater = $('[targetdiv="#Attachment_updater"]');
    if (!$Attachment_updater.hasClass('ThemeColor3')) {
      $Attachment_updater.click();
    }
  };

  handleUploadComplete = (bool) => {
    this.setState({
      isUploadComplete: bool,
    });
    $('#hidden_UpdaterType').val('9');
    const value = $('#textarea_Updater').val();

    if (
      bool &&
      (!value || value == (_l('知会工作是一种美德') + '...') || value == _l('上传附件...')) &&
      (this.state.temporaryData.length || this.state.kcAttachmentData.length)
    ) {
      $('#textarea_Updater').val(
        this.state.temporaryData.length ? this.state.temporaryData[0].originalFileName : this.state.kcAttachmentData[0].originalFileName
      );
      $('#textarea_Updater').focus();
    }
  };

  render() {
    return (
      <div className="card updaterCard">
        <input type="hidden" id="hidden_UpdaterType" />
        <input type="hidden" id="Hidden_FromStorage" value="0" />
        <div>
          <div className="myUpdateItem ThemeBorderColor4">
            <div className="myUpdateItem_Content" id="myUpdateItem_Content" style={{ position: 'relative' }}>
              <div id="msgContainer" className="msgContainer">
                <textarea id="textarea_Updater" style={{ height: '24px' }} className="TextArea Gray_a Block" />
              </div>
              <div className="Hidden" id="myupdaterOP">
                <div className="faceArea">
                  <div className="msgExpandDiv" style={{ marginRight: '-4px' }}>
                    <a
                      className="faceBtn icon-smile"
                      ref={(faceBtn) => {
                        this.faceBtn = faceBtn;
                      }}
                      onMouseOver={this.handleMouseover}
                      onMouseOut={this.handleMouseout}
                    />
                    <div className="Clear" />
                  </div>
                </div>

                <div className="Relative">
                  <div className="Absolute Hidden" id="updateCloseContainer" style={{ right: '0px', top: '15px' }}>
                    <span className="update_close ThemeBGColor3" style={{ margin: '5px' }} data-tip={_l('关闭')}>
                      <i className="icon-delete ThemeColor3" />
                    </span>
                  </div>

                  <div className="myUpdateType mTop12">
                    <span className="inlineBlock mRight20" data-tip={_l('添加附件')}>
                      <a className="icon-attachment Font18 NoUnderLine" data-targetdiv="#Attachment_updater" />
                    </span>
                    <span className="inlineBlock mRight20" data-tip={_l('链接')}>
                      <a className="icon-link Font18 NoUnderLine" data-targetdiv="#Link_updater" />
                    </span>
                    <span className="inlineBlock" data-tip={_l('投票')}>
                      <a className="icon-votenobg Font18 NoUnderLine" data-targetdiv="#Vote_updater" />
                    </span>
                  </div>

                  <div id="Attachment_updater" className="middleContent mBottom5 Hidden">
                    <UploadFiles
                      dropPasteElement="myUpdateItem_Content"
                      onDropPasting={() => {
                        this.textareaFocus();
                        this.handleOpen([]);
                      }}
                      arrowLeft={4}
                      temporaryData={this.state.temporaryData}
                      kcAttachmentData={this.state.kcAttachmentData}
                      onTemporaryDataUpdate={(result) => {
                        this.handleOpen(result), this.setState({ temporaryData: result });
                      }}
                      onKcAttachmentDataUpdate={(result) => {
                        this.setState({ kcAttachmentData: result });
                      }}
                      onUploadComplete={(bool) => {
                        this.handleUploadComplete(bool);
                      }}
                    />
                    <div className={cx('addAttachmentToKc mTop10', { Hidden: !this.state.temporaryData.length })}>
                      <input id="addAttachmentToKcToggle" type="checkbox" />
                      <span id="addAttachmentToKcLink" className="ThemeColor3 Hand">
                        {_l('本地文件存入知识中心')}
                      </span>
                    </div>
                    <hr
                      className={cx('updaterAttachmentSplitter ThemeBorderColor5', {
                        Hidden: !(this.state.temporaryData.length || this.state.kcAttachmentData.length),
                      })}
                    />
                    <div
                      id="Div_JoinKnowledge"
                      className={cx('mLeft0 mAll5 Left', { Hidden: !(this.state.temporaryData.length || this.state.kcAttachmentData.length) })}
                      style={{ width: '200px' }}
                    >
                      <input type="text" className="Hidden" id="txtKnowledge" style={{ width: '370px', opacity: 0 }} />
                    </div>
                  </div>

                  {/* 链接*/}
                  <div id="Link_updater" className="middleContent Hidden">
                    <div className="arrowUpOuter" style={{ left: '40px' }}>
                      <div className="arrowUpInner" />
                    </div>
                    <div className="updaterDialog_Main" style={{ minHeight: '35px' }}>
                      <div id="uploadLink_Step1" className="upload_Step1">
                        <div className="visualDocTextBox">
                          <div className="Left">
                            <input type="text" id="text_LinkUrl" className="TextBox linkTextBox" />
                          </div>
                          <div className="Right linkBtnArea">
                            <input
                              type="button"
                              className="btnBootstrap btnBootstrap-primary btnBootstrap-small linkBtn"
                              ref={(linkBtn) => {
                                this.linkBtn = linkBtn;
                              }}
                              onClick={this.viewLink}
                              defaultValue={_l('预览')}
                            />
                          </div>
                          <div className="clear" />
                        </div>
                        <div className="updaterLinkView uploadLinkContent" />
                      </div>
                    </div>
                  </div>

                  {/* 投票*/}
                  <div id="Vote_updater" className="middleContent Hidden" />

                  <div className="Right mTop5">
                    <div className="Right" style={{ boxSizing: 'border-box', marginTop: '2px' }}>
                      <input
                        id="button_Share"
                        type="button"
                        className="TxtMiddle btnBootstrap btnBootstrap-primary btnBootstrap-small"
                        style={{ padding: '2px 15px' }}
                        ref={(postBtn) => {
                          this.postBtn = postBtn;
                        }}
                        onClick={this.post}
                        value={_l('分享')}
                      />
                    </div>
                    <div className="Right">
                      <input type="hidden" id="hidden_GroupID_All" value="" />
                    </div>
                  </div>
                  <div className="Clear" />
                </div>
              </div>
            </div>
          </div>
          <div className="Clear" />
        </div>
      </div>
    );
  }
}

module.exports = connect((state) => {
  const { projectId, groupId } = state.post.options;
  return { projectId, groupId };
})(Updater);
