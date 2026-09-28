import React, { Fragment } from 'react';
import _ from 'lodash';
import { Checkbox, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { updateConfig } from 'src/utils/domain/control/editorSetting';
import SubListStatisticsConfig from '../components/SubListStatisticsConfig';

export default function RelateSearchConfig(props) {
  const { data, onChange } = props;
  const { controlId, relationControls = [], strDefault } = data;
  const [isHiddenOtherViewRecord] = (strDefault || '000').split('');
  const { controls = [] } = window.subListSheetConfig[controlId] || {};
  const statisticsControls = controls.length ? controls : relationControls;
  const { showtype } = getAdvanceSetting(data);
  const isList = _.includes(['2', '5', '6'], showtype);

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          className="allowSelectRecords"
          checked={!!+isHiddenOtherViewRecord}
          onChange={event => {
            onChange({
              strDefault: updateConfig({
                config: strDefault,
                value: +event.target.checked,
                index: 0,
              }),
            });
          }}
          size="small"
        >
          <span style={{ marginRight: '6px' }}>{_l('按用户权限过滤')}</span>
          <Tooltip
            placement="bottom"
            title={
              <span>
                {_l('未勾选时，用户可查看所有查询结果。勾选后，按照用户对数据的权限查看，隐藏无权限的数据或字段')}
              </span>
            }
          >
            <i className="icon icon-help textTertiary Font16 mLeft5 pointer" />
          </Tooltip>
        </Checkbox>
      </div>
      {isList && <SubListStatisticsConfig {...props} controls={statisticsControls} />}
    </Fragment>
  );
}
