import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Dialog } from 'ming-ui';
import AddOrEditSource from '../AddOrEditSource';
import dataSourceApi from '../../../../api/datasource';
import { DETAIL_TYPE } from '../../../constant';

const Wrapper = styled.div`
  .optionIcon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #9e9e9e;
    background-color: #fff;

    &:hover {
      color: #2196f3;
      background-color: #f5f5f5;
    }
  }
`;

const OptionMenu = styled.div`
  position: relative !important;
  width: 220px !important;
  padding: 6px 0 !important;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  background: #fff;
`;

const MenuItem = styled.div`
  padding: 0 20px;
  line-height: 36px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const RedMenuItem = styled(MenuItem)`
  color: #f44336;
`;

export default function OptionColumn(props) {
  const { record, sourceList, setSourceList } = props;
  const [visible, setVisible] = useState(false);
  const [useDetailVisible, setUseDetailVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  return (
    <Wrapper>
      <Trigger
        action={['click']}
        popupClassName="moreOption"
        getPopupContainer={() => document.body}
        popupVisible={visible}
        onPopupVisibleChange={visible => setVisible(visible)}
        popupAlign={{
          points: ['tr', 'bl'],
          offset: [25, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={
          <OptionMenu>
            <MenuItem
              onClick={() => {
                setVisible(false);
                setUseDetailVisible(true);
              }}
            >
              {_l('使用详情')}
            </MenuItem>
            <RedMenuItem
              onClick={() => {
                setVisible(false);
                setDialogVisible(true);
              }}
            >
              {_l('删除')}
            </RedMenuItem>
          </OptionMenu>
        }
      >
        <div className="optionIcon">
          <Icon icon="task-point-more" className="Font18 pointer" />
        </div>
      </Trigger>

      {useDetailVisible && (
        <AddOrEditSource
          {...props}
          isEdit={true}
          sourceRecord={record}
          editType={DETAIL_TYPE.USE_DETAIL}
          onClose={() => setUseDetailVisible(false)}
        />
      )}

      {dialogVisible && (
        <Dialog
          title={_l('删除数据源')}
          buttonType="danger"
          visible={dialogVisible}
          description={
            <div>
              <span>{_l('删除后，相关的同步任务会立即终止')}</span>
              <a
                className="mLeft10"
                onClick={() => {
                  setDialogVisible(false);
                  setUseDetailVisible(true);
                }}
              >
                {_l('查看同步任务')}
              </a>
            </div>
          }
          okText={_l('删除')}
          onOk={() => {
            dataSourceApi.deleteDatasource({ projectId: props.currentProjectId, datasourceId: record.id }).then(res => {
              if (res.isSucceeded) {
                alert(_l('数据源删除成功'));
                setSourceList(sourceList.filter(item => item.id !== record.id));
              } else {
                alert(res.errorMsg, 2);
              }

              setDialogVisible(false);
            });
          }}
          onCancel={() => setDialogVisible(false)}
        />
      )}
    </Wrapper>
  );
}
