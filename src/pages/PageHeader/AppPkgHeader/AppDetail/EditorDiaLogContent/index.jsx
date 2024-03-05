import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Divider, Button, Tooltip } from 'antd';
import { Icon, RichText } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import UserHead from 'src/components/userHead';
import styled from 'styled-components';
import './index.less';
import { canEditData, canEditApp } from 'src/pages/worksheet/redux/actions/util.js';
import appManagementApi from 'src/api/appManagement';

const Wrap = styled.div`
  .ck-editor__main {
    max-height: ${props => props.richTextHeight ? `${props.richTextHeight}px` : `100%`};
  }
  .flexShrink0 {
    flex-shrink: 0;
    min-width: 0;
  }
`;

export default class Editor extends Component {
  static propTypes = {
    cacheKey: PropTypes.string, // 缓存内容key
    isEditing: PropTypes.bool, // 编辑状态
    auth: PropTypes.bool, // 权限
    permissionType: PropTypes.number,
    className: PropTypes.string, // 类名
    summary: PropTypes.string, // 内容
    placeholder: PropTypes.string, // 无内容的时候引导文案
    joinEditing: PropTypes.func, // 进入编辑
    onCancel: PropTypes.func, // 取消回调
    onSave: PropTypes.func, // 确定回调
  };

