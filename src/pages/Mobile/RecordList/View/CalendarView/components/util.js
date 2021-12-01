// 时间格式化显示
export const dateFormat = (start,end) => {
  if (!start && !end) return
  // 没有结束时间
  if (!end) {
    if (moment().isSame(moment(start),'year')) {
      return moment(start).format('MM月DD日 HH:mm')
    } else {
      return moment(start).format('YYYY年MM月DD日 HH:mm')
    }
  } 
  // stat/end同一天
  if (moment(start).isSame(moment(end),'day') && moment().isSame(moment(start),'day')) {
    return moment(start).format('[今天] HH:mm') + '~' + moment(end).format('HH:mm')
  } else if (moment(start).isSame(moment(end),'day') && moment(start).isSame(moment().subtract(1,'days'),'day')) {
    return moment(start).format('[昨天] HH:mm')  + '~' + moment(end).format('HH:mm')
  } else if (moment(start).isSame(moment(end),'day') && moment(start).isSame(moment().add(1,'days'),'day')) {
    return moment(start).format('[明天] HH:mm')  + '~' + moment(end).format('HH:mm')
  }
  // start/end同年
  if (moment(start).isSame(moment(end),'year')) {
    return moment(start).format('YYYY年MM月DD日 HH:mm') + '~' + moment(end).format('MM月DD日 HH:mm') 
  }
  return moment(start).format('YYYY年MM月DD日 HH:mm') + '~' + moment(end).format('YYYY年MM月DD日 HH:mm')
}