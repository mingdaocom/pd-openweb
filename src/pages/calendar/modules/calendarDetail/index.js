import { createRoot } from 'react-dom/client';
import React, { Component } from 'react';
import CalendarDetail from './root';
import { getParamsFromUrl, getCalendarDetail } from './common';
import ErrorState from 'src/components/errorPage/errorState';
import DocumentTitle from 'react-document-title';
import { htmlDecodeReg, getAppFeaturesPath } from 'src/util';
import { Dialog, LoadDiv } from 'ming-ui';

export let Config = {};

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      noAuth: false,
      data: null,
    };
  }
  dialogRef = React.createRef();

  componentWillMount() {
    this.fetchData(true);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.calendarId !== this.props.calendarId || nextProps.recurTime !== this.props.recurTime) {
      this.fetchData(true, nextProps);
    }
  }

  componentDidMount() {
    const { exitCallback, saveCallback, deleteCallback } = Config;
    const dialog = $('.calendarEdit')[0];

    if (dialog) {
      // dialogCenter func
      Config.dialogCenter = () => {};

      Config.exitCallback = function () {
        $('.calendarEdit').parent().remove();
        exitCallback();
      };

      Config.deleteCallback = function () {
        $('.calendarEdit').parent().remove();
        deleteCallback();
      };

      Config.saveCallback = function () {
        if ($.isFunction(saveCallback)) saveCallback();
      };

      Config.cancelCallback = Config.closeDialog = function () {
        $('.calendarEdit').parent().remove();
      };
    }
  }

  fetchData(isShowLoading, props) {
    const { calendarId, recurTime } = props || this.props;
    if (isShowLoading) {
      this.setState({
        isLoading: true,
        noAuth: false,
      });
    }
    getCalendarDetail(calendarId, recurTime)
      .then(({ data }) => {
        data.calendar.title = htmlDecodeReg(data.calendar.title);
        this.setState({
          isLoading: false,
          data,
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          noAuth: true,
        });
      });
  }

  renderContent() {
    const { isLoading, data, noAuth } = this.state;

    // 加载中
    if (isLoading) {
      return <LoadDiv className="pTop30 pBottom30" />;
    }

    // 无权限
    if (noAuth) {
      return <ErrorState text={_l('您的权限不足或此日程已被删除，无法查看')} className="h100 pTop30 pBottom30" />;
    }

    return <CalendarDetail data={data} reFetchData={this.fetchData.bind(this)} />;
  }

  render() {
    const { data } = this.state;
    let title = _l('日程详情');
    if (data) {
      title = data.calendar.title;
    }
    if (Config.isDetailPage) {
      return <DocumentTitle title={title}>{this.renderContent()}</DocumentTitle>;
    } else {
      return (
        <Dialog
          visible
          dialogClasses="calendarEdit"
          width={800}
          showFooter={false}
          closable={false}
          overlayClosable={true}
          handleClose={() => {
            this.props.handleClose && this.props.handleClose();
            $('.calendarEdit').parent().remove();
          }}
          ref={this.dialogRef}
          type="fixed"
          onCancel={() => {
            this.props.handleClose && this.props.handleClose();
            $('.calendarEdit').parent().remove();
          }}
        >
          {this.renderContent()}
        </Dialog>
      );
    }
  }
}

export default function (options) {
  const defaults = {
    container: '',
    isDetailPage: false,

    calendarId: '',
    recurTime: '',

    exitCallback: null,
    deleteCallback: null,
    saveCallback: null,
  };

  Config = Object.assign(Config, defaults, options);

  if (Config.isDetailPage && Config.container) {
    Config = Object.assign({}, Config, getParamsFromUrl());
    Config.exitCallback = Config.deleteCallback = function () {
      window.location.href = '/apps/calendar/home' + '?' + getAppFeaturesPath();
    };
  } else {
    const { saveCallback } = Config;
    Config.exitCallback = function () {
      // 日程首页的一些操作
      if (location.href.indexOf('/apps/calendar/home') !== -1) {
        $('.showActiveTitleMessage').remove();
        $('#calendar').fullCalendar('refetchEvents');
        if (window.localStorage.getItem === 'list' && $.isFunction(saveCallback)) {
          saveCallback();
        }
      } else if ($.isFunction(saveCallback)) {
        saveCallback();
      }
    };

    Config.deleteCallback = function () {
      // 日程首页的一些操作
      if (location.href.indexOf('/apps/calendar/home') !== -1) {
        $('.showActiveTitleMessage').remove();
        $('#calendar').fullCalendar('refetchEvents');
        if (window.localStorage.getItem === 'list' && $.isFunction(saveCallback)) {
          saveCallback();
        }
      } else if ($.isFunction(saveCallback)) {
        saveCallback();
      }
    };
  }

  const { isDetailPage, container, calendarId, recurTime, handleClose } = Config;
  const root = createRoot(isDetailPage ? container : document.createElement('div'));

  root.render(<Container calendarId={calendarId} recurTime={recurTime} handleClose={handleClose} />);
}
