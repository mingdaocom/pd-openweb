import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog, Icon } from 'ming-ui';
import { CustomActionWrap } from '../../style';
import cx from 'classnames';
import { enumWidgetType } from '../../../../../util';
import { DEFAULT_CONFIG } from '../../../../../config/widget';
import DynamicDefaultValue from '../../../DynamicDefaultValue';
import { HAS_DYNAMIC_TYPE } from '../../config';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../../util/setting';
import AddFields from '../AddFields';
import SelectSheetFromApp from '../../../SelectSheetFromApp';
import worksheetAjax from 'src/api/worksheet';

const getDefaultInfo = (globalSheetInfo = {}) => {
  return {
    appId: globalSheetInfo.appId,
    sheetId: globalSheetInfo.worksheetId,
    sheetName: globalSheetInfo.name,
    appName: globalSheetInfo.appName,
  };
};

export default function CreateRecord(props) {
  const { actionData = {}, handleOk, allControls = [], globalSheetInfo = {} } = props;
  const defaultData = getDefaultInfo(globalSheetInfo);
  const [{ advancedSetting, actionItems, controls, visible }, setState] = useSetState({
    actionItems: actionData.actionItems || [],
    advancedSetting: actionData.advancedSetting || defaultData,
    controls: [],
    visible: true,
  });

  useEffect(() => {
    setState({
      actionItems: actionData.actionItems || [],
      advancedSetting: actionData.advancedSetting || defaultData,
      controls: [],
    });
  }, []);

  useEffect(() => {
    if (!advancedSetting.sheetId) return;
    worksheetAjax.getWorksheetInfo({ worksheetId: advancedSetting.sheetId, getTemplate: true }).then(res => {
      setState({
        controls: _.get(res, 'template.controls') || [],
        advancedSetting: { ...advancedSetting, appName: res.appName, sheetName: res.name },
      });
    });
  }, [advancedSetting.sheetId]);

  const getDetail = controlId => {
    const currentControl = _.find(controls, s => s.controlId === controlId) || {};
    const enumType = enumWidgetType[currentControl.type];
    const { icon } = DEFAULT_CONFIG[enumType] || {};
    return { icon, currentControl };
  };

  const isEmpty = _.isEmpty(actionItems);
  const selectControls = (controls || []).filter(i => _.includes(HAS_DYNAMIC_TYPE, i.type));

  return (
    <Dialog
      width={560}
      visible={visible}
      okDisabled={isEmpty || !advancedSetting.sheetId}
      title={_l('创建新记录')}
      onCancel={() => setState({ visible: false })}
      className="SearchWorksheetDialog"
      overlayClosable={false}
      onOk={() => {
        handleOk({ ...actionData, actionItems, advancedSetting });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        <SelectSheetFromApp
          globalSheetInfo={globalSheetInfo}
          {...advancedSetting}
          fromCustomEvent={true}
          onChange={value => setState({ advancedSetting: { ...advancedSetting, ...value }, actionItems: [] })}
        />
        {!isEmpty && <div className="splitLine"></div>}
        {!isEmpty && !_.isEmpty(controls) && (
          <div className="setValueContent">
            <div className="setItem">
              <div className="itemFiledTitle Gray_70">{_l('字段')}</div>
              <div className="itemValueTitle Gray_70">{_l('默认值')}</div>
            </div>
            {actionItems.map((item, index) => {
              const { icon, currentControl } = getDetail(item.controlId);
              return (
                <div className="setItem">
                  <div className="itemFiled itemFiledTitle ">
                    {icon && <Icon className="mRight8 Font14 Gray_75" icon={icon} />}
                    <span className={cx('flex overflow_ellipsis', { Red: _.isEmpty(currentControl) })}>
                      {_.get(currentControl, 'controlName') || _l('已删除')}
                    </span>
                  </div>
                  <div className="itemValue itemValueTitle">
                    <DynamicDefaultValue
                      {...props}
                      data={handleAdvancedSettingChange(currentControl, {
                        [item.type === '1' ? 'defaultfunc' : 'defsource']: item.value,
                        defaulttype: item.type,
                      })}
                      hideTitle={true}
                      hideSearchAndFun={true}
                      propFiledVisible={true}
                      onChange={newData => {
                        const { defsource, defaulttype, defaultfunc } = getAdvanceSetting(newData);
                        const tempValue = {
                          ...item,
                          type: defaulttype,
                          value: defaulttype === '1' ? defaultfunc : defsource,
                        };
                        setState({
                          actionItems: actionItems.map((i, idx) => (idx === index ? tempValue : i)),
                        });
                      }}
                    />
                  </div>
                  <Icon
                    icon="delete1"
                    className="Font16 deleteBtn"
                    onClick={() => {
                      setState({ actionItems: actionItems.filter((i, idx) => idx !== index) });
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
        <AddFields
          className={isEmpty ? 'mTop20' : ''}
          handleClick={value => setState({ actionItems: actionItems.concat(value) })}
          selectControls={selectControls}
          text={_l('字段默认值')}
        />
      </CustomActionWrap>
    </Dialog>
  );
}
