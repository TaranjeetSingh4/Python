/* global user_data, district_ranking, UI, url_update, division_district_map, district_name_mapping */
/* global url:true, total:true, prof_dist, get_latest_date, defaults */
/* exported url, render_profile_, render_stacks, render_cards, total, dict_ */

var top_bottom_data, district_data, division_data;
var latest_date = get_latest_date(),
  bydomain,
  bytype;

var color_value = {
  availability: "color5",
  coverage: "color2",
  data_quality: "color3",
  quality: "color4",
  ante_natal: "color1",
  communicable_diseases: "color2",
  delivery_care: "color4",
  family_planning: "color4",
  finance: "color5",
  immunization: "color6",
  post_natal_care: "color1",
};

$(".container1_dropdown")
  .on("template")
  .template({
    data: UI.create_data_structure("district_list"),
  });
$(".data_last_updated").html("Data last updated on " + latest_date);

function render_profile_(url) {
  var _dist = url.searchKey.district || "Agra";
  _dist = prof_dist[_dist] === undefined ? _dist : prof_dist[_dist];
  $(".profile_")
    .on("template", function () {
      // url.searchKey.district === undefined ? $('.profile').hide() :
      $(".profile").show();
    })
    .template({
      data: UI.get_profile_data(_dist),
    });
}

_.includes([undefined, "", "no"], url.searchKey.tb_toggle)
  ? $("#switch-district").click()
  : "";
// render profile page with data
// render cards with data
function render_cards(url, cards_container) {
  $(".cards_data")
    .on("template", function () {
      _.each($(".wrap_text"), function (d) {
        if ($(d).text().trim().length > 15) {
          $(d).attr("style", "font-size: 50%");
        } else if (
          $(d).text().trim().length > 10 &&
          $(d).text().trim().length < 15
        ) {
          $(d).attr("style", "font-size: 75%");
        }
      });
      $(".loading-icon").hide();
    })
    .template({
      cards: cards_container,
    });
}

// render top and bottom horizontal bar with data
function render_top_bottom(url, top_bottom, type, by_value) {
  render_profile_(url);
  if (by_value != "state") {
    $(".bars").hide();
    $("#switch2").hide();
  } else {
    $(".bars").hide();
    $("#switch2").show();
  }
  if (type == "district") {
    $(".bars").show();
    $(".bars_data").off();
    $(".bars_data")
      .on("template", function () {
        // _.lowerCase(_.split($('#dis_div_name').text().trim(), '-')[1].trim()) === "uttar pradesh" ? $('.compo_score').hide() :  $('.compo_score').show()
        url.searchKey.filter_type === "type"
          ? $(".db").text("By Type")
          : $(".db").text("By Domain");
        var min_ =
          $(".perf_bar")
            .eq($(".perf_bar").length - 1)
            .attr("id") == undefined
            ? 0
            : parseFloat(
                $(".perf_bar")
                  .eq($(".perf_bar").length - 1)
                  .attr("id")
                  .trim()
              );
        var max_ =
          $(".perf_bar").eq(0).attr("id") == undefined
            ? 0
            : parseFloat($(".perf_bar").eq(0).attr("id").trim());
        if (top_bottom.length != 0) {
          min_ = _.minBy(top_bottom, "composite_index").composite_index;
          max_ = _.maxBy(top_bottom, "composite_index").composite_index;
        }
        var a = d3.scaleLinear().domain([min_, max_]).range([30, 100]);
        _.each($(".perf_bar"), function (d) {
          var b = _.find(top_bottom, [
            "composite_index",
            parseFloat($(d).attr("id").trim()),
          ]);
          if (_.isObject(b)) {
            $(d).attr(
              "style",
              "width:" + a(parseFloat($(d).attr("id").trim())) + "% !important"
            );
          }
        });
        if (
          url.searchKey.district === undefined ||
          url.searchKey.district === "Uttar Pradesh"
        ) {
          $(".performing_type").text("Districts");
          _.each($(".perf_bar"), function (d) {
            // console.log(d)
            $(d).attr("href", "?district=" + $(d).attr("data-attr"));
          });
          $(".loading-icon").hide();
        } else {
          $(".performing_type").text("Blocks");
          _.each($(".perf_bar"), function (d) {
            $(d).removeAttr("href");
          });
          $(".performing_text").html("");
          $(".perf_bar").length == 10
            ? $(".performing_text").html(
                '<span class="text-success_"> Top 5</span> and <span class="color-red"> bottom 5</span class="font-weight-bold text-uppercase text-dark"> Performing <span class="performing_type">Blocks</span>'
              )
            : $(".performing_text").html(
                "Performance of " +
                  $(".perf_bar").length +
                  "<span class='performing_type'> Blocks</span>"
              );
        }
        if (top_bottom.length === 0) {
          $(".progress").parent().html("No Data Available");
          // $('.bars').html("No Data Available")
          $(".progress").parent().css("text-align", "center");
          // $('.bars').css("text-align", "center")
        }
        bars_clicking(url);
        if (top_bottom.length === 0) {
          $(".perf_bar").hide();
          $(".no_data_").show();
        } else {
          $(".no_data_").hide();
          $(".perf_bar").show();
        }
      })
      .template({
        data: top_bottom,
        type_: type,
        by_value: by_value,
      });
  } else {
    $(".bars").show();
    $(".bars_data2").off();
    $(".bars_data2")
      .on("template", function () {
        !_.includes([undefined, ""], url.searchKey.division)
          ? $(".legend_value").show()
          : $(".legend_value").hide();
        url.searchKey.filter_type === "type"
          ? $(".db").text("By Type")
          : $(".db").text("By Domain");
        var min_ =
          $(".perf_bar")
            .eq($(".perf_bar").length - 1)
            .attr("id") == undefined
            ? 0
            : parseFloat(
                $(".perf_bar")
                  .eq($(".perf_bar").length - 1)
                  .attr("id")
                  .trim()
              );
        var max_ =
          $(".perf_bar").eq(0).attr("id") == undefined
            ? 0
            : parseFloat($(".perf_bar").eq(0).attr("id").trim());
        if (top_bottom.length != 0) {
          min_ = _.minBy(top_bottom, "composite_index").composite_index;
          max_ = _.maxBy(top_bottom, "composite_index").composite_index;
        }
        var a = d3.scaleLinear().domain([min_, max_]).range([30, 100]);
        // debugger
        _.each($(".perf_bar"), function (d) {
          var b = _.find(top_bottom, [
            "composite_index",
            parseFloat($(d).attr("id").trim()),
          ]);
          if (_.isObject(b)) {
            $(d).attr(
              "style",
              "width:" + a(parseFloat($(d).attr("id").trim())) + "% !important"
            );
          }
        });
        if (
          url.searchKey.district === undefined ||
          url.searchKey.district === "Uttar Pradesh"
        ) {
          $(".performing_type").text("Districts");
          _.each($(".perf_bar"), function (d) {
            $(d).attr("href", "?district=" + $(d).attr("data-attr"));
          });
          $(".loading-icon").hide();
        } else {
          $(".performing_type").text("Blocks");
          _.each($(".perf_bar"), function (d) {
            $(d).removeAttr("href");
          });
          $(".performing_text").html("");
          // $('.perf_bar').length == 10 ? $('.performing_text').html('<span class="text-success_"> Top 5</span> and <span class="color-red"> bottom 5</span class="font-weight-bold text-uppercase text-dark"> Performing <span class="performing_type">Blocks</span>') : $('.performing_text').html("Performance of " + $('.perf_bar').length + "<span class='performing_type'> Blocks</span>")
        }
        bars_clicking(url);
        if (top_bottom.length === 0) {
          $(".progress").parent().html("No Data Available");
          // $('.bars').html("No Data Available")
          $(".progress").parent().css("text-align", "center");
          // $('.bars').css("text-align", "center")
        }
      })
      .template({
        data: top_bottom,
        type_: type,
        by_value: by_value,
      });
  }
}

