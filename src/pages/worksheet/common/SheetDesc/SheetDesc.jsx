import React, { Component } from 'react';
import { Modal } from 'antd';
import { Icon } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import EditAppIntro from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditIntro';

export default class SheetDesc extends Component {
  constructor(props) {
    super(props);
    const { desc, resume, remark } = props;
    this.state = {
      desc,
      resume,
      remark,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.desc !== this.props.desc) {
      this.setState({ desc: nextProps.desc });
    }
  }
  handleSave = () => {
    const value = this.state.desc || '';
    const desc = value.trim();
    const { resume, remark } = this.state;
    if (desc !== this.props.desc || resume !== this.props.resume || remark !== this.props.remark) {
      const { worksheetId } = this.props;
      if (worksheetId) {
        sheetApi
          .updateWorksheetDec({
            worksheetId,
            dec: desc,
            resume,
            remark,
          })
          .then(() => {
            this.props.onSave(desc, resume);
            alert(_l('修改成功'));
          })
          .catch(() => {
            alert(_l('修改描述失败'), 2);
          });
      } else {
        this.props.onSave(desc, resume);
      }
    }
  };
  render() {
    const { cacheKey, title, visible, onClose, isEditing, setDescIsEditing, permissionType, data } = this.props;
    const { desc, resume, remark } = this.state;
    return (
      <Modal
        zIndex={1000}
        className="appIntroDialog"
        wrapClassName="appIntroDialogWrapCenter"
        visible={visible}
        onCancel={onClose}
        animation="zoom"
        width={800}
        footer={null}
        centered={true}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        bodyStyle={{ minHeight: '480px', padding: 0 }}
        maskAnimation="fade"
        mousePosition={{ x: 139, y: 23 }}
        closeIcon={<Icon icon="close" />}
      >
        <EditAppIntro
          title={title}
          cacheKey={cacheKey}
          description={desc}
          resume={resume}
          permissionType={permissionType}
          // isEditing={!desc}
          data={data}
          remark={remark}
          isEditing={isEditing}
          changeSetting={() => {}}
          changeEditState={setDescIsEditing}
          onSave={data => {
            const value = data.description;
            const resume = data.resume;
            const remark = data.remark;
            setDescIsEditing(false);
            this.setState(
              {
                desc: value === null ? this.props.desc : value,
                resume,
                remark,
              },
              this.handleSave,
            );
          }}
          onCancel={() => {
            onClose();
          }}
        />
      </Modal>
    );
  }
}
