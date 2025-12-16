import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Dialog, FunctionWrap, LoadDiv, Radio, ScrollView } from 'ming-ui';
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
    <Dialog
      width={640}
      visible
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
              <Radio className="bold" text={o.name} checked={type === o.type} onClick={() => setType(o.type)} />
            </div>

            {o.type === 1 && type === 1 && (
              <ScrollView>
                {!worksheetList.length ? (
                  <LoadDiv className="mTop15" />
                ) : (
                  worksheetList.map(o => (
                    <Checkbox
                      className="mTop15 mLeft30"
                      text={o.workSheetName}
                      checked={_.includes(worksheetIds, o.workSheetId)}
                      onClick={checked =>
                        setWorksheetIds(
                          checked ? worksheetIds.filter(id => id !== o.workSheetId) : [...worksheetIds, o.workSheetId],
                        )
                      }
                    />
                  ))
                )}
              </ScrollView>
            )}
          </Fragment>
        );
      })}
    </Dialog>
  );
};

export default props => FunctionWrap(SelectWorksheet, { ...props });