// main function
function render(url, up, data, cm_date, data_selectedby, _type) {
  // var data = UI.create_data_structure('complete_data')
  // if(url.searchKey.division != undefined || url.searchKey.district != undefined) {
  //   $("#trend_img_pos").removeClass()
  //   $("#trend_img_pos").addClass("d-none")
  //   $("#map_img_pos").removeClass()
  //   $("#map_img_pos").addClass("d-none")
  // }
  click_tb();
  url.searchKey.card_toggle === "yes" ? $("#switch-domain").click() : "";
  var by_value = data_selectedby;
  $(".header_row").show();
  $(".no_data").hide();
  var __type = cm_date;
  if (_type !== "date") {
    __type = parseInt(cm_date);
  }
  if (
    up === undefined ||
    up.overall === undefined ||
    up.overall.length === 0 ||
    (up.overall.length === 1 && up.overall[0][_type] !== __type)
  ) {
    $(".header_row").hide();
    $(".no_data").show();
  }
  if (data === undefined || data.top_bottom_52.length === 0) {
    if (
      data === undefined ||
      data.overall === undefined ||
      (data.overall !== undefined && data.overall.length !== 2)
    ) {
      // debugger
      // if(data !== undefined){
      render_top_bottom(url, [], "district", by_value);
      // }
    }
  } else if (data_selectedby == "state") {
    $(".with_out_map").show();
    // fetch all the data from backend
    if (data === undefined) {
      $(".loading-icon").hide();
    }
    // top and bottom horizontal bars data
    var top_bottom_district = _.each(data.top_bottom_52, function (d, i) {
      d.name = d.block || d.district;
      d.per = d.composite_index;
      d.rank = i + 1;
    });
    var result = [];
    if (top_bottom_district.length >= 10) {
      for (var i = 0; i < 5; i++) {
        result.push(top_bottom_district[i]);
      }
      for (
        var j = top_bottom_district.length - 5;
        j < top_bottom_district.length;
        j++
      ) {
        result.push(top_bottom_district[j]);
      }
    } else {
      result = top_bottom_district;
    }

    var top_bottom_division = _.each(
      data.top_bottom_5_division,
      // _.filter(data.top_bottom_5_division, function(d1) { return d1.date == cm_date })
      function (d, i) {
        d.name = d.block || d.division;
        d.per = d.composite_index;
        d.rank = i + 1;
      }
    );
    var result2 = [];
    if (top_bottom_division.length >= 10) {
      for (i = 0; i < 5; i++) result2.push(top_bottom_division[i]);
      for (
        j = top_bottom_division.length - 5;
        j < top_bottom_division.length;
        j++
      ) {
        result2.push(top_bottom_division[j]);
      }
    } else {
      result2 = top_bottom_division;
    }
    render_top_bottom(url, result2, "division", by_value);
    render_top_bottom(url, result, "district", by_value);
  } else if (data_selectedby == "division") {
    $(".with_out_map").show();
    // fetch all the data from backend
    if (data === undefined) {
      $(".loading-icon").hide();
    }
    // console.log("by division_selectded")
    top_bottom_division = _.each(data.top_bottom_52, function (d, i) {
      d.name = d.block || d.division || d.district;
      d.per = d.composite_index;
      d.rank = i + 1;
    });
    result2 = [];
    if (top_bottom_division.length >= 10) {
      for (i = 0; i < 5; i++) {
        result2.push(top_bottom_division[i]);
      }
      for (
        j = top_bottom_division.length - 5;
        j < top_bottom_division.length;
        j++
      ) {
        result2.push(top_bottom_division[j]);
      }
    } else {
      result2 = top_bottom_division;
    }
    render_top_bottom(url, result2, "division", by_value);
  } else if (data_selectedby == "district") {
    // console.log("by district_selectded")
    $(".with_out_map").show();
    // fetch all the data from backend

    if (data === undefined) {
      $(".loading-icon").hide();
    }
    // top and bottom horizental bars data
    top_bottom_district = _.each(data.top_bottom_52, function (d, i) {
      d.name = d.block || d.district;
      d.per = d.composite_index;
      d.rank = d.composite_rank || i + 1;
    });
    result = [];
    if (top_bottom_district.length >= 10) {
      for (i = 0; i < 5; i++) result.push(top_bottom_district[i]);
      for (
        j = top_bottom_district.length - 5;
        j < top_bottom_district.length;
        j++
      ) {
        result.push(top_bottom_district[j]);
      }
    } else {
      result = top_bottom_district;
    }
    // calling division for rendering the chart in first block--
    render_top_bottom(url, result, "division", by_value);
  }
}

