/* globals moment, UI */

var data_update_stepnumber = 0;
var TRACKCHECK;
var stage_stepnumber_mapping = {
  fetch: 1,
  merge: 2,
  calculate: 2,
  save: 2,
  push: 3,
};
$(document)
  .ready(function () {
    latest_data_update_track();
  })
  .on("change", "#filter_dashboard", function () {
    let dashboard_id = $(this).val();
    dashboard_indicators(dashboard_id);
    $(".checkallIndicatorCheckboxes").prop("checked", false);
  })
  .on("change", ".selectall_indicator_checkbox", function () {
    $(this)
      .closest("table")
      .find(".indicator_checkbox")
      .prop("checked", $(this).prop("checked"));
  })
  .on("change", ".checkallIndicatorCheckboxes", function () {
    let district_table = $(".district_indicatorsTable");
    let block_table = $(".block_indicatorsTable");
    district_table
      .find(".indicator_checkbox")
      .prop("checked", $(this).prop("checked"));
    block_table
      .find(".indicator_checkbox")
      .prop("checked", $(this).prop("checked"));
    district_table
      .find(".selectall_indicator_checkbox")
      .prop("checked", $(this).prop("checked"));
    block_table
      .find(".selectall_indicator_checkbox")
      .prop("checked", $(this).prop("checked"));
  })
  // .on("click", ".fetch_indicator", function () {
  //   let indicator_ids = [];
  //   let ind_id = $(this).closest("tr").attr("data-indicator_id");
  //   let indicators_for = $(this).closest("table").attr("data-indicators_for");
  //   indicator_ids.push(ind_id);
  //   fetch_indicators(indicator_ids, indicators_for);
  // })
  // .on("click", ".fetch_all_indicator", function () {
  //   let district_table = $(".district_indicatorsTable");
  //   let block_table = $(".block_indicatorsTable");
  //   let district_indicator_ids = [];
  //   let block_indicator_ids = [];
  //   let ind_id;
  //   let district_ind_count = district_table.find(".indicator_checkbox").length
  //   let selected_district_ind_count = district_table.find(".indicator_checkbox:checked").length
  //   let block_ind_count = block_table.find(".indicator_checkbox").length
  //   let selected_block_ind_count = block_table.find(".indicator_checkbox:checked").length

  //   if (selected_district_ind_count){
  //     if (district_ind_count == selected_district_ind_count) {
  //       district_indicator_ids.push('All')
  //     }else{
  //       district_table.find(".indicator_checkbox:checked").each(function () {
  //         ind_id = $(this).closest("tr").attr("data-indicator_id");
  //         district_indicator_ids.push(ind_id);
  //       });
  //     }
  //   }

  //   if (selected_block_ind_count){
  //     if (block_ind_count == selected_block_ind_count) {
  //       block_indicator_ids.push('All')
  //     } else{
  //       block_table.find(".indicator_checkbox:checked").each(function () {
  //         ind_id = $(this).closest("tr").attr("data-indicator_id");
  //         block_indicator_ids.push(ind_id);
  //       });
  //     }
  //   }

  //   if (selected_district_ind_count || selected_block_ind_count) {
  //     fetch_indicators(district_indicator_ids, block_indicator_ids);
  //   } else {
  //     alert("Please select Indicators");
  //     return
  //   }
  // })
  .on("click", ".retryfetchIndicators", function () {
    retryfetchIndicators();
  })
  .on("click", ".saveInDB", function () {
    let tracker_id = $("#dataScreen").attr("data-tracker_id");
    let parent_id = $("#dataScreen").attr("data-parent_id");
    start_save_process(tracker_id, parent_id, true);
  })
  .on("click", ".pushtoProd", function () {
    let tracker_id = $("#dataScreen").attr("data-tracker_id");
    let parent_id = $("#dataScreen").attr("data-parent_id");
    start_push_process(tracker_id, parent_id, true);
  })
  .on("click", ".draftProcess", function () {
    draft_process();
  })

  .on("click", ".data-update-steps", function () {
    let step = this.getAttribute("value");
    let screen_data = { data_update_stepnumber: data_update_stepnumber };
    if (step == "back") {
      data_update_stepnumber -= 1;
      screen_data["data_update_stepnumber"] = data_update_stepnumber;
      render_data_update_screen(screen_data);
    } else if (step == "next") {
      if (data_update_stepnumber == 0) {
        let sel_ind = get_selected_indicators();
        let mandatory_elements = [
          { selector: "#filter_dashboard", type: "select", label: "Dashboard" },
          { selector: "#fromdate", type: "text", label: "From date" },
          { selector: "#todate", type: "text", label: "To date" },
          {
            selector: ".indicator_checkbox",
            type: "checkbox",
            label: "Indicator",
          },
        ];
        let v = validate_submission(mandatory_elements);
        let is_valid = v.is_valid;
        if (is_valid == true) {
          fetch_indicators(sel_ind);
          data_update_stepnumber += 1;
        }
      } else if (data_update_stepnumber == 1) {
        let tracker_id = $("#dataScreen").attr("data-tracker_id");
        let parent_id = $("#dataScreen").attr("data-parent_id");
        start_save_process(tracker_id, parent_id);
        data_update_stepnumber += 1;
      } else if (data_update_stepnumber == 2) {
        let tracker_id = $("#dataScreen").attr("data-tracker_id");
        let parent_id = $("#dataScreen").attr("data-parent_id");
        start_push_process(tracker_id, parent_id);
        data_update_stepnumber += 1;
      }
      // render_data_update_screen(screen_data)
    }
  })
  .on("click", ".downloadData", function () {
    download_fetched_data();
  })
  .on("click", ".cancelData", function () {
    let tracker_id = $("#dataScreen").attr("data-tracker_id");
    // let parent_id = $("#dataScreen").attr("data-parent_id");
    cancel_data_update(tracker_id);
  })
  .on("click", ".HomePage", function () {
    window.location.reload();
  })
  .on("click", "#show_updated_history", function () {
    $("#HistoryModal").modal("toggle");
    get_data_updated_history();
  })
  .on("click", ".takeAction", function () {
    show_loader();
    setTimeout(() => {
      let tid = $(this).attr("data-tracker_id");
      get_track(tid);
      $("#HistoryModal").modal("toggle");
    }, 1000);
  })
  .on("click", "#uploadfiles_btn", function () {
    let upload_url = "upload";
    let dropzone_selector = "#fileupload_dropzone";
    let tracker_id = $("#dataScreen").attr("data-tracker_id");
    let parent_id = $("#dataScreen").attr("data-parent_id");
    let dashboard_id = $("#dataScreen").attr("data-dashboard_id");
    UI.set_dropzone(
      dropzone_selector,
      upload_url,
      tracker_id,
      parent_id,
      dashboard_id
    );
  });

