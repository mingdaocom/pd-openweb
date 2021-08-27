import './css/dialog.css';
import React from 'react';
import { default as ReactDOM, render, unstable_renderSubtreeIntoContainer } from 'react-dom';
import cx from 'classnames';
import LoadDiv from 'ming-ui/components/LoadDiv';

class DialogLayer extends React.Component {
  static defaultProps = {
    show: true,
  };

  defaultSettings = {
    dialogBoxID: 'mdDialogBoxId-' + new Date().getTime(), // 标示ID
    showClose: true,
    width: 480,
    height: 'auto',
    className: null,
    oneScreen: false,
    oneScreenMaxHeight: 1000,
    oneScreenGap: 240,
    container: {
      header: null, // 头部文字
      content: null, // 内容
      minorContent: '',
      ckText: null, // ckBox 文字
      noText: _l('取消'), // 取消按钮的文?
      yesText: _l('确认'), // 确认按钮的文?
      yesFn: null, // 成功回调
      noFn: null, // 取消回调
    }, // string / object   弹处层内容的id或内容模?
    overlay: true, // boolean 是否添加遮罩?
    selected: false,
    status: 'enable', // 按钮状?      disable enable
    lock: false, // boolean          是否允许ESC键来关闭弹出?
    isSameClose: true, // boolean      是否同时全部关闭
    readyFn: null, // 加载完成后出?
    callback: null, // function       关闭弹出层后执行的回调函?
    overlayClosable: false,
  };

  constructor(props) {
    super(props);
    this.updateState(props);
    this.text = '';
  }

  updateState(props) {
    var options = $.extend(true, this.defaultSettings, props);
    var maxH = $(window).height() - options.oneScreenGap;
    maxH = maxH > 1000 ? 1000 : maxH;

    options.style = {
      width: options.width,
      height: options.height,
    };
    options.contentStyle = {
      maxHeight: options.oneScreen ? maxH : 'auto',
    };
    options.maskId = options.dialogBoxID + '_mask';
    options.containerId = options.dialogBoxID + '_container';

    this.state = options;
  }

  componentWillMount() {}

  componentWillUnmount() {}

  componentDidMount() {
    const _this = this;
    const settings = this.state;
    const $dialog = $('#' + settings.dialogBoxID);

    // 插入box
    this.renderDialog(this.props, this.state);
    // 允许ESC 关闭
    if (!settings.lock) {
      $(document).on('keyup.' + settings.dialogBoxID, function(event) {
        if (event.keyCode === 27) {
          if (!$('input:focus, textarea:focus').length) {
            // 取消回调
            if ($.isFunction(settings.container.noFn)) {
              settings.container.noFn.call(settings, event);
            }
            _this.closeDialog();
          } else if ($('input:focus, textarea:focus').length && _this.text === $(event.target).val()) {
            $(event.target).blur();
          }
        }

        // 记录按下之后的值
        _this.text = $(event.target).val();
      });
    }

    this.dialogCenter();
  }

  componentWillReceiveProps(nextProps) {
    this.updateState(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextProps.show && !nextState.show) {
      return false;
    }
    this.renderDialog(nextProps, nextState);
    return false;
  }

