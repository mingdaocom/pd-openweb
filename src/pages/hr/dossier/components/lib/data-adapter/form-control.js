import moment from 'moment';

import Controls from '../../form-control';
import { Controls as SignControls } from '../../sign-group/data';

/**
 * 日期时间格式化字符串
 */
const TimeFormat = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm',
};

class FormControl {
  constructor() {
    // 明细列表
    this.list = {};
  }

  /**
   * 明细数据合并至控件列表
   */
  flatten = (controls, formControls) => {
    if (formControls && formControls.length) {
      formControls.map((item) => {
        this.list[item.formId] = item;

        return null;
      });
    }

    if (controls && controls.length) {
      const list = controls.map((item) => {
        if (item.type === 0 && item.formId) {
          item.data = this.list[item.formId];
        }

        return item;
      });

      list.sort((a, b) => {
        return a.row - b.row || a.col - b.col;
      });

      return list;
    }

    return [];
  };
  /**
   * 从控件列表中获取表单数据
   */
  getFormData = (controlData, formControlData) => {
    const controls = [];
    const formControls = [];

    for (const id in controlData) {
      if (id && controlData[id]) {
        const item = controlData[id];

        if (item.type === Controls.type.FORMGROUP) {
          const valueList = item.value.map((values) => {
            const _data = _.cloneDeep(formControlData);

            for (const _id in values) {
              if (_id) {
                _data[_id].value = values[_id];
              }
            }

            return this.getFormData(_data, {}).controls;
          });

          formControls.push({
            [id]: valueList,
          });
        } else if (item.type === Controls.type.DROPDOWN) {
          let value = item.value;
          if (item.config && item.config.dataSource) {
            value = JSON.stringify(item.value);
          }

          controls.push({
            [id]: value,
          });
        } else if (item.type === Controls.type.DATETIME) {
          let format = TimeFormat.DATE;
          if (item.config && item.config.type && item.config.type === 'datetime') {
            format = TimeFormat.DATETIME;
          }

          let value = '';
          if (item.value) {
            try {
              value = moment(new Date(item.value)).format(format);
            } catch (e) {
              //
            }
          }

          controls.push({
            [id]: value,
          });
        } else if (item.type === Controls.type.DATETIMERANGE) {
          let value = '';
          if (item.value && item.value.length >= 2) {
            try {
              const list = [new Date(item.value[0]).getTime(), new Date(item.value[1]).getTime()];

              if (item.value.length >= 4) {
                list.push(item.value[2]);
                list.push(item.value[3]);
              }

              value = list.join(',');
            } catch (e) {
              //
            }
          }

          controls.push({
            [id]: value,
          });
        } else if (item.type === Controls.type.CHECKBOXGROUP) {
          let value = '0';
          if (item.value) {
            let maxLength = 1;
            for (const key in item.value) {
              if (key && item.value[key]) {
                if (key.length > maxLength) {
                  maxLength = key.length;
                }
              }
            }

            const list = new Array(maxLength);
            list.fill('0');
            for (const key in item.value) {
              if (key && item.value[key] && key.length && key[0] === '1') {
                list[maxLength - key.length] = '1';
              }
            }

            value = list.join('');
          }

          controls.push({
            [id]: value,
          });
        } else if (item.type === Controls.type.AREAPICKER) {
          let value = '';
          if (item.value && item.value.length) {
            value = item.value[item.value.length - 1].id;
          }

          controls.push({
            [id]: value,
          });
        } else if (item.type === Controls.type.SIGNGROUP) {
          const values = {};

          for (const _id in item.value) {
            if (_id === SignControls.RANGE) {
              const _data = item.value[_id];
              let value = '';
              if (_data && _data.length >= 2) {
                try {
                  const list = [new Date(_data[0]).getTime(), new Date(_data[1]).getTime()];

                  if (_data.length >= 4) {
                    list.push(_data[2]);
                    list.push(_data[3]);
                  }

                  value = list.join(',');
                } catch (e) {
                  //
                }
              }

              values[_id] = value;
            } else {
              values[_id] = item.value[_id];
            }
          }

          controls.push({
            [id]: JSON.stringify(values),
          });
        } else if (item.type === Controls.type.USERPICKER || item.type === Controls.type.DEPARTMENTPICKER || item.type === Controls.type.FILEATTACHMENT) {
          let value = '';
          if (item.value) {
            value = JSON.stringify(item.value);
          }

          controls.push({
            [id]: value,
          });
        } else {
          controls.push({
            [id]: item.value,
          });
        }
      }
    }

    return {
      controls,
      formControls,
    };
  };
}

export default new FormControl();
