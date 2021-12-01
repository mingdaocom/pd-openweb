import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, RichText } from 'ming-ui';
import './index.less';
import { ADVANCE_AUTHORITY } from '../../config';
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
    this.onChange(summary)
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

  /**
   * 缓存内容
   */
  onChange = html => {
    const { cacheKey, isEditing } = this.props;

    if (cacheKey && isEditing) {
      localStorage.setItem('mdEditor_' + cacheKey, html);
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
          <div className="mdEditorTipColor">{_l('检测到有上次未保存的内容，')}</div>
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

    this.editorInstance.setContent(cacheSummary, 'html');
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
    const { cacheKey } = this.props;
    const content = localStorage.getItem('mdEditor_' + cacheKey);
    this.props.onSave(content);
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
      permissionType,
      summary,
      title,
      changeSetting,
      toorIsBottom,
    } = this.props;

    if (!isEditing) {
      return (
        <div className={cx('mdEditor', { Alpha8: !auth }, className, { pBottom15: summary })} onClick={joinEditing}>
          <header className="appIntroHeader">
            <div className="caption">{title || _l('应用说明')}</div>
            {!isEditing && permissionType >= ADVANCE_AUTHORITY && (
              <div className="editAppIntro" onClick={() => this.props.changeEditState(true)}>
                <Icon icon="edit" />
                <span className="Font13 ">{_l('编辑')}</span>
              </div>
            )}
          </header>
          {summary ? (
            <RichText
              // placeholder={_l('为应用填写使用说明，当用户第一次访问应用时会打开此说明')}
              data={summary || ''}
              className={'mdEditorContent editorContent'}
              disabled={true}
              backGroundColor={'#fff'}
            />
          ) : null}
        </div>
      );
    }

    return (
      <div className={cx('mdEditor', className)}>
        {toorIsBottom && (
          <RichText
            // placeholder={_l('为应用填写使用说明，当用户第一次访问应用时会打开此说明')}
            data={summary || ''}
            className={'editorContent mdEditorContent'}
            showTool={true}
            onActualSave={this.onChange}
            changeSetting={changeSetting}
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
              onCancel();
            }}
          >
            {_l('取消')}
          </div>
          <div className="mdEditorSave ThemeBGColor3 ThemeHoverBGColor2" onClick={this.onSave}>
            {_l('保存')}
          </div>
        </div>
        {!toorIsBottom && (
          <RichText
            // placeholder={_l('为应用填写使用说明，当用户第一次访问应用时会打开此说明')}
            data={summary || ''}
            className={'editorContent mdEditorContent'}
            showTool={true}
            onActualSave={this.onChange}
            changeSetting={changeSetting}
          />
        )}
      </div>
    );
  }
}
