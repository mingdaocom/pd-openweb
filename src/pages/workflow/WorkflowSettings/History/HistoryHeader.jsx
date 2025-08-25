import React, { Component, Fragment } from 'react';
import { DatePicker } from 'antd';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { array, bool, func, string } from 'prop-types';
import { Icon } from 'ming-ui';
import instanceVersionAjax from '../../api/instanceVersion';
import Dropdown from '../../components/Dropdown';
import Search from '../../components/Search';
import SerialProcessDialog from './components/SerialProcessDialog';
import { FLOW_STATUS } from './config';

export default class HistoryHeader extends Component {
  static propTypes = {
    isPlugin: bool,
    processId: string,
    isSerial: bool,
    onFilter: func,
    onRefresh: func,
    batchIds: array,
  };
  static defaultProps = {
    isPlugin: false,
    processId: '',
    isSerial: false,
    onFilter: () => {},
    onRefresh: () => {},
    batchIds: [],
    archivedItem: {},
  };

  state = {
    status: 'all',
    time: ['', ''],
    searchVal: '',
    isRefresh: false,
    showDialog: false,
  };

  formatData = data => {
    const { isPlugin } = this.props;

    return Object.keys(data)
      .filter(key => !isPlugin || (isPlugin && key !== '6'))
      .map(key => ({ ...data[key], value: key }));
  };

  formatTime = time => time.map(item => item && moment(item).format('YYYY/MM/DD HH:mm'));

  handlePara = () => {
    const { status, time, searchVal } = this.state;
    const [startDate, endDate] = this.formatTime(time);
    const para = {};
    status && status !== 'all' && Object.assign(para, { status });
    searchVal && Object.assign(para, { title: searchVal });
    startDate && Object.assign(para, { startDate });
    endDate && Object.assign(para, { endDate });
    return para;
  };

  onFilterParaChanged = () => {
    this.props.onFilter(this.handlePara());
  };

  handleFilter = obj => {
    this.setState(obj, this.onFilterParaChanged);
  };

  render() {
    const { onRefresh, isSerial, processId, batchIds, archivedItem } = this.props;
    const { status, isRefresh, showDialog } = this.state;
    const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
    const stopIdsCount = batchIds.filter(o => o.status === 1 && o.instanceType !== -1).length;
    const refreshIdsCount = batchIds.filter(
      o => _.includes([3, 4], o.status) && !_.includes([6666, 7777], o.cause) && o.instanceType !== -1,
    ).length;
    const data = this.formatData(FLOW_STATUS);
    data.unshift({ value: 'all', text: _l('所有状态') });

    return (
      <div className="historyHeader">
        {batchIds.length ? (
          <Fragment>
            <div
              className={cx('historyHeaderBtn mRight15 stop', { disabled: !stopIdsCount })}
              onClick={() => {
                if (stopIdsCount) {
                  instanceVersionAjax
                    .endInstanceList({
                      sources: batchIds.filter(o => o.status === 1).map(({ id }) => id),
                    })
                    .then(() => {
                      onRefresh();
                    });
                }
              }}
            >
              <i className="icon-workflow_suspend Font16 mRight5" />
              {stopIdsCount ? _l('中止 (%0)', stopIdsCount) : _l('中止')}
            </div>
            <div
              className={cx('historyHeaderBtn mRight15 refresh', { disabled: !refreshIdsCount })}
              onClick={() => {
                if (refreshIdsCount) {
                  instanceVersionAjax
                    .resetInstanceList({
                      sources: batchIds
                        .filter(
                          o =>
                            _.includes([3, 4], o.status) && !_.includes([6666, 7777], o.cause) && o.instanceType !== -1,
                        )
                        .map(({ id }) => id),
                    })
                    .then(() => {
                      onRefresh();
                    });
                }
              }}
            >
              <i className="icon-refresh1 Font16 mRight5" />
              {refreshIdsCount ? _l('重试 (%0)', refreshIdsCount) : _l('重试')}
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <div className="filterName">
              <Search handleChange={searchVal => this.handleFilter({ searchVal })} />
            </div>
            <div className="statusDropdown">
              <Dropdown
                className="historyHeaderStatusDropdown"
                onChange={status => this.handleFilter({ status })}
                selectedValue={status}
                data={data}
                placeholder={_l('所有状态')}
              />
            </div>
            <DatePicker.RangePicker
              locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
              showTime
              disabledDate={currentDate => {
                if (_.isEmpty(archivedItem)) return currentDate > moment();

                return currentDate < moment(archivedItem.start) || currentDate > moment(archivedItem.end).add(1, 'd');
              }}
              showToday={false}
              onChange={time => this.handleFilter({ time: time || ['', ''] })}
            />

            {isSerial && (
              <div className="clearFilter ThemeColor3" onClick={() => this.setState({ showDialog: true })}>
                {_l('查看串行等待中的流程')}
              </div>
            )}
          </Fragment>
        )}

        <div className="flex" />

        <span
          data-tip={isRefresh ? _l('刷新中...') : _l('刷新')}
          id="historyRefresh"
          onClick={() => {
            if (isRefresh) return;

            this.setState({ isRefresh: true });
            onRefresh(() => {
              this.setState({ isRefresh: false });
            });
          }}
        >
          <Icon
            className={cx(
              'Font18 pointer ThemeHoverColor3 Block',
              isRefresh ? 'historyRefresh ThemeColor3' : 'Gray_75',
            )}
            icon="ic_refresh_black"
          />
        </span>

        {showDialog && (
          <SerialProcessDialog processId={processId} onClose={() => this.setState({ showDialog: false })} />
        )}
      </div>
    );
  }
}
