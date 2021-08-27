import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { DatePicker } from 'antd';
import 'dialogSelectUser';
import 'quickSelectUser';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';

const { RangePicker } = DatePicker;

const customDate = 8;

const dateScope = [{
  name: _l('今天'),
  value: 1,
  format: () => {
    return [moment().format('YYYY-MM-DD'), moment().add(1, 'days').format('YYYY-MM-DD')];
  }
}, {
  name: _l('昨天'),
  value: 2,
  format: () => {
    return [moment().add(-1, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
  }
}, {
  name: _l('前天'),
  value: 3,
  format: () => {
    return [moment().add(-2, 'days').format('YYYY-MM-DD'), moment().add(-1, 'days').format('YYYY-MM-DD')];
  }
}, {
  name: _l('本周'),
  value: 4,
  format: () => {
    return [moment().startOf('week').format('YYYY-MM-DD'), moment().endOf('week').add(1, 'days').format('YYYY-MM-DD')];
  }
}, {
  name: _l('上周'),
  value: 5,
  format: () => {
    return [moment().startOf('week').subtract('week', 1).format('YYYY-MM-DD'), moment().endOf('week').subtract('week', 1).add(1, 'days').format('YYYY-MM-DD')];
  }
}, {
  name: _l('本月'),
  value: 6,
  format: () => {
    return [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').endOf('month').add(1, 'days').format('YYYY-MM-DD')];
  }
}, {
  name: _l('上月'),
  value: 7,
  format: () => {
    return [moment().startOf('month').subtract('month', 1).format('YYYY-MM-DD'), moment().endOf('month').subtract('month', 1).endOf('month').add(1, 'days').format('YYYY-MM-DD')];
  }
}, {
  name: _l('自定义日期'),
  value: customDate
}];

export default class InboxFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userValue: null,
      timeLevel: null,
      time: null
    }
  }

  componentWillReceiveProps(nextProps) {
    if (_.isEmpty(nextProps.filter)) {
      this.setState({
        userValue: null,
        timeLevel: null,
        time: null
      });
    }
  }

  handleSave = () => {
    const { userValue, timeLevel, time } = this.state;
    const [ startTime, endTime ] = time || [null, null];
    this.props.onChange({
      user: userValue,
      startTime,
      endTime,
      timeName: timeLevel ? _.find(dateScope, { value: timeLevel }).name : null
    });
  }

  handlePickUser = (event) => {
    const that = this;
    const filterAccountIds = [md.global.Account.accountId];
    const projectId = '';
    const account = {
      accountId: md.global.Account.accountId,
      fullname: _l('我自己'),
      avatar: md.global.Account.avatar,
    };
    $(event.target).quickSelectUser({
      showQuickInvite: false,
      showMoreInvite: false,
      isTask: false,
      isRangeData: false,
      filterWorksheetId: '',
      filterWorksheetControlId: '',
      // prefixAccounts: !_.includes(filterAccountIds, md.global.Account.accountId) ? [account] : [],
      filterAccountIds,
      minHeight: 400,
      container: $('.InboxFilterWrapper'),
      offset: {
        top: 16,
        left: 0,
      },
      zIndex: 10001,
      SelectUserSettings: {
        unique: true,
        projectId: projectId,
        filterAccountIds,
        callback: that.handleChangeUser
      },
      selectCb: that.handleChangeUser,
    });
  }

  handleEmptyUser = () => {
    const { time } = this.state;
    if (time) {
      this.setState({
        userValue: null
      }, this.handleSave);
    } else {
      this.props.onChange(null);
    }
  }

  handleChangeUser = (data) => {
    this.setState({
      userValue: data[0],
    }, this.handleSave);
  }

  handleChangeTime = (time) => {
    const { timeLevel } = this.state;
    const { format } = _.find(dateScope, { value: timeLevel });
    const data = format ? format() : time;
    if (data) {
      this.setState({
        time: data,
      }, this.handleSave);
    }
  }

  render() {
    const { inboxType } = this.props;
    const { userValue, timeLevel } = this.state;
    return (
      <div className="InboxFilterWrapper">
        {
          !['workflow'].includes(inboxType) && (
            <div className="flexRow valignWrapper mBottom20 userItemWrapper">
              <div className="Gray_75 Font14 mRight15 userLabel">{_l('回复、提到我的人')}</div>
              {
                userValue ? (
                  <div className="userWrapper flexRow valignWrapper">
                    <img src={userValue.avatar} />
                    <div className="name flexRow valignWrapper">
                      <span className="Font13">{userValue.fullname}</span>
                      <Icon onClick={this.handleEmptyUser} className="Gray_9e Font13 pointer" icon="close" />
                    </div>
                  </div>
                ) : (
                  <Icon onClick={this.handlePickUser} className="flexRow valignWrapper pointer" icon="plus" />
                )
              }
            </div>
          )
        }
        <div className="flexRow">
          <div className="Gray_75 Font14 mRight15 timeLabel">{_l('时间')}</div>
          <div className="flexColumn flex">
            <div className="flexRow valignWrapper flex dateScope">
              {
                dateScope.map((item, index) => (
                  <div
                    key={index}
                    className={cx('item pointer', { active: item.value === timeLevel })}
                    onClick={() => {
                      if (item.value === timeLevel) {
                        this.setState({
                          timeLevel: null,
                          time: null,
                        }, () => {
                          this.state.userValue ? this.handleSave() : this.props.onChange(null);
                        });
                      } else {
                        this.setState({
                          timeLevel: item.value
                        }, this.handleChangeTime);
                      }
                    }}
                  >
                      {item.name}
                  </div>
                ))
              }
            </div>
            {
              timeLevel === customDate && (
                <RangePicker
                  allowClear={false}
                  suffixIcon={null}
                  locale={locale}
                  format="YYYY-MM-DD"
                  onChange={(data) => {
                    const [start, end] = data;
                    this.handleChangeTime([start.format('YYYY-MM-DD'), moment(end.format('YYYY-MM-DD')).add(1, 'days').format('YYYY-MM-DD')]);
                  }}
                />
              )
            }
          </div>
        </div>
      </div>
    );
  }
}
