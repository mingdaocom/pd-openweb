import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Modal } from 'antd';
import sheetApi from 'src/api/worksheet';
import EditAppIntro from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditIntro';

export default class SheetDesc extends Component {
  constructor(props) {
    super(props);
    const { desc } = props;
    this.state = {
      desc,
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.desc !== this.props.desc) {
      this.setState({ desc: nextProps.desc });
    }
  }
  handleSave = () => {
    const value = this.state.desc || '';
    const desc = value.trim();
    if (desc !== this.props.desc) {
      const { worksheetId } = this.props;
      if (worksheetId) {
        sheetApi.updateWorksheetDec({
          worksheetId,
          dec: desc,
        }).then((data) => {
          this.props.onSave(desc);
          alert(_l('修改成功'));
        }).fail((err) => {
          alert(_l('修改描述失败'), 2);
        });
      } else {
        this.props.onSave(desc);
      }
    }
  }
  render() {
    const { worksheetId, title, visible, onClose, isEditing, setDescIsEditing, isCharge } = this.props;
    const { desc } = this.state;
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
          cacheKey={worksheetId ? 'sheetIntroDescription' : 'pageIntroDescription'}
          description={desc}
          permissionType={isCharge ? 100 : 0}
          // isEditing={!desc}
          isEditing={isEditing}
          changeSetting={() => {}}
          changeEditState={setDescIsEditing}
          onSave={value => {
            setDescIsEditing(false);
            if (value === null) {
              // onClose();
            } else {
              this.setState({
                desc: value
              }, this.handleSave);
            }
          }}
          onCancel={() => {
            onClose();
          }}
        />
      </Modal>
    );
  }
}
