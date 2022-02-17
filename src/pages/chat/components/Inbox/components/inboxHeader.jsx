import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import antd from 'antd';
import { TYPES, TYPE_GROUP } from '../constants';
import InboxFilter from './baseComponent/inboxFilter';
import { Dropdown, Icon } from 'ming-ui';
import cx from 'classnames';

export default class InboxHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    type: PropTypes.oneOf(_.values(TYPES)),
    inboxFavorite: PropTypes.bool,
    changeType: PropTypes.func,
    changeFaviorite: PropTypes.func,
  };

  renderOverlay() {
    const { filter, inboxType } = this.props;
    return (
      <InboxFilter
        inboxType={inboxType}
        filter={filter}
        onChange={this.props.changeInboxFilter}
      />
    );
  }

  renderDropDown() {
    const { type, dropdownData, inboxType, changeType } = this.props;
    const parsedData = _.map(dropdownData, (key) => {
      const dict = TYPE_GROUP[inboxType];
      return {
        text: dict[key],
        value: key,
      };
    });

    if (parsedData.length <= 1) {
      return (
        <span>{parsedData[0].text}</span>
      );
    } else {
      return (
        <Dropdown
          value={type}
          data={parsedData}
          onChange={(data) => {
            this.handleClick(false);
            changeType(data);
          }}
        />
      );
    }
  }

  handleClick = (flag) => {
    const { inboxFavorite, changeFaviorite } = this.props;
    if (inboxFavorite !== flag) {
      changeFaviorite(flag);
    }
  }

  render() {
    const { inboxFavorite, title, filter, inboxType } = this.props;
    const { user, timeName } = filter || {};
    const clsNameFunc = (flag) => cx('inboxItem Hand', {
      'ThemeColor3 ThemeBorderColor3': flag,
      'ThemeHoverBorderColor3 ThemeHoverColor3': !flag,
    });
    const fullname = user ? user.fullname : '';
    return (
      <div className='inboxHeader'>
        <div className='inboxType Absolute'>{title}</div>
        <span
          className={clsNameFunc(!inboxFavorite)}
          onClick={() => { this.handleClick(false) }}>
          {this.renderDropDown()}
        </span>
        <span
          className={clsNameFunc(inboxFavorite)}
          onClick={() => { this.handleClick(true) }}>{_l('星标')}</span>
        <antd.Dropdown overlay={this.renderOverlay()} trigger={['click']} placement="bottomRight" overlayClassName="inboxFilterDropdown">
          <div className={cx('filterWrapper flexRow valignWrapper', { transparent: _.isEmpty(filter) })}>
            {
              filter ? (
                <Fragment>
                  <Icon className="Font20" icon="filter" />
                  <span>
                    {fullname}
                    {fullname && timeName ? ', ' : ''}
                    {timeName}
                  </span>
                  <Icon
                    icon="close"
                    className="Font15 mBottom2"
                    onClick={(event) => {
                      event.stopPropagation();
                      this.props.changeInboxFilter(null);
                    }}
                    />
                </Fragment>
              ) : (
                <Icon className="Font20 Gray_9e pointer" icon="filter" />
              )
            }
          </div>
        </antd.Dropdown>
      </div>
    );
  }
}
