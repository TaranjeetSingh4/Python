/* global Noty */
/* exported notification */
var hierarchy,
  district = "",
  block = "",
  otp = "",
  phonenumber = "",
  username = "",
  designation = "",
  email = "",
  level = 1;
var userid = "";

var region_designations = {
  state: ["GM", "Consultant"],
  district: ["ACMO", "CMO"],
  block: ["BCPM", "MOIC"],
};

function render() {
  render_dropdown("designation", region_designations.state);
  render_dropdown("program", ["Program 1", "Program 2", "Program 3"]);
}
function get_data() {
  $.ajax({
    url: "block_data_register",
    // data: '_by=division&_by=district&_by=block',
    async: false,
    success: function (response) {
      hierarchy = _.groupBy(response, "district");
    },
  });
}
function block_level() {
  render_dropdown("block", _.map(hierarchy[district], "block"));
  render_dropdown("designation", region_designations["block"]);
}
function district_level() {
  render_dropdown("district", _.sortBy(_.keys(hierarchy)));
  render_dropdown("designation", region_designations["district"]);
  return district;
}

function render_dropdown(type, data) {
  $("#" + type).selectpicker("destroy");
  if (type == "designation") $("#designation").empty();
  $("." + type + "-dropdown")
    .on("template", function () {
      $("#" + type).selectpicker();
    })
    .template({
      data: data,
      column: false,
      id: type,
    });
}
function validate_number(regexstr, validate_str, str_length) {
  var flag = regexstr.test(validate_str);
  if (!flag || validate_str.length != str_length) {
    return false;
  }
  return true;
}
function notification(message, msg_type) {
  var noty = new Noty({
    type: msg_type || "error",
    layout: "topRight",
    closeWith: ["click", "hover"],
    timeout: 3000,
    text: message,
  });
  noty.show();
}

function user_filled_data() {
  username = $("#username").val();
  email = $("#email").val() || "";
  phonenumber = $("#phonenumber").val();
  designation = $("#designation").val();
}

function registration_otp(phonenumber) {
  $.ajax({
    url: "registration_otp",
    method: "POST",
    data: { phonenumber: phonenumber },
  }).done(function (response) {
    otp = response;
  });
}

var Upload = function (file) {
  this.file = file;
};

Upload.prototype.getType = function () {
  return this.file.type;
};
Upload.prototype.getSize = function () {
  return this.file.size;
};
Upload.prototype.getName = function () {
  return this.file.name;
};

Upload.prototype.doUpload = function () {
  var formData = new FormData();
  formData.append("file", this.file);
  if (!check_phonenumber()) {
    $("#file-input").val(null);
    return;
  }
  formData.append("mobilenumber", phonenumber);
  $.ajax({
    headers: { Accept: "image/*" },
    url: "save_picture",
    type: "POST",
    data: formData,
    contentType: false,
    processData: false,
    async: false,
  })
    .done(function () {
      enable_otp();
    })
    .fail(function () {
      $(".profile-pic-upload").val(null);
      notification(
        "File format not acceptable. Please upload png/svg",
        "error"
      );
    });
};

function enable_otp() {
  registration_otp(phonenumber);
  $(".otp").attr("disabled", false);
  $("#enter-div, #submit-form, #resend-div").show();
  $("#otp-button").hide();
  $("#username, #phonenumber, #email").attr("readonly", "readonly");
}

$(document)
  .on("change", "#district", function () {
    district = $("#district").val();
    block_level();
  })
  .on("change", "#block", function () {
    block = $("#block").val();
  })
  .on("change", "#phonenumber", function () {
    phonenumber = $("#phonenumber").val();
    var regex = /^[0-9]*(?:\.\d{1,2})?$/;
    if (!regex.test(phonenumber)) {
      $("#otp-button").attr("disabled", true);
      $("#otp-button").addClass("opacity-60");
      notification("Please enter only numbers for the Phonenumber", "error");
    } else {
      $("#otp-button").removeAttr("disabled");
      $("#otp-button").removeClass("opacity-60");
    }
  })
  .on("change", ".profile-pic-upload", function () {
    if (
      this.files[0].type != "image/svg+xml" &&
      this.files[0].type != "image/png"
    ) {
      $("#otp-button").attr("disabled", true);
      $("#otp-button").addClass("opacity-60");
      notification("Only png/svg files can be uploaded", "error");
      $(".profile-pic-upload").val(null);
    } else {
      if (this.files[0].size < 30000 || this.files[0].size > 200000) {
        $("#otp-button").attr("disabled", true);
        $("#otp-button").addClass("opacity-60");
        notification(
          "Please upload the file of size in between 30KB and 200KB",
          "error"
        );
        $(".profile-pic-upload").val(null);
      } else {
        $("#otp-button").removeAttr("disabled");
        $("#otp-button").removeClass("opacity-60");
      }
    }
  });