function master() {
  $(".loading-icon").show();
  url = g1.url.parse(location.href);
  if (url.searchKey.state === "Uttar Pradesh") $(".back-button").hide();
  if (
    url.searchKey["division"] === undefined &&
    url.searchKey["district"] === undefined
  ) {
    if (_.includes([undefined, ""], url.searchKey["division"])) {
      url_update({ state: "Uttar Pradesh" });
    }
  }

  var def_date = defaults.date;
  var def_prev_date = moment(def_date)
    .subtract("month", 1)
    .format("YYYY-MM-DD");
  var quarter_ = "";
  var prev_quarter_ = "";
  var year_ = "";
  var prev_year_ = "";
  var filter_type = "date";

  // // If state user hide ES
  // if (!user_data.district && !user_data.division ) {$('#executive_nav').remove()}
  $(".footer").removeClass("d-none");

  if (url.searchKey.month !== "" && url.searchKey.quarter === "") {
    def_date = moment(
      url.searchKey.year + "-" + url.searchKey.month + "-01",
      "YYYY-MMM-DD"
    ).format("YYYY-MM-DD");
    def_prev_date = moment(def_date).subtract("month", 1).format("YYYY-MM-DD");
    $(".calendar_time, .selected_cal").html(
      moment(def_date, "YYYY-MM-DD").format("MMM YYYY")
    );
    filter_type = "date";
  } else if (!_.includes(["", undefined], url.searchKey.quarter)) {
    quarter_ = url.searchKey.quarter[1];
    prev_quarter_ = url.searchKey.prev_quarter[1];
    year_ = url.searchKey.year;
    prev_year_ = quarter_ === "1" ? url.searchKey.prev_year : year_;
    $(".calendar_time, .selected_cal").html(
      url.searchKey.quarter + " " + year_
    );
    def_date = "";
    def_prev_date = "";
    filter_type = "quarter";
  } else if (url.searchKey.quarter === "" && url.searchKey.month === "") {
    year_ = url.searchKey.year;
    prev_year_ = url.searchKey.prev_year;
    $(".calendar_time, .selected_cal").html(year_);
    def_date = "";
    def_prev_date = "";
    filter_type = "year";
  }

  var calendar_filter = {
    division: url.searchKey.division || "",
    district: url.searchKey.district || "",
    date: [def_date, def_prev_date],
    to_quarter: quarter_,
    from_quarter: prev_quarter_,
    to_year: year_,
    from_year: prev_year_,
  };
  // var calendar_filter1 = $.param(calendar_filter, true)
  // render(url)
  //render gauage chart
  render_chart("gauage", calendar_filter, url, calendar_filter, filter_type);
  // bars_clicking(url)
  //render cards chart
  // render_chart("cards", calendar_filter, url)
  // bars_clicking(url)
}

$(".dropdown")
  .on("template", function () {
    var val =
      url.searchKey["district"] || url.searchKey["division"] || "Uttar Pradesh";
    $(".back-button").hide();
    $("#top-panel").text(val);
    if (
      _.includes(
        Object.keys(district_name_mapping),
        $("#top-panel").text().trim()
      )
    )
      $("#top-panel").text(
        district_name_mapping[$("#top-panel").text().trim()]
      );
  })
  .template({
    overall: "Uttar Pradesh",
    data: division_district_map(),
    filter: "division",
    param: "district",
    district_name_change: district_name_mapping,
  });
$(".info").template();
$(".insights").template();

$(function () {
  user_login();
});

function user_login() {
  var div_dist = UI.fetch_data("div_dist_map", "");
  var user_ = user_data.map_id;
  let url_div = url.searchKey.division;
  let url_dist = url.searchKey.district;
  if (user_ && !url_div && !url_dist) {
    _.each(div_dist, function (d) {
      if (d.map_id.toString() === user_.toString()) {
        if (user_data.district) {
          url_update({ district: d.district, division: d.division });
        } else if (user_data.division) {
          url_update({ division: d.division });
        }
      }
    });
  }
  master();
}

// $(window).on('popstate', function() {
//   master()
// });

function gauage_chart_legend() {
  $("#legend_gauage_chart").unbind("click");
  $("#legend_gauage_chart").click(function () {
    $(this).toggleClass("clicked");
    var legend_id = $(".legend_value").attr("id");
    if (legend_id != null) {
      $(".legend_data").show();
      $(".legend_value").removeAttr("id");
    } else {
      $(".legend_data").hide();
      $(".legend_value").attr("id", "legend_show");
    }
  });
}

function gauage_chart_config(type, rank, insight) {
  // division template
  var template_content = $("#dis_div_template").html();
  var dis_div_list = _.template(template_content);
  var dis_div_name = type;
  // var dis_div_name = "Mathura"
  var template_data = dis_div_list({
    name: dis_div_name,
    district_name_change: district_name_mapping,
  });
  $("#dis_div_name").html(template_data);
  //insights rank
  template_content = $("#rank_svg_template").html();
  var rank_svg_list = _.template(template_content);
  var insight_rank = rank;
  var template_data2 = rank_svg_list({
    rank: insight_rank,
  });
  $("#rank_svg").html(template_data2);

  // insight template
  template_content = $("#insight_div_template").html();
  var insight_div_list = _.template(template_content);
  var gauage_chart_insight = insight;
  var template_data3 = insight_div_list({
    insights: gauage_chart_insight,
  });
  $("#insight_div_container").html(template_data3);
  //close the legend on load.....
  $("#legend_gauage_chart").trigger("click");
  // restrict the data if  Uttar Pradesh comes
  if (dis_div_name == "Uttar Pradesh") {
    $("#rank_div").hide();
    $("#profile_div").hide();
    $("#insights_div").hide();
  } else {
    $("#rank_div").show();
    $("#profile_div").show();
    $("#insights_div").show();
  }
  //close the laoding icon......
  $(".loading-icon").hide();
}

