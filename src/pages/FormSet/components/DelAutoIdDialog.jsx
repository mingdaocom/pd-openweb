import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Button, Dialog, LoadDiv } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import processAjax from 'src/pages/workflow/api/process';

const Wrap = styled.div``;
export default function DelDialog(props) {
  const { show, onClose, worksheetId, companyId, delCallback } = props;
  const [loading, setLoading] = useState(false);
  const [hasCheck, setHasCheck] = useState(false);
  const [list, setList] = useState([]);
  const checkAutoID = () => {
    if (loading) {
      true;
    }
    setLoading(true);
    processAjax
      .getProcessByControlId({
        controlId: 'autoid',
        appId: worksheetId,
        companyId,
      })
      .then(res => {
        setList(res);
        setLoading(false);
        setHasCheck(true);
      });
  };
  const delAutoID = () => {
    worksheetAjax.deleteWorksheetAutoID({ worksheetId }).then((res = {}) => {
      if (res.data) {
        alert(_l('删除成功'));
        delCallback();
      } else {
        alert(_l('删除失败，请稍后再试！'), 2);
      }
      onClose();
    });
  };
  return (
    <Dialog
      title={_l('删除系统编号字段')}
      className={cx('delDialog')}
      onCancel={onClose}
      visible={show}
      footer={
        <div>
          <Button
            className="check"
            type="ghostgray"
            onClick={() => {
              checkAutoID();
            }}
          >
            {_l('检查')}
          </Button>
          <Button
            className="onSur"
            type="danger"
            onClick={() => {
              delAutoID();
            }}
          >
            {_l('删除')}
          </Button>
        </div>
      }
    >
      <Wrap>
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
              <div className="mBottom6">
                <span className="ThemeColor3">{o.name}</span>
                {(o.flowNodes || []).length > 0 && (
                  <span className="">{` (  ${(o.flowNodes || []).map(item => item.name).join(',')} ) `}</span>
                )}
              </div>
            );
          })}
      </Wrap>
    </Dialog>
  );
}
