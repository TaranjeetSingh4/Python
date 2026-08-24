/* global Noty, CryptoJS */
var url = g1.url.parse(location.href);
function save_password() {
  var phone_number = url.searchKey["phone"];
  var password = $("#password").val();
  var re_password = $("#re-password").val();

  if (!password) {
    notification("Please enter Password", "error");
    return;
  }
  if (!re_password) {
    notification("Please Re-enter Password", "error");
    return;
  }
  if (password !== re_password) {
    notification("Password and Re-enter password did not match", "error");
    return;
  }
  var _xsrf = $("#_xsrf").val();
  $.ajax({
    headers: { "X-Xsrftoken": _xsrf },
    method: "PUT",
    url: "save_password",
    data: {
      phonenumber: phone_number,
      password: CryptoJS.SHA256($("#password").val()).toString(),
    },
  })
    .done(function () {
      url = url.join("login").toString();
      window.location.href = url;
    })
    .fail(function () {
      notification(
        "Unable to process this request. Please try again.",
        "error"
      );
    });
}

function notification(message, msg_type) {
  var noty = new Noty({
    type: msg_type,
    layout: "topRight",
    closeWith: ["click", "hover"],
    timeout: 3000,
    text: message,
  });
  noty.show();
}

$(document)
  .on("click", "#reset", function (e) {
    e.preventDefault();
    $(".login-input").addClass("d-none");
    $(".reset-password").removeClass("d-none");
  })
  .on("click", "#login", function () {
    $(".reset-password").addClass("d-none");
    $(".login-input").removeClass("d-none");
  })
  .on("click", "#send-otp", function (e) {
    e.preventDefault();
    var phone = $("#phonenumber").val();
    if (!phone) {
      notification("Please enter Phonenumber", "error");
      return;
    }
    if (!phone.toString().match("^[0-9]{10}$")) {
      notification("Please enter a valid phone number", "error");
      return;
    }
    $.ajax({
      url: "send_otp",
      method: "POST",
      data: { phone_number: phone },
    })
      .done(function (response) {
        if (response == "success") {
          url = url.join("reset?phone=" + phone).toString();
          window.location.href = url;
        } else {
          notification("Please enter registered mobile number", "error");
        }
      })
      .fail(function () {
        notification(
          "Unable to process this request. Please try again.",
          "error"
        );
      });
  })
  .on("click", "#verify", function (e) {
    e.preventDefault();
    var otp = $("#otp").val();
    var phone_number = url.searchKey.phone;
    $.ajax({
      url: "get_otp?phone_number=" + phone_number + "&otp=" + otp,
      method: "GET",
    })
      .done(function (response) {
        if (response.length) {
          $(".verify-otp").addClass("d-none");
          $(".set-password").removeClass("d-none");
        } else {
          notification("OTP does not match. Please re-enter.", "error");
        }
      })
      .fail(function () {
        notification(
          "Unable to process this request. Please try again.",
          "error"
        );
      });
  })
  .on("click", "#enter", function (e) {
    e.preventDefault();
    save_password();
  })
  .on("submit", "#loginform", function () {
    var pass = document.getElementById("inputPassword").value;
    document.getElementById("inputPassword").value =
      CryptoJS.SHA256(pass).toString();
  });
