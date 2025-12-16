import React, { Component, Fragment } from 'react';
import { Button, Divider } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ColorPicker, Icon, Input, LoadDiv, RadioGroup, RichText, SvgIcon, Textarea, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import mingoApi from 'src/api/mingo';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';
import './index.less';

const Wrap = styled.div`
  .ck-editor__main {
    max-height: ${props => (props.richTextHeight ? `${props.richTextHeight}px` : `100%`)};
  }
  .flexShrink0 {
    flex-shrink: 0;
    min-width: 0;
  }
  .createRemarkWrap {
    .ming.Textarea {
      padding: 5px 12px;
      line-height: 24px;
    }
    .withdraw,
    .active {
      padding: 2px 5px;
      border-radius: 3px;
    }
    .withdraw:hover {
      background: #f5f5f5;
    }
    .active {
      cursor: pointer;
      color: #9709f2;
      &:hover {
        background: #9709f20f;
      }
    }
    .error {
      .ming.Textarea {
        border-color: red !important;
      }
      .TxtRight {
        color: red;
      }
    }
  }
`;

const remarkMaxLength = 150;

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
    const { resume, remark = '' } = props;
    const resumeInfo = resume ? JSON.parse(resume) : {};
    this.state = {
      showCache: false,
      bindCreateUpload: false,
      clearCacheLoading: false,
      aiCreateLoading: false,
      showType: resume ? 1 : 0,
      resume: resumeInfo.value || '',
      resumeColor: resumeInfo.color || '#151515',
      remark,
      sourceAi: false,
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
    appManagementApi
      .refresh({
        appId: data.id,
      })
      .then(() => {
        this.setState({ clearCacheLoading: false });
      });
  };

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

    this.props.onSave({
      description: cacheSummary,
    });
    this.setState({ showCache: false });
  };

  /**
   * 忽略
   */
  clearStorage = () => {
    const { cacheKey } = this.props;
    localStorage.removeItem('mdEditor_' + cacheKey);
    this.setState({ showCache: false, sourceAi: false });
  };

  /**
   * onSave
   */
  onSave = () => {
    const { showType, resume, resumeColor, remark, aiCreateLoading } = this.state;
    const { cacheKey, onSave, changeEditState } = this.props;
    const content = localStorage.getItem('mdEditor_' + cacheKey);
    const resumeInfo = JSON.stringify({
      value: resume,
      color: resumeColor,
    });
    if (aiCreateLoading) {
      return;
    }
    if (remark && remark.length > remarkMaxLength) {
      alert(_l('描述文字超出上限'), 2);
      return;
    }
    onSave({
      description: content,
      resume: showType ? resumeInfo : '',
      remark,
    });
    if (cacheKey === 'sheetIntroDescription' && !content && resume) {
      this.props.onCancel();
    }
    changeEditState && changeEditState(false);
    this.clearStorage();
  };

  handleCreateAi = () => {
    const { cacheKey, data } = this.props;
    const { remark } = this.state;
    const isApp = cacheKey === 'appIntroDescription';
    const isSheet = cacheKey === 'sheetIntroDescription';
    const param = {
      langType: getCurrentLangCode(),
      desc: remark,
    };
    if (isApp) {
      param.name = data.name;
      param.appId = data.id;
      param.type = 1;
    }
    if (isSheet) {
      param.name = data.name;
      param.worksheetId = data.worksheetId;
      param.type = 2;
    }
    this.setState({ aiCreateLoading: true, remark: '', lastRemark: this.state.remark });
    mingoApi
      .generateAppOrWorksheetDescription(param)
      .then(data => {
        const { isSuccess, content, errorMsg } = data;
        if (!isSuccess) {
          alert(errorMsg, 3);
        }
        this.setState({
          sourceAi: true,
          aiCreateLoading: false,
          remark: content.value,
        });
      })
      .catch(() => {
        this.setState({
          aiCreateLoading: false,
        });
      });
  };

  renderState = () => {
    const { aiCreateLoading, remark, lastRemark, sourceAi } = this.state;
    if (aiCreateLoading) {
      return (
        <div className="flexRow alignItemsCenter">
          <LoadDiv className="mRight5" size="small" />
          {_l('AI 生成中...')}
        </div>
      );
    }
    if (remark && sourceAi && !aiCreateLoading) {
      return (
        <div
          className="flexRow alignItemsCenter Gray_9e withdraw pointer"
          onClick={() => {
            this.setState({ sourceAi: undefined, remark: lastRemark || '' });
          }}
        >
          <Icon icon="back" className="Font17 mRight2" />
          {_l('撤销')}
        </div>
      );
    }
    return (
      <div className="flexRow alignItemsCenter active" onClick={this.handleCreateAi}>
        <span className="mRight4 bold">{_l('AI 生成')}</span>
        <Icon icon="auto_awesome" />
      </div>
    );
  };

  render() {
    const { showType, remark, aiCreateLoading } = this.state;
    const {
      isEditing,
      auth,
      className,
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
      renderLeftContent,
    } = this.props;

    const isAppIntroDescription = cacheKey === 'appIntroDescription';
    const isSheetIntroDescription = cacheKey === 'sheetIntroDescription';
    const clientHeight = document.body.clientHeight;
    const distance = isEditing ? (isSheetIntroDescription ? 380 : 198) : 135;
    const richTextHeight = isAppIntroDescription && !isEditing ? 0 : clientHeight - distance;
    const isError = remark.length > remarkMaxLength;

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
                  <Button size="small" onClick={() => changeEditState(true)}>
                    <Icon className="mRight2" icon="edit" />
                    <span className="Font13">{_l('编辑')}</span>
                  </Button>
                </Divider>
              )}
              {isEditAppDescription && (
                <Tooltip title={_l('当应用权限异常时，可尝试清除缓存的权限数据')} placement="bottom">
                  <div
                    className={cx('flexRow alignItemsCenter Gray_9e pointer clearCache', {
                      isLoading: this.state.clearCacheLoading,
                    })}
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

    const renderFooter = () => {
      return (
        <Fragment>
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
        </Fragment>
      );
    };

    return (
      <Wrap
        className={cx('mdEditor', className, { sheetEditor: isSheetIntroDescription })}
        richTextHeight={richTextHeight}
      >
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
          {!isSheetIntroDescription && renderFooter()}
        </div>
        {(isAppIntroDescription || isSheetIntroDescription) && (
          <div className="pLeft24 pRight24 pBottom10 createRemarkWrap">
            <div className="flexRow alignItemsCenter justifyContentBetween pBottom10">
              <div className="flexRow alignItemsCenter">
                <span className="bold">{_l('描述')}</span>
                <Tooltip
                  title={
                    isAppIntroDescription
                      ? _l(
                          '用于概括应用的主要用途和业务定位，便于 AI 正确理解并运用表中的信息。该描述不会直接展示给普通用户。',
                        )
                      : _l(
                          '用于定义工作表的用途和业务背景，便于 AI 正确理解并运用表中的信息。该描述不会直接展示给普通用户。',
                        )
                  }
                >
                  <Icon icon="info_outline" className="Gray_9e Font15 pointer mLeft5" />
                </Tooltip>
              </div>
              {!md.global.SysSettings.hideAIBasicFun && this.renderState()}
            </div>
            <div className={cx('w100', { error: isError })}>
              <Textarea
                minHeight={36}
                maxHeight={36 * 2}
                value={remark}
                disabled={aiCreateLoading}
                placeholder={
                  aiCreateLoading
                    ? _l('AI 生成中...')
                    : isAppIntroDescription
                      ? _l('例如: 跟进销售线索的客户管理系统')
                      : _l('例如：记录和管理订单信息的数据表')
                }
                onChange={value => {
                  this.setState({
                    remark: value,
                    sourceAi: false,
                  });
                }}
              />
              <div className="TxtRight">{isError ? `${remark.length} / ${remarkMaxLength}` : ''}</div>
            </div>
          </div>
        )}
        <div className="flexRow alignItemsCenter pLeft24 pRight24 pBottom10">
          <span className="bold">{_l('说明')}</span>
          <Tooltip
            title={
              isAppIntroDescription
                ? _l('用于向使用者介绍应用的功能、使用方法和注意事项。填写的内容会在用户首次打开应用时展示。')
                : _l('用于向使用者介绍应用项的功能、使用方法和注意事项')
            }
          >
            <Icon icon="info_outline" className="Gray_9e Font15 pointer mLeft5" />
          </Tooltip>
        </div>
        {isSheetIntroDescription && (
          <div className="sheetIntroInfo">
            <div className="mBottom10 flexRow alignItemsCenter">
              <div className="Font13 mRight20">{_l('显示方式')}</div>
              <RadioGroup
                size="middle"
                data={[
                  {
                    text: _l('图标'),
                    value: 0,
                  },
                  {
                    text: _l('文字'),
                    value: 1,
                  },
                ]}
                checkedValue={showType}
                onChange={value => {
                  this.setState({ showType: value });
                }}
              />
            </div>
            {!!showType && (
              <div className="mTop10 mBottom10 flexRow alignItemsCenter">
                <div className="flex mRight20">
                  <div className="flexRow alignItemsCenter mBottom10 Font13">
                    <span className="mRight3">{_l('摘要')}</span>
                    <span>（{_l('在标题下方显示文案')}）</span>
                  </div>
                  <div className="flex Relative">
                    <Input
                      className="w100"
                      value={this.state.resume}
                      onChange={value => {
                        this.setState({ resume: value.slice(0, 80).trim() });
                      }}
                    />
                    <span className="resumeLength Font13 Gray_9e">{`${this.state.resume.length}/80`}</span>
                  </div>
                </div>
                <div>
                  <div className="Font13 mBottom10">{_l('文字颜色')}</div>
                  <ColorPicker
                    value={this.state.resumeColor}
                    sysColor={true}
                    onChange={value => {
                      this.setState({ resumeColor: value });
                    }}
                  >
                    <div className="colorWrap flexRow alignItemsCenter pointer">
                      <span className="Font22 bold" style={{ color: this.state.resumeColor }}>
                        A
                      </span>
                      <Icon icon="arrow-down-border" />
                    </div>
                  </ColorPicker>
                </div>
              </div>
            )}
            <div className="flexRow alignItemsCenter Font13 mTop10 mBottom10">
              <span className="mRight3">{_l('详细说明')}</span>
              {showType === 1 && <span>（{_l('在摘要后显示详情按钮，点击查看。可不填')}）</span>}
            </div>
          </div>
        )}
        <div className="flexRow mdEditorContentWrap">
          {renderLeftContent && <div className="leftContent flex">{renderLeftContent()}</div>}
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
        {isSheetIntroDescription && (
          <div className="flexRow alignItemsCenter sheetIntroDescriptionFooter">{renderFooter()}</div>
        )}
      </Wrap>
    );
  }
}
