import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Dialog } from 'ming-ui';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import { ROW_ID_CONTROL } from '../../../../../config/widget';
import ApiSearchConfig from '../../../ApiSearchConfig';
import { CustomActionWrap } from '../../style';

export default function OperationFlow(props) {
  const { actionData = {}, data, handleOk, fromCustomFilter, allControls = [] } = props;
  const [{ advancedSetting, dataSource, filterItems, visible }, setState] = useSetState({
    advancedSetting: actionData.advancedSetting || {},
    filterItems: actionData.filterItems || [],
    dataSource: actionData.dataSource || '',
    visible: true,
  });
  const [requestControls, setControls] = useState([]);

  useEffect(() => {
    setState({
      advancedSetting: actionData.advancedSetting || {},
      filterItems: actionData.filterItems || [],
      dataSource: actionData.dataSource || '',
    });
  }, []);

  const canSave = () => {
    const requestMap = safeParse(advancedSetting.requestmap || '[]');
    const canSaveRequest = _.every(requestMap, item => {
      if (
        _.get(
          _.find(requestControls, r => r.controlId === item.id),
          'required',
        )
      ) {
        const defSource = safeParse(item.defsource);
        return _.some(defSource, d => _.get(d, 'cid') || _.get(d, 'staticValue'));
      }
      return true;
    });
    const canSaveFilter = checkConditionCanSave(filterItems);
    return fromCustomFilter ? dataSource && canSaveFilter && canSaveRequest : dataSource && canSaveRequest;
  };

  return (
    <Dialog
      width={560}
      visible={visible}
      okDisabled={!canSave()}
      className="SearchWorksheetDialog"
      title={_l('调封装业务流程')}
      overlayClosable={false}
      onCancel={() => setState({ visible: false })}
      onOk={() => {
        handleOk({
          ...actionData,
          advancedSetting: { ...advancedSetting, apiEventId: uuidv4() },
          dataSource,
          ...(fromCustomFilter ? { filterItems } : {}),
        });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap className="customApiDialog">
        <ApiSearchConfig
          {...props}
          fromCustom={true}
          allControls={allControls.concat(ROW_ID_CONTROL)}
          fromCustomEventApi={true}
          fromOperationFlow={true}
          setControls={setControls}
          data={{ ...data, type: 49, advancedSetting, dataSource, filterItems }}
          handleFilters={value => setState({ filterItems: value })}
          onChange={newData => {
            setState({
              advancedSetting: {
                ..._.pick(newData.advancedSetting, ['requestmap', 'responsemap', 'authaccount']),
              },
              dataSource: newData.dataSource,
            });
          }}
        />
      </CustomActionWrap>
    </Dialog>
  );
}
