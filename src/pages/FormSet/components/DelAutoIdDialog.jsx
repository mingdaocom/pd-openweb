import React, { useEffect, useRef, useState } from 'react';
import { LoadDiv } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import processAjax from 'src/pages/workflow/api/process';

export default function DelDialog(props) {
  const { show, onClose, worksheetId, companyId, delCallback } = props;
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasCheck, setHasCheck] = useState(false);
  const [list, setList] = useState([]);
  const checkingRef = useRef(false);
  const deletingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const checkAutoID = () => {
    if (checkingRef.current) return;

    checkingRef.current = true;
    setLoading(true);
    return processAjax
      .getProcessByControlId({
        controlId: 'autoid',
        appId: worksheetId,
        companyId,
      })
      .then(res => {
        if (!mountedRef.current) return;

        setList(res);
        setHasCheck(true);
      })
      .finally(() => {
        checkingRef.current = false;
        if (mountedRef.current) setLoading(false);
      });
  };

  const delAutoID = () => {
    if (deletingRef.current) return;

    deletingRef.current = true;
    setDeleting(true);
    return worksheetAjax
      .deleteWorksheetAutoID({ worksheetId })
      .then((res = {}) => {
        if (res.data) {
          alert(_l('删除成功'));
          delCallback();
        } else {
          alert(_l('删除失败，请稍后再试！'), 2);
        }
      })
      .finally(() => {
        deletingRef.current = false;
        if (mountedRef.current) setDeleting(false);
      })
      .then(() => onClose());
  };

  return (
    <Modal
      title={_l('删除系统编号字段')}
      className="delDialog"
      onCancel={onClose}
      open={show}
      cancelText={_l('检查')}
      cancelButtonProps={{ className: 'check', disabled: deleting, onClick: checkAutoID }}
      okText={_l('删除')}
      okButtonProps={{ className: 'onSur', danger: true }}
      confirmLoading={deleting}
      onOk={delAutoID}
    >
      <div>
        <p className="">
          {loading && <LoadDiv size="small" className="InlineBlock mRight10" />}
          {!hasCheck
            ? !loading
              ? _l('如果你不确定是否已在工作流中使用，可以通过程序检查')
              : _l('检查中，请耐心等待……')
            : loading
              ? _l('检查中，请耐心等待……')
              : list.length <= 0
                ? _l('检查完毕！你未使用过此字段，可放心删除')
                : _l('检查完毕！你在以下%0个流程中使用了此字段。请谨慎删除', list.length)}
        </p>
        {!loading &&
          hasCheck &&
          list.map(o => {
            return (
              <div className="mBottom6" key={o.id || o.processId || o.name}>
                <span className="colorPrimary">{o.name}</span>
                {(o.flowNodes || []).length > 0 && (
                  <span className="">{` (  ${(o.flowNodes || []).map(item => item.name).join(',')} ) `}</span>
                )}
              </div>
            );
          })}
      </div>
    </Modal>
  );
}