function check_phonenumber() {
  phonenumber = $("#phonenumber").val();
  var phonenumber_flag = validate_number(/[6-9]{1}[0-9]{9}/, phonenumber, 10);
  if (!phonenumber_flag) {
    notification("Please enter valid mobile number", "error");
    return false;
  }
  return true;
}

$("#otp-button").click(function () {
  user_filled_data();
  if (level == 1) userid = designation + "_UP_" + username.split(" ").join("_");
  else if (level == 2)
    userid =
      designation +
      "_" +
      district.split(" ").join("_") +
      "_" +
      username.split(" ").join("_");
  else
    userid =
      designation +
      "_" +
      block.split(" ").join("_") +
      "_" +
      username.split(" ").join("_");
  if (!check_phonenumber()) {
    return;
  } else if (username.length == 0 || username == undefined) {
    notification("Username cannot be empty", "error");
    return;
  } else {
    $.get(`unique_user?user=${userid}&phonenumber=${phonenumber}`).done(
      function (response) {
        if (response.length > 0) {
          notification(
            "User already registered. Please use a different user name.",
            "error"
          );
          return;
        } else {
          $.get(`unique_phone?phonenumber=${phonenumber}&user=${userid}`).done(
            function (response) {
              if (response.length > 0) {
                notification(
                  "Number already registered. Please use a different number.",
                  "error"
                );
                return;
              } else {
                var file = $(".profile-pic-upload")[0].files[0];
                var upload = new Upload(file);
                upload.doUpload();
              }
            }
          );
        }
      }
    );
  }
});

$("#submit-form").click(function (e) {
  e.stopPropagation();
  if ($("#enter-otp").val() == otp) {
    // user_filled_data()
    var insert_data = {
      phonenumber: phonenumber,
      name: username,
      district: district,
      block: block,
      designation: designation,
      user: userid,
      temp_password: "1",
      Approval: "Not Approved",
      email: email,
    };
    $.ajax("saveuserdetails", {
      method: "POST",
      headers: { "X-Xsrftoken": $('input[name="_xsrf"]').val() },
      data: insert_data, // Note: values are arrays
    })
      .done(function () {
        notification("User registered successfully", "success");
        setTimeout(function () {
          window.location.href = "login";
        }, 4000);
      })
      .fail(function () {
        setTimeout(function () {
          notification(
            "Phone number and username need to be unique. Please try again.",
            "error"
          );
          $("#username, #phonenumber, #email").removeAttr("readonly");
          $("#enter-div, #submit-form, #resend-div").hide();
          $("#otp-button").show();
        }, 3000);
      });
  } else {
    notification("OTP mismatched. Please try again.", "error");
    return;
  }
});
$("#resend-otp").click(function () {
  if (!check_phonenumber() || username.length == 0 || username == undefined) {
    notification(
      "Username or phone number cannot be empty. Phone number needs to be valid",
      "error"
    );
    return;
  }
  registration_otp(phonenumber);
});
$(document)
  .on("change", ".region_level", function () {
    if ($(this).val() == "state") {
      level = 1;
      $("#district_div").hide();
      $("#block_div").hide();
      render_dropdown("designation", region_designations["state"]);
    } else if ($(this).val() == "district") {
      level = 2;
      $("#district_div").show();
      $("#block_div").hide();
      district = "Agra";
      district_level();
    } else if ($(this).val() == "block") {
      level = 3;
      $("#district_div").show();
      $("#block_div").show();
      district = "Agra";
      block = "Agra Achnera";
      district_level();
      block_level();
    }
  })
  .on("change", "#username", function () {
    var str = $("#username").val();
    var esc_string = str.match(/[^a-zA-Z .]/g);
    if (esc_string != null) {
      $("#otp-button").attr("disabled", true);
      $("#otp-button").addClass("opacity-60");
      notification("Username is having special characters", "error");
    } else {
      $("#otp-button").removeAttr("disabled");
      $("#otp-button").removeClass("opacity-60");
    }
  });
$(document).on("change", ".program_level", function () {
  if ($(this).val() == "program-yes") {
    $("#program_div").show();
  } else if ($(this).val() == "program-no") {
    $("#program_div").hide();
  }
});
$(document).ready(function () {
  get_data();
  render();
  $(
    "#district_div, #block_div, #program_div, #submit-form, #enter-div, #resend-div"
  ).hide();
});