function default_load_functions() {
  dashboard_indicators();
  UI.load_calendar();
}

function show_loader() {
  $(".upload_screen_loader").show();
}
function hide_loader() {
  $(".upload_screen_loader").hide();
}

function dashboard_indicators(dashboard_id = null) {
  show_loader();
  let req_params = {};
  if (dashboard_id) {
    req_params["dashboard_id"] = dashboard_id;
  }
  $.ajax({
    type: "GET",
    url: "dashboard_indicator_names",
    data: req_params,
    dataType: "json",
    success: function (response) {
      // console.log("response", response);
      let dashboard_selection = {};
      dashboard_selection["all_dashboards"] = response["all_dashboards"];
      dashboard_selection["dashboard_id"] = response["dashboard_id"];
      load_dashboard_selection(dashboard_selection);
      render_indicators_table(
        "#district_indicators_table_template",
        response["district_indicators"],
        "district"
      );
      render_indicators_table(
        "#block_indicators_table_template",
        response["block_indicators"],
        "block"
      );
      hide_loader();
      // return response;
    },
    error: function () {
      hide_loader();
      // console.log(jqXHR, exception);
      alert("Server Error !!");

      // return {};
    },
  });
}

function load_dashboard_selection(data) {
  $("#dashboard_selection_template").template({ data: data });
}
function render_indicators_table(template_selector, data, indicators_for) {
  // if(data && data.length > 0){
  $(template_selector).template({ data: data, indicators_for: indicators_for });
  // }
}