$(document).on("click", ".dropdown-default", function (event) {
  event.stopPropagation();
  var selected = url.searchKey["division"];
  if (selected !== undefined) {
    url.update({ division: selected }, "division=del");
  }
  selected = url.searchKey["district"];
  if (selected !== undefined) {
    url.update({ district: selected }, "district=del");
  }
  url.update({ state: "Uttar Pradesh" });
  window.history.pushState({}, "", url.toString());
  $(".back-button").hide();
  master();

  $("#indicator-top-bar").hide();
  $("#collapsemain").removeClass("show");
  $("#top-panel").addClass("collapsed");
  $("#deepdive-container").show();
  var val =
    url.searchKey["district"] || url.searchKey["division"] || "Uttar Pradesh";
  $("#top-panel").text(val);
  if (
    _.includes(
      Object.keys(district_name_mapping),
      $("#top-panel").text().trim()
    )
  )
    $("#top-panel").text(district_name_mapping[$("#top-panel").text().trim()]);
});

$(document)
  .on("change", "#switch-district", function () {
    render_count();
  })
  .on("click", ".perf_bar", function () {
    if (_.includes([undefined, ""], url.searchKey.district)) {
      var selected2 = url.searchKey["state"];
      var selected = $(this).attr("data-attr");
      var maping = UI.fetch_data("div_dist_map", { district: selected });
      if (selected2 !== undefined) {
        url.update({ state: selected2 }, "state=del");
        window.history.pushState({}, "", url.toString());
        if ($("#switch-district").prop("checked")) {
          url_update({ district: selected, division: maping[0].division });
        } else {
          url_update({ division: selected });
        }
      } else if (maping.length !== 0) {
        url_update({ district: selected, division: maping[0].division });
      }
      master();
    }
  })
  .on("click", "#myUL li", function () {
    //    var selected2 = url.searchKey['state']
    var selected = $(this).find("span").text().trim();
    var maping = UI.fetch_data("div_dist_map", { district: selected });
    if (selected === "Uttar Pradesh") {
      url_update({ state: selected });
      url.searchKey.division !== undefined
        ? url.update({ division: url.searchKey.division }, "division=del")
        : "";
      url.searchKey.district !== undefined
        ? url.update({ district: url.searchKey.district }, "district=del")
        : "";
      window.history.pushState({}, "", url.toString());
    } else if (maping.length !== 0) {
      url_update({ district: selected, division: maping[0].division });
    }
    master();
    $("#myUL").hide();
    $("#close_nav").click();
    // $('#myInput1').text("")
    // $('#myInput1').hide()
  })
  .on("click", ".dropdown-arrow", function (event) {
    event.stopPropagation();
    $(".back-button").show();
    var selected = url.searchKey["district"];
    if (selected !== undefined) {
      url.update({ district: selected }, "district=del");
    }
    var selected2 = url.searchKey["state"];
    if (selected2 !== undefined) {
      url.update({ state: selected2 }, "state=del");
    }
    var row = {};
    var key = $(this).attr("data-param");
    row[key] = $(this).attr("data-value");
    url.update(row);
    window.history.pushState({}, "", url.toString());
    master();
    $(".loading-icon").hide();
    $("#indicator-top-bar").hide();
    $("#collapsemain").removeClass("show");
    $("#top-panel").addClass("collapsed");
    $("#deepdive-container").show();
  })
  .on("click", ".dropdown-value", function () {
    $(".back-button").show();
    var key = $(this).attr("data-param");
    var row = {};
    row[key] = $(this).attr("data-value");
    key = $(this).attr("parent-param");
    var selected = url.searchKey["state"];
    if (selected !== undefined) {
      url.update({ state: selected }, "state=del");
    }
    row[key] = $(this).attr("parent-value");
    url.update(row);
    window.history.pushState({}, "", url.toString());
    master();
    $(".loading-icon").hide();
    $("#indicator-top-bar").hide();
    $("#collapsemain").removeClass("show");
    $("#top-panel").addClass("collapsed");
    $("#deepdive-container").show();
  })
  .on("template", function () {
    var val =
      url.searchKey["district"] || url.searchKey["division"] || "Uttar Pradesh";
    $("#top-panel").text(val);
    if (
      _.includes(
        Object.keys(district_name_mapping),
        $("#top-panel").text().trim()
      )
    )
      $("#top-panel").text(
        district_name_mapping[$("#top-panel").text().trim()]
      );
  })
  .on("click", ".back-button", function () {
    if (
      !_.includes(
        [undefined, ""],
        g1.url.parse(location.href).searchKey.division
      )
    ) {
      if (_.includes(g1.url.parse(location.href).relative, "#")) history.go(-5);
      else history.go(-4);
      setTimeout(function () {
        master();
      }, 1000);
    } else {
      $.when(history.back()).then(function () {
        url = g1.url.parse(location.href);
        setTimeout(function () {
          master();
        }, 1000);
      });
    }
  })
  .on("click", "#icon", function () {
    $("#myInput1").show();
  })
  .on("click", "#close_nav", function () {
    $("#myInput1").hide();
    document.getElementById("myInput").value = "";
    $("#myUL").hide();
  });
// .on("click", ".ui-autocomplete li", function() {
//   var ele = $(this).find('.ui-menu-item-wrapper').html().trim().toLowerCase()
//   ele = ele.split(' ').join('_')
//   // var target = $('.deepdive-table [href="#'+ele+'"]')
//   // target.find('i').click()
//   $('.deepdive-table [data-val="'+ele+'"]').click()

//   $("#myInput1").hide()
//   document.getElementById("myInput").value = ""
//   $("#myUL").hide()

// })

