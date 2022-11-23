import 'src/components/createTask/createTask';

export default function(options) {
  if (
    $('#dialogSendMessage').is(':visible') ||
    $('#easyDialogBoxMDUpdater').is(':visible') ||
    $('#createCalendar').is(':visible') ||
    $('#createTask').is(':visible')
  ) {
    return;
  }
  $.CreateTask(options);
}