function get_selected_indicators() {
  let district_table = $(".district_indicatorsTable");
  let block_table = $(".block_indicatorsTable");
  let district_indicator_ids = [];
  let block_indicator_ids = [];
  let ind_id;
  let district_ind_count = district_table.find(".indicator_checkbox").length;
  let selected_district_ind_count = district_table.find(
    ".indicator_checkbox:checked"
  ).length;
  let block_ind_count = block_table.find(".indicator_checkbox").length;
  let selected_block_ind_count = block_table.find(
    ".indicator_checkbox:checked"
  ).length;

  if (selected_district_ind_count) {
    if (district_ind_count == selected_district_ind_count) {
      district_indicator_ids.push("All");
    } else {
      district_table.find(".indicator_checkbox:checked").each(function () {
        ind_id = $(this).closest("tr").attr("data-indicator_id");
        district_indicator_ids.push(ind_id);
      });
    }
  }

  if (selected_block_ind_count) {
    if (block_ind_count == selected_block_ind_count) {
      block_indicator_ids.push("All");
    } else {
      block_table.find(".indicator_checkbox:checked").each(function () {
        ind_id = $(this).closest("tr").attr("data-indicator_id");
        block_indicator_ids.push(ind_id);
      });
    }
  }

  if (selected_district_ind_count || selected_block_ind_count) {
    // fetch_indicators(district_indicator_ids, block_indicator_ids);
    return {
      district_indicator_ids: district_indicator_ids,
      block_indicator_ids: block_indicator_ids,
    };
  } else {
    alert("Please select Indicators");
    return { district_indicator_ids: [], block_indicator_ids: [] };
  }
}

function validate_submission(mandatory_elements = []) {
  let is_valid = true;
  let errors = [];
  mandatory_elements.forEach(function (item, index) {
    let selector = item.selector;
    let type = item.type;
    let label = item.label;
    if (selector.startsWith("#")) {
      let val = $(selector).val();
      if (!val) {
        is_valid = false;
        errors.push(label);
      }
    } else if (selector.startsWith(".") && type == "checkbox") {
      let checked_count = $(selector + ":checked").length;
      if (checked_count == 0) {
        is_valid = false;
        errors.push(label);
      }
    }
  });
  return { is_valid: is_valid, errors: errors };
}

function fetch_indicators(selected_indicators) {
  show_loader();
  let district_indicator_ids = selected_indicators.district_indicator_ids || [];
  let block_indicator_ids = selected_indicators.block_indicator_ids || [];
  let mandatory_elements = [
    { selector: "#filter_dashboard", type: "select", label: "Dashboard" },
    { selector: "#fromdate", type: "text", label: "From date" },
    { selector: "#todate", type: "text", label: "To date" },
    { selector: ".indicator_checkbox", type: "checkbox", label: "Indicator" },
  ];
  let validation = validate_submission(mandatory_elements);
  let is_valid = validation.is_valid;
  let validation_errors = validation.errors || [];
  if (is_valid == true && (district_indicator_ids || block_indicator_ids)) {
    let req_params = {};
    req_params["district_indicator_ids"] = district_indicator_ids;
    req_params["block_indicator_ids"] = block_indicator_ids;
    // req_params["indicators_for"] = indicators_for;
    req_params["dashboard_id"] = $("#filter_dashboard").val();
    req_params["dashboard_name"] = $("#filter_dashboard")
      .find("option:selected")
      .attr("data-dashboard_name");
    let fromdate = $("#fromdate").val();
    let todate = $("#todate").val();
    req_params["fromdate"] = moment(fromdate, "MMMM-YYYY").format("YYYY-MM-01");
    req_params["todate"] = moment(todate, "MMMM-YYYY").format("YYYY-MM-01");
    let todate_mnth = moment(todate, "MMMM-YYYY").month() + 1;
    let todate_yr = moment(todate, "MMMM-YYYY").year();
    let year = todate_mnth <= 3 ? todate_yr - 1 : todate_yr;
    req_params["year"] = year.toString(); // financial year start
    $.ajax({
      type: "POST",
      url: "fetch_indicators_data",
      data: req_params,
      dataType: "json",
      success: function (response) {
        // if(response && response.status){
        setTimeout(() => {
          hide_loader();
          latest_data_update_track();
          activate_check_track();
        }, 5000);
        // }
      },
      error: function () {
        hide_loader();
        alert("Server Error");
      },
    });
  } else {
    alert("Please choose " + validation_errors);
  }
}