//only for gauage chart and the cards............
/* global gauage */
function render_chart(type, filter, url, filter_dict, filter_type) {
  // debugger
  if (type == "gauage") {
    // var type_ = url.searchKey.type !== undefined ? url.searchKey.type : ""
    // var indicator_ = url.searchKey.indicator !== undefined ? url.searchKey.indicator : ""
    // yy-mm-dd
    let cmdate = defaults.date;
    let pmdate = moment(defaults.date)
      .subtract("month", 1)
      .format("YYYY-MM-DD");
    var cm_date =
      moment(
        url.searchKey.year + "-" + url.searchKey.month + "-01",
        "YYYY MMM DD"
      ).format("YYYY-MM-DD") === "2001-01-01"
        ? cmdate
        : moment(
            url.searchKey.year + "-" + url.searchKey.month + "-01",
            "YYYY MMM DD"
          ).format("YYYY-MM-DD");
    var pm_date =
      moment(
        url.searchKey.year + "-" + url.searchKey.month + "-01",
        "YYYY MMM DD"
      ).format("YYYY-MM-DD") === "2001-01-01"
        ? pmdate
        : moment(
            moment(
              url.searchKey.year + "-" + url.searchKey.month + "-01",
              "YYYY MMM DD"
            ).format("YYYY-MM-DD")
          )
            .subtract(1, "month")
            .format("YYYY-MM-DD");
    var division = url.searchKey["division"];
    var district = url.searchKey["district"];
    var state =
      url.searchKey["division"] === undefined &&
      url.searchKey["district"] === undefined
        ? "Uttar Pradesh"
        : undefined;
    var dist_div_data = [];
    var filter_ = "";
    if (filter_type === "quarter") {
      filter_ = "_qa";
    } else if (filter_type === "year") {
      filter_ = "_yr";
    }
    var bla = "data";
    if (state == "Uttar Pradesh") {
      var data_selectedby = "state";
      district = "Uttar Pradesh";
      dist_div_data = UI.fetch_data(
        "summary_overall" + filter_,
        $.param(filter, true)
      );
      var up = dist_div_data;
      if (dist_div_data !== undefined) {
        top_bottom_data = dist_div_data;
        var overall_value = dist_div_data.overall;
      } else {
        overall_value = [];
        bla = "nodata";
      }
      if (!_.includes([0], overall_value.length)) {
        $(".legend_value").show();
        if (!_.includes([1], overall_value.length)) {
          var pm_ci_value = overall_value[0].composite_index;
          var cm_ci_value = overall_value[1].composite_index;
          if (!_.includes(["", undefined], url.searchKey.quarter)) {
            if (overall_value[0].year > overall_value[1].year) {
              cm_ci_value = overall_value[0].composite_index;
              pm_ci_value = overall_value[1].composite_index;
            } else if (
              overall_value[0].year === overall_value[1].year &&
              overall_value[0].quarter > overall_value[1].quarter
            ) {
              cm_ci_value = overall_value[0].composite_index;
              pm_ci_value = overall_value[1].composite_index;
            }
          }
        } else {
          cm_ci_value = overall_value[0].composite_index;
          pm_ci_value = overall_value[0].composite_index;
        }
        var composite_score = parseFloat(cm_ci_value.toFixed(2));
        var percentage_change =
          ((_.round(cm_ci_value, 2) - _.round(pm_ci_value, 2)) /
            _.round(pm_ci_value, 2)) *
          100;
        percentage_change = parseFloat(percentage_change.toFixed(2)) || 0;
        var ch_insights = Math.round(percentage_change) + "% vs Previous Month";
        // add the by_domain data for the cards chart
        bydomain = dist_div_data.by_domain;
        // add the by_type data for the cards chart
        bytype = dist_div_data.by_type;
        if (up.overall.length === 1 && up.overall[0].date === pm_date) {
          bydomain = null;
          bytype = null;
        }
      } else {
        $(".loading").hide();
        $(".legend_value").hide();
        bla = "nodata";
      }
      var sel_dis_div_state_name = state;
    } else if (division != null && district == null) {
      data_selectedby = "division";
      top_bottom_data = UI.fetch_data(
        "summary_overall" + filter_,
        $.param(filter, true)
      );
      var filter_new = _.cloneDeep(filter);
      filter_new.date[0] = filter_new.date[1];
      var prev_dist_div_data = UI.fetch_data(
        "summary_overall" + filter_,
        $.param(filter_new, true)
      );
      dist_div_data = top_bottom_data;
      if (dist_div_data !== undefined) {
        overall_value = dist_div_data.overall;
        var prev_overall_value = prev_dist_div_data.overall;
      } else {
        overall_value = [];
        bla = "nodata";
      }
      if (!_.includes([0], overall_value.length)) {
        filter_dict["division"] = "";
        filter_dict["district"] = "";
        filter_dict["block"] = "";
        up = UI.fetch_data(
          "summary_overall" + filter_,
          $.param(filter_dict, true)
        );
        if (overall_value.length !== 1) {
          var up_composite_score = parseFloat(
            up.overall[1].composite_index.toFixed(2)
          );
          pm_ci_value = prev_overall_value[0].composite_index;
          cm_ci_value = overall_value[0].composite_index;
          if (!_.includes(["", undefined], url.searchKey.quarter)) {
            if (prev_overall_value[0].year > overall_value[0].year) {
              cm_ci_value = overall_value[0].composite_index;
              pm_ci_value = prev_overall_value[0].composite_index;
              up_composite_score = parseFloat(
                up.overall[0].composite_index.toFixed(2)
              );
            } else if (
              prev_overall_value[0].year === overall_value[0].year &&
              prev_overall_value[0].quarter > overall_value[0].quarter
            ) {
              cm_ci_value = overall_value[0].composite_index;
              pm_ci_value = prev_overall_value[0].composite_index;
              up_composite_score = parseFloat(
                up.overall[0].composite_index.toFixed(2)
              );
            }
          }
        } else {
          up_composite_score = parseFloat(
            up.overall[0].composite_index.toFixed(2)
          );
          cm_ci_value = overall_value[0].composite_index;
          pm_ci_value = prev_overall_value[0].composite_index;
          // add the by_domain data for the cards chart
        }
        bydomain = dist_div_data.by_domain;
        // add the by_type data for the cards chart
        bytype = dist_div_data.by_type;
        composite_score = parseFloat(cm_ci_value.toFixed(2));
        percentage_change = ((cm_ci_value - pm_ci_value) / pm_ci_value) * 100;
        percentage_change = parseFloat(percentage_change.toFixed(2)) || 0;
        // filter['division'] = division
        var rank_ = UI.fetch_data(
          "summary_division" + filter_,
          $.param(filter, true)
        );
        // var rank = overall_value[1].composite_rank
        var output = _(rank_.top_bottom_52)
          .groupBy("division")
          .map((objs, key) => ({
            division: key,
            composite_index: _.meanBy(objs, "composite_index"),
          }))
          .value();
        output = _.orderBy(output, ["composite_index"], ["desc"]);
        var rank =
          parseInt(_.keys(_.pickBy(output, { division: division }))) + 1;
        url_update({ rank: rank });
        // _.each(output, function(d){
        //   if(d.division === url.searchKey.division){
        //     console.log(d)
        //     rank = _.findIndex(output, d)
        //   }
        // })
        var score_details = "";
        if (composite_score > up_composite_score) {
          score_details = "above";
        } else if (composite_score == up_composite_score) {
          score_details = "same";
        } else if (composite_score < up_composite_score) {
          score_details = "below";
        }
        var insights =
          division +
          "'s composite score is " +
          score_details +
          " UP average and is ranked at " +
          rank +
          "/18 divisions";
        ch_insights = Math.round(percentage_change) + "% vs Previous Month";
        sel_dis_div_state_name = division;
        if (up.overall.length === 1 && up.overall[0].date === pm_date) {
          bydomain = null;
          bytype = null;
        }
      } else {
        $(".loading").hide();
        bla = "nodata";
      }
    } else if (division != null && district != null) {
      // for the summary overall we don't need the filters.
      dist_div_data = UI.fetch_data(
        "summary_overall" + filter_,
        $.param(filter, true)
      );
      // UI.fetch_data("summary_division", )
      // { date: [cm_date, pm_date], type: type_, indicator: indicator_ })
      filter_new = _.cloneDeep(filter);
      filter_new.date[0] = filter_new.date[1];
      prev_dist_div_data = UI.fetch_data(
        "summary_overall" + filter_,
        $.param(filter_new, true)
      );
      data_selectedby = "district";
      // debugger
      if (dist_div_data !== undefined || prev_dist_div_data != undefined) {
        overall_value = dist_div_data.overall;
        prev_overall_value = prev_dist_div_data.overall;
      } else {
        overall_value = [];
        bla = "nodata";
      }
      if (!_.includes([0], overall_value.length)) {
        filter_dict["division"] = "";
        filter_dict["district"] = "";
        filter_dict["block"] = "";
        up = UI.fetch_data(
          "summary_overall" + filter_,
          $.param(filter_dict, true)
        );
        if (prev_overall_value[0].length >= 1) {
          up_composite_score = parseFloat(
            up.overall[1].composite_index.toFixed(2)
          );
          pm_ci_value = prev_overall_value[0].composite_index;
          cm_ci_value = overall_value[0].composite_index;
          if (!_.includes(["", undefined], url.searchKey.quarter)) {
            if (prev_overall_value[0].year > overall_value[0].year) {
              cm_ci_value = overall_value[0].composite_index;
              pm_ci_value = prev_overall_value[0].composite_index;
              up_composite_score = parseFloat(
                up.overall[0].composite_index.toFixed(2)
              );
            } else if (
              prev_overall_value[0].year === overall_value[0].year &&
              prev_overall_value[0].quarter > overall_value[0].quarter
            ) {
              cm_ci_value = prev_overall_value[0].composite_index;
              pm_ci_value = overall_value[0].composite_index;
              up_composite_score = parseFloat(
                up.overall[0].composite_index.toFixed(2)
              );
            }
          }
        } else {
          up_composite_score = parseFloat(
            up.overall[0].composite_index.toFixed(2)
          );
          cm_ci_value = overall_value[0].composite_index;
          pm_ci_value = prev_overall_value[0].composite_index;
        }
        filter["district"] = district;
        top_bottom_data = UI.fetch_data(
          "summary_form" + filter_,
          $.param(filter, true)
        );
        dist_div_data = top_bottom_data;
        // add the by_domain data for the cards chart
        bydomain = dist_div_data.by_domain;
        // add the by_type data for the cards chart
        bytype = dist_div_data.by_type;
        composite_score = parseFloat(cm_ci_value.toFixed(2));
        percentage_change =
          ((_.round(cm_ci_value, 2) - _.round(pm_ci_value, 2)) /
            _.round(pm_ci_value, 2)) *
          100;
        percentage_change = parseFloat(percentage_change.toFixed(2)) || 0;
        // filter['division'] = url.searchKey.division
        // filter['district'] = url.searchKey.district
        var filter_new_ = _.cloneDeep(filter);
        filter_new_["district"] = "";
        filter_new_["rank"] = "";
        rank_ = UI.fetch_data(
          "summary_division" + filter_,
          $.param(filter_new_, true)
        );
        // var rank = overall_value[1].composite_rank
        output = _(rank_.top_bottom_52)
          .groupBy("district")
          .map((objs, key) => ({
            district: key,
            composite_index: _.meanBy(objs, "composite_index"),
          }))
          .value();
        output = _.orderBy(output, ["composite_index"], ["desc"]);
        rank = parseInt(_.keys(_.pickBy(output, { district: district }))) + 1;
        url_update({ rank: rank });
        score_details = "";
        if (composite_score > up_composite_score) {
          score_details = "above";
        } else if (composite_score == up_composite_score) {
          score_details = "same";
        } else if (composite_score < up_composite_score) {
          score_details = "below";
        }
        insights =
          (_.includes(Object.keys(district_name_mapping), district)
            ? district_name_mapping[district]
            : district) +
          "'s composite score is " +
          score_details +
          " UP average and is ranked at " +
          rank +
          "/75 districts";
        // ch_insights = Math.round(percentage_change) + "% vs Previous Month"
        ch_insights = _.round(percentage_change, 2) + "% vs Previous Month";

        sel_dis_div_state_name = district;
        if (up.overall.length === 1 && up.overall[0].date === pm_date) {
          bydomain = null;
          bytype = null;
        }
      } else {
        $(".loading").hide();
        bla = "nodata";
      }
    }
    // debugger
    var _type = "date";
    var __type = cm_date;
    //chart function on priority to get the effects.....
    if (!_.includes(["", undefined], url.searchKey.quarter)) {
      _type = "quarter";
      ch_insights = Math.round(percentage_change) + "% vs Previous Quarter";
      cm_date = url.searchKey.quarter[1];
      pm_date = url.searchKey.prev_quarter[1];
      __type = parseInt(cm_date);
    } else if (url.searchKey.quarter === "" && url.searchKey.month === "") {
      _type = "year";
      ch_insights = Math.round(percentage_change) + "% vs Previous Year";
      cm_date = url.searchKey.year;
      pm_date = url.searchKey.prev_year;
      __type = parseInt(cm_date);
    }
    var cs = composite_score * 100 > 100 ? 100 : composite_score * 100;
    var gauge_data = {
      circle_value: cs || 0,
      composite_score: composite_score || 0,
      insights: ch_insights,
    };
    if (bla !== "nodata") {
      $(".no_data_").hide();
      $(".perf_bar").show();
      // debugger;
      if (data_selectedby == "state") {
        $("#perf-count").show();
        $("#power-gauge").hide();
        $("#map_img_pos").addClass("t-50").removeClass("t-50 t-92");
        $("#map_img_pos").css("top", "50%");
        render_count();
      } else {
        $("#perf-count").attr("style", "display: none !important");
        $("#map_img_pos").addClass("t-92").removeClass("t-50 t-92");
        $("#map_img_pos").css("top", "72%");
        $("#power-gauge").show();
        $(".legend_gauage_chart_script").template({});
        gauage("#power-gauge", gauge_data);
      }
    } else {
      $(".perf_bar").hide();
      $(".no_data_").show();
    }
    gauage_chart_legend();
    gauage_chart_config(sel_dis_div_state_name, rank, insights);
    // render_top_bottom(url)
    d3.select(".bars").remove();
    render(url, up, top_bottom_data, cm_date, data_selectedby, _type);
    // debugger
    if (district == "" && division == "") {
      district_data = district_ranking(
        top_bottom_data.district_ranking,
        url,
        "district"
      );
      division_data = district_ranking(
        top_bottom_data.division_ranking,
        url,
        "division"
      );
    } else {
      district_data = district_ranking(
        top_bottom_data.top_bottom_52,
        url,
        "district"
      );
      division_data = district_ranking(
        top_bottom_data.top_bottom_5_division,
        url,
        "division"
      );
    }
    distric_ranking(district_data);
    //render cards chhart .....
    // console.log(up === undefined || up.overall === undefined || up.overall.length === 0 || up.overall.length === 1 && up.overall[0][_type] !== __type)
    if (
      up === undefined ||
      up.overall === undefined ||
      up.overall.length === 0 ||
      (up.overall.length === 1 && up.overall[0][_type] !== __type)
    ) {
      bydomain = null;
      bytype = null;
    }
    // debugger
    var card_data_by_domain = calculate_card_change(
      bydomain,
      "domain",
      cm_date,
      pm_date,
      district
    );
    var card_data_by_type = calculate_card_change(
      bytype,
      "type_",
      cm_date,
      pm_date,
      district
    );
    render_cards_chart(card_data_by_domain, card_data_by_type, district);
  }
}

