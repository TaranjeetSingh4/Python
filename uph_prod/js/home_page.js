/*globals user_info, g1*/
/* exported update_ticker_text */

$(".home_page_navbar").template({ user: user_info["user"] });
$(".home_page").template({ user: user_info["user"] });

$(".insert_ticker_msg").template({ user: user_info["user"] });
$(".insert_ticker_msg_amethi").template({ user: user_info["user"] });

$(".file_upload").template();

get_list_of_files();
function get_list_of_files() {
  $.get("files_list", function (data) {
    $(".avail_file_list").empty();
    $(".avail_file_list").template({
      files_list: data,
    });

    $(".list_of_files").empty();
    $(".list_of_files").template({
      files_list: data,
    });
  });
}

var _file_to_delete = "",
  sel_page = "";

function update_ticker_text() {
  $.get("ticker_data", function (data) {
    _.each(data, function (d) {
      $("." + d.ticker_id).text(d.msg);
    });
  });
}
update_ticker_text();

$(document)
  .on("click", ".ticker_dropdown a", function () {
    sel_page = $(this).attr("data-value");
    var _val = $(this).attr("data-value");
    $(".ticker_drpdwn").html(_val + "  ");
  })
  .on("click", "#ticker_msg_sub", function () {
    var t_val = $("#ticker_msg").val();
    var t_val_amethi = $("#amethi_ticker_msg").val();
    // if(url.file == 'amethi_table' || url.file == 'amethi_map'){
    if (t_val_amethi != "") {
      $(".amethi_ticker_msg").text($("#amethi_ticker_msg").val());
      saveToDbAmethi($("#amethi_ticker_msg").val());
    }
    // }
    if (t_val != "") {
      $(".ticker_msg").text($("#ticker_msg").val());
      saveToDb(sel_page, $("#ticker_msg").val());
    }
    url_update({ ticker_page: sel_page });
    update_ticker_text();
    // $('#insertMsgModal').toggle('toggle')
  })
  .on("change", ".upload", function () {
    $(".upload_label").removeClass("border-color12 border-dotted");
    $(".upload_label").addClass("border-success border");
    $(".upload_label h3").text("Added PDF File");
    var file_name = $(this)[0].value.substring(12);
    // console.log(file_name)
    $(".upload_label p button").text(file_name);
  })
  .on("click", "#upload_pdf", function () {
    var file = $("#pdf_file")[0].files[0];
    var upload = new Upload(file);
    upload.doUpload();
    get_list_of_files();

    $(".upload_label h3").text("Add PDF File");
    // var file_name = $(this)[0].value.substring(12)
    // console.log(file_name)
    $(".upload_label p button").text(
      "only pdf format with maximum sizeof 5 MB"
    );
  })
  .on("mouseover", ".home_marq", function () {
    this.stop();
  })
  .on("mouseout", ".home_marq", function () {
    this.start();
  })
  .on("click", ".delete_pdf_item", function () {
    // var url = g1.url.parse(location.href)
    _file_to_delete = $(this).attr("spec_delete");
    url_update({ to_delete: $(this).attr("file_attr") });
  })
  .on("click", ".delete_pdf", function () {
    var url = g1.url.parse(location.href);
    // $.get($(this).attr('spec_delete'))
    $.get(_file_to_delete);
    $("[file_attr='" + url.searchKey.to_delete + "']").remove();
    url_update({ to_delete: null });
    $.get("files_list", function (data) {
      if (data.length == 0) {
        $("#_delete_modal").text("No files to delete");
      }
      // console.log(data.length)
    });
  })
  .on("click", ".close", function () {
    $(".video_pause").each(function () {
      $(this).get(0).pause();
    });
  });

var Upload = function (file) {
  // alert('file')
  this.file = file;
};
Upload.prototype.getType = function () {
  return this.file.type;
};
Upload.prototype.getSize = function () {
  return this.file.size;
};
Upload.prototype.getName = function () {
  // alert('header_data')
  return this.file.name;
};
Upload.prototype.doUpload = function () {
  var formData = new FormData();
  formData.append("file", this.file);
  $.ajax({
    url: "upload",
    type: "POST",
    data: formData,
    contentType: false,
    processData: false,
    async: false,
  }).done(function () {
    document.getElementById("pdf_file").value = "";
  });
};

// $.get('ticker_msg', function (data) {
//   $('.ticker_msg').text(data[0].Msg)
// })

$.get("amethi_ticker_msg", function (data) {
  $(".amethi_ticker_msg").text(data[0].Msg);
});

function saveToDb(page, msg) {
  $.ajax({
    url: "ticker_data",
    type: "PUT",
    // headers: xsrf_token,
    data: { dashboard: page, msg: msg },
  });
  update_ticker_text();
}

function saveToDbAmethi(msg) {
  $.ajax({
    url: "amethi_ticker_msg",
    type: "PUT",
    // headers: xsrf_token,
    data: { Id: 1, Msg: msg },
  });
}

function url_update(uri) {
  var clear_url = g1.url.parse(location.href).update(uri);
  history.pushState({}, "", clear_url.toString());
}