function start_save_process(tracker_id, parent_id, is_retry = false) {
  show_loader();
  if (!tracker_id) return;
  let req_params = {};
  req_params["tracker_id"] = tracker_id;
  req_params["parent_id"] = parent_id;
  req_params["is_retry"] = is_retry;
  $.ajax({
    type: "POST",
    url: "start_save_process",
    data: req_params,
    dataType: "json",
    success: function (resp) {
      let screen_data = {
        data_update_stepnumber: data_update_stepnumber,
        stage: "",
        status: "",
      };
      if (resp && Object.keys(resp).length > 0) {
        let stage = "merge";
        data_update_stepnumber = 2;
        screen_data = resp;
        screen_data["data_update_stepnumber"] = data_update_stepnumber;
        screen_data["stage"] = stage;
        screen_data["request_data"] = resp.screen_data
          ? JSON.parse(resp.screen_data)
          : {};
        // if (resp.status != 'open') {
        //   deactivate_check_track()
        // } else if (resp.status == 'open') {
        //   activate_check_track()
        // }
      }
      setTimeout(() => {
        hide_loader();
        latest_data_update_track();
        activate_check_track();
      }, 5000);

      // return response;
    },
    error: function () {
      hide_loader();
      alert("Server Error");
      return {};
    },
  });
}
function start_push_process(tracker_id, parent_id, is_retry = false) {
  show_loader();
  if (!tracker_id) return;
  let req_params = {};
  req_params["tracker_id"] = tracker_id;
  req_params["parent_id"] = parent_id;
  req_params["is_retry"] = is_retry;
  $.ajax({
    type: "POST",
    url: "start_push_process",
    data: req_params,
    dataType: "json",
    success: function (resp) {
      let screen_data = {
        data_update_stepnumber: data_update_stepnumber,
        stage: "",
        status: "",
      };
      if (resp && Object.keys(resp).length > 0) {
        let stage = "merge";
        data_update_stepnumber = 2;
        screen_data = resp;
        screen_data["data_update_stepnumber"] = data_update_stepnumber;
        screen_data["stage"] = stage;
        screen_data["request_data"] = resp.screen_data
          ? JSON.parse(resp.screen_data)
          : {};
        // if (resp.status != 'open') {
        //   deactivate_check_track()
        // } else if (resp.status == 'open') {
        //   activate_check_track()
        // }
      }
      setTimeout(() => {
        hide_loader();
        latest_data_update_track();
        activate_check_track();
      }, 5000);

      // return response;
    },
    error: function () {
      hide_loader();
      alert("Server Error");
      return {};
    },
  });
}

function render_data_update_screen(screen_data) {
  $("#data_update_screens")
    .off()
    .on("template", function () {
      // get_financial_years();
      // update_steps();
      $(".nextBtn").prop("disabled", true);
      $(".nextBtn").addClass("cursor-not-allowed");
      if (data_update_stepnumber == 0) {
        default_load_functions();
        $(".nextBtn").prop("disabled", false);
        $(".nextBtn").removeClass("cursor-not-allowed");
      }
      if (screen_data.status == "success") {
        $(".nextBtn").prop("disabled", false);
        $(".nextBtn").removeClass("cursor-not-allowed");
      }
    })
    .template({
      screen_data: screen_data,
    });
}