function distric_ranking(data) {
  $("#ranking").off();
  $("#ranking")
    .on("template", function () {
      _.each($(".cm_bar"), function (d) {
        if (Number($(d).attr("width")) > 20) {
          $(d).css("width", $(d).attr("width") + "%");
        }
      });
      _.each($(".pm_bar"), function (d) {
        Number($(d).attr("width")) > 90
          ? $(d).css("margin-left", "90%")
          : $(d).css("margin-left", $(d).attr("width") + "%");
      });
    })
    .template({ data: data });
}

function render_count() {
  var type = $("#switch-district").prop("checked") ? "district" : "division";
  $(".count").template({
    type: type,
    data: [
      {
        class: "bg-color4",
        count: type === "district" ? 25 : 6,
        filter_ty: "Top",
      },
      {
        class: "color5",
        count: type === "district" ? 25 : 6,
        filter_ty: "Moderate",
      },
      {
        class: "bg-color5",
        count: type === "district" ? 25 : 6,
        filter_ty: "Bottom",
      },
    ],
  });
}

function calculate_card_change(
  bydomain,
  card_type_name,
  cm_date,
  pm_date,
  district
) {
  var domain_cm_value = {};
  var unique_domain_value = [];
  // card_type_name = "domain"
  _.each(bydomain, function (item) {
    var domain = item[card_type_name];
    if (!(domain in domain_cm_value)) {
      domain_cm_value[domain] = 1;
      unique_domain_value.push(domain);
    }
  });

  var card_data_cal = [];
  var type_ = "date";
  var cm_date_ = cm_date;
  var pm_date_ = pm_date;
  var default_text = "% vs Previous Month";
  if (cm_date.length == 1) {
    cm_date_ = parseInt(cm_date);
    pm_date_ = parseInt(pm_date);
    type_ = "quarter";
    default_text = "% vs Previous Quarter";
  } else if (cm_date.length == 4) {
    cm_date_ = parseInt(cm_date);
    pm_date_ = parseInt(pm_date);
    type_ = "year";
    default_text = "% vs Previous Year";
  }
  for (var i in unique_domain_value) {
    // var type_name = unique_domain_value[i]
    var check_domain = unique_domain_value[i];
    var cm_index = 0;
    var pp = 0;
    for (var j in bydomain) {
      if (
        cm_date_ == bydomain[j][type_] &&
        bydomain[j][card_type_name] == check_domain
      ) {
        cm_index =
          bydomain[j][
            card_type_name == "type_"
              ? card_type_name.toLowerCase() + "index"
              : card_type_name.toLowerCase() + "_index"
          ];
        pp = bydomain[j]["perc_point"];
        if (district != "Uttar Pradesh" || district != null) {
          var cm_rank = bydomain[j][card_type_name + "_rank"];
        }
      } else if (
        pm_date_ == bydomain[j][type_] &&
        bydomain[j][card_type_name] == check_domain
      )
        var pm_index = bydomain[j][card_type_name + "_index"];
    }
    var percentage_change_cards = ((cm_index - pm_index) / pm_index) * 100;
    percentage_change_cards =
      parseFloat(percentage_change_cards.toFixed(2)) || 0;
    // "-4% vs Previous Month"
    var cards_insights = Math.round(percentage_change_cards) + default_text;
    if (check_domain != undefined && cm_index != undefined) {
      card_data_cal.push({
        type: check_domain.split("_").join(" "),
        rank: district == "Uttar Pradesh" || district == null ? 0 : cm_rank,
        value: parseFloat(cm_index.toFixed(2)),
        pp: _.round(pp, 2),
        insight: cards_insights,
        class: color_value[unique_domain_value[i]],
      });
    }
  }
  // bars_clicking(url)
  return card_data_cal;
}

