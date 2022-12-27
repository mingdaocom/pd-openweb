import base, { controllerName } from './base';

const check = {
  /**
   * 获取根据考勤计算的请假和加班时长
   * @param {Object} args 请求参数
   * @param {String} [args.controlId=请假或者加班时间段 控件id]
   * @param {Object} [args.value=[ 对接控件的值
   {"59a4f9696d12f903b1cdd4c3": "59b0fc2e6d12f90c36066fbd"},
   {"59a4f9696d12f903b1cdd4c4": "1504780572108,1505212572108"},
   {"59a4f9696d12f903b1cdd4c5": "3424"},
   {"59a4f9696d12f903b1cdd4c6": "42342"}
   ]]
   */
  getEffectiveTime(args, options) {
    base.ajaxOptions.url = base.server() + '/check/getEffectiveTime';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'getEffectiveTime', JSON.stringify(args), $.extend(base, options));
  },
};
export default check;
