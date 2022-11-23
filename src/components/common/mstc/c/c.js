import 'src/components/createCalendar/createCalendar';

export default function(options) {
  if (
    $('#dialogSendMessage').is(':visible') ||
    $('#easyDialogBoxMDUpdater').is(':visible') ||
    $('#createCalendar').is(':visible') ||
    $('#createTask').is(':visible')
  ) {
    return;
  }
  $.CreateCalendar(options);
}
