module.exports = function (options) {
  require(['createCalendar'], function () {
    if ($('#dialogSendMessage').is(':visible') ||
              $('#easyDialogBoxMDUpdater').is(':visible') ||
              $('#createCalendar').is(':visible') ||
              $('#createTask').is(':visible')) { return; }
    $.CreateCalendar(options);
  });
};
