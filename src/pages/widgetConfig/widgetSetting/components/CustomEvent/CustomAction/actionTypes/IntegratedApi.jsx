import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { Dialog } from 'ming-ui';
import { CustomActionWrap } from '../../style';
import ApiSearchConfig from '../../../ApiSearchConfig';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';

export default function IntegratedApi(props) {
  const { actionData = {}, data, handleOk, fromCustomFilter } = props;
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
      title={_l('调用已集成API')}
      onCancel={() => setState({ visible: false })}
      onOk={() => {
        handleOk({ ...actionData, advancedSetting, dataSource, ...(fromCustomFilter ? { filterItems } : {}) });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        <ApiSearchConfig
          {...props}
          fromCustom={true}
          setControls={setControls}
          data={{ ...data, type: 49, advancedSetting, dataSource, filterItems }}
          handleFilters={value => setState({ filterItems: value })}
          onChange={newData => {
            setState({
              advancedSetting: {
                ..._.pick(newData.advancedSetting, ['requestmap', 'responsemap']),
              },
              dataSource: newData.dataSource,
            });
          }}
        />
      </CustomActionWrap>
    </Dialog>
  );
}
