module.exports = function (options) {
  require(['createTask'], function () {
    if ($('#dialogSendMessage').is(':visible') ||
              $('#easyDialogBoxMDUpdater').is(':visible') ||
              $('#createCalendar').is(':visible') ||
              $('#createTask').is(':visible')) { return; }
    $.CreateTask(options);
  });
};