function latest_data_update_track(is_async = true) {
  let screen_data = {};
  $.ajax({
    type: "GET",
    async: is_async,
    url: "latest_data_update_track",
    dataType: "json",
    contentType: "application/json",
    success: function (resp) {
      screen_data = {
        data_update_stepnumber: data_update_stepnumber,
        stage: "",
        status: "",
      };
      if (resp && Object.keys(resp).length > 0) {
        let stage = resp.stage;
        screen_data = resp;
        data_update_stepnumber =
          stage_stepnumber_mapping[stage] || data_update_stepnumber;
        screen_data["data_update_stepnumber"] = data_update_stepnumber;
        screen_data["request_data"] = resp.request_data
          ? JSON.parse(resp.request_data)
          : {};
        if (resp.status != "open") {
          deactivate_check_track();
        } else if (resp.status == "open") {
          deactivate_check_track();
          activate_check_track();
        }
      } else if (data_update_stepnumber == 2) {
        deactivate_check_track();
        window.location.reload();
      }
      // screen_data['status'] = 'success';
      render_data_update_screen(screen_data);
      // hide_loader();
      return screen_data;
    },
    error: function () {
      hide_loader();
      alert("Server error");
    },
  });
  return screen_data;
}

function cancel_data_update(tracker_id) {
  data_update_stepnumber -= 1;
  show_loader();
  $.ajax({
    type: "POST",
    url: "cancel_data_update",
    data: { tracker_id: tracker_id },
    dataType: "json",
    success: function (resp) {
      window.location.reload();
      latest_data_update_track();
      hide_loader();
    },
    error: function () {
      hide_loader();
      alert("Server error");
    },
  });
}

function retryfetchIndicators() {
  let req_params = {};
  let tracker_id = $("#dataScreen").attr("data-tracker_id");
  let parent_id = $("#dataScreen").attr("data-parent_id");
  data_update_stepnumber -= 1;
  show_loader();
  if (!tracker_id) return;
  req_params["tracker_id"] = tracker_id;
  req_params["parent_id"] = parent_id;
  $.ajax({
    type: "POST",
    url: "retryfetchIndicators",
    data: req_params,
    dataType: "json",
    // contentType: "application/json",
    success: function (resp) {
      setTimeout(() => {
        hide_loader();
        latest_data_update_track();
        activate_check_track();
      }, 5000);
    },
    error: function () {
      hide_loader();
      alert("Server error");
    },
  });
}

// function mark_data_upload_complete(){
//   show_loader()
//   $.ajax({
//     type: "GET",
//     url: "mark_data_upload_complete",
//     dataType: "json",
//     contentType: "application/json",
//     success: function (resp) {
//       hide_loader();
//       window.location.reload();
//     },
//     error: function () {
//       hide_loader();
//       alert("Server error")
//     },
//   });
// }

function activate_check_track() {
  TRACKCHECK = setTimeout(function () {
    latest_data_update_track();
  }, 60000);
}
function deactivate_check_track() {
  clearTimeout(TRACKCHECK);
}

