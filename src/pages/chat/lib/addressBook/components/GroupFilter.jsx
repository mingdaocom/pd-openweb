import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'ming-ui/components/Dropdown';
import MenuItem from 'ming-ui/components/MenuItem';
import Icon from 'ming-ui/components/Icon';

import { SEARCH_GROUP_TYPES, GROUP_STATUS } from '../constants';

function GroupFilter(props) {
  const { changeGroupFilter, changeGroupStatus, searchGroupType, groupStatus, isProject } = props;

  const dropDownData = isProject
    ? [
        {
          text: _l('我加入的群组'),
          value: SEARCH_GROUP_TYPES.JOINED,
        },
        {
          text: _l('我创建的群组'),
          value: SEARCH_GROUP_TYPES.CREATED,
        },
        {
          text: _l('所有群组'),
          value: SEARCH_GROUP_TYPES.ALL,
        },
      ]
    : [
        {
          text: _l('所有群组'),
          value: SEARCH_GROUP_TYPES.JOINED,
        },
        {
          text: _l('我创建的群组'),
          value: SEARCH_GROUP_TYPES.CREATED,
        },
      ];
  const item = <MenuItem onClick={changeGroupStatus}>{_l('显示已关闭的群组')}</MenuItem>;
  return (
    <div className="pLeft10 Gray_75">
      <Dropdown data={dropDownData} onChange={changeGroupFilter} value={searchGroupType} className="ThemeHoverColor3">
        <div className="ming Dividor" />
        {React.cloneElement(
          item,
          groupStatus === GROUP_STATUS.ALL ? { icon: <Icon icon="hr_ok" />, iconAtEnd: true, className: 'ThemeColor3' } : { className: 'Gray_9' }
        )}
      </Dropdown>
    </div>
  );
}

GroupFilter.propTypes = {
  changeGroupFilter: PropTypes.func.isRequired,
  changeGroupStatus: PropTypes.func.isRequired,
  searchGroupType: PropTypes.number,
  groupStatus: PropTypes.number,
};

export default GroupFilter;
