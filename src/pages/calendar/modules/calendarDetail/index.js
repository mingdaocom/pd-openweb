import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import { LoadDiv } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import ErrorState from 'src/components/errorPage/errorState';
import { htmlDecodeReg } from 'src/utils/core/string';
import { Config, getCalendarDetail } from './common';
import CalendarDetail from './root';

export class CalendarDetailContainer extends Component {
  state = {
    isLoading: true,
    noAuth: false,
    data: null,
  };

  componentDidMount() {
    this.syncConfig();
    this.fetchData(true);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.calendarId !== prevProps.calendarId ||
      this.props.recurTime !== prevProps.recurTime ||
      this.props.isDetailPage !== prevProps.isDetailPage
    ) {
      this.syncConfig();
      this.fetchData(true);
    }
  }

  syncConfig = () => {
    const { isDetailPage, onChange, onClose, onExit } = this.props;
    Config.isDetailPage = !!isDetailPage;
    Config.dialogCenter = () => {};

    Config.saveCallback = () => onChange?.();
    Config.exitCallback = () => {
      onChange?.();
      (onExit || onClose)?.();
    };

    Config.deleteCallback = Config.exitCallback;
    Config.cancelCallback = Config.closeDialog = () => onClose?.();
  };

  fetchData = isShowLoading => {
    const { calendarId, recurTime } = this.props;

    if (isShowLoading) {
      this.setState({ isLoading: true, noAuth: false });
    }

    return getCalendarDetail(calendarId, recurTime)
      .then(({ data }) => {
        data.calendar.title = htmlDecodeReg(data.calendar.title);
        this.setState({ isLoading: false, data });
      })
      .catch(() => {
        this.setState({ isLoading: false, noAuth: true });
      });
  };

  renderContent() {
    const { isLoading, data, noAuth } = this.state;

    if (isLoading) return <LoadDiv className="pTop30 pBottom30" />;
    if (noAuth) {
      return <ErrorState text={_l('您的权限不足或此日程已被删除，无法查看')} className="h100 pTop30 pBottom30" />;
    }

    return <CalendarDetail data={data} reFetchData={this.fetchData} />;
  }

  render() {
    const { data } = this.state;
    const { isDetailPage, onClose } = this.props;
    const title = data ? data.calendar.title : _l('日程详情');

    if (isDetailPage) {
      return <DocumentTitle title={title}>{this.renderContent()}</DocumentTitle>;
    }

    return (
      <Modal
        open
        rootClassName="calendarEdit"
        width={800}
        footer={null}
        closable={false}
        mask={{ closable: true }}
        keyboard
        styles={{ header: { padding: 0 }, body: { padding: 0 }, container: { padding: 0 } }}
        type="fixed"
        onCancel={onClose}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}

export default function openCalendarDetail(options = {}) {
  const container = document.createElement('div');
  const root = createRoot(container);
  let isClosed = false;

  const close = () => {
    if (isClosed) return;
    isClosed = true;
    options.handleClose?.();
    setTimeout(() => root.unmount(), 0);
  };

  root.render(
    <CalendarDetailContainer
      calendarId={options.calendarId}
      recurTime={options.recurTime}
      onChange={options.saveCallback}
      onClose={close}
    />,
  );

  return close;
}
