import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import DialogRelationControl from 'src/components/relationControl/relationControl';
import { getRelationText } from 'src/pages/widgetConfig/util/index';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import List from './List';

const Relation = props => {
  const { from, disabled, value, enumDefault, formItemId, onChange } = props;
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleAdd = () => {
    if (md.global.Account.isPortal) {
      alert('您不是该组织成员，请联系管理员！', 3);
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

  const onDialogPick = item => {
    const list = _.cloneDeep(JSON.parse(value || '[]'));

    list.push(item);
    onChange(JSON.stringify(list));
    setDialogVisible(false);
  };

  // 私有部署没有申请单，兼容到全部
  const finalEnumDefault = md.global.Config.IsLocal && enumDefault === 5 ? 0 : enumDefault;

  const text = getRelationText(finalEnumDefault);

  return (
    <div className={cx({ controlDisabled: disabled })} style={{ height: 'auto' }}>
      {!disabled && (
        <button className="customFormRelationBtn pointer" onClick={handleAdd}>
          <Icon icon="plus" className="mRight5 Gray_9e Font16" />
          <span>{text}</span>
        </button>
      )}

      <List data={JSON.parse(value || '[]')} from={from} disabled={disabled} onDelete={itemOnDelete} />

      {dialogVisible && (
        <DialogRelationControl
          title={''}
          types={finalEnumDefault === 0 ? [] : [finalEnumDefault]}
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