  renderDialog(props, state) {
    var dialogBoxHtml = '';
    if (!document.getElementById(state.dialogBoxID + '_container')) {
      if (state.overlay) {
        dialogBoxHtml += '<div id="' + state.dialogBoxID + '_mask" class="maskTaskBox opacity7"></div>';
      } else {
        $('#' + state.dialogBoxID + '_mask').remove();
      }

      dialogBoxHtml += '<div id="' + state.dialogBoxID + '_container" class="mdDialog dialogScroll ' + (state.className || '') + '"></div>';
      $('body').append(dialogBoxHtml);

      if (state.overlayClosable) {
        $('#' + state.dialogBoxID + '_container').on('click', evt => {
          if ($(evt.target).is($('#' + state.dialogBoxID + '_container'))) {
            this.closeDialog();
          }
        });
      }
    }

    unstable_renderSubtreeIntoContainer(
      this,
      <div id={state.dialogBoxID} className={cx('boderRadAll_3 dialogBox', { Hidden: !props.show })} style={state.style}>
        <div className={cx(state.container.header ? 'header' : 'noHeader')}>
          <span
            title="关闭窗口"
            className={cx('dialogCloseBtn icon-delete ThemeColor3', { Hidden: !state.showClose })}
            onClick={evt => this.closeDialogClick(evt)}
          />
          {state.container.header ? <span className="title Font17 overflow_ellipsis" dangerouslySetInnerHTML={{ __html: state.container.header || '' }} /> : ''}
        </div>
        <div className={cx('dialogContent', { oneScreenDialog: state.oneScreen })} style={state.contentStyle}>
          {state.container.content || props.children || state.container.ckText ? (
            <div>
              {props.children || <div dangerouslySetInnerHTML={{ __html: state.container.content || '' }} />}
              {state.container.ckText ? (
                <div className="checkBox">
                  <span className={cx('btnCk', { selected: state.selected })} onClick={() => this.checkBoxSelected()}>
                    {state.container.ckText}
                  </span>
                </div>
              ) : (
                ''
              )}
            </div>
          ) : (
            <LoadDiv className="mBottom10" />
          )}
        </div>
        {state.container.yesText || state.container.noText ? (
          <div className="footer">
            {state.container.leftContent ? <div dangerouslySetInnerHTML={{ __html: state.container.leftContent }} /> : ''}

            {state.container.noText ? (
              <a
                className={cx('noText ThemeHoverColor3', { Hidden: !state.container.content && !state.container.ckText && !props.children })}
                onClick={evt => this.closeDialogClick(evt)}
                dangerouslySetInnerHTML={{ __html: state.container.noText }}
              />
            ) : (
              ''
            )}

            {state.container.yesText ? (
              <a
                className={cx(
                  'yesText boderRadAll_3 ThemeBGColor3',
                  { Hidden: !state.container.content && !state.container.ckText && !props.children },
                  { disable: state.status === 'disable' }
                )}
                onClick={() => this.confirmClick()}
                dangerouslySetInnerHTML={{ __html: state.container.yesText }}
              />
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
        {state.container.minorContent ? <div className="minorContent pBottom10" dangerouslySetInnerHTML={{ __html: state.container.minorContent }} /> : ''}
      </div>,
      document.getElementById(this.state.dialogBoxID + '_container'),
      () => {
        this.dialogCenter();
        if (!this.state.isReadyFn && (this.state.container.content || this.props.children) && $.isFunction(this.state.readyFn)) {
          this.state.readyFn(this);
          this.setState({ isReadyFn: true });
        }
      }
    );
  }

  confirmClick() {
    var success;
    // 禁用
    if (this.state.status === 'disable') {
      return;
    }
    // 成功回调
    if ($.isFunction(this.state.container.yesFn)) {
      success = this.state.container.yesFn(this.state.container.ckText ? this.state.selected : '');
    }
    // 关闭?
    if (success !== false) {
      this.closeDialog();
    }
  }

  closeDialogClick(evt) {
    // 取消回调
    if ($.isFunction(this.state.container.noFn)) {
      this.state.container.noFn.call(this.state, evt);
    }
    // 关闭?
    this.closeDialog();
  }

  checkBoxSelected() {
    this.setState({ selected: !this.state.selected });
  }

  static getScrollBarWidth() {
    var scrollBarWidth;
    var scrollBarHelper = document.createElement('div');
    scrollBarHelper.style.cssText = 'overflow:scroll;width:100px;height:100px;';
    document.body.appendChild(scrollBarHelper);
    if (scrollBarHelper) {
      scrollBarWidth = {
        horizontal: scrollBarHelper.offsetHeight - scrollBarHelper.clientHeight,
        vertical: scrollBarHelper.offsetWidth - scrollBarHelper.clientWidth,
      };
    }
    document.body.removeChild(scrollBarHelper);
    return scrollBarWidth;
  }

  ckContent(ckText) {
    this.showContent(ckText, true);
  }

  dialogCenter() {
    var settings = this.state;
    var $dialog = $('#' + settings.dialogBoxID);
    var $w = $(window);
    var WIDTH = $w.width();
    var HEIGHT = $w.height();
    var dialogWidth = $dialog.width();
    var dialogHeight = $dialog.height();
    var gapTop = (HEIGHT - dialogHeight) / 2;
    var gapLeft = (WIDTH - dialogWidth) / 2;
    gapTop = gapTop <= 32 ? 32 : gapTop;
    $dialog.css({
      top: 0,
      left: 0,
      marginTop: gapTop,
      marginLeft: gapLeft,
    });
  }

  closeDialog() {
    // 每次关闭
    var settings = this.state;
    var $dialog = $('#' + settings.dialogBoxID);
    var $parent = $dialog.parent();

    // 回调
    if ($.isFunction(settings.callback)) {
      settings.callback();
    }

    // 是否同时关闭
    if (!settings.isSameClose) {
      var $dialogScroll = $('.dialogScroll');
      // 多个
      if ($dialogScroll.length > 1) {
        var $last = $dialogScroll.last();
        if (!$last.is($parent)) {
          return;
        }
      }
    }

    // 解绑事件
    $(document).off('keyup.' + settings.dialogBoxID);

    $dialog.animate(
      {
        top: '-=45',
      },
      150,
      function() {
        if (settings.scroll) {
          // 页面滚动?
          $('#container').css('padding-right', 0);
          $('#topBarContainer .rightMenuItem').css('right', 0);
          $('html').css('overflow-y', settings.htmlOverflow);
        }

        if ($('#' + settings.dialogBoxID + '_container')[0]) {
          ReactDOM.unmountComponentAtNode($('#' + settings.dialogBoxID + '_container')[0]);
        }
        $dialog
          .add($parent)
          .add($('#' + settings.dialogBoxID + '_mask'))
          .remove();
      }
    );
    $dialog.add($('#' + settings.dialogBoxID + '_mask')).fadeOut('fast');
  }

  content(contentHtml) {
    this.showContent(contentHtml, false);
  }
  // 显示内容
  showContent(contentHtml, isCk) {
    var container = this.state.container;

    $('#' + this.state.dialogBoxID)
      .find('.footer a')
      .removeClass('Hidden');

    if (isCk) {
      container.ckText = contentHtml;
    } else {
      container.content = contentHtml;
    }

    this.setState({ container });
  }

  disable(text) {
    var settings = this.state;

    settings.status = 'disable';
    if (text) {
      settings.container.yesText = text;
    }
    this.setState({ settings });
  }

  enable(text) {
    var settings = this.state;

    settings.status = 'enable';
    if (text) {
      settings.container.yesText = text;
    }
    this.setState({ settings });
  }

  render() {
    return <noscript />;
  }
}

export default DialogLayer;

export function index(opts) {
  return render(<DialogLayer {...opts} />, document.createElement('div'));
}

(function($) {
  $.DialogLayer = function(opts) {
    return render(<DialogLayer {...opts} />, document.createElement('div'));
  };
})(jQuery);
