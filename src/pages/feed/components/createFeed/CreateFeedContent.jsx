import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Button, Tabs, Tooltip } from 'ming-ui/antd-components';
import { SelectGroupPopover } from 'ming-ui/functions/quickSelectGroup';
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
const KNOWLEDGE_STYLE = { width: 200 };
const KNOWLEDGE_INPUT_STYLE = { width: 370 };
const getCreateFeedPopupContainer = () => document.body;

export default function CreateFeedContent({
  defaultAttachmentData,
  defaultKcAttachmentData,
  initialActiveTab,
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
  const { open: openMentionsInput, holder: mentionsInputHolder } = useMentionsInput();

  const resetContent = React.useCallback(() => {
    setActiveTab('');
    setAttachmentData([]);
    setKcAttachmentData([]);
    setIsToFeed(true);
  }, []);

  React.useEffect(() => {
    onMount({ openMentionsInput, resetContent, setActiveTab, setPosting });
  }, [onMount, openMentionsInput, resetContent]);

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
            <textarea
              className="Updater_TextArea TextArea mRight10"
              id="MDUpdater_textarea_Updater"
              style={TEXTAREA_STYLE}
              defaultValue={postMsg}
            />
          </div>

          <div className="msgExpandDiv Right">
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
  initialActiveTab: PropTypes.string.isRequired,
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
