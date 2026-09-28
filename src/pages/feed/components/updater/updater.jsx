import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Checkbox, Tabs, Tooltip } from 'ming-ui/antd-components';
import { SelectGroupPopover } from 'ming-ui/functions/quickSelectGroup';
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
    };
  }

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
      nextState.isPosting !== this.state.isPosting
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
      });
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
                <textarea id="textarea_Updater" style={{ height: '24px' }} className="TextArea textTertiary Block" />
              </div>
              <div className="Hidden" id="myupdaterOP">
                <div className="faceArea">
                  <div className="msgExpandDiv" style={{ marginRight: '-4px' }}>
                    <Emotion
                      input="#textarea_Updater"
                      placement="bottomRight"
                      onSelect={() => {
                        const textBox = document.getElementById('textarea_Updater');

                        if (
                          textBox.value === _l('知会工作是一种美德') + '...' ||
                          textBox.value === _l('上传附件') + '...' ||
                          textBox.value === _l('请输入投票问题') + '...'
                        ) {
                          textBox.value = '';
                        }
                      }}
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
