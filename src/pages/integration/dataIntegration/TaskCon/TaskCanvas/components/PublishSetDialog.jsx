import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, VerifyPasswordInput } from 'ming-ui';
import { Checkbox, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/style.less';
import { getIconByType } from 'src/utils/domain/control/metadata';

const Wrap = styled.div`
  .verifyPasswordWrap {
    .verifyPasswordTitle {
      font-size: 14px !important;
    }
  }
`;

export default function PublishSetDialog(props) {
  const { onClose, onOk } = props;
  const [{ value, writeMode, isCleanDestTableData, password, fieldForIdentifyDuplicate, loading }, setState] =
    useSetState({
      value: props.fieldForIdentifyDuplicate
        ? _.get(
            props.controls.find(o => o.id === _.get(props, 'fieldForIdentifyDuplicate.id')),
            'id',
          )
        : undefined,
      writeMode: props.writeMode ? props.writeMode : undefined,
      isCleanDestTableData: !!props.isCleanDestTableData,
      password: '',
      fieldForIdentifyDuplicate: props.fieldForIdentifyDuplicate
        ? props.controls.find(o => o.id === _.get(props, 'fieldForIdentifyDuplicate.id'))
        : {},
      loading: false,
    });
  const controlOptions = props.controls.map(control => ({
    label: control.alias || control.name,
    icon: getIconByType(control.mdType, false),
    value: control.id,
  }));

  return (
    <Modal
      open
      title={<span className="bold">{_l('更新发布')}</span>}
      width={552}
      className="publishSetDialog"
      okText={loading ? _l('更新发布...') : _l('更新发布')}
      onOk={() => {
        isCleanDestTableData
          ? verifyPassword({
              password,
              customActionName: 'checkAccount',
              success: () => {
                onOk({
                  fieldForIdentifyDuplicate,
                  writeMode,
                  isCleanDestTableData,
                });
                onClose();
              },
            })
          : onOk({
              fieldForIdentifyDuplicate,
              writeMode,
              isCleanDestTableData,
            });
      }}
      onCancel={() => {
        onClose();
      }}
    >
      <Wrap>
        <p className="textSecondary">{_l('此操作会重新同步全量数据')}</p>
        <h5 className="Bold mTop32 Font14">{_l('识别重复数据')}</h5>
        <p className="mBottom12 textTertiary">{_l('未选择目标字段时, 会根据数据源的主键字段判断重复')}</p>
        <div className="">
          <div className="">{_l('在同步时，依据目标字段')}</div>
          <Select
            allowClear
            className="controlDrop mTop10"
            classNames={{ popup: { root: 'dropWorksheetIntegration' } }}
            options={controlOptions}
            labelRender={() => {
              const info = props.controls.find(o => o.id === value) || {};
              return (
                <React.Fragment>
                  <Icon className="textTertiary" icon={getIconByType(info.mdType, false)} /> {info.alias || info.name}
                </React.Fragment>
              );
            }}
            optionRender={({ data }) => (
              <span>
                <Icon className="textTertiary mRight10" icon={data.icon} />
                {data.label}
              </span>
            )}
            value={value}
            onChange={value => {
              setState({ value, fieldForIdentifyDuplicate: props.controls.find(o => o.id === value) || {} });
            }}
          />
          <div className="mTop10">{_l('识别重复，并')}</div>
          <div className="flexRow alignItemsCenter mTop10">
            <Select
              className="controlDrop"
              options={[
                { label: _l('跳过'), value: 'SKIP' },
                { label: _l('覆盖'), value: 'OVERWRITE' },
              ]}
              value={writeMode}
              onChange={writeMode => {
                setState({ writeMode });
              }}
            />
            <Tooltip title={_l('“覆盖”会导致数据同步变慢')}>
              <Icon icon="info_outline" className="textDisabled mLeft5 Font18" />
            </Tooltip>
          </div>
        </div>
        <h5 className="Bold mTop25 Font14">{_l('其他配置')}</h5>
        <div className="">
          <Checkbox
            checked={isCleanDestTableData}
            onChange={() => {
              setState({
                isCleanDestTableData: !isCleanDestTableData,
              });
            }}
            size="small"
          >
            {_l('在本次同步数据之前，彻底清空目标表数据')}
          </Checkbox>
        </div>
        {isCleanDestTableData && (
          <VerifyPasswordInput
            className="mTop15 verifyPasswordWrap"
            showSubTitle={true}
            autoFocus={false}
            isRequired={false}
            allowNoVerify={false}
            onChange={({ password }) => {
              setState({ password });
            }}
          />
        )}
      </Wrap>
    </Modal>
  );
}
