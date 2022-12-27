import intlTelInput from '@mdfe/intl-tel-input';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import './style.css';
import contactController from 'src/api/contact';
import RegExp from 'src/util/expression';
import tpl from './tpl/form.html';
import doT from '@mdfe/dot';
import { index as dialog } from 'src/components/mdDialog/dialog';
import 'src/components/select/select';
import SelectLocation from 'src/components/selectLocation/selectLocation';

var Contact = {};

Contact.Options = {
  $container: null,
  iti: '',
};
/**
 * [popupLinkContent description]
 * @return {[type]} [description]
 */
Contact.popupLinkContent = function (title, leadType) {
  Contact.dialog = dialog({
    fixed: false,
    dialogBoxID: 'dialogContact',
    container: {
      header: title + ' ( <span class="red">*</span>为必填项 )',
      yesText: null,
      noText: null,
    },
    width: 458,
  });

  contactController.getContactInfo({}).then(function (res) {
    if (res) {
      res.leadType = leadType;

      var html = doT.template(tpl)({
        user: res.user,
        leadType: leadType,
      });

      Contact.Options.$container = $('#dialogContact');
      Contact.dialog.content(html);
      Contact.dialog.dialogCenter();
      Contact.bindEvent(res);
    }
  });
};

Contact.bindEvent = function (data) {

  var $dialogContact = Contact.Options.$container;

  var $mobilePhone = $dialogContact.find('.txtMobile');
  if ($mobilePhone.length > 0) {
    Contact.Options.iti = intlTelInput(document.querySelector('.txtMobile'), {
      initialCountry: 'cn',
      loadUtils: '',
      preferredCountries: ['cn'],
      utilsScript: utils,
      separateDialCode: true,
    });
    if (data.user && data.user.mobilePhone) {
      var mobilePhone = data.user.mobilePhone;
      if (RegExp.isMobile(mobilePhone)) {
        mobilePhone = '+86' + mobilePhone;
      }
      Contact.Options.iti.setNumber(mobilePhone);
    }
  }

  var $companyCity = $dialogContact.find('.txtCity');
  if ($companyCity.length > 0) {
    $companyCity.on('mouseover', function () {
      SelectLocation($dialogContact.find('.txtCity'), {
        style: {
          top: 25,
        },
      });
    });
  }

  var $hidIndustry = $dialogContact.find('.hidIndustry');
  if ($hidIndustry.length > 0 && data.industries && data.industries.length > 0) {
    $hidIndustry.MDSelect({
      dataArr: data.industries,
      showType: 4,
      zIndex: 22,
      wordLength: 100,
    });
  }

  var $btnSubmit = $dialogContact.find('.linkButton');
  $btnSubmit.on('click', function () {
    Contact.submitLinkContent(data.leadType);
  });

};

Contact.checkParams = function () {

  var $dialogContact = Contact.Options.$container;

  var $txtCompany = $dialogContact.find('.txtCompany');
  if ($txtCompany.length > 0 && $txtCompany.is(':visible') && !$txtCompany.val().trim()) {
    alert('组织名称不能为空', 3);
    $txtCompany.focus();
    return false;
  }

  var $txtName = $dialogContact.find('.txtName');
  if ($txtName.length > 0 && $txtName.is(':visible') && !$txtName.val().trim()) {
    alert('姓名不能为空', 3);
    $txtName.focus();
    return false;
  }

  var $txtJob = $dialogContact.find('.txtJob');
  if ($txtJob.length > 0 && $txtJob.is(':visible') && !$txtJob.val().trim()) {
    alert('职位不能为空', 3);
    $txtJob.focus();
    return false;
  }

  var $txtEmail = $dialogContact.find('.txtEmail');
  if ($txtEmail.length > 0 && $txtEmail.is(':visible')) {
    var email = $txtEmail.val().trim();
    if (!email) {
      alert('邮箱不能为空', 3);
      $txtEmail.focus();
      return false;
    } else if (!RegExp.isEmail(email)) {
      alert('邮箱格式不正确', 3);
      $txtEmail.select();
      return false;
    }
  }

  var $txtMobile = $dialogContact.find('.txtMobile');
  if ($txtMobile.length > 0 && $txtMobile.is(':visible')) {
    var mPhone = Contact.Options.iti.getNumber();
    if (!mPhone) {
      alert('手机不能为空', 3);
      $txtMobile.focus();
      return false;
    } else {
      var isValid = Contact.Options.iti.isValidNumber();
      if (!isValid) {
        alert('手机号格式不准确', 3);
        $txtMobile.select();
        return false;
      }
    }
  }

  var $txtCity = $dialogContact.find('.txtCity');
  if ($txtCity.length > 0 && $txtCity.is(':visible')) {
    if (!$txtCity.attr('selectValue')) {
      alert('省份不能为空', 3);
      return false;
    }
  }

  var $txtAddress = $dialogContact.find('.txtAddress');
  if ($txtAddress.length > 0 && $txtAddress.is(':visible') && !$txtAddress.val().trim()) {
    alert('地址不可为空', 3);
    $txtAddress.focus();
    return false;
  }

  return true;
};

/**
 * [submitLinkContent description]
 * @return {[type]} [description]
 */
Contact.submitLinkContent = function (leadType) {
  if (Contact.checkParams()) {

    var $dialogContact = Contact.Options.$container;

    var $btnSubmit = $dialogContact.find('.linkButton');

    $btnSubmit.val('提交中...').attr('disabled', true);

    var company = $dialogContact.find('.txtCompany').val().trim();
    var userName = $dialogContact.find('.txtName').val().trim();
    var job = $dialogContact.find('.txtJob').val().trim();
    var email = $dialogContact.find('.txtEmail').val().trim();
    var mobile = Contact.Options.iti.getNumber();
    var content = $dialogContact.find('.txtContent').val().trim();
    var contactMe = $dialogContact.find('.contactMe').prop('checked');

    var industry = null;
    var city = null;
    var address = null;
    var companyWeb = null;

    var $hidIndustry = $dialogContact.find('.hidIndustry');
    if ($hidIndustry.length > 0) {
      industry = $hidIndustry.val();
    }
    var $txtCity = $dialogContact.find('.txtCity');
    if ($txtCity.length > 0) {
      city = $txtCity.attr('selectValue');
    }
    var $txtAddress = $dialogContact.find('.txtAddress');
    if ($txtAddress.length > 0) {
      address = $txtAddress.val().trim();
    }
    var $txtCompanyWeb = $dialogContact.find('.txtCompanyWeb');
    if ($txtCompanyWeb.length > 0) {
      companyWeb = $txtCompanyWeb.val().trim();
      companyWeb = companyWeb == 'http://' ? null : companyWeb;
    }

    contactController.submitLinkContent({
      leadType: leadType,
      userName: userName,
      company: company,
      job: job,
      email: email,
      mobile: mobile,
      industry: industry,
      city: city,
      address: address,
      companyWeb: companyWeb,
      content: content,
      contactMe: contactMe,
    }).then(function (result) {
      Contact.dialog.closeDialog();
      alert('信息提交成功，我们会及时与您联系');
      $btnSubmit.val('提 交', 3).removeAttr('disabled');
    });
  }
};

export default Contact;
