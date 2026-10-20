import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Tabs, Tooltip } from 'ming-ui/antd-components';
import { SelectGroupPopover } from 'ming-ui/functions/quickSelectGroup';
import { MARKDOWN_PREFERENCE_KEY, readMarkdownPreference } from 'src/components/comment/config';
import PostMarkdownEditor from 'src/components/comment/PostMarkdownEditor';
import createLinksForMessage from 'src/components/comment/utils/createLinksForMessage';
import {
  extractMentions,
  mentionsToRelationLists,
  stripMarkdown,
  toDisplayMessage,
  toSyntaxMessage,
} from 'src/components/comment/utils/markdownMessageSyntax';
import Emotion from 'src/components/emotion';
import { useMentionsInput } from 'src/components/MentionsInput';
import UploadFiles from 'src/components/UploadFiles';
import './style.css';

const CREATE_FEED_TAB_STYLES = {
  root: { marginTop: 12 },
  header: { marginBottom: 10 },
};
const INACTIVE_CREATE_FEED_TAB_STYLES = {
  root: { marginTop: 12 },
  header: { marginBottom: 0 },
};
const TEXTAREA_STYLE = { height: 50 };
// textarea 本身被 jQuery 直接改 class 与 style，隐藏要放在 React 独占的外层容器上
const HIDDEN_WRAP_STYLE = { display: 'none' };
const KNOWLEDGE_STYLE = { width: 200 };
const KNOWLEDGE_INPUT_STYLE = { width: 370 };
const getCreateFeedPopupContainer = () => document.body;
const getTextareaElement = () => document.getElementById('MDUpdater_textarea_Updater');

