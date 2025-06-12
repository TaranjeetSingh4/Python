/* global g1,  Noty, CryptoJS */
var url = g1.url.parse(location.href);
var captcha_val;
function save_password() {
  var phone_number = url.searchKey["phone"];
  var password = $("#password").val();
  var re_password = $("#re_password").val();
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
      temp_password: "0",
    },
  })
    .done(function () {
      window.location.href = "login";
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

function ajax_call(url_hit, method = "GET", bool_async = true) {
  return $.ajax({
    url: url_hit,
    async: bool_async,
    method: method,
    dataType: "json",
  });
}

function get_captcha() {
  ajax_call("cap").done(function (data) {
    $("#captcha_img").attr("src", data.img_data.slice(0, -16));
    $("body");
    captcha_val = data.str.toLowerCase();
    $("body").on("keyup", "#captcha", function () {
      if ($(this).val().toLowerCase() == captcha_val) {
        $(".captcha_msg").addClass("d-none");
        $("#signin").removeAttr("disabled");
      } else {
        if ($(this).val().length >= 6) {
          ajax_call("cap").done(function (data) {
            $("#captcha_img").attr("src", data.img_data.slice(0, -16));
            captcha_val = data.str.toLowerCase();
          });
          $(".captcha_msg").removeClass("d-none");
        }
        $("#signin").attr("disabled", true);
      }
    });
  });
}

$(window).on("load", function () {
  get_captcha();
});
$("body").on("click", "#captcha-reload", function () {
  get_captcha();
});

$(document)
  .on("click", "#reset", function (e) {
    e.preventDefault();
    $(".login-input").addClass("d-none");
    $(".reset-password").removeClass("d-none");
  })
  .on("submit", "#loginform", function (e) {
    e.preventDefault();
    var pass;
    if (captcha_val != $("#captcha").val()) {
      $("#signin").attr("disabled", true);
      $(".captcha_msg").removeClass("d-none");
      return;
    } else {
      $("#signin").removeAttr("disabled");
      $(".captcha_msg").addClass("d-none");
      pass = document.getElementById("inputPassword").value;
      document.getElementById("inputPassword").value =
        CryptoJS.SHA256(pass).toString();
    }
    var _xsrf = $("#_xsrf").val();

    $.ajax({
      headers: { "X-Xsrftoken": _xsrf },
      method: "POST",
      url: "login",
      data: {
        user: $(".username").val(),
        password: CryptoJS.SHA256(pass).toString(),
      },
    })
      .done(function () {
       // var base_url = url.protocol + "://" + url.origin;
       // if (url.directory.replace(/\//g, "") && !("next" in url["searchKey"]))
         // base_url = base_url + url.directory;
       // if (url) {
         // if ("next" in url["searchKey"] && url["hash"])
           // window.location.href =
           //   base_url + url["searchKey"]["next"] + "#" + url.hash;
         // else if ("next" in url["searchKey"] && !url["hash"])
           // window.location.href = base_url + url["searchKey"]["next"];
         // else window.location.href = ".";
       // } else window.location.href = ".";
	window.location.href = "/";
      })
      .fail(function () {
        $(".invalid_text").removeClass("d-none");
        $(".invalid_msg").removeClass("d-none");
        notification(
          "Unable to process this request. Please try again.",
          "error"
        );
      });
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
      data: { phonenumber: phone, temp_password: "1" },
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
    var phone_number = url.searchKey["phone"];
    $.ajax({
      url: "get_otp?phonenumber=" + phone_number + "&otp=" + otp,
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
  });
