import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Select } from 'ming-ui/antd-components';
import Icon from 'ming-ui/components/Icon';
import { GROUP_STATUS, SEARCH_GROUP_TYPES } from '../constants';

function GroupFilter(props) {
  const { changeGroupFilter, changeGroupStatus, searchGroupType, groupStatus, isProject } = props;

  const dropDownData = isProject
    ? [
        {
          label: _l('我加入的群组'),
          value: SEARCH_GROUP_TYPES.JOINED,
        },
        {
          label: _l('我创建的群组'),
          value: SEARCH_GROUP_TYPES.CREATED,
        },
        {
          label: _l('所有群组'),
          value: SEARCH_GROUP_TYPES.ALL,
        },
      ]
    : [
        {
          label: _l('所有群组'),
          value: SEARCH_GROUP_TYPES.JOINED,
        },
        {
          label: _l('我创建的群组'),
          value: SEARCH_GROUP_TYPES.CREATED,
        },
      ];
  return (
    <div className="pLeft10 textSecondary">
      <Select
        variant="borderless"
        options={dropDownData}
        onChange={changeGroupFilter}
        value={searchGroupType}
        className="hoverColorPrimary"
        popupRender={menu => (
          <React.Fragment>
            {menu}
            <Divider className="mTop5 mBottom5" />
            <div
              className={`flexRow alignItemsCenter justifyContentBetween pLeft12 pRight12 pTop5 pBottom5 pointer ${
                groupStatus === GROUP_STATUS.ALL ? 'colorPrimary' : 'textTertiary'
              }`}
              onClick={changeGroupStatus}
            >
              {_l('显示已关闭的群组')}
              {groupStatus === GROUP_STATUS.ALL && <Icon icon="hr_ok" />}
            </div>
          </React.Fragment>
        )}
      />
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
