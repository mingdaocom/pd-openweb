import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import { Checkbox, Modal, Radio } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import homeApp from 'src/api/homeApp';

const SelectWorksheet = props => {
  const { appId, selectIds = [], onOk, onClose } = props;
  const [type, setType] = useState(selectIds.length ? 1 : 0);
  const [worksheetList, setWorksheetList] = useState([]);
  const [worksheetIds, setWorksheetIds] = useState(selectIds);
  const TYPES = [
    { type: 0, name: _l('应用所有工作表') },
    { type: 1, name: _l('指定工作表') },
  ];

  useEffect(() => {
    homeApp.getWorksheetsByAppId({ appId, type: 0 }).then(result => {
      setWorksheetList(result);
    });
  }, []);

  return (
    <Modal
      width={640}
      open
      title={_l('使用范围')}
      onOk={() => {
        onOk(
          type === 0 || !worksheetIds.length ? [] : worksheetList.filter(o => _.includes(worksheetIds, o.workSheetId)),
        );
        onClose();
      }}
      onCancel={onClose}
    >
      {TYPES.map(o => {
        return (
          <Fragment key={o.type}>
            <div className={cx({ mTop15: o.type !== 0 })}>
              <Radio className="bold" checked={type === o.type} onChange={() => setType(o.type)} title={o.name}>
                {o.name}
              </Radio>
            </div>

            {o.type === 1 && type === 1 && (
              <ScrollView style={{ maxHeight: 400 }}>
                {!worksheetList.length ? (
                  <LoadDiv className="mTop15" />
                ) : (
                  worksheetList.map(o => (
                    <div className="mTop15 mLeft30" key={o.workSheetId}>
                      <Checkbox
                        checked={_.includes(worksheetIds, o.workSheetId)}
                        onChange={event =>
                          setWorksheetIds(
                            !event.target.checked
                              ? worksheetIds.filter(id => id !== o.workSheetId)
                              : [...worksheetIds, o.workSheetId],
                          )
                        }
                      >
                        {o.workSheetName}
                      </Checkbox>
                    </div>
                  ))
                )}
              </ScrollView>
            )}
          </Fragment>
        );
      })}
    </Modal>
  );
};

export function useSelectWorksheetDialog() {
  return useFunctionWrapComponent(SelectWorksheet);
}