export default function CreateFeedContent({
  defaultAttachmentData,
  defaultKcAttachmentData,
  getPlaceholder,
  initialActiveTab,
  isPlaceholder,
  initialShareGroup,
  knowledge,
  onAttachmentDataChange,
  onGroupChange,
  onKcAttachmentDataChange,
  onEmotionSelect,
  onMount,
  onPost,
  onTabChange,
  onUploadComplete,
  postMsg,
  selectGroupOptions,
  showToFeed,
  showType,
}) {
  const [activeTab, setActiveTab] = React.useState(initialActiveTab);
  const [attachmentData, setAttachmentData] = React.useState(defaultAttachmentData);
  const [kcAttachmentData, setKcAttachmentData] = React.useState(defaultKcAttachmentData);
  const [isPosting, setPosting] = React.useState(false);
  const [isToFeed, setIsToFeed] = React.useState(true);
  const [shareGroup, setShareGroup] = React.useState(initialShareGroup);
  const [isMarkdown, setIsMarkdown] = React.useState(readMarkdownPreference);
  const [markdownValue, setMarkdownValue] = React.useState(postMsg || '');
  const { open: openMentionsInput, holder: mentionsInputHolder } = useMentionsInput();
  const markdownEditorRef = React.useRef(null);
  const uploadFilesRef = React.useRef(null);
  const markdownStateRef = React.useRef({ isMarkdown, value: markdownValue });

  React.useEffect(() => {
    markdownStateRef.current = { isMarkdown, value: markdownValue };
  }, [isMarkdown, markdownValue]);

  const resetContent = React.useCallback(() => {
    setActiveTab('');
    setAttachmentData([]);
    setKcAttachmentData([]);
    setIsToFeed(true);
  }, []);

  const resetMarkdown = React.useCallback(() => {
    setMarkdownValue('');
    markdownEditorRef.current?.setValue('');
  }, []);

  // 提交时由控制器读取：Markdown 模式下正文来自编辑器而非 textarea
  const getMarkdownState = React.useCallback(() => markdownStateRef.current, []);

  React.useEffect(() => {
    onMount({ openMentionsInput, resetContent, setActiveTab, setPosting, getMarkdownState, resetMarkdown });
  }, [onMount, openMentionsInput, resetContent, getMarkdownState, resetMarkdown]);

  const changeTab = key => {
    setActiveTab(key);
    onTabChange(Number(key));
  };

  const handleClose = () => {
    resetContent();
    onTabChange(0, true);
  };

  const handleAttachmentDataChange = data => {
    setAttachmentData(data);
    onAttachmentDataChange(data);
  };

  const handleKcAttachmentDataChange = data => {
    setKcAttachmentData(data);
    onKcAttachmentDataChange(data);
  };

  const handleGroupChange = value => {
    setShareGroup(value);
    onGroupChange(value);
  };

  /** 编辑器里粘贴或拖入的图片不进 Markdown，仍然走附件上传 */
  const handleEditorUploadFiles = files => {
    if (!files || !files.length) return;

    changeTab('9');
    uploadFilesRef.current?.addFiles(files);
  };

  const applyMarkdownMode = nextIsMarkdown => {
    setIsMarkdown(nextIsMarkdown);
    safeLocalStorageSetItem(MARKDOWN_PREFERENCE_KEY, nextIsMarkdown ? '1' : '0');
  };

  // 两种输入方式互相切换时尽力保留内容：@人靠 mention 数据在两种载体之间搬运
  const switchToMarkdown = () => {
    const textarea = getTextareaElement();

    const done = (messageText, mentions) => {
      const content = isPlaceholder(messageText) ? '' : messageText;
      setMarkdownValue(toDisplayMessage(content, mentionsToRelationLists(mentions)));
      applyMarkdownMode(true);
    };

    if (textarea && _.isFunction(textarea.val) && _.isFunction(textarea.getMentions)) {
      textarea.getMentions(mentions => textarea.val(messageText => done(messageText, mentions)));
      return;
    }

    done(textarea?.value || '', []);
  };

  const switchToPlainText = () => {
    const markdown = markdownStateRef.current.value;
    const mentions = extractMentions(markdown);
    const messageText = stripMarkdown(toSyntaxMessage(markdown));
    const displayText = createLinksForMessage({
      message: messageText,
      noLink: true,
      ...mentionsToRelationLists(mentions),
    });

    applyMarkdownMode(false);
    setMarkdownValue('');

    // textarea 由 MentionsInput 注入 setValue，需等它渲染回来
    setTimeout(() => {
      const textarea = getTextareaElement();
      if (!textarea) return;

      if (_.isFunction(textarea.setValue)) {
        textarea.setValue(displayText, messageText, mentions);
      } else {
        textarea.value = displayText;
      }
    }, 0);
  };

  const renderActions = inTabBar => (
    <div className={cx('createFeedActions', { createFeedActionsInTabBar: inTabBar })}>
      {showToFeed && (
        <Tooltip title={_l('转发到动态')}>
          <Button
            type="text"
            size="small"
            className={cx('createFeedToFeedButton', { createFeedToFeedButtonActive: isToFeed })}
            icon={<i className="icon icon-feed Font16" />}
            aria-label={_l('转发到动态')}
            onClick={() => setIsToFeed(value => !value)}
          />
        </Tooltip>
      )}
      {isToFeed && (
        <SelectGroupPopover
          {...selectGroupOptions}
          className={cx('createFeedShareGroup', selectGroupOptions.className)}
          value={shareGroup}
          onChange={handleGroupChange}
          getPopupContainer={getCreateFeedPopupContainer}
        />
      )}
      <Button id="MDUpdater_button_Share" type="primary" size="small" loading={isPosting} onClick={onPost}>
        {_l('分享')}
      </Button>
    </div>
  );

  const items = [
    showType.includes('attachment') && {
      key: '9',
      label: (
        <Tooltip title={_l('添加附件')}>
          <span className="createFeedTabIcon icon icon-attachment Font18" aria-label={_l('添加附件')} />
        </Tooltip>
      ),
      forceRender: true,
      children: (
        <div id="MDUpdater_Attachment_updater" className="middleContent mBottom5">
          <UploadFiles
            manualRef={ref => {
              uploadFilesRef.current = ref;
            }}
            dropPasteElement="MDUpdater_textarea_Updater"
            isInitCall
            temporaryData={attachmentData}
            kcAttachmentData={kcAttachmentData}
            onDropPasting={() => {
              changeTab('9');
              document.getElementById('MDUpdater_textarea_Updater')?.focus();
            }}
            onTemporaryDataUpdate={handleAttachmentDataChange}
            onKcAttachmentDataUpdate={handleKcAttachmentDataChange}
            onUploadComplete={onUploadComplete}
          />
          {knowledge && (
            <div id="MDUpdater_Div_JoinKnowledge" className="Hidden mAll5 Left" style={KNOWLEDGE_STYLE}>
              <input type="text" id="MDUpdater_txtKnowledge" style={KNOWLEDGE_INPUT_STYLE} />
            </div>
          )}
        </div>
      ),
    },
    showType.includes('vote') && {
      key: '7',
      label: (
        <Tooltip title={_l('投票')}>
          <span className="createFeedTabIcon icon icon-votenobg Font18" aria-label={_l('投票')} />
        </Tooltip>
      ),
      forceRender: true,
      children: <div id="MDUpdater_Vote_updater" className="middleContent" />,
    },
  ].filter(Boolean);

  return (
    <>
      {mentionsInputHolder}
      <div className="MDUpdater">
        <input type="hidden" id="MDUpdater_hidden_UpdaterType" value={activeTab || 0} readOnly />
        <input type="hidden" id="MDUpdater_hidden_fromUseMD" value="" readOnly />
        <input type="checkbox" id="isToFeed" checked={isToFeed} readOnly hidden />
        <div className="Updater_Textpanel">
          <div id="MDUpdater_msgContainer" className="msgContainer mBottom20">
            {/* textarea 始终保留：MentionsInput、草稿缓存、附件粘贴都绑在它上面 */}
            <div style={isMarkdown ? HIDDEN_WRAP_STYLE : undefined}>
              <textarea
                className="Updater_TextArea TextArea mRight10"
                id="MDUpdater_textarea_Updater"
                style={TEXTAREA_STYLE}
                defaultValue={postMsg}
              />
            </div>

            {isMarkdown && (
              <PostMarkdownEditor
                ref={markdownEditorRef}
                className="createFeedMarkdownEditor"
                value={markdownValue}
                placeholder={getPlaceholder(Number(activeTab || 0))}
                minHeight={72}
                projectId={selectGroupOptions.projectId}
                onChange={setMarkdownValue}
                onUploadFiles={handleEditorUploadFiles}
                onSubmit={onPost}
              />
            )}
          </div>

          <div className="msgExpandDiv Right">
            {!isMarkdown && (
              <Emotion
                input="#MDUpdater_textarea_Updater"
                placement="bottomRight"
                popupContainer={getCreateFeedPopupContainer}
                onSelect={onEmotionSelect}
              >
                <button
                  type="button"
                  className="emotionTriggerButton faceBtn icon-smile"
                  aria-label={_l('插入表情')}
                  title={_l('插入表情')}
                />
              </Emotion>
            )}
            <Tooltip title={isMarkdown ? _l('切换为普通文本') : _l('使用 Markdown 编辑')}>
              <button
                type="button"
                className={cx('emotionTriggerButton faceBtn icon-code', { ThemeColor3: isMarkdown })}
                aria-label={isMarkdown ? _l('切换为普通文本') : _l('使用 Markdown 编辑')}
                onClick={isMarkdown ? switchToPlainText : switchToMarkdown}
              />
            </Tooltip>
            <div className="Clear" />
          </div>
          <div className="Clear" />

          <Tabs
            className={cx('createFeedTabs', { createFeedTabsInactive: !activeTab })}
            activeKey={activeTab}
            destroyOnHidden={false}
            items={items}
            styles={activeTab ? CREATE_FEED_TAB_STYLES : INACTIVE_CREATE_FEED_TAB_STYLES}
            tabBarExtraContent={
              activeTab ? (
                <Tooltip title={_l('关闭')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<i className="icon icon-close Font16 textTertiary" />}
                    aria-label={_l('关闭')}
                    onClick={handleClose}
                  />
                </Tooltip>
              ) : (
                renderActions(true)
              )
            }
            onChange={changeTab}
          />

          {activeTab && renderActions(false)}
          <div className="Clear" />
        </div>
      </div>
    </>
  );
}

CreateFeedContent.propTypes = {
  defaultAttachmentData: PropTypes.arrayOf(PropTypes.object).isRequired,
  defaultKcAttachmentData: PropTypes.arrayOf(PropTypes.object).isRequired,
  getPlaceholder: PropTypes.func.isRequired,
  initialActiveTab: PropTypes.string.isRequired,
  isPlaceholder: PropTypes.func.isRequired,
  initialShareGroup: PropTypes.object.isRequired,
  knowledge: PropTypes.bool.isRequired,
  onAttachmentDataChange: PropTypes.func.isRequired,
  onGroupChange: PropTypes.func.isRequired,
  onKcAttachmentDataChange: PropTypes.func.isRequired,
  onEmotionSelect: PropTypes.func.isRequired,
  onMount: PropTypes.func.isRequired,
  onPost: PropTypes.func.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onUploadComplete: PropTypes.func.isRequired,
  postMsg: PropTypes.string,
  selectGroupOptions: PropTypes.object.isRequired,
  showToFeed: PropTypes.bool.isRequired,
  showType: PropTypes.arrayOf(PropTypes.string).isRequired,
};
