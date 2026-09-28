import React, { useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Checkbox, Input, Modal, Select } from 'ming-ui/antd-components';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import { WORKFLOW_SYSTEM_CONTROL } from 'src/utils/domain/control/widget';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { getShowViews } from 'src/utils/services/worksheet/view';

const Item = styled.div`
  margin-bottom: 20px;
  .queryConfigControlsDropdown {
    width: 260px;
  }
`;

const Title = styled.div`
  font-weight: 500;
  .required {
    color: var(--color-error);
    margin-top: -10px;
  }
`;

const Desp = styled.div`
  margin: 10px 0 15px;
  color: var(--color-text-tertiary);
`;

const AVAILABLE_TYPES = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT,
  WIDGETS_TO_API_TYPE_ENUM.NUMBER,
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE,
  WIDGETS_TO_API_TYPE_ENUM.EMAIL,
  WIDGETS_TO_API_TYPE_ENUM.CRED,
];

export default function QueryConfigDialog(props) {
  const [tempQueryInfo, setTempQueryInfo] = useState({});
  const { queryInfo = {}, onClose, onSuccess } = props;
  const { title, queryControlIds = [], viewId, worksheet, exported } = { ...queryInfo, ...tempQueryInfo };
  const queryControlOptions = worksheet.template.controls
    .filter(
      control =>
        !WORKFLOW_SYSTEM_CONTROL.some(item => item.controlId === control.controlId) &&
        _.includes(AVAILABLE_TYPES, control.type),
    )
    .map(control => ({ label: control.controlName, value: control.controlId }));
  const deletedControlOptions = queryControlIds
    .filter(id => !queryControlOptions.some(option => option.value === id))
    .map(value => ({ label: <span className="Red">{_l('字段已删除')}</span>, value }));
  return (
    <Modal
      title={_l('设置查询链接')}
      style={{ width: '560px' }}
      mask={{ closable: false }}
      open
      keyboard
      okDisabled={_.isEmpty(queryControlIds) || !viewId}
      onOk={() => {
        const params = {
          worksheetId: worksheet.worksheetId,
          ...{ ..._.pick(queryInfo, ['viewId', 'queryControlIds', 'title', 'exported']), ...tempQueryInfo },
        };

        if (!params.title) {
          params.title = _l('查询%0', queryInfo.worksheetName || _.get(queryInfo, 'worksheet.name'));
        }

        publicWorksheetAjax.editPublicQuery(params).then(() => {
          alert(_l('设置成功'));
          onSuccess({ ...queryInfo, ...params });
          onClose();
        });
      }}
      onCancel={onClose}
    >
      <Item>
        <Title>
          {_l('查询视图')} <span className="required">*</span>
        </Title>
        <Desp>{_l('对所选视图下数据进行查询')}</Desp>
        <Select
          value={viewId}
          options={getShowViews(worksheet.views || []).map(view => ({
            label: view.name,
            value: view.viewId,
          }))}
          placeholder={_l('请选择视图')}
          onChange={value => setTempQueryInfo({ ...tempQueryInfo, viewId: value })}
        />
      </Item>
      <Item>
        <Title>
          {_l('查询条件')} <span className="required">*</span>
        </Title>
        <Desp>
          {_l(
            '选择作为查询条件的字段。如设置多个条件，则所有条件都为必填。只支持文本类型字段进行查询，如：学号、身份证号、手机号、订单编号',
          )}
        </Desp>
        <Select
          mode="multiple"
          className="queryConfigControlsDropdown w100"
          options={[...deletedControlOptions, ...queryControlOptions]}
          value={queryControlIds}
          placeholder={_l('请选择查询条件字段')}
          listHeight={280}
          showPopupSearch
          optionFilterProp="label"
          onChange={values => {
            setTempQueryInfo({
              ...tempQueryInfo,
              queryControlIds: values,
            });
          }}
        />
      </Item>
      <Item>
        <Title>{_l('页面标题')}</Title>
        <Desp>{_l('如：查询成绩单')}</Desp>
        <Input
          className="w100"
          value={title}
          onChange={event => setTempQueryInfo({ ...tempQueryInfo, title: event.target.value })}
        />
      </Item>
      <Item>
        <Title>{_l('设置')}</Title>
        <Desp></Desp>
        <Checkbox
          checked={exported}
          onChange={() =>
            setTempQueryInfo({
              ...tempQueryInfo,
              exported: !exported,
            })
          }
        >
          {_l('允许导出数据')}
        </Checkbox>
      </Item>
    </Modal>
  );
}

QueryConfigDialog.propTypes = {
  queryInfo: PropTypes.shape({}),
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};
