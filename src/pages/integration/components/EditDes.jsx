import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, RichText } from 'ming-ui';

const Wrap = styled.div`
  .ck .ck-content {
    background: #fff !important;
  }
  // .ck-editor__main {
  //   max-height: ${props => `${props.richTextHeight}px`};
  // }
  .editAppIntro {
    opacity: 0;
    &:hover {
      .Icon {
        color: #1677ff;
      }
    }
  }
  &:hover {
    .editAppIntro {
      opacity: 1;
    }
  }
`;

export default class EditDes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      summary: props.summary,
      isEditing: false,
    };
  }

  componentDidMount() {
    this.setState({
      summary: this.props.summary,
    });
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
  }

  componentWillUnmount() {
    $('body').off('.editor');
  }

  /**
   * onSave
   */
  onSave = () => {
    const { summary = '' } = this.state;
    this.setState({
      isEditing: false,
    });
    this.props.onSave(summary);
  };

  render() {
    const { canEditing, className, summary, title, maxHeight, minHeight } = this.props;
    const { isEditing } = this.state;
    const clientHeight = document.body.clientHeight;
    const distance = isEditing ? 198 : 135;
    const richTextHeight = clientHeight - distance;

    if (!isEditing) {
      return (
        <Wrap className={cx('mdEditor', className, { pBottom15: summary })} richTextHeight={richTextHeight}>
          <header className="appIntroHeader">
            <div className="caption">{title || _l('说明')}</div>
            {!isEditing && canEditing && (
              <div
                className="editAppIntro"
                onClick={() => {
                  this.setState({
                    isEditing: true,
                  });
                }}
              >
                <Icon icon="edit" className="Font18 Hand" />
              </div>
            )}
          </header>
          <RichText
            data={summary || ''}
            className={'editorContent'}
            disabled={true}
            backGroundColor={'#fff'}
            minHeight={minHeight}
            maxHeight={maxHeight}
          />
        </Wrap>
      );
    }

    return (
      <Wrap className={cx('mdEditor', className)} richTextHeight={richTextHeight}>
        <div className="flexRow mdEditorHeader">
          <div className="caption">{title || _l('应用说明')}</div>
          <div className="flex" />
          <div
            className="mdEditorCancel ThemeColor3"
            onClick={() => {
              this.setState({
                isEditing: false,
              });
            }}
          >
            {_l('取消')}
          </div>
          <div className="mdEditorSave ThemeBGColor3 ThemeHoverBGColor2" onClick={this.onSave}>
            {_l('保存')}
          </div>
        </div>

        <RichText
          data={summary || ''}
          className={'editorContent'}
          onActualSave={value => {
            this.setState({
              summary: value,
            });
          }}
          showTool
          // changeSetting={changeSetting}
          minHeight={minHeight || 320}
          maxHeight={maxHeight}
        />
      </Wrap>
    );
  }
}
