/* global g1: true */
var current_url = g1.url.parse(location.href);

$(document)
  /* On click on enter button form will be submitted */
  .on("click", "#enter", function (e) {
    e.preventDefault();
    insert_password_details();
  })
  /* On keypress of enter on body form will be submitted */
  .on("keypress", "body", function (e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      insert_password_details();
    }
  });

/* To create and insert new passowrd */
function insert_password_details() {
  var password = $("#password").val();
  var re_password = $("#re_password").val();
  /* If password is blank */
  if (!password) {
    $(".alert-error").html(
      '<div class="alert alert-danger alert-dismissable"><a href="#" class="close" data-dismiss="alert" aria-label="close">×</a><strong>Please enter Password</strong></div>'
    );
    return;
  }
  /* If re enter password is blank */
  if (!re_password) {
    $(".alert-error").html(
      '<div class="alert alert-danger alert-dismissable"><a href="#" class="close" data-dismiss="alert" aria-label="close">×</a><strong>Please Re Enter Password</strong></div>'
    );
    return;
  }
  /* If password and re enter password does not match */
  if (password !== re_password) {
    $(".alert-error").html(
      '<div class="alert alert-danger alert-dismissable"><a href="#" class="close" data-dismiss="alert" aria-label="close">×</a><strong>Password and Re enter password Did not match</strong></div>'
    );
    return;
  }
  if (!password.match(/^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$/)) {
    // https://stackoverflow.com/a/10557545
    $(".alert-error").html(
      '<div class="alert alert-danger alert-dismissable"><a href="#" class="close" data-dismiss="alert" aria-label="close">×</a><strong>Not alphanumeric password.</strong></div>'
    );
    return;
  }
  if (password.length < 8) {
    $(".alert-error").html(
      '<div class="alert alert-danger alert-dismissable"><a href="#" class="close" data-dismiss="alert" aria-label="close">×</a><strong>Password must be at least 8 characters.</strong></div>'
    );
    return;
  }

  /* Submit the details to save password based on uuid */
  var _xsrf = $("#_xsrf").val();
  $.ajax({
    headers: { "X-Xsrftoken": _xsrf },
    method: "POST",
    url: "save-password",
    data: {
      user: sessionStorage["user"],
      phonenumber: sessionStorage["phonenumber"],
      password: $("#password").val(),
    },
  }).done(function (response) {
    if (response === "success") {
      // show temporary password expiration message for 10 seconds and redirect to login page
      $(".alert-error").html(
        '<div class="alert alert-success alert-dismissable"><a href="#" class="close" data-dismiss="alert" aria-label="close">×</a><strong>Password reset complete! Use this password from now. Redirecting to login page in 10 seconds...</strong></div>'
      );
      setTimeout(function () {
        current_url = current_url.join("logout").toString();
        window.location.href = current_url;
      }, 10000);
    }
  });
}
