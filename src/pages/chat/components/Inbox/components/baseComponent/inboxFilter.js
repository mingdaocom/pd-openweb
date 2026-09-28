import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { Icon } from 'ming-ui';
import { DateRangePicker } from 'ming-ui/antd-components';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import AppFilter from './appFilter';

const customDate = 8;

const dateScope = [
  {
    name: _l('今天'),
    value: 1,
    format: () => {
      return [moment().format('YYYY-MM-DD'), moment().add(1, 'days').format('YYYY-MM-DD')];
    },
  },
  {
    name: _l('昨天'),
    value: 2,
    format: () => {
      return [moment().add(-1, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
    },
  },
  {
    name: _l('前天'),
    value: 3,
    format: () => {
      return [moment().add(-2, 'days').format('YYYY-MM-DD'), moment().add(-1, 'days').format('YYYY-MM-DD')];
    },
  },
  {
    name: _l('本周'),
    value: 4,
    format: () => {
      return [
        moment().startOf('week').format('YYYY-MM-DD'),
        moment().endOf('week').add(1, 'days').format('YYYY-MM-DD'),
      ];
    },
  },
  {
    name: _l('上周'),
    value: 5,
    format: () => {
      return [
        moment().startOf('week').subtract('week', 1).format('YYYY-MM-DD'),
        moment().endOf('week').subtract('week', 1).add(1, 'days').format('YYYY-MM-DD'),
      ];
    },
  },
  {
    name: _l('本月'),
    value: 6,
    format: () => {
      return [
        moment().startOf('month').format('YYYY-MM-DD'),
        moment().endOf('month').endOf('month').add(1, 'days').format('YYYY-MM-DD'),
      ];
    },
  },
  {
    name: _l('上月'),
    value: 7,
    format: () => {
      return [
        moment().startOf('month').subtract('month', 1).format('YYYY-MM-DD'),
        moment().endOf('month').subtract('month', 1).endOf('month').add(1, 'days').format('YYYY-MM-DD'),
      ];
    },
  },
  {
    name: _l('自定义日期'),
    value: customDate,
  },
];

export default class InboxFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userValue: null,
      timeLevel: null,
      time: null,
      appId: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (_.isEmpty(this.props.filter)) {
        this.setState({
          userValue: null,
          timeLevel: null,
          time: null,
          appId: null,
        });
      }
    }
  }

  handleSave = () => {
    const { userValue, timeLevel, time, appId } = this.state;
    const [startTime, endTime] = time || [null, null];
    this.props.onChange({
      user: userValue,
      startTime,
      endTime,
      timeName: timeLevel ? _.find(dateScope, { value: timeLevel }).name : null,
      appId,
    });
  };

  handleEmptyUser = () => {
    const { time, appId } = this.state;

    if (time || appId) {
      this.setState(
        {
          userValue: null,
        },
        this.handleSave,
      );
    } else {
      this.props.onChange(null);
    }
  };

  handleChangeUser = data => {
    this.setState(
      {
        userValue: data[0],
      },
      this.handleSave,
    );
  };

  handleChangeTime = time => {
    const { timeLevel } = this.state;
    const { format } = _.find(dateScope, { value: timeLevel });
    const data = format ? format() : time;

    if (data) {
      this.setState(
        {
          time: data,
        },
        this.handleSave,
      );
    }
  };

  render() {
    const { inboxType } = this.props;
    const { userValue, timeLevel } = this.state;
    return (
      <div className="InboxFilterWrapper">
        <div className="flexRow valignWrapper mBottom20 userItemWrapper">
          <div className="textSecondary Font14 mRight15 userLabel">{_l('回复、提到我的人')}</div>
          {userValue ? (
            <div className="userWrapper flexRow valignWrapper">
              <img src={userValue.avatar} />
              <div className="name flexRow valignWrapper">
                <span className="Font13">{userValue.fullname}</span>
                <Icon onClick={this.handleEmptyUser} className="textTertiary Font13 pointer" icon="close" />
              </div>
            </div>
          ) : (
            <UserSelectPopover
              showMoreInvite={false}
              isTask={false}
              selectRangeOptions={false}
              filterAccountIds={[md.global.Account.accountId]}
              minHeight={400}
              SelectUserSettings={{
                unique: true,
                projectId: '',
                filterAccountIds: [md.global.Account.accountId],
                callback: this.handleChangeUser,
              }}
              onSelect={this.handleChangeUser}
            >
              <Icon className="flexRow valignWrapper pointer" icon="plus" />
            </UserSelectPopover>
          )}
        </div>
        <div className="flexRow">
          <div className="textSecondary Font14 mRight15 timeLabel">{_l('时间')}</div>
          <div className="flexColumn flex">
            <div className="flexRow valignWrapper flex dateScope">
              {dateScope.map((item, index) => (
                <div
                  key={index}
                  className={cx('item pointer', { active: item.value === timeLevel })}
                  onClick={() => {
                    if (item.value === timeLevel) {
                      this.setState(
                        {
                          timeLevel: null,
                          time: null,
                        },
                        () => {
                          this.state.userValue || this.state.appId ? this.handleSave() : this.props.onChange(null);
                        },
                      );
                    } else {
                      this.setState(
                        {
                          timeLevel: item.value,
                        },
                        this.handleChangeTime,
                      );
                    }
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
            {timeLevel === customDate && (
              <DateRangePicker
                allowClear
                format="YYYY-MM-DD"
                onChange={data => {
                  if (!data) {
                    this.setState(
                      {
                        timeLevel: null,
                        time: null,
                      },
                      () => {
                        this.state.userValue || this.state.appId ? this.handleSave() : this.props.onChange(null);
                      },
                    );
                    return;
                  }

                  const [start, end] = data;
                  this.handleChangeTime([start.format('YYYY-MM-DD'), moment(end).add(1, 'days').format('YYYY-MM-DD')]);
                }}
              />
            )}
          </div>
        </div>
        {['workflow', 'worksheet'].includes(inboxType) && (
          <div className="flexRow mBottom10">
            <div className="textSecondary Font14 mRight15 timeLabel">{_l('应用')}</div>
            <div className="flexColumn flex">
              <AppFilter
                apkId={this.state.appId}
                onChange={appId => {
                  this.setState(
                    {
                      appId,
                    },
                    () => {
                      appId || this.state.userValue || this.state.time ? this.handleSave() : this.props.onChange(null);
                    },
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