function render_cards_chart(card_data_by_domain, card_data_by_type, district) {
  var temp_data_model = $("#cards_template").html();
  var userlist = _.template(temp_data_model);
  var tem_html = userlist({
    data: card_data_by_domain,
    type: "type",
  });
  $("#cards_div").html(tem_html);
  temp_data_model = $("#cards_template2").html();
  userlist = _.template(temp_data_model);
  tem_html = userlist({
    data: card_data_by_type,
    type: "type",
  });
  $("#cards_div2").html(tem_html);

  if (district == "Uttar Pradesh" || district == null) {
    $(".rank_value_div").hide();
  } else {
    $(".rank_value_div").show();
  }
  config_composite_score();
}

function config_composite_score() {
  var type = _.includes([undefined, "", "no"], url.searchKey.card_toggle)
    ? "bydomain"
    : "bytype";
  if (type == "bydomain") {
    $(".domain_").css("font-weight", "bold");
    $(".type_").css("font-weight", "normal");
    $("#cards_div2").hide();
    $("#cards_div").show();
  } else if (type == "bytype") {
    $(".domain_").css("font-weight", "normal");
    $(".type_").css("font-weight", "bold");
    $("#cards_div2").show();
    $("#cards_div").hide();
  }
  $("#switch-domain").unbind("click");
  $("#switch-domain").click(function () {
    //    var type = _.includes([undefined, "", "no"], url.searchKey.card_toggle) ? "bydomain" : "bytype"
    $("#switch-domain").removeAttr("class");
    if ($(this).prop("checked")) {
      url_update({ card_toggle: "yes" });
      $(".domain_").css("font-weight", "normal");
      $(".type_").css("font-weight", "bold");
      $("#cards_div2").show();
      $("#cards_div").hide();
    } else {
      url_update({ card_toggle: "no" });
      $(".domain_").css("font-weight", "bold");
      $(".type_").css("font-weight", "normal");
      $("#cards_div2").hide();
      $("#cards_div").show();
    }
  });
}

