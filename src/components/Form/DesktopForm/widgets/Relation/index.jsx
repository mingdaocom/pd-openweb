import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import DialogRelationControl from 'src/components/relationControl/relationControl';
import { getRelationText } from 'src/utils/domain/control/metadata';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import List from './List';

export const mergeRelationItems = (list, items) =>
  _.uniqBy(list.concat(items), item => `${item.type}-${item.sid}-${item.sidext || ''}`);

const Relation = props => {
  const { from, disabled, value, enumDefault, formItemId, onChange } = props;
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleAdd = () => {
    if (md.global.Account.isPortal) {
      alert(_l('您不是该组织成员，请联系管理员！'), 3);
      return;
    }

    setDialogVisible(true);
  };

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;

      switch (triggerType) {
        case 'Enter':
          handleAdd();
          break;
        case 'trigger_tab_leave':
          setDialogVisible(false);
          break;
        default:
          break;
      }
    }, []),
  );

  /**
   * 删除指定项目
   */
  const itemOnDelete = (item, i) => {
    if (!item) {
      return;
    }

    const list = _.cloneDeep(JSON.parse(value || '[]'));

    list.splice(i, 1);
    onChange(JSON.stringify(list));
  };

  const onDialogPick = items => {
    const list = _.cloneDeep(JSON.parse(value || '[]'));
    const pickedItems = Array.isArray(items) ? items : [items];
    onChange(JSON.stringify(mergeRelationItems(list, pickedItems)));
    setDialogVisible(false);
  };

  // 私有部署没有申请单，兼容到全部
  const finalEnumDefault =
    (window.platformENV.isOverseas || window.platformENV.isLocal) && enumDefault === 5 ? 0 : enumDefault;

  const text = getRelationText(finalEnumDefault);

  return (
    <div className={cx({ controlDisabled: disabled })} style={{ height: 'auto' }}>
      {!disabled && (
        <Button
          className="relationControlAddButton"
          color="default"
          variant="textBordered"
          icon={<Icon icon="plus" className="Font16" />}
          onClick={handleAdd}
        >
          <span>{text}</span>
        </Button>
      )}

      <List data={JSON.parse(value || '[]')} from={from} disabled={disabled} onDelete={itemOnDelete} />

      {dialogVisible && (
        <DialogRelationControl
          title={''}
          types={finalEnumDefault === 0 ? [] : [finalEnumDefault]}
          multiple
          onCancel={() => setDialogVisible(false)}
          onSubmit={onDialogPick}
        />
      )}
    </div>
  );
};

Relation.propTypes = {
  from: PropTypes.number,
  disabled: PropTypes.bool,
  value: PropTypes.any,
  enumDefault: PropTypes.number,
  onChange: PropTypes.func,
};

export default Relation;
