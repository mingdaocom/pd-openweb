import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Dropdown, Modal, Switch } from 'ming-ui/antd-components';
import systemIntegrationAjax from 'src/api/systemIntegration';
import { useBindKuaiMaiDialog } from 'src/pages/FormSet/containers/Print/components/BindKuaiMaiDialog.jsx';
import { navigateTo } from 'src/router/navigation/navigateTo';
import Config from '../../../config';

const PrintItem = styled.div`
  display: flex;
  align-items: center;
  height: 90px;
  border-radius: 3px;
  border: 1px solid var(--color-border-primary);
  padding: 0 20px;
  margin-bottom: 10px;
  .verticalAlign {
    vertical-align: text-bottom;
  }
  .textDot {
    width: 4px;
    height: 4px;
    background: var(--color-text-primary);
    border-radius: 50%;
    margin: 0 5px;
  }
`;

export default function CloudPrint(props) {
  const { open: openBindKuaiMaiDialog, holder: bindKuaiMaiDialogHolder } = useBindKuaiMaiDialog();
  const { onBack } = props;
  const [printLoading, setPrintLoading] = useState(true);
  const [printList, setPrintList] = useState(props.printList || [{ id: 'new', name: _l('快麦云打印') }]);
  const [currentId, setCurrentId] = useState('');

  const getPrintList = () => {
    systemIntegrationAjax
      .getSystemIntegrationList({ projectId: Config.projectId, type: 1 })
      .then(res => {
        setPrintList(res || []);
        setPrintLoading(false);
      })
      .catch(() => {
        setPrintLoading(false);
      });
  };

  const changeSystemIntegrationStatus = (id, isOpen) => {
    systemIntegrationAjax.changeSystemIntegrationStatus({ projectId: Config.projectId, isOpen, id }).then(res => {
      if (res) {
        setPrintList(printList.map(item => (item.id === id ? { ...item, isOpen } : item)));
        alert(isOpen ? _l('已连接') : _l('已关闭'));
      } else {
        alert(isOpen ? _l('连接失败') : _l('关闭失败'), 2);
      }
    });
  };

  const deleteSystemIntegration = (e, item) => {
    e.stopPropagation();
    e.preventDefault();

    setCurrentId('');

    Modal.confirm({
      title: <div className="textError">{_l('确定删除云打印服务吗？')}</div>,
      content: <div>{_l('删除后，云打印服务将无法继续使用，请谨慎操作。')}</div>,
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        systemIntegrationAjax
          .deletSystemIntegration({
            projectId: Config.projectId,
            id: item.id,
          })
          .then(res => {
            if (res) {
              setPrintList(printList.filter(item => item.id !== item.id));
              navigateTo(`/admin/systemservice/${Config.projectId}`);
            }
          });
      },
    });
  };

  useEffect(() => {
    Config.setPageTitle(_l('集成 - 云打印'));
    getPrintList();
  }, []);

  return (
    <div className="orgManagementWrap adminCloudPrintContainer">
      {bindKuaiMaiDialogHolder}
      <div className="orgManagementHeader">
        <span className="Font17 Bold flexRow alignItemsCenter">
          <i className="icon-backspace Font22 hoverColorPrimary pointer mRight10" onClick={onBack} />
          {_l('云打印')}
        </span>
      </div>
      <div className="orgManagementContent">
        {printLoading ? (
          <LoadDiv />
        ) : (
          printList.map(item => (
            <PrintItem key={item.id}>
              <div
                className="flex minWidth0 flexRow alignItemsCenter Hand"
                onClick={() => {
                  openBindKuaiMaiDialog({
                    projectId: Config.projectId,
                    appId: item?.configSetting?.cloudAppId,
                    appSecret: item?.configSetting?.cloudSecretKey,
                    id: item.id,
                  });
                }}
              >
                <Icon icon="cloud_printing" className="Font36 Green mRight20" />
                <div className="flex">
                  <div className="bold Font15 mBottom4 flexRow alignItemsCenter">
                    <span>{_l('快麦')}</span>
                    <span className="textDot"></span>
                    <span>{_l('云打印')}</span>
                  </div>
                  {item.id === 'new' ? (
                    ''
                  ) : (
                    <div>
                      <Switch
                        size="small"
                        checked={item.isOpen}
                        onClick={(checked, event) => {
                          event.stopPropagation();
                          return changeSystemIntegrationStatus(item.id, !item.isOpen);
                        }}
                      />
                      <span className="Font12 textTertiary mLeft6 verticalAlign">
                        {item.isOpen ? _l('已连接') : _l('已关闭')}
                      </span>
                    </div>
                  )}
                </div>
                <span className="textTertiary">{item.id === 'new' ? _l('连接') : _l('编辑')}</span>
              </div>
              <Dropdown
                trigger={['click']}
                open={currentId === item.id}
                onOpenChange={visible => {
                  console.log(visible);
                  setCurrentId(visible ? item.id : '');
                }}
                menu={{
                  items: [
                    {
                      key: 'delete',
                      danger: true,
                      icon: <Icon icon="delete2" className="Font18" />,
                      label: _l('删除'),
                    },
                  ],
                  onClick: ({ domEvent }) => deleteSystemIntegration(domEvent, item),
                  style: { minWidth: 140 },
                }}
              >
                <span
                  className="icon-more_horiz Font18 mLeft20 textSecondary hoverColorPrimary Hand"
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentId(item.id);
                  }}
                ></span>
              </Dropdown>
            </PrintItem>
          ))
        )}
      </div>
    </div>
  );
}
