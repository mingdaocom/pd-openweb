import React from 'react';
import { ActionSheet, Button } from 'antd-mobile';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { getRecordUrl, getWorksheetShareUrl } from 'mobile/components/RecordInfo/RecordFooter';
import { deleteRecord } from 'worksheet/common/recordInfo/crtl';
import { permitList } from 'src/pages/FormSet/config';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { getTitleTextFromControls } from 'src/utils/control';

export const handleDeleteRecord = ({ worksheetId, recordId, onDeleteSuccess }) => {
  const deleteRow = async () => {
    try {
      await deleteRecord({ worksheetId, recordId });
      alert(_l('删除成功'));
      onDeleteSuccess();
    } catch (err) {
      console.log(err);
      alert(_l('删除失败'), 2);
    }
  };

  const actionDeleteHandler = ActionSheet.show({
    popupClassName: 'md-adm-actionSheet',
    actions: [],
    extra: (
      <div className="flexColumn w100">
        <div className="bold Gray Font17 pTop10">{_l('是否删除此条记录 ?')}</div>
        <div className="valignWrapper flexRow mTop24">
          <Button
            className="flex mRight6 bold Gray_75 flex ellipsis Font13"
            onClick={() => actionDeleteHandler.close()}
          >
            {_l('取消')}
          </Button>
          <Button
            className="flex mLeft6 bold ellipsis Font13"
            color="danger"
            onClick={() => {
              deleteRow();
              actionDeleteHandler.close();
            }}
          >
            {_l('确认')}
          </Button>
        </div>
      </div>
    ),
  });
};

export const handleShareRecord = ({ switchPermit, recordBase, controls, rowData }) => {
  const publicShare = isOpenPermit(permitList.recordShareSwitch, switchPermit, recordBase.viewId);
  const innerShare = isOpenPermit(permitList.embeddedLink, switchPermit, recordBase.viewId);

  const BUTTONS = [
    {
      key: 'innerShare',
      name: _l('内部成员访问'),
      info: _l('仅限内部成员登录系统后根据权限访问'),
      icon: 'share',
      iconClass: 'Font18 Gray_9e',
      fn: () => getRecordUrl(recordBase),
      className: 'mBottom10',
    },
    {
      key: 'publicShare',
      name: _l('对外公开分享'),
      info: _l('获得链接的所有人都可以查看'),
      icon: 'trash',
      iconClass: 'Font22 Red',
      fn: () => getWorksheetShareUrl(recordBase),
    },
  ].filter(v =>
    publicShare && innerShare
      ? true
      : publicShare
        ? v.key === 'publicShare'
        : innerShare
          ? v.key === 'innerShare'
          : false,
  );

  const recordTitle = getTitleTextFromControls(controls, rowData);

  const shareSheetHandler = ActionSheet.show({
    actions: BUTTONS.map(item => {
      return {
        key: item.icon,
        text: (
          <div className={cx('flexRow valignWrapper w100', item.className)} onClick={item.fn}>
            <div className="flex flexColumn" style={{ lineHeight: '22px' }}>
              <span className="Bold">{item.name}</span>
              <span className="Font12 Gray_75">{item.info}</span>
            </div>
            <Icon className="Font18 Gray_9e" icon="arrow-right-border" />
          </div>
        ),
      };
    }),
    extra: (
      <div className="flexRow header">
        <span className="Font13 overflow_ellipsis">{recordTitle || _l('分享')}</span>
        <div className="closeIcon flex-shrink-0" onClick={() => shareSheetHandler.close()}>
          <Icon icon="close" />
        </div>
      </div>
    ),
    onAction: () => {
      shareSheetHandler.close();
    },
  });
};