function download_fetched_data() {
  let req_params = {};
  let tracker_id = $("#dataScreen").attr("data-tracker_id");
  show_loader();
  if (!tracker_id) return;
  req_params["tracker_id"] = tracker_id;
  $.ajax({
    url: "download_data",
    method: "POST",
    data: req_params,
    dataType: "binary",
    xhrFields: {
      responseType: "blob",
    },
    // processData: false,
    // contentType: 'application/json;charset=UTF-8',
    success: function (data, status, xhr) {
      if (data && data.status) {
        alert("Server Error");
        return;
      }
      let a = document.createElement("a");
      let url = window.URL.createObjectURL(data);
      a.href = url;
      var filename = "";
      var disposition = xhr.getResponseHeader("Content-Disposition");
      if (disposition && disposition.indexOf("attachment") !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1])
          filename = matches[1].replace(/['"]/g, "");
      }
      a.download = filename;
      document.body.append(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      hide_loader();
    },
    error: function (error) {
      hide_loader();
      alert("Server Error!!");
    },
  });
}

function get_data_updated_history() {
  let column_names = [
    "dashboard_name",
    "fromdate",
    "todate",
    "updated_at",
    "stage",
    "",
  ];
  $("#dataupdatedHistory_table").DataTable({
    bDestroy: true,
    processing: true,
    serverSide: true,
    order: [[3, "desc"]],
    searching: false,
    responsive: true,
    ajax: function (data, callback) {
      var search_data = {};
      search_data["order"] =
        column_names[data.order[0].column] + " " + data.order[0].dir;
      search_data["offset"] = data.start || 0;
      search_data["limit"] = data.length || 10;
      // search_data['global_search'] = data.search.value || "";
      $.ajax({
        type: "GET",
        url: "get_data_updated_history",
        data: search_data,
        dataType: "json",
        success: function (result) {
          var totalRecords = result.total_count || 0;
          var resultData = {};
          resultData["draw"] = data["draw"];
          resultData["recordsTotal"] = totalRecords;
          resultData["recordsFiltered"] = totalRecords;
          resultData["data"] = result.data;
          callback(resultData);
        },
        error: function () {
          alert("Server Error !!");
        },
      });
    },
    columnDefs: [
      { targets: [0], orderable: false },
      { targets: [1], orderable: false },
      { targets: [2], orderable: false },
      { targets: [4], orderable: false },
      { targets: [5], orderable: false },
    ],
    columns: [
      { data: "dashboard_name" },
      {
        data: "fromdate",
        render: function (data) {
          let s = moment(data, "YYYY-MM-01").format("MMMM-YYYY");
          return s;
        },
      },
      {
        data: "todate",
        render: function (data) {
          let s = moment(data, "YYYY-MM-01").format("MMMM-YYYY");
          return s;
        },
      },
      {
        data: "updated_at",
        render: function (data) {
          let s = moment(data).format("D MMMM YYYY, [at] h:mm:ss A");
          return s;
        },
      },
      {
        data: "stage",
        render: function (data, type, row, meta) {
          let tid = row.tracker_id;
          let status = row.status;
          let status_class_name = "";
          let str = " ";
          if (status == "success") {
            status_class_name = "text-success";
            if (data == "save") {
              str = " in Test DB Completed";
            } else if (data == "push") {
              str = " to Prod DB Completed";
            } else {
              str = " Completed";
            }
          } else if (status == "failed") {
            status_class_name = "text-danger";
          } else {
            str = " ...";
            status_class_name = "text-danger";
          }

          let s = `<span class="font-bold ${status_class_name}" data-tracker_id=${tid}><span class="text-capitalize">${data}</span>${str}</span><span></span>`;
          return s;
        },
      },
      {
        data: "",
        render: function (data, type, row, meta) {
          let tid = row.tracker_id;
          let s;
          if (row.is_completed == 1) {
            s = `<span class="font-bold">Done</span>`;
          } else {
            s = `<button type="button" class="btn btn-outline-secondary btn-sm takeAction font-weight-bold" data-tracker_id=${tid}>Next action </button>`;
          }
          return s;
        },
      },
    ],
  });
}

function draft_process() {
  show_loader();
  let tracker_id = $("#dataScreen").attr("data-tracker_id");
  let parent_id = $("#dataScreen").attr("data-parent_id");
  if (!tracker_id) return;
  let req_params = {};
  req_params["tracker_id"] = tracker_id;
  req_params["parent_id"] = parent_id;
  $.ajax({
    type: "POST",
    url: "draft_process",
    data: req_params,
    dataType: "json",
    success: function () {
      hide_loader();
      window.location.reload();
    },
    error: function () {
      hide_loader();
      alert("Server error");
    },
  });
}

function get_track(tracker_id) {
  data_update_stepnumber = 0;
  let pending = latest_data_update_track(false);
  if (pending && pending.tracker_id) {
    hide_loader();
    return;
  }
  // let tracker_id = $("#dataScreen").attr("data-tracker_id");
  if (!tracker_id) return;
  let req_params = {};
  req_params["tracker_id"] = tracker_id;
  show_loader();
  $.ajax({
    type: "GET",
    url: "get_track",
    data: req_params,
    dataType: "json",
    success: function (resp) {
      let screen_data = {
        data_update_stepnumber: data_update_stepnumber,
        stage: "",
        status: "",
      };
      if (resp && Object.keys(resp).length > 0) {
        let stage = resp.stage;
        screen_data = resp;
        data_update_stepnumber =
          stage_stepnumber_mapping[stage] || data_update_stepnumber;
        screen_data["data_update_stepnumber"] = data_update_stepnumber;
        screen_data["request_data"] = resp.request_data
          ? JSON.parse(resp.request_data)
          : {};
      }
      render_data_update_screen(screen_data);
      hide_loader();
    },
    error: function () {
      hide_loader();
      alert("Server error");
    },
  });
}
