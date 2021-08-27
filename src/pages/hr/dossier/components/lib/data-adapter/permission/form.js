class FormAdapter {
  /**
   * 转换
   * @param {Array} data - 控件列表
   */
  convert = (data) => {
    let formData = [];

    if (data && data.length) {
      formData = data.map((item, i, list) => {
        const control = this.convertControl(item);

        return control;
      });
    }

    return formData;
  };

  /**
   * 转换控件数据
   * @param {Object} control - 控件
   */
  convertControl = (control) => {
    return {
      id: [control.controlId, control.formId].join('-'),
      controlId: control.controlId,
      formId: control.formId,
      label: control.controlName,
      view: !!control.viewable,
      viewdisabled: !!control.viewdisabled,
      edit: !!control.editable,
      editdisabled: !!control.editdisabled,
    };
  };
}

export default new FormAdapter();
