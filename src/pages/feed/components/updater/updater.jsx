import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Checkbox, Tabs, Tooltip } from 'ming-ui/antd-components';
import { SelectGroupPopover } from 'ming-ui/functions/quickSelectGroup';
import PostMarkdownEditor from 'src/components/comment/PostMarkdownEditor';
import {
  buildGroupMentionMarkdown,
  buildUserMentionMarkdown,
  toSyntaxMessage,
} from 'src/components/comment/utils/markdownMessageSyntax';
import Emotion from 'src/components/emotion';
import UploadFiles from 'src/components/UploadFiles';
import { addSuccess } from '../../redux/postActions';
import MyUpdater from '../common/myupdater/myupdater';
import './updater.css';

const UPDATER_TAB_STYLES = {
  root: { marginTop: 12 },
  header: { marginBottom: 10 },
};
const INACTIVE_UPDATER_TAB_STYLES = {
  root: { marginTop: 12 },
  header: { marginBottom: 0 },
};

const TEXTAREA_STYLE = { height: '24px' };
// textarea 本身被 myupdater.js 的 jQuery 直接改 class 与 style，隐藏要放在 React 独占的外层容器上
const HIDDEN_WRAP_STYLE = { display: 'none' };

// 旧草稿还原 @人 时的占位符：私有区字符，正文里不会出现，也不含 @
const DRAFT_MENTION_TOKEN = String.fromCharCode(0xe000);
const DRAFT_MENTION_TOKEN_REG = new RegExp(`${DRAFT_MENTION_TOKEN}(\\d+)${DRAFT_MENTION_TOKEN}`, 'g');

/**
 * 草稿沿用 MentionsInput 的缓存（cacheKey: updatertext），在原有字段外附带 markdownValue 保存编辑器源码。
 * 旧版纯文本草稿没有 markdownValue：按 mentionsCollection 把正文里的「@名字」还原成 Markdown 链接，@人 不丢 id。
 */