  static defaultProps = {
    cacheKey: '',
    isEditing: false,
    auth: true,
    className: '',
    summary: '',
    placeholder: '',
    joinEditing: () => {},
    onCancel: () => {},
    onSave: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      showCache: false,
      bindCreateUpload: false,
      clearCacheLoading: false
    };
  }

  componentDidMount() {
    // a 链接点击
    $('body').on('click.editor', '.mdEditorContent a', function (e) {
      e.stopPropagation();
      e.preventDefault();

      const a = document.createElement('a');
      a.href = $(this).attr('href');
      a.target = '_blank';
      a.rel = 'nofollow noopener noreferrer';
      a.click();
    });
    const { summary } = this.props;
    this.onChange(summary);
  }

  componentWillReceiveProps(nextProps) {
    const { cacheKey, summary } = nextProps;
    const cacheSummary = localStorage.getItem('mdEditor_' + cacheKey);

    if (!this.props.isEditing && nextProps.isEditing && cacheSummary && cacheSummary !== summary) {
      this.setState({ showCache: true });
    }
  }

  componentWillUnmount() {
    $('body').off('.editor');
  }

  handleClearCache = () => {
    const { data } = this.props;
    if (this.state.clearCacheLoading) return;
    this.setState({ clearCacheLoading: true });
    appManagementApi.refresh({
      appId: data.id
    }).then(data => {
      this.setState({ clearCacheLoading: false });
    });
  }

  /**
   * 缓存内容
   */
  onChange = html => {
    const { cacheKey, isEditing } = this.props;

    if (cacheKey && isEditing) {
      safeLocalStorageSetItem('mdEditor_' + cacheKey, html);
    }
  };

  /**
   * 判断是否有缓存的内容
   */
  renderRecovery() {
    const { cacheKey, summary } = this.props;
    const cacheSummary = localStorage.getItem('mdEditor_' + cacheKey);

    if (this.state.showCache && cacheSummary && cacheSummary !== summary) {
      return (
        <Fragment>
          <div className="mdEditorTipColor mLeft10">{_l('检测到有上次未保存的内容，')}</div>
          <div className="pointer ThemeColor3 ThemeHoverColor2" onClick={this.recovery}>
            {_l('点击恢复')}
          </div>
          <div className="mdEditorTipColor mLeft5 mRight5">{_l('或')}</div>
          <div className="pointer ThemeColor3 ThemeHoverColor2" onClick={this.clearStorage}>
            {_l('忽略')}
          </div>
        </Fragment>
      );
    }

    return null;
  }

  /**
   * 点击恢复
   */
  recovery = () => {
    const { cacheKey } = this.props;
    const cacheSummary = localStorage.getItem('mdEditor_' + cacheKey);

    this.props.onSave(cacheSummary);
    this.setState({ showCache: false });
  };

  /**
   * 忽略
   */
  clearStorage = () => {
    const { cacheKey } = this.props;
    localStorage.removeItem('mdEditor_' + cacheKey);
    this.setState({ showCache: false });
  };

  /**
   * onSave
   */
  onSave = () => {
    const { cacheKey, onSave, changeEditState } = this.props;
    const content = localStorage.getItem('mdEditor_' + cacheKey);
    onSave(content);
    changeEditState && changeEditState(false);
    this.clearStorage();
  };

  render() {
    const {
      isEditing,
      auth,
      className,
      placeholder,
      joinEditing,
      onCancel,
      changeEditState,
      permissionType,
      isLock,
      summary,
      title,
      changeSetting,
      toorIsBottom,
      maxHeight,
      minHeight,
      cacheKey,
      data = {},
      renderLeftContent
    } = this.props;

    const isAppIntroDescription = cacheKey === 'appIntroDescription';
    const clientHeight = document.body.clientHeight;
    const distance = isEditing ? 198 : 135;
    const richTextHeight = (isAppIntroDescription && !isEditing) ? 0 : clientHeight - distance;

    if (!isEditing) {
      const { name, iconUrl, iconColor, projectId, managers } = data;
      const { projects } = md.global.Account;
      const { companyName } = _.filter(projects, { projectId })[0] || {};
      const isEditAppDescription = !isEditing && (canEditData(permissionType) || canEditApp(permissionType, isLock));
      return (
        <Wrap
          className={cx('mdEditor', { Alpha8: !auth }, className, { pBottom15: summary })}
          onClick={joinEditing}
          richTextHeight={richTextHeight}
        >
          {isAppIntroDescription && !_.isEmpty(data) ? (
            <header className="appDescriptionHeader flexColumn alignItemsCenter justifyContentCenter">
              <div
                className="flexRow alignItemsCenter justifyContentCenter circle mBottom10"
                style={{ width: 60, height: 60, marginTop: 64, backgroundColor: iconColor }}
              >
                <SvgIcon url={iconUrl} fill="#fff" size={40} />
              </div>
              <div className="Font20 Gray bold mBottom5 pLeft20 pRight20">{name}</div>
              {companyName && <div className="Font14 Gray_9e">{companyName}</div>}
              {!!managers.length && (
                <div className="mTop15 mBottom10 flexRow alignItemsCenter managersWrap">
                  <div className="Gray_9e managersLabel">{_l('管理员')}</div>
                  <div className="flexRow pLeft20 pRight20 managersList">
                    {managers.slice(0, 20).map(data => (
                      <UserHead
                        key={data.accountId}
                        className="manager"
                        projectId={projectId}
                        size={32}
                        user={{
                          ...data,
                          accountId: data.accountId,
                          userHead: data.avatar,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {isEditAppDescription && (
                <Divider className="mBottom5">
                  <Button
                    size="small"
                    onClick={() => changeEditState(true)}
                  >
                    <Icon className="mRight2" icon="edit" />
                    <span className="Font13">{_l('编辑')}</span>
                  </Button>
                </Divider>
              )}
              {isEditAppDescription && (
                <Tooltip title={_l('当应用权限异常时，可尝试清除缓存的权限数据')} placement="bottom">
                  <div
                    className={cx('flexRow alignItemsCenter Gray_9e pointer clearCache', { isLoading: this.state.clearCacheLoading })}
                    onClick={this.handleClearCache}
                  >
                    <Icon className="Font18" icon="task-later" />
                    {_l('清除缓存')}
                  </div>
                </Tooltip>
              )}
            </header>
          ) : (
            <header className="appIntroHeader">
              <div className="caption">{title || _l('应用说明')}</div>
              {isEditAppDescription && (
                <div className="editAppIntro" onClick={() => changeEditState(true)}>
                  <Icon icon="edit" />
                  <span className="Font13 ">{_l('编辑')}</span>
                </div>
              )}
            </header>
          )}
          {isAppIntroDescription && !summary && (
            <div className="Font14 pTop45 pBottom100 flexRow alignItemsCenter justifyContentCenter">
              {'👏'}
              {_l('欢迎使用')}
              <span className="Gray_9e mLeft5">{`(${_l('未添加应用说明')})`}</span>
            </div>
          )}
          {summary ? (
            <RichText
              // placeholder={_l('为应用填写使用说明，当用户第一次访问应用时会打开此说明')}
              data={summary || ''}
              autoFocus={true}
              className={'mdEditorContent editorContent'}
              disabled={true}
              backGroundColor={'#fff'}
              minHeight={minHeight}
              maxHeight={maxHeight}
            />
          ) : null}
        </Wrap>
      );
    }

    return (
      <Wrap className={cx('mdEditor', className)} richTextHeight={richTextHeight}>
        {toorIsBottom && (
          <RichText
            // placeholder={_l('为应用填写使用说明，当用户第一次访问应用时会打开此说明')}
            data={summary || ''}
            autoFocus={true}
            className={'editorContent mdEditorContent'}
            showTool={true}
            onActualSave={this.onChange}
            changeSetting={changeSetting}
            minHeight={minHeight}
            maxHeight={maxHeight}
          />
        )}
        {!toorIsBottom && <button id="editorFiles" />}
        <div className="flexRow mdEditorHeader">
          {!toorIsBottom && <div className="caption">{title || _l('应用说明')}</div>}
          {this.renderRecovery()}
          <div className="flex" />
          <div
            className="mdEditorCancel ThemeColor3"
            onClick={() => {
              this.clearStorage();
              changeEditState && changeEditState(false);
              if (cacheKey === 'customPageEditWidget' || cacheKey === 'appMultilingual') {
                onCancel();
              }
            }}
          >
            {_l('取消')}
          </div>
          <div className="mdEditorSave ThemeBGColor3 ThemeHoverBGColor2" onClick={this.onSave}>
            {_l('保存')}
          </div>
        </div>
        <div className="flexRow">
          {renderLeftContent && (
            <div className="leftContent flex">
              {renderLeftContent()}
            </div>
          )}
          {!toorIsBottom && (
            <div className="flex flexShrink0">
              <RichText
                // placeholder={_l('为应用填写使用说明，当用户第一次访问应用时会打开此说明')}
                data={summary || ''}
                autoFocus={true}
                className={'editorContent mdEditorContent'}
                showTool={true}
                onActualSave={this.onChange}
                changeSetting={changeSetting}
                minHeight={minHeight || 320}
                maxHeight={maxHeight}
              />
            </div>
          )}
        </div>
      </Wrap>
    );
  }
}
