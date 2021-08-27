import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';

const newWhiteList = Object.assign({}, whiteList, { span: ['style'] });

export default class Content extends Component {
  static propTypes = {
    auth: PropTypes.bool, // 权限
    className: PropTypes.string, // 类名
    summary: PropTypes.string, // 内容
    placeholder: PropTypes.string, // 无内容的时候引导文案
    joinEditing: PropTypes.func, // 进入编辑
  };

  static defaultProps = {
    auth: true,
    className: '',
    summary: '',
    placeholder: '',
    joinEditing: () => {},
  };

  componentDidMount() {
    // a 链接点击
    $(this.editor).on('click', '.mdEditorContent a', function(e) {
      e.stopPropagation();
      e.preventDefault();

      const a = document.createElement('a');
      a.href = $(this).attr('href');
      a.target = '_blank';
      a.rel = 'nofollow noopener noreferrer';
      a.click();
    });

    $(this.editor).on('click', '.BraftEditor-container a.braft-link', e => {
      e.stopPropagation();
      e.preventDefault();
    });
  }

  render() {
    const { auth, className, placeholder, joinEditing } = this.props;
    const summary = this.props.summary
      .replace(/<input type="image" src="[^"]*\/images\/ico_unchecked.gif" class="ico_checkbox">/gi, '☐')
      .replace(/<input type="image" src="[^"]*\/images\/ico_checked.gif" class="ico_checkbox">/gi, '☑')
      .replace(/background-color:#ffffff/g, 'background-color:transparent');

    return (
      <div
        ref={editor => {
          this.editor = editor;
        }}
        className={cx('mdEditor', className, { 'pTop15 pBottom15': summary })}
        onClick={joinEditing}
      >
        {summary ? (
          <div
            className="mdEditorContent"
            dangerouslySetInnerHTML={{
              __html: filterXSS(summary, {
                stripIgnoreTag: true,
                whiteList: newWhiteList,
              }),
            }}
          />
        ) : (
          <div className={cx('editorNull', { 'ThemeColor3 pointer': auth })}>{placeholder}</div>
        )}
      </div>
    );
  }
}
