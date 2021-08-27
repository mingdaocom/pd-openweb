import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { wait } from '../../../utils';
import './codeViewer.css';

class CodeViewer extends React.Component {
  static propTypes = {
    src: PropTypes.string,
    type: PropTypes.string, // code or markdown
    className: PropTypes.string,
    onError: PropTypes.func,
  };

  static defaultProps = { type: 'code' };

  state = {
    loading: true,
    content: '',
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.load(this.props.src, this.props.type);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.src !== this.props.src) {
      this.load(this.props.src, this.props.type);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  load = (src, type) => {
    if (!src || !type) {
      if (this.props.onError) {
        this.props.onError();
      }
      return;
    }
    this.setState({ loading: true }, () => {
      $.when(
        src.indexOf('/actionpage/') > -1 // 普通附件 downloadUrl, CORS 302 跳转后被拦截
          ? $.ajax({ url: src, dataType: 'json', headers: { 'Return-Download-Url-Instead-Of-Redirect': 'yes' } }).then(res =>
              $.ajax(res.downloadUrl, { dataType: 'text' }).then(content => content)
            )
          : $.ajax(src, { dataType: 'text' }).then(content => content),
        wait(600)
      )
        .then((content) => {
          switch (type) {
            case 'code':
              this.loadCode(content);
              break;
            case 'markdown':
              this.loadMarkdown(content);
              break;
            default:
              if (this.props.onError) {
                this.props.onError();
              }
          }
        })
        .fail(this.props.onError);
    });
  };

  loadCode = (content) => {
    require.ensure([], (require) => {
      require('highlight.js/styles/vs.css');
      if (!this._isMounted) {
        return;
      }
      const hljs = require('highlight.js');
      const result = hljs.highlightAuto(content).value;
      this._isMounted &&
        this.setState({
          loading: false,
          content: (
            <pre>
              <code dangerouslySetInnerHTML={{ __html: result }} />
            </pre>
          ),
        });
    });
  };

  loadMarkdown = (content) => {
    require.ensure([], (require) => {
      require('highlight.js/styles/vs.css');
      if (!this._isMounted) {
        return;
      }
      const xss = require('xss');
      const Remarkable = require('remarkable');
      const replaceEntities = require('remarkable/lib/common/utils').replaceEntities;
      const escapeHtml = require('remarkable/lib/common/utils').escapeHtml;
      const hljs = require('highlight.js');
      const md = new Remarkable({
        highlight(str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(lang, str).value;
            } catch (err) {}
          }
          try {
            return hljs.highlightAuto(str).value;
          } catch (err) {}
          return '';
        },
      });
      md.renderer.rules.link_open = function (tokens, idx /* , options, env */) {
        const title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
        return '<a target="_blank" href="' + escapeHtml(tokens[idx].href) + '"' + title + '>';
      };
      let result = md.render(content);
      result = xss(result, {
        whiteList: Object.assign({}, xss.whiteList, { span: ['class'], div: ['class'], code: ['class'], pre: ['class'] }),
      });
      this._isMounted &&
        this.setState({
          loading: false,
          content: <div className="markdown-body" dangerouslySetInnerHTML={{ __html: result }} />,
        });
    });
  };

  onWheel = (e) => {
    e.stopPropagation();
  };

  render() {
    return (
      <div className={cx('codeViewer', { loading: this.state.loading }, this.props.className)} onWheel={this.onWheel}>
        {this.state.loading ? <LoadDiv size="big" /> : this.state.content}
      </div>
    );
  }
}

module.exports = CodeViewer;