function bars_clicking(url) {
  if (url.searchKey.state === "Uttar Pradesh") $("#switch-district").show();
  var type = _.includes([undefined, "", "no"], url.searchKey.tb_toggle)
    ? "district_switch"
    : "division_switch";
  if (
    $(".district_bar")[0] !== undefined &&
    $(".division_bar")[0] !== undefined
  ) {
    if (type == "district_switch") {
      $(".district_bar").show();
      $(".division_bar").hide();
    } else if (type == "division_switch") {
      $(".district_bar").hide();
      $(".division_bar").show();
    }
  }

  // debugger
  if (
    _.includes(["", undefined], g1.url.parse(location.href).searchKey.division)
  ) {
    $("#first_card").removeClass();
    $("#first_card").addClass("col-0 px-0");
    $("#second_card").removeClass();
    $("#second_card").addClass("col-10");
  } else {
    $("#first_card").removeClass();
    $("#first_card").addClass("col-2");
    $("#second_card").removeClass();
    $("#second_card").addClass("col-8");
  }
  render_count();
}

function click_tb() {
  // debugger
  // _.includes([undefined, "", 'yes'], url.searchKey.tb_toggle) ? $('#switch-district').click() : ""
  $(function () {
    if ($("#switch-district").prop("checked")) {
      url_update({ tb_toggle: "no" });
      $(".division__").css("font-weight", "normal");
      $(".district__").css("font-weight", "bold");
      if ($(".division_bar").length === 1 && $(".district_bar").length === 1) {
        $(".district_bar").show();
        $(".division_bar").hide();
      }
    } else {
      url_update({ tb_toggle: "yes" });
      $(".division__").css("font-weight", "bold");
      $(".district__").css("font-weight", "normal");
      if ($(".division_bar").length === 1 && $(".district_bar").length === 1) {
        $(".district_bar").hide();
        $(".division_bar").show();
      }
    }
  });
}

var dict_ = {};

$("body")
  .urlfilter({
    selector: ".urlfilter",
    target: "pushState",
  })
  .on("urlfilter", master);
$(document)
  .on("click", ".submit", function () {
    master();
  })
  .on("click", "#switch-district", function () {
    if ($(this).prop("checked")) {
      url_update({ tb_toggle: "no" });
      $(".district_bar").show();
      $(".division_bar").hide();
      $(".division__").css("font-weight", "normal");
      $(".district__").css("font-weight", "bold");
      distric_ranking(district_data);
      $(".district__ranking").text("District Ranking");
    } else {
      url_update({ tb_toggle: "yes" });
      $(".district_bar").hide();
      $(".division_bar").show();
      $(".division__").css("font-weight", "bold");
      $(".district__").css("font-weight", "normal");
      distric_ranking(division_data);
      $(".district__ranking").text("Division Ranking");
    }
  })
  .on("click", ".ranking_click", function () {
    $(".bar_click").show();
    var maping_dic = {
      yes: [0, 6, 6, 12, 12, 18],
      no: [0, 25, 25, 50, 50, 75],
    };
    var list_ = maping_dic[g1.url.parse(location.href).searchKey.tb_toggle];

    if ($(this).find(".filter_type").text().trim() === "Top") {
      _.each($(".bar_click"), function (d, i) {
        if (i >= list_[0] && i < list_[1]) {
          $(d).css("display", "auto");
        } else {
          $(d).css("display", "none");
        }
      });
    } else if ($(this).find(".filter_type").text().trim() === "Moderate") {
      _.each($(".bar_click"), function (d, i) {
        if (i >= list_[2] && i < list_[3]) {
          $(d).css("display", "auto");
        } else {
          $(d).css("display", "none");
        }
      });
    } else {
      _.each($(".bar_click"), function (d, i) {
        if (i >= list_[4] && i < list_[5]) {
          $(d).css("display", "auto");
        } else {
          $(d).css("display", "none");
        }
      });
    }
  });
