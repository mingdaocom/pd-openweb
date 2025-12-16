import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dialog, Dropdown, Icon, VerifyPasswordInput } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import verifyPassword from 'src/components/verifyPassword';
import 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/style.less';
import { getIconByType } from 'src/pages/widgetConfig/util';

const Wrap = styled.div`
  .ming.Dropdown,
  .dropdownTrigger {
    min-width: 300px;
    max-width: 100%;
  }
  .ming.Item .Item-content .itemText {
    padding-left: 10px;
  }
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

  return (
    <Dialog
      visible
      title={<span className="bold">{_l('更新发布')}</span>}
      width={552}
      className="publishSetDialog"
      showCancel={true}
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
        <p className="Gray_75">{_l('此操作会重新同步全量数据')}</p>
        <h5 className="Bold mTop32 Font14">{_l('识别重复数据')}</h5>
        <p className="mBottom12 Gray_9e">{_l('未选择目标字段时, 会根据数据源的主键字段判断重复')}</p>
        <div className="">
          <div className="">{_l('在同步时，依据目标字段')}</div>
          <Dropdown
            isAppendToBody
            cancelAble
            className="controlDrop mTop10"
            menuStyle={{ width: '100%' }}
            data={props.controls.map(o => {
              return { text: o.alias || o.name, icon: getIconByType(o.mdType, false), value: o.id };
            })}
            renderTitle={() => {
              const info = props.controls.find(o => o.id === value) || {};
              return (
                <React.Fragment>
                  <Icon className="Gray_9e" icon={getIconByType(info.mdType, false)} /> {info.alias || info.name}
                </React.Fragment>
              );
            }}
            renderItem={o => {
              return <span className="mLeft10">{o.text}</span>;
            }}
            menuClass={'dropWorksheetIntegration'}
            value={value}
            border
            onChange={value => {
              setState({ value, fieldForIdentifyDuplicate: props.controls.find(o => o.id === value) || {} });
            }}
          />
          <div className="mTop10">{_l('识别重复，并')}</div>
          <div className="flexRow alignItemsCenter mTop10">
            <Dropdown
              className="controlDrop"
              menuStyle={{ width: '100%' }}
              data={[
                { text: _l('跳过'), value: 'SKIP' },
                { text: _l('覆盖'), value: 'OVERWRITE' },
              ]}
              value={writeMode}
              border
              onChange={writeMode => {
                setState({ writeMode });
              }}
            />
            <Tooltip title={_l('“覆盖”会导致数据同步变慢')}>
              <Icon icon="info_outline" className="Gray_bd mLeft5 Font18" />
            </Tooltip>
          </div>
        </div>
        <h5 className="Bold mTop25 Font14">{_l('其他配置')}</h5>
        <div className="">
          <Checkbox
            size="small"
            checked={isCleanDestTableData}
            onClick={() => {
              setState({
                isCleanDestTableData: !isCleanDestTableData,
              });
            }}
            text={_l('在本次同步数据之前，彻底清空目标表数据')}
          />
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
    </Dialog>
  );
}
