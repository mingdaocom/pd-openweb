import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { getIconByType } from 'src/pages/widgetConfig/util';

const NewCheckbox = styled(Checkbox)`
  .icon {
    position: unset !important;
  }
`;

export default function CommonFieldDropdown(props) {
  const { controls, selectedFields, onChange, extendSourceId, weChatSetting } = props;
  const [fieldSearchKeyWords, setFieldSearchKeyWords] = useState('');

  const filterControls = controls.filter(
    item =>
      _.includes(item.controlName.toLocaleLowerCase(), fieldSearchKeyWords.toLocaleLowerCase()) &&
      !_.includes([21, 26, 27, 48, 52], item.type) &&
      !_.includes(
        [
          extendSourceId,
          _.get(weChatSetting, 'fieldMaps.openId'),
          _.get(weChatSetting, 'fieldMaps.nickName'),
          _.get(weChatSetting, 'fieldMaps.headImgUrl'),
        ],
        item.controlId,
      ),
  );
  const selectedCount = controls.filter(item => _.includes(selectedFields, item.controlId)).length;
  const data = [
    {
      text: (
        <SearchInput
          className="searchInput"
          placeholder={_l('搜索字段')}
          onChange={value => setFieldSearchKeyWords(value)}
        />
      ),
      className: 'customFieldSearch',
    },
  ].concat(
    filterControls.length > 0
      ? filterControls.map(item => {
          return {
            text: (
              <NewCheckbox
                size="small"
                checked={_.includes(selectedFields, item.controlId)}
                text={
                  <span>
                    <Icon icon={getIconByType(item.type, false)} className="mRight8" />
                    {item.controlName}
                  </span>
                }
              />
            ),
            value: item.controlId,
          };
        })
      : [
          {
            text: fieldSearchKeyWords ? _l('暂无搜索结果') : _l('暂无数据'),
            disabled: true,
          },
        ],
  );

  return (
    <Dropdown
      border
      selectClose={false}
      className="customFieldDropdown"
      placeholder={_l('选择字段')}
      renderTitle={() =>
        !selectedCount ? (
          <span className="Gray_bd">{_l('选择字段')}</span>
        ) : (
          <span>{_l('已选择%0个字段', selectedCount)}</span>
        )
      }
      data={data}
      value={selectedCount}
      onChange={onChange}
    />
  );
}