const getDraftMarkdown = (draft = {}) => {
  if (_.isString(draft.markdownValue)) return draft.markdownValue;

  const tokens = [];
  let markdown = String(draft.text || '');

  // 与 MentionsInput 一致，每个 mention 对应正文里第一处未被占用的「@名字」；
  // 已替换的位置先换成占位符，避免后续同前缀的名字匹配进去
  (draft.mentionsCollection || []).forEach(mention => {
    const name = mention && (mention.fullname || mention.value);
    const index = name && mention.id ? markdown.indexOf(`@${name}`) : -1;

    if (index === -1) return;

    const buildMarkdown = mention.type === 'group' ? buildGroupMentionMarkdown : buildUserMentionMarkdown;

    tokens.push(buildMarkdown(name, mention.id));
    markdown = [
      markdown.slice(0, index),
      DRAFT_MENTION_TOKEN,
      tokens.length - 1,
      DRAFT_MENTION_TOKEN,
      markdown.slice(index + name.length + 1),
    ].join('');
  });

  return markdown.replace(DRAFT_MENTION_TOKEN_REG, (raw, index) => tokens[index]);
};

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
    this.isPosting = false;

    this.state = {
      kcAttachmentData: [],
      temporaryData: [],
      isUploadComplete: true,
      addAttachmentToKc: false,
      shareGroup: {},
      activeTab: '',
      isPosting: false,
      // 只承载外部写入编辑器的值（草稿恢复、发布后清空）；输入过程不回写，避免整个发布器随输入重渲染
      markdownValue: '',
      // 编辑器聚焦后保持展开，直到点击发布框外部收起（与原 textarea 一致，见 MyUpdater 的 onCollapse）
      editorExpanded: false,
    };
  }

  /**
   * Markdown 编辑器的内容实时写回隐藏的 textarea：
   * myupdater.js 的提交、占位符判断、展开收起都依赖它，这样那一层无需改动。
   */
  syncMarkdownToTextarea = markdownValue => {
    const textarea = document.getElementById('textarea_Updater');
    if (!textarea) return;

    textarea.value = toSyntaxMessage(markdownValue);
    textarea.classList.remove('textTertiary');
  };

  /**
   * 操作区（表情、附件、投票、分享）原本由 textarea 的 focus 事件展开，
   * textarea 隐藏后改由编辑器聚焦触发，保持与原有交互一致。
   */
  /** 编辑器里粘贴或拖入的图片不进 Markdown，仍然走附件上传 */
  handleEditorUploadFiles = files => {
    if (!files || !files.length) return;

    this.handleOpen([]);
    this.uploadFilesRef?.addFiles(files);
  };

  handleEditorFocus = () => {
    if (!this.state.editorExpanded) this.setState({ editorExpanded: true });

    $('#myupdaterOP').slideDown(function () {
      $(this).attr('style', 'display: block');
    });
  };

  /**
   * textarea 已隐藏、不会再触发失焦保存，草稿改由编辑器内容变化与失焦时写入，
   * 切换页面再回来时可以恢复（Vditor 的 input 回调本身带防抖）
   */
  storeDraft = markdownValue => {
    const textarea = document.getElementById('textarea_Updater');
    if (!textarea || !_.isFunction(textarea.store)) return;

    if (!_.trim(markdownValue)) {
      textarea.clearStore();
      return;
    }

    textarea.store({
      text: markdownValue,
      messageText: toSyntaxMessage(markdownValue),
      mentionsCollection: [],
      markdownValue,
    });
  };

  handleRestoreDraft = draft => {
    const markdownValue = getDraftMarkdown(draft);
    const textarea = document.getElementById('textarea_Updater');

    if (!this._isMounted) return;

    // restore 把旧草稿的 mentionsCollection 写进了 textarea，这里清掉，提交只认编辑器同步过去的正文
    textarea?.reset?.();
    this.syncMarkdownToTextarea(markdownValue);
    this.setState({ markdownValue });
  };

  handleMarkdownChange = markdownValue => {
    this.syncMarkdownToTextarea(markdownValue);
    this.storeDraft(markdownValue);
  };

  clearFilesData = () => {
    this.setState({
      kcAttachmentData: [],
      temporaryData: [],
      isUploadComplete: true,
      addAttachmentToKc: false,
    });
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    const comp = this;
    this.MyUpdater = MyUpdater;
    MyUpdater.Init({
      clearFilesData: () => {
        this.clearFilesData();
      },
      projectId: comp.props.projectId,
      group: { groupId: comp.props.groupId, isJoin: true },
      resetActiveTab: this.resetActiveTab,
      onPostingChange: this.handlePostingChange,
      onRestoreDraft: this.handleRestoreDraft,
      onCollapse: this.handleCollapse,
    });
    $('#hidden_UpdaterType').val('0');
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextState.temporaryData.length !== this.state.temporaryData.length ||
      nextState.kcAttachmentData.length !== this.state.kcAttachmentData.length ||
      nextState.addAttachmentToKc !== this.state.addAttachmentToKc ||
      nextState.shareGroup !== this.state.shareGroup ||
      nextState.activeTab !== this.state.activeTab ||
      nextState.isPosting !== this.state.isPosting ||
      nextState.markdownValue !== this.state.markdownValue ||
      nextState.editorExpanded !== this.state.editorExpanded
    ) {
      return true;
    }

    if (nextProps.groupId !== this.props.groupId || nextProps.projectId !== this.props.projectId) {
      this.MyUpdater = MyUpdater;
      MyUpdater.Init({
        clearFilesData: this.clearFilesData.bind(this),
        projectId: nextProps.projectId,
        group: { groupId: nextProps.groupId },
        resetActiveTab: this.resetActiveTab,
        onPostingChange: this.handlePostingChange,
        onRestoreDraft: this.handleRestoreDraft,
        onCollapse: this.handleCollapse,
      });
    }

    return false;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  post = () => {
    if (this.isPosting) {
      return;
    }

    const { shareGroup = {} } = this.state;

    if (!this.state.isUploadComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return;
    }

    const addPost = postItem => this.props.dispatch(addSuccess(postItem));
    const resultData = {
      attachmentData: this.state.temporaryData,
      kcAttachmentData: this.state.kcAttachmentData,
      isUploadComplete: this.state.isUploadComplete,
      addAttachmentToKc: this.state.addAttachmentToKc,
      scope:
        (shareGroup.shareGroupIds || []).length ||
        (shareGroup.shareProjectIds || []).length ||
        (shareGroup.radioProjectIds || []).length ||
        shareGroup.isMe
          ? _.pick(shareGroup, ['radioProjectIds', 'shareGroupIds', 'shareProjectIds'])
          : undefined,
    };

    if (!this._isMounted) {
      return;
    }

    MyUpdater.PostUpdater(resultData, result => {
      addPost(result.post);
      this.setState({
        kcAttachmentData: [],
        temporaryData: [],
        isUploadComplete: true,
        addAttachmentToKc: false,
        shareGroup: {},
        markdownValue: '',
      });
      this.markdownEditor?.setValue('');
      $('body').click(); // 发布器收起
    });
  };

  handlePostingChange = isPosting => {
    this.isPosting = isPosting;
    if (this._isMounted) {
      this.setState({ isPosting });
    }
  };

  textareaFocus = () => {
    $('#textarea_Updater').focus();
  };

  handleCollapse = () => {
    if (this._isMounted && this.state.editorExpanded) this.setState({ editorExpanded: false });
  };

  handleOpen = () => {
    if (this.state.activeTab !== '9') {
      this.handleTabChange('9');
    }
  };

  handleTabChange = activeTab => {
    MyUpdater.ChangeUpdaterType(activeTab);
    this.setState({ activeTab });
  };

  handleClose = () => {
    MyUpdater.ResetUpdaterDiv();
  };

  resetActiveTab = () => {
    if (this._isMounted) {
      this.setState({ activeTab: '' });
    }
  };

  handleUploadComplete = bool => {
    this.setState({
      isUploadComplete: bool,
    });
    $('#hidden_UpdaterType').val('9');
    const value = $('#textarea_Updater').val();

    if (
      bool &&
      (!value || value == _l('知会工作是一种美德') + '...' || value == _l('上传附件...')) &&
      (this.state.temporaryData.length || this.state.kcAttachmentData.length)
    ) {
      $('#textarea_Updater').val(
        this.state.temporaryData.length
          ? this.state.temporaryData[0].originalFileName
          : this.state.kcAttachmentData[0].originalFileName,
      );
      $('#textarea_Updater').focus();
    }
  };

  handleSelectGroup = value => this.setState({ shareGroup: value });

  renderBottomRightCon = inTabBar => {
    const { isPosting, shareGroup } = this.state;

    return (
      <div className={cx('updaterBottomRightCon', !inTabBar && 'Right mTop5')}>
        <div className="Right" style={{ boxSizing: 'border-box', marginTop: '2px' }}>
          <Button id="button_Share" type="primary" size="small" loading={isPosting} onClick={this.post}>
            {_l('分享')}
          </Button>
        </div>
        <div className="Right">
          <SelectGroupPopover value={shareGroup} onChange={this.handleSelectGroup} />
        </div>
      </div>
    );
  };

  render() {
    const { activeTab } = this.state;

    return (
      <div className="card updaterCard">
        <input type="hidden" id="hidden_UpdaterType" />
        <input type="hidden" id="Hidden_FromStorage" value="0" />
        <div>
          <div className="myUpdateItem borderColorPrimary">
            <div className="myUpdateItem_Content" id="myUpdateItem_Content" style={{ position: 'relative' }}>
              <div id="msgContainer" className="msgContainer">
                {/* textarea 始终保留：提交、草稿、附件粘贴、展开收起都挂在它上面 */}
                {/* textarea 仍承载提交、草稿与附件粘贴，仅对用户隐藏 */}
                <div style={HIDDEN_WRAP_STYLE}>
                  <textarea id="textarea_Updater" style={TEXTAREA_STYLE} className="TextArea textTertiary Block" />
                </div>
                <PostMarkdownEditor
                  ref={editor => {
                    this.markdownEditor = editor;
                  }}
                  value={this.state.markdownValue}
                  placeholder={_l('知会工作是一种美德') + '...'}
                  minHeight={24}
                  focusedMinHeight={80}
                  expanded={this.state.editorExpanded}
                  projectId={this.props.projectId}
                  onChange={this.handleMarkdownChange}
                  onFocus={this.handleEditorFocus}
                  onBlur={this.storeDraft}
                  onUploadFiles={this.handleEditorUploadFiles}
                  onSubmit={this.post}
                />
              </div>
              <div className="Hidden" id="myupdaterOP">
                <div className="faceArea">
                  <div className="msgExpandDiv" style={{ marginRight: '-4px' }}>
                    <Emotion
                      placement="bottomRight"
                      onSelect={selection => this.markdownEditor?.insertText(selection.text)}
                      popupContainer={document.querySelector('.myUpdateItem')}
                    >
                      <button
                        type="button"
                        className="emotionTriggerButton faceBtn icon-smile"
                        aria-label={_l('插入表情')}
                        title={_l('插入表情')}
                      />
                    </Emotion>
                    <div className="Clear" />
                  </div>
                </div>

                <div className="Relative">
                  <Tabs
                    className={cx('updaterTabs', { updaterTabsInactive: !activeTab })}
                    activeKey={activeTab}
                    destroyOnHidden={false}
                    onChange={this.handleTabChange}
                    styles={activeTab ? UPDATER_TAB_STYLES : INACTIVE_UPDATER_TAB_STYLES}
                    tabBarExtraContent={
                      activeTab ? (
                        <div id="updateCloseContainer">
                          <Tooltip title={_l('关闭')}>
                            <Button
                              type="text"
                              size="small"
                              icon={<i className="icon icon-close Font16 textTertiary" />}
                              aria-label={_l('关闭')}
                              onClick={this.handleClose}
                            />
                          </Tooltip>
                        </div>
                      ) : (
                        this.renderBottomRightCon(true)
                      )
                    }
                    items={[
                      {
                        key: '9',
                        label: (
                          <Tooltip title={_l('添加附件')}>
                            <span className="updaterTabIcon icon icon-attachment Font18" aria-label={_l('添加附件')} />
                          </Tooltip>
                        ),
                        forceRender: true,
                        children: (
                          <div id="Attachment_updater" className="middleContent mBottom5">
                            <UploadFiles
                              manualRef={ref => {
                                this.uploadFilesRef = ref;
                              }}
                              dropPasteElement="myUpdateItem_Content"
                              onDropPasting={() => {
                                this.textareaFocus();
                                this.handleOpen([]);
                              }}
                              temporaryData={this.state.temporaryData}
                              kcAttachmentData={this.state.kcAttachmentData}
                              onTemporaryDataUpdate={result => {
                                this.handleOpen(result);
                                this.setState(state => ({
                                  temporaryData: result,
                                  addAttachmentToKc: result.length ? state.addAttachmentToKc : false,
                                }));
                              }}
                              onKcAttachmentDataUpdate={result => {
                                this.setState({ kcAttachmentData: result });
                              }}
                              onUploadComplete={bool => {
                                this.handleUploadComplete(bool);
                              }}
                            />
                            <Checkbox
                              className={cx('mTop10', {
                                Hidden: !this.state.temporaryData.length,
                              })}
                              checked={this.state.addAttachmentToKc}
                              onChange={event => this.setState({ addAttachmentToKc: event.target.checked })}
                            >
                              {_l('本地文件存入知识中心')}
                            </Checkbox>
                          </div>
                        ),
                      },
                      {
                        key: '7',
                        label: (
                          <Tooltip title={_l('投票')}>
                            <span className="updaterTabIcon icon icon-votenobg Font18" aria-label={_l('投票')} />
                          </Tooltip>
                        ),
                        forceRender: true,
                        children: <div id="Vote_updater" className="middleContent" />,
                      },
                    ]}
                  />

                  {activeTab && this.renderBottomRightCon(false)}
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

export default connect(state => {
  const { projectId, groupId } = state.post.options;
  return { projectId, groupId };
})(Updater);
