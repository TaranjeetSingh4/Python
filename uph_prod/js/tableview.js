/* global g1, UI, user_info, defaults, indicator_mapping, data_map, district_name_mapping,
    swal, render_search_bar_template, set_user_details,rename_key, rename_keys,redraw_table_view,get_area_data,get_col_values,
    get_fin_year,set_table_selection,get_selected_date,get_domain_values,get_block_domain_values,download_map
    rendering_indicator_template,update_rows,common_district_template,set_labels*/
/* exported render_table,ind_type */

var url,
  sort_key,
  user_district,
  user_division,
  table_config,
  table_selection,
  date,
  ind_type;
url = g1.url.parse(location.href);
var doubleLabels = [
  "<i>Show All</i>",
  "<i>Aspirational</i>",
  "<i>High Priority</i>",
];

var _def_inds = {
  table: "composite_score",
  niti_table: "% ANC registered in First trimester",
  cmo_table: "ANC registered within first trimester",
};
var default_ind = [
  {
    indicator:
      "% of children received full immunization (BCG, Penta 1, 2, 3, Measles)",
  },
  {
    indicator:
      "% of pregnant women delivered in institution against estimated delivery",
  },
  { indicator: "Total case notification rate of TB against expected TB cases" },
  { indicator: "% JSY Incentive" },
  { indicator: "% of fund utilized against approved budget" },
  // {indicator: "Allopathic attendance OPD"},
  // {indicator: "Inpatient admissions"},
  { indicator: "Treatment Success Rate  as per total cases notified" },
];

/* Get month, quarter, year data for selected date */
function get_table_data(
  type,
  group,
  parameter,
  year,
  quarter,
  date,
  merge_key
) {
  var keyMap = {},
    params = {};
  var val = url.searchKey["val"] || defaults.val;
  var name = url.searchKey[val] || defaults.name;
  // debugger
  // var col_dict = { 'month': 'monthly_score', 'quarter': 'quarterly_score', 'year': 'fy_score' }
  var rank_map = {
    month: "monthly_score",
    quarter: "quarterly_score",
    year: "fy_score",
  };
  // var rank_map = url.file == 'amethi_table' ? { 'month': 'curr. month', 'quarter': 'quarterly_score', 'year': 'prev. month' } : { 'month': 'monthly_score', 'quarter': 'quarterly_score', 'year': 'fy_score' }
  var table_selection = set_table_selection();
  var col;
  if (name !== "composite_score") {
    params[val] = name;
    col = ["perc_point|avg"];
  } else {
    col = ["composite_index|avg"];
    // col = url.file == 'table' ? ['composite_index|avg'] : ['perc_point|avg']
  }
  // var _type = {
  //   'table': type,
  //   'niti_table': type + '_niti',
  //   'cmo_table': type + '_cmo'
  // }
  // type = _type[url.file] || type
  // ind_type = user_info.user == 'CM_Office1' ? type + '_cm' : type
  params["_by"] = group;
  params["_c"] = col;
  if (table_selection == "month") {
    var year_arr = get_col_values(
      type,
      "year",
      year,
      parameter,
      params,
      "fy",
      "fy_score",
      col
    );
    var date_arr = get_col_values(
      type,
      "date",
      date,
      parameter,
      params,
      "monthly",
      "monthly_score",
      col
    );
  }
  // Fetch either monthly data or quarterly data based on user time period selection
  // yearly - fetch only year
  // monthly - fetch year and monthly
  // quarter - fetch year and quarter

  if (table_selection == "quarter") {
    year_arr = get_col_values(
      type,
      "year",
      year,
      parameter,
      params,
      "fy",
      "fy_score",
      col
    );
    params["year"] = year;
    var quarter_arr = get_col_values(
      type,
      "quarter",
      quarter,
      parameter,
      params,
      "quarterly",
      "quarterly_score",
      col
    );
  }

  if (table_selection == "year") {
    year_arr = get_col_values(
      type,
      "year",
      year,
      parameter,
      params,
      "fy",
      "fy_score",
      col
    );
  }
  var data = merge_arrays(year_arr, quarter_arr, merge_key);
  // Changed the order of merge (month, year) to get all records
  data = merge_arrays(data, date_arr, merge_key);
  keyMap[type] = "name";
  keyMap[merge_key] = "id";
  data = rename_keys(data, keyMap);
  if (type === "block") {
    var ranked_data = [];
    _.each(_.groupBy(data, "district_id"), function (values) {
      var dist_data = add_ranks(values, rank_map[table_selection], type, false);
      ranked_data = ranked_data.concat(dist_data);
    });
    return ranked_data;
  }

  data = add_ranks(data, rank_map[table_selection], type, true);
  return data;
}

function render_table() {
  $(".loading-icon").show();
  // var ou_data = UI.fetch_data("ou_id_mappings",{})
  // var _ou_data = _.each(ou_data, function(d){
  //   d['name'] = d['block']
  //   d['id'] = d['uid_block']
  //   d['fy_score'] = 'NA'
  //   d['monthly_score'] = 'NA'
  //   d['quarterly_score'] = 'NA'
  //   d['rank'] = ''
  //   delete d['block']
  //   })
  url = g1.url.parse(location.href);
  var month = url.searchKey["month"];
  var quarter = url.searchKey["quarter"];
  var year = url.searchKey["year"] || defaults.year;
  table_selection = set_table_selection();
  date = get_selected_date(table_selection, month, quarter, year, defaults);
  var val = url.searchKey["val"] || defaults.val;
  var name = url.searchKey[val] || defaults.name;
  var select = url.searchKey["select"] || defaults.level;
  var selected_name = url.searchKey[select] || user_district;
  var parameter;
  if (name === "composite_score") {
    parameter = "composite_index";
  } else {
    parameter = "perc_point";
  }
  var table_quarter = moment(date).fquarter().quarter;
  var table_year = get_fin_year(date);
  var level = url.searchKey["level"] || defaults.level;
  // url = g1.url.parse(location.href)
  var url_indicator = url.searchKey["indicator"] || _def_inds[url.file]; //(url.file == 'table' ? 'composite_score' : '% ANC registered in First trimester')
  var indicator_np = _.find(indicator_mapping, {
    indicator_name: url_indicator,
  }).positive_negative;
  var color_scale =
    indicator_np == "positive"
      ? d3.scaleLinear().range(["red", "white", "green"])
      : d3.scaleLinear().range(["green", "white", "red"]);
  var _ind = _def_inds[url.file]; //url.file == 'table' ? 'composite_score' : '% ANC registered in First trimester'
  name == _ind
    ? color_scale.domain([0, 0.5, 1])
    : color_scale.domain([0, 50, 100]);
  sort_key = url.searchKey["sort_key"] || defaults.sort_key;
  // console.log(sort_key)
  sort_key = [sort_key, "name"];

  var date_format, parsetime, display_values, sub_ind_grp, sub_ind_date_value;
  if (table_selection === "month") {
    date_format = "MMM YY";
    parsetime = d3.timeParse("%b %y");
    // display_values = user_info.user == 'CM_Office1' ? [table_config.rank, table_config.month, table_config.fy] : [table_config.rank, table_config.month, table_config.fy, table_config.trend]
    display_values =
      url.file == "table_noauth"
        ? [table_config.rank, table_config.month, table_config.fy]
        : [
            table_config.rank,
            table_config.month,
            table_config.fy,
            table_config.trend,
          ];
    $("#date-label").text(moment(date).format("MMM YYYY"));
    sub_ind_grp = "date";
    sub_ind_date_value = date;
  } else if (table_selection === "quarter") {
    date_format = "Q YY";
    parsetime = d3.timeParse("%m %Y");
    // display_values = user_info.user == 'CM_Office1'? [table_config.rank, table_config.quarter, table_config.fy] : [table_config.rank, table_config.quarter, table_config.fy, table_config.trend]
    display_values =
      url.file == "table_noauth"
        ? [table_config.rank, table_config.quarter, table_config.fy]
        : [
            table_config.rank,
            table_config.quarter,
            table_config.fy,
            table_config.trend,
          ];
    $("#date-label").text(
      moment(date).subtract(1, "Q").format("[Q]Q") +
        " " +
        (table_year - 1) +
        "-" +
        table_year
    );
    sub_ind_grp = "quarter";
    sub_ind_date_value = table_quarter;
  } else {
    date_format = "YYYY";
    parsetime = d3.timeParse("%Y");
    // display_values = user_info.user == 'CM_Office1'? [table_config.rank, table_config.fy] : [table_config.rank, table_config.fy, table_config.trend]
    display_values =
      url.file == "table_noauth"
        ? [table_config.rank, table_config.fy]
        : [table_config.rank, table_config.fy, table_config.trend];
    $("#date-label").text(table_year - 1 + "-" + table_year);
    sub_ind_grp = "year";
    sub_ind_date_value = table_year;
  }

  $(".trend").empty();
  var area_data = {},
    sub_ind_div,
    sub_ind_dist,
    sub_ind_block;
  // var type = selection == 'overall' ? 'division' : selection
  // show trend line only when user is not CM_Office1
  // var _type = {
  //   'table': type,
  //   'niti_table': type + '_niti',
  //   'cmo_table': type + '_cmo',
  //   'amethi_table': type + '_amethi'
  // }
  // // type = url.file == 'niti_table' ? type+'_niti' : type
  // type = _type[url.file] || type
  // ind_type = user_info.user == 'CM_Office1' ? type + '_cm' : type
  if (user_info.user != "CM_Office1" && url.file != "table_noauth") {
    // debugger
    area_data[defaults.state_name] = get_area_data(
      defaults,
      "overall",
      date,
      val,
      table_selection
    );

    if (url.searchKey.select == "division") {
      var area_div = get_area_data(
        defaults,
        "division",
        date,
        val,
        table_selection
      );
    }
    var area_dist = get_area_data(
      defaults,
      "district",
      date,
      val,
      table_selection
    );
    var area_blk = get_area_data(defaults, "block", date, val, table_selection);

    if (level == "division") {
      area_data = $.extend({}, area_data, area_div, area_dist, area_blk);
    } else if (level == "district") {
      area_data = $.extend({}, area_data, area_dist, area_blk);
    }
  } else {
    // var dist_params = {'_by': ['district_id', 'district', 'sub_id', sub_ind_grp], '_c': ['value|sum'], 'indicator_id': url.searchKey.indicator_id}
    var dist_params = { indicator_id: url.searchKey.indicator_id };
    // var block_params = {'_by': ['block_id', 'block', 'district', 'district_id', 'sub_id', sub_ind_grp], '_c': ['value|sum'], 'indicator_id': url.searchKey.indicator_id}
    var block_params = { indicator_id: url.searchKey.indicator_id };
    // var block_params = {'indicator_id': parseInt(url.searchKey.indicator_id.split('_')[1])}
    dist_params[sub_ind_grp] = sub_ind_date_value;
    block_params[sub_ind_grp] = sub_ind_date_value;
    if (sub_ind_grp != "year") {
      dist_params["year"] = table_year;
      block_params["year"] = table_year;
      dist_params[sub_ind_grp] = [sub_ind_date_value, table_year - 1];
      // dist_params[sub_ind_grp] = sub_ind_date_value
      // dist_params['date_yr'] = table_year-1
      block_params[sub_ind_grp] = [sub_ind_date_value, table_year - 1];
      // block_params[sub_ind_grp] = sub_ind_date_value
      // block_params['date_yr'] = table_year-1
    }
    // sub_ind_dist = rename_keys(UI.fetch_data(data_map['sub_indicator']['district'], dist_params), {'value|sum': 'value'})
    sub_ind_dist = UI.fetch_data(
      data_map["sub_indicator"]["district"],
      dist_params
    );
    // sub_ind_block = rename_keys(UI.fetch_data(data_map['sub_indicator']['block'], block_params), {'value|sum': 'value'})
    sub_ind_block = UI.fetch_data(
      data_map["sub_indicator"]["block"],
      block_params
    );
    sub_ind_dist = format_sub_ind_data(sub_ind_dist, "district_id");
    sub_ind_block = format_sub_ind_data(sub_ind_block, "block_id");
    if (url.searchKey.select == "division") {
      var div_params = {
        _by: ["div_map_id", "division", "sub_id", sub_ind_grp],
        _c: ["value|sum"],
        indicator_id: url.searchKey.indicator_id,
      };
      div_params[sub_ind_grp] = sub_ind_date_value;
      if (sub_ind_grp != "year") {
        div_params["year"] = table_year;
        div_params[sub_ind_grp] = [sub_ind_date_value, table_year - 1];
      }
      sub_ind_div = rename_keys(
        UI.fetch_data(data_map["sub_indicator"]["district"], div_params),
        { "value|sum": "value" }
      );
      sub_ind_div = format_sub_ind_data(sub_ind_div, "div_map_id");
      _.each(sub_ind_div, function (d) {
        d["id"] = _.toNumber(d["id"]);
      });
    }
  }

  // Fetch division data only if division toggle is selected
  if (url.searchKey.select == "division") {
    var group = ["division", "div_map_id"];
    var table_division_data = get_table_data(
      "division",
      group,
      parameter,
      table_year,
      table_quarter,
      date,
      "div_map_id"
    );
    table_division_data = merge_sub_ind(table_division_data, sub_ind_div, "id");
  }

  group = ["division", "district", "district_id", "map_id"];
  var table_district_data = get_table_data(
    "district",
    group,
    parameter,
    table_year,
    table_quarter,
    date,
    "district_id"
  );
  group = ["district", "district_id", "block", "block_id"];
  var table_block_data = get_table_data(
    "block",
    group,
    parameter,
    table_year,
    table_quarter,
    date,
    "block_id"
  );
  // table_block_data = _.merge(table_block_data)
  table_district_data = merge_sub_ind(table_district_data, sub_ind_dist, "id");
  table_block_data = merge_sub_ind(table_block_data, sub_ind_block, "id");
  // table_block_data =  merge_arrays(_ou_data,table_block_data, "name")
  // var table_block_data_grp = _.groupBy(table_block_data, 'district')
  // var sorted_table_block_data = {}
  // _.each(table_block_data_grp, function (v, k) {
  //   sorted_table_block_data[k] = _.orderBy(v, 'monthly_score', 'desc')
  // })
  // ind_type = 'block'
  var overall = {},
    cols = [
      "monthly",
      "quarterly",
      "fy",
      "monthly_score",
      "quarterly_score",
      "fy_score",
    ];
  if (user_info.user == "CM_Office1")
    cols = cols.concat(data_map["sub-indicators"][url.searchKey.indicator_id]);
  overall["name"] = defaults.state_name;
  overall["id"] = defaults.state_name;
  overall["rank"] = "";
  overall["next"] = false;

  _.times(cols.length, function (i) {
    overall[cols[i]] = _.round(_.meanBy(table_district_data, cols[i]), 2);
  });
  var labels =
    user_info.user != "CM_Office1" && url.file != "table_noauth"
      ? d3.extent(area_data[defaults.state_name], function (d) {
          return parsetime(d.date);
        })
      : [];
  // Fetch division domain only if division toggle is selected
  if (url.searchKey.select == "division") {
    var division_domain = get_domain_values(table_division_data);
  }
  var district_domain = get_domain_values(table_district_data);
  var block_domain = get_domain_values(table_block_data);
  var district_block_domain = get_block_domain_values(table_block_data);
  table_block_data = _.sortBy(table_block_data, ["rank", "name"]);

  if (level === "district") {
    //Ordering according to changed district names(Allahabad)
    let division_sort = url.searchKey["division_sort"] || "asc";
    table_district_data = _.orderBy(
      table_district_data,
      sort_key,
      division_sort
    );
    let distrinct_template_data = {
      selection: table_selection,
      indicator: name,
      type: "district",
      level_one_data: [overall].concat(table_district_data),
      level_two_data: _.groupBy(table_block_data, "district"),
      level_three_data: false,
      level_one_domain: district_domain,
      level_two_domain: block_domain,
      district_block_domain: district_block_domain,
      area_data: area_data,
      parsetime: parsetime,
      display_values: display_values,
      district_name_change: district_name_mapping,
    };
    common_district_template(
      table_selection,
      user_info,
      labels,
      date_format,
      url,
      distrinct_template_data,
      select,
      selected_name,
      defaults
    );
  } else {
    let division_sort = url.searchKey["division_sort"] || "asc";
    table_division_data = _.orderBy(
      table_division_data,
      sort_key,
      division_sort
    );
    var _class = url.file == "table_noauth" ? ".table_cm" : ".table";
    $(_class)
      .on("template", function () {
        $(_class).off();
        _.each($(".color-cell"), function (d) {
          var domain_max = _.round(parseFloat($(d).attr("domain-attr")), 2);
          var domain_min = _.round(parseFloat($(d).attr("domain-attr_min")), 2);
          color_scale.domain([
            domain_min,
            (domain_min + domain_max) / 2,
            domain_max,
          ]);
          if ($(d).attr("value") != 0) {
            $(d).css("background-color", color_scale($(d).attr("value")));
          }
        });
        if (user_info.user != "CM_Office1")
          set_labels(table_selection, labels, date_format);
        $("." + select + '-name[data-attr="' + selected_name + '"]').addClass(
          "selected-name"
        );
        $(".loading-icon").hide();
      })
      .template({
        selection: table_selection,
        indicator: name,
        type: "division",
        level_one_data: [overall].concat(table_division_data),
        level_two_data: _.groupBy(table_district_data, "division"),
        level_three_data: _.groupBy(table_block_data, "district"),
        level_one_domain: division_domain,
        level_two_domain: district_domain,
        level_three_domain: block_domain,
        district_block_domain: district_block_domain,
        area_data: area_data,
        parsetime: parsetime,
        display_values: display_values,
        district_name_change: district_name_mapping,
      });
  }
  show_insights("table");
  $(".download-button").template();
}

function format_sub_ind_data(array, name_id) {
  var temp_data = [];
  _.each(_.groupBy(array, name_id), function (values, id) {
    var row = {};
    row["id"] = name_id == ("district_id" || "div_map_id") ? parseInt(id) : id;
    _.each(values, function (d) {
      row[d.sub_id] = d["value"];
    });
    temp_data.push(row);
  });
  return temp_data;
}

function merge_sub_ind(array1, array2, key) {
  return _.map(array1, function (obj) {
    var find = {};
    find[key] = obj[key];
    return _.assign(obj, _.find(array2, find));
  });
}

function render_indicator_table() {
  var year_arr, quarter_arr, date_arr, select;
  var keyMap = {};
  $(".loading-icon").show();
  var month = url.searchKey["month"];
  var quarter = url.searchKey["quarter"];
  var year = url.searchKey["year"] || defaults.year;
  var table_selection = set_table_selection();
  var date = get_selected_date(table_selection, month, quarter, year, defaults);
  var table_quarter = moment(date).fquarter().quarter;
  var table_year = get_fin_year(date);
  var params = {};
  var table_data = {};
  select = url.searchKey["select"] || defaults.level;
  params[select] = url.searchKey[select];
  var filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  // var color_scale = d3.scaleLinear().domain([0, 50, 100]).range(['red', 'white', 'green'])
  params["_by"] =
    filter_type == "indicator" ? [filter_type] : [filter_type, "indicator"];
  params["_c"] = ["perc_point|avg"];
  params["year"] = table_year;

  // if block, also add district as additional filter to ensure district specific block is fetched  (duplicate block fix)
  if (select == "block") {
    params["district"] = url.searchKey["district"];
  }

  // select = url.file == 'table' ? select : select+'_niti'
  // ind_type = user_info.user == 'CM_Office1' ? select+'_cm' : select
  var _type = {
    table: select,
    niti_table: select + "_niti",
    cmo_table: select + "_cmo",
    table_noauth: select + "_cm",
  };
  ind_type = user_info.user == "CM_Office1" ? select + "_cm" : _type[url.file]; //(url.file == 'niti_table' ? select+'_niti' : select)
  table_data["year"] = UI.fetch_data(data_map[ind_type]["year"], params);
  if (table_selection == "quarter") {
    params["quarter"] = table_quarter;
    table_data["quarter"] = UI.fetch_data(
      data_map[ind_type]["quarter"],
      params
    );
  } else if (table_selection == "month") {
    params["date"] = date;
    table_data["date"] = UI.fetch_data(data_map[ind_type]["date"], params);
  }
  params[select] = null;

  // if block, remove district as additional filter (duplicate block fix)
  if (select == "block") {
    params["district"] = null;
  }
  params["_c"] = ["perc_point|avg", "perc_point|min", "perc_point|max"];
  if (table_selection == "month") {
    params["date"] = date;
  } else {
    params["year"] = table_year;
    if (table_selection == "quarter") {
      params["quarter"] = table_quarter;
    }
  }
  var _main_sel = {
    table: "",
    niti_table: "_niti",
    cmo_table: "_cmo",
    table_noauth: "_cm",
  };
  var main_sel = _main_sel[url.file]; //user_info.user == 'CM_Office1' ? '_cm' : _main_sel[url.file]//(url.file == 'table' ? '' : '_niti')
  var district_avg = UI.fetch_data(
    data_map["district" + main_sel][table_selection],
    params
  );
  var block_avg = UI.fetch_data(
    data_map["block" + main_sel][table_selection],
    params
  );
  var table_avg = _.unionBy(district_avg, block_avg, "indicator");
  table_avg = rename_keys(table_avg, {
    "perc_point|min": "avg_min",
    "perc_point|max": "avg_max",
  });
  params["_c"] = ["perc_point|max", "perc_point|min"];
  if (select == "division") {
    params["_by"] =
      filter_type == "indicator"
        ? [filter_type, select]
        : [filter_type, "indicator", select];
    params["_c"] = ["perc_point|avg"];
  }
  if (select == "block") params["district"] = url.searchKey.district;
  var table_max = UI.fetch_data(data_map[ind_type][table_selection], params);
  if (select == "division") {
    var division_max = [];
    _.each(_.groupBy(table_max, "indicator"), function (rows, key) {
      var max_row = _.maxBy(rows, "perc_point|avg");
      var min_row = _.minBy(rows, "perc_point|avg");
      division_max.push({
        indicator: key,
        division:
          get_indicator_type(key) == "negative"
            ? min_row["division"]
            : max_row["division"],
        "perc_point|max": max_row["perc_point|avg"],
        "perc_point|min": min_row["perc_point|avg"],
      });
    });
    table_max = division_max;
  }
  table_data["max_avg"] = merge_arrays(table_max, table_avg, "indicator");
  keyMap["perc_point|avg"] = "fy_score";
  year_arr = rename_keys(table_data["year"], keyMap);
  if (table_selection == "quarter") {
    keyMap["perc_point|avg"] = "quarterly_score";
    quarter_arr = rename_keys(table_data["quarter"], keyMap);
  } else if (table_selection == "month") {
    keyMap["perc_point|avg"] = "monthly_score";
    date_arr = rename_keys(table_data["date"], keyMap);
  }

  var max_avg = rename_keys(table_data["max_avg"], {
    "perc_point|max": "max",
    "perc_point|avg": "avg",
    "perc_point|min": "min",
  });
  (params["date"] = null), (params["quarter"] = null);
  params["_by"] =
    filter_type == "indicator" ? [filter_type] : [filter_type, "indicator"];
  params["_c"] = ["perc_point|max", "perc_point|min"];

  var fy_max = UI.fetch_data(data_map[ind_type]["year"], params);
  fy_max = rename_keys(fy_max, {
    "perc_point|max": "fy_max",
    "perc_point|min": "fy_min",
  });

  var table_indicator_data = merge_arrays(year_arr, quarter_arr, "indicator");
  // Changed the order of merge (month, year) to get all records
  table_indicator_data = merge_arrays(
    table_indicator_data,
    date_arr,
    "indicator"
  );
  table_indicator_data = merge_arrays(
    table_indicator_data,
    max_avg,
    "indicator"
  );
  table_indicator_data = merge_arrays(
    table_indicator_data,
    fy_max,
    "indicator"
  );
  table_indicator_data = rename_key(table_indicator_data, "indicator", "name");

  table_indicator_data = UI.sort_list(table_indicator_data, "name");
  _.each(table_indicator_data, function (row) {
    row["ind_max"] = row.max;
  });
  if (select != "division") {
    table_selection == "quarter"
      ? (params["quarter"] = table_quarter)
      : (params["date"] = date);
    if (table_selection == "year") {
      params["date"] = null;
    }
    delete params["_by"];
    params["_c"] = ["perc_point", select, filter_type];
    // params['_sort'] = ['perc_point', 'district']
    keyMap = {};
    if (filter_type == "type" || filter_type == "domain") {
      keyMap[filter_type] = filter_type; //, keyMap['perc_point'] = 'max'
      params["_c"].push("indicator");
    }
    (keyMap["indicator"] = "name"), (keyMap["perc_point"] = "max");
    var best_region = rename_keys(
      UI.fetch_data(data_map[ind_type][table_selection], params),
      keyMap
    );
    console.log(best_region);
    best_region = _.sortBy(best_region, "district");
    best_region = _.sortBy(best_region, "block");
    best_region = _.intersectionWith(
      best_region,
      table_indicator_data,
      merge_best_district
    );
    table_indicator_data = merge_arrays(
      table_indicator_data,
      best_region,
      "name"
    );
  }

  // Identify missing indicators and adds empty records
  let type_ind = _.includes(["", undefined], url.searchKey.select)
    ? "district"
    : url.searchKey.select;
  var all_indicators = _.map(
    _.filter(indicator_mapping, function (i) {
      return _.includes([type_ind, "dist_block"], i.type_ind);
    }),
    "indicator_name"
  );
  var table_indicators = _.map(table_indicator_data, "name");
  var missing_indicators = _.filter(all_indicators, function (i) {
    return !_.includes(table_indicators, i);
  });

  _.each(missing_indicators, function (mi) {
    let t_avg = _.find(table_avg, { indicator: mi });
    let t_max = _.find(table_max, { indicator: mi });
    let ind_item = _.find(indicator_mapping, { indicator_name: mi });
    table_indicator_data.push({
      name: mi,
      avg: t_avg ? t_avg["perc_point|avg"] : t_avg,
      max: t_max ? t_max["perc_point|max"] : t_max,
      avg_max: t_avg ? t_avg["avg_max"] : t_avg,
      avg_min: t_avg ? t_avg["avg_min"] : t_avg,
      ind_max: t_max ? t_max["perc_point|max"] : t_max,
      min: t_max ? t_max["perc_point|min"] : t_max,
      type: ind_item.type,
      domain: ind_item.domain,
    });
  });
  if (user_info.user == "CM_Office1") {
    table_indicator_data = _.filter(table_indicator_data, function (d) {
      if (_.find(default_ind, ["indicator", d.name])) return d;
    });
  }
  let templte_indicator_data = {
    selection: table_selection,
    type: filter_type,
    indicator_data: UI.sort_list(table_indicator_data, "name"),
    mapping: indicator_mapping,
    select: select,
  };
  rendering_indicator_template(defaults, url, templte_indicator_data, select);
  // $('.indicator-table')
  // .on('template', function() {
  //   $('.indicator-table').off()
  //   _.each($('.ind-color-cell'), function(d) {
  //     var domain_max = parseFloat($(d).attr("domain-attr"))
  //     var domain_min = parseFloat($(d).attr("domain-attr_min"))
  //     color_scale.domain([domain_min, (domain_min+domain_max)/2, domain_max])
  //     var indicator_np = $(d).attr("indicator_sign")
  //     indicator_np == 'positive' ? color_scale.range(['red', 'white', 'green']) : color_scale.range(['green', 'white', 'red'])
  //     if ($(d).attr('value') != 0) {
  //       $(d).css('background-color', color_scale($(d).attr('value')))
  //     }else if($(d).attr('indicator_sign') == 'negative') {
  //       $(d).css('background-color', color_scale($(d).attr('value')))
  //     }
  //   })
  //   var selected_geo = url.searchKey[select] || defaults.state_name
  //   if(select == 'block') selected_geo += ' - ' + url.searchKey.district
  //   $('.table-title').text(selected_geo)
  //   if(_.includes(Object.keys(district_name_mapping), $('.table-title').text().trim()))
  //   $('.table-title').text(district_name_mapping[$('.table-title').text().trim()])
  //   $('.loading-icon').hide()

  //   //For changing icons on accordition
  //   $(".collapse-body").on("show.bs.collapse", function(){
  //     $(this).parent().find(".collapse-header .fa").removeClass("fa-minus")
  //     $(this).parent().find(".collapse-header .fa").addClass("fa-plus")
  //   })
  //   $(".collapse-body").on("hide.bs.collapse", function(){
  //     $(this).parent().find(".collapse-header .fa").removeClass("fa-plus")
  //     $(this).parent().find(".collapse-header .fa").addClass("fa-minus")
  //   })
  // })
  // .template({
  //   selection: table_selection,
  //   type: filter_type,
  //   indicator_data: table_indicator_data,
  //   mapping: indicator_mapping,
  //   select: select
  // })
  show_insights("indicator");
}

function get_indicator_type(indicator) {
  return _.find(indicator_mapping, { indicator_name: indicator })
    .positive_negative;
}

function merge_best_district(obj, src) {
  var p_n = get_indicator_type(src.name);
  if (p_n == "negative") return obj.name == src.name && obj.max == src.min;
  return obj.name == src.name && obj.max == src.max;
}

function show_insights(table_name) {
  var month = url.searchKey["month"];
  var year = url.searchKey["year"] || defaults.year;
  var date =
    month !== undefined
      ? moment(year + "-" + month + "-01", "YYYY-MMM-DD").format("YYYY-MM-DD")
      : defaults.date;
  var table_selection = set_table_selection();
  var val = url.searchKey["val"] || defaults.val;
  var name = url.searchKey[val] || defaults.name;
  var quarter = url.searchKey["quarter"];
  var parameter, current_selection, prev_selection, curr_year, prev_year;
  var level = url.searchKey["level"] || defaults.level;
  var select = url.searchKey["select"];
  var filter_type = url.searchKey["filter_type"] || defaults.filter_type;
  var params = {},
    prev_params = {};
  var current_data, previous_data, merged_data; /*curr_sum, prev_sum*/
  if (table_selection === "month") {
    current_selection = date;
    prev_selection = moment(date).subtract(1, "month").format("YYYY-MM-01");
    params["date"] = current_selection;
    prev_params["date"] = prev_selection;
  } else if (table_selection === "quarter") {
    current_selection = parseInt(quarter[1]);
    prev_selection = parseInt(url.searchKey["prev_quarter"][1]);
    curr_year = parseInt(year);
    prev_year = parseInt(url.searchKey["prev_year"]);
    params["quarter"] = current_selection;
    prev_params["quarter"] = prev_selection;
    params["year"] = curr_year;
    prev_params["year"] = prev_year;
  } else {
    current_selection = parseInt(year);
    prev_selection = parseInt(url.searchKey["prev_year"]);
    params["year"] = current_selection;
    prev_params["year"] = prev_selection;
  }
  if (table_name === "table") {
    $("#table-insights").empty();
    if (name === "composite_score") {
      parameter = "composite_index";
    } else if (name === "% ANC registered in First trimester") {
      parameter = "perc_point";
    } else {
      parameter = val + "_index";
    }
    if (name !== "composite_score") {
      params[val] = name;
      prev_params[val] = name;
    }
    params["_by"] = level;
    if (level == "district" && url.searchKey.slider)
      params["map_id"] =
        defaults.district_priority[parseInt(url.searchKey.slider) - 1];
    params["_c"] = parameter + "|avg";
    prev_params["_by"] = level;
    prev_params["_c"] = parameter + "|avg";
    var _type = {
      table: select,
      niti_table: select + "_niti",
      cmo_table: select + "_cmo",
      table_noauth: select + "_cm",
    };
    ind_type = _type[url.file]; //user_info.user == 'CM_Office1' ? select + '_cm' : _type[url.file]
    current_data = rename_key(
      UI.fetch_data(data_map[ind_type][table_selection], params),
      parameter + "|avg",
      "curr_score"
    );
    previous_data = rename_key(
      UI.fetch_data(data_map[ind_type][table_selection], prev_params),
      parameter + "|avg",
      "prev_score"
    );
    merged_data = _.map(current_data, function (obj) {
      var find = {};
      find[level] = obj[level];
      return _.assign(obj, _.find(previous_data, find));
    });
    merged_data = _.orderBy(merged_data, "curr_score", "desc");
    // var inc_count = _.filter(merged_data, function(d) { return d.curr_score > d.prev_score}).length
    var total = merged_data.length;
    // var dec_count = total - inc_count
    // curr_sum = _.sumBy(merged_data, 'curr_score')
    // prev_sum = _.sumBy(merged_data, 'prev_score')
    if (total) {
      //#region table-insights
      // $('.table-insights').template({
      //   total: total,
      //   inc_count: inc_count,
      //   dec_count: dec_count,
      //   level: level,
      //   selected_name: name,
      //   top_three: merged_data[0][level]+', '+merged_data[1][level]+', '+merged_data[2][level],
      //   bottom_three: merged_data[total-3][level]+', '+merged_data[total-2][level]+', '+merged_data[total-1][level],
      //   change: _.round((curr_sum - prev_sum)/prev_sum * 100, 2)
      // })
      //#endregion
    }
  } else {
    $("#indicator-insights").empty();
    name = defaults.state_name;
    if (select === undefined) {
      select = "division";
    } else {
      params[select] = url.searchKey[select];
      name = url.searchKey[select];
    }
    params["_by"] = filter_type;
    params["_c"] = filter_type + "_index|avg";
    prev_params["_by"] = filter_type;
    prev_params["_c"] = filter_type + "_index|avg";
    current_data = rename_key(
      UI.fetch_data(data_map[ind_type][table_selection], params),
      filter_type + "_index|avg",
      "curr_score"
    );
    previous_data = rename_key(
      UI.fetch_data(data_map[ind_type][table_selection], prev_params),
      filter_type + "_index|avg",
      "prev_score"
    );
    merged_data = _.map(current_data, function (obj) {
      var find = {};
      find[filter_type] = obj[filter_type];
      return _.assign(obj, _.find(previous_data, find));
    });
    _.each(merged_data, function (row) {
      row["change"] =
        _.round(
          ((row.curr_score - row.prev_score) / row.prev_score) * 100,
          2
        ) || 0;
    });
    merged_data = _.orderBy(merged_data, "change", "desc");
    $(".footer-note").template({
      month: moment(date).subtract(1, "month").format("MMM"),
    });
    // curr_sum = _.sumBy(merged_data, 'curr_score')
    // prev_sum = _.sumBy(merged_data, 'prev_score')
    //#region indicator-insights
    // if(merged_data.length && user_info.user != 'CM_Office1') {
    //   $('.indicator-insights').template({
    //     name: name,
    //     filter_type: filter_type,
    //     change: _.round((curr_sum - prev_sum)/prev_sum * 100, 2),
    //     first: merged_data[0],
    //     last: merged_data[merged_data.length - 1]
    //   })
    // }
    //#endregion
  }
}

/* Add rank based on key */
function add_ranks(arr, key, type, next) {
  // var _type = {
  //   'table': type,
  //   'niti_table':type+'_niti',
  //   'cmo_table': type+'_cmo'
  // }
  url = g1.url.parse(location.href);
  var url_indicator = url.searchKey["indicator"] || _def_inds[url.file]; //(url.file == 'table' ? 'composite_score' : '% ANC registered in First trimester')
  var indicator_np = _.find(indicator_mapping, {
    indicator_name: url_indicator,
  }).positive_negative;

  arr =
    indicator_np == "positive"
      ? _.reverse(_.sortBy(arr, key))
      : _.sortBy(arr, key);

  var counter = 0;
  var default_val = -1;
  arr.forEach(function (row) {
    // row[key] = _.round(row[key], 2)
    if (row[key] != null && (row[key] || indicator_np == "negative")) {
      var _ind = _def_inds[url.file]; //url.file == 'table' ? 'composite_score' : '% ANC registered in First trimester'
      if (url_indicator == _ind || default_val != row[key]) {
        counter += 1;
      }
      default_val = row[key];
      row["rank"] = counter;
    } else row["rank"] = counter + 1;
    row["type"] = type;
    row["next"] = next;
  });
  return arr;
}

/* Merge date, quarter, year arrays */
function merge_arrays(array1, array2, key) {
  var merged_data = [];
  if (user_info.user != "CM_Office1") {
    merged_data = _.map(array1, function (obj) {
      var find = {};
      find[key] = obj[key];
      return _.assign(obj, _.find(array2, find));
    });
  } else {
    merged_data = _.merge(_.keyBy(array1, key), _.keyBy(array2, key));
    merged_data = _.values(merged_data);
  }
  return merged_data;
}

$(function () {
  url = g1.url.parse(location.href);
  table_config = defaults.table_config;
  // var user = js_user
  // var user_data = UI.fetch_data("user_login_details", $.param({user:[user]}, true))[0]
  $(".nav-bar")
    .on("template", function () {
      // logged user is extracted to determine if district or not
      var _attr = url.file; //== 'table' ? "table" : "niti_table"
      $("a[data-attr=" + _attr + "]").addClass("active-tab");
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";
      $(".page-sidenav")
        .on("template", function () {
          let lat_url = "get_maximum_date_district";
          if (url.file == "niti_table") {
            lat_url = "get_niti_maximum_date_district";
          } else if (url.file == "cmo_table") {
            lat_url = "get_maximum_date";
          } else if (url.file == "table_noauth") {
            lat_url = "last_update_noauth";
          }
          $.getJSON(lat_url, function (data) {
            var date_t = moment(data[0]["date"]).format("MMM yyyy");
            $(".last_date").text(date_t);
            // $(".last_date").text("jan 2023");
          });
          $(".user_name").text(user_info.user);
          $(".user-profile").template({
            user_name: user_info.user,
            details: {
              mobile: user_info.phonenumber || "Not Provided",
              district: user_info.district || "All",
              designation: user_info.designation || "Admin",
              program: user_info.program || "None",
            },
          });
        })
        .template({ user: user_info.designation || "Admin" });
      UI.load_calendar();
      $(".insights").template();
      render_search_bar_template();
    })
    .template({ user: user_info.user });
  $("#double-label-slider")
    .slider({
      max: 2,
      min: 0,
      value: url.searchKey.slider || 0,
      animate: 100,
      change: function (event, el) {
        $.when($(".loading-icon").show()).then(function () {
          url.update({ slider: el.value });
          window.history.pushState({}, "", url.toString());
          update_rows(el.value, defaults);
          show_insights("table");
          $(".loading-icon").hide();
        });
      },
    })
    .slider("pips", {
      rest: "label",
      labels: doubleLabels,
    });
  let user_config = set_user_details(defaults);
  user_district = user_config.user_district;
  user_division = user_config.user_division;
  url = g1.url.parse(location.href);
  var level = url.searchKey.level || defaults.level;
  if (user_info.division != "" && user_info.district == "") level = "division";
  if (!url.searchKey.select) {
    if (level === "district")
      url.update({ select: "district", district: user_district });
    else
      url.update({
        level: "division",
        select: "division",
        division: user_division,
      });
  } else {
    var select = url.searchKey.select;
    if (!url.searchKey[select]) {
      var param = {};
      param[select] = select === "division" ? user_division : user_district;
    }
  }
  window.history.pushState({}, "", url.toString());
  redraw_table_view(defaults, _def_inds, default_ind);

  // code which hides/displays negative indicator text
  var url_indicator =
    url.searchKey.indicator_id || (url.file == "table" ? "" : "indicator_1"); // indicator_1 is in niti view
  var indicator_np = _.find(indicator_mapping, { indicator_id: url_indicator });
  if (indicator_np.positive_negative == "positive") {
    $(".negative_indication").hide();
  } else {
    $(".negative_indication").show();
  }
});

$("body")
  .urlfilter({
    selector: ".urlfilter",
    target: "pushState",
  })
  .on("urlfilter", redraw_table_view);

$(document)
  .on("click", ".division-name", function () {
    $(".up-name,.division-name,.district-name,.block-name").removeClass(
      "selected-name"
    );
    $(this).addClass("selected-name");
    url.update({ select: "division", division: $(this).attr("data-attr") });
    window.history.pushState({}, "", url.toString());
    render_indicator_table();
  })
  .on("click", ".block-name", function () {
    $(".up-name,.division-name,.district-name,.block-name").removeClass(
      "selected-name"
    );
    $(this).addClass("selected-name");
    url.update({
      select: "block",
      block: $(this).attr("data-attr"),
      district: $(this).data("parent"),
    });
    window.history.pushState({}, "", url.toString());
    render_indicator_table();
  })
  .on("click", ".district-name", function () {
    $(".up-name,.division-name,.district-name,.block-name").removeClass(
      "selected-name"
    );
    $(this).addClass("selected-name");
    url.update({ select: "district", district: $(this).attr("data-attr") });
    window.history.pushState({}, "", url.toString());
    render_indicator_table();
  })
  .on("click", ".up-name", function () {
    $(".division-name,.district-name,.block-name").removeClass("selected-name");
    $(this).addClass("selected-name");
    var url_update = {};
    var val = url.searchKey["select"];
    if (val !== undefined) {
      url_update["select"] = url.searchKey["select"];
      url_update[val] = url.searchKey[val];
      url.update(url_update, "select=del&" + val + "=del");
      window.history.pushState({}, "", url.toString());
      render_indicator_table();
    }
  })
  .on("change", "#level", function () {
    url.update(
      {
        select: url.searchKey["select"] || "",
        division: url.searchKey["division"] || "",
        district: url.searchKey["district"] || "",
        block: url.searchKey["block"] || "",
      },
      "del"
    );
    var val = $(this).prop("checked") ? "district" : "division";
    url.update({ level: val });
    if (val === "district") {
      url.update({ select: "district", district: user_district });
      $("#double-label-slider").removeClass("d-none");
    } else {
      url.update({ select: "division", division: user_division });
      $("#double-label-slider").addClass("d-none");
    }
    if ($(this).prop("checked")) {
      $(".level-district").removeClass("text-secondary");
      $(".level-division").addClass("text-secondary");
    } else {
      $(".level-division").removeClass("text-secondary");
      $(".level-district").addClass("text-secondary");
    }
    window.history.pushState({}, "", url.toString());
    $.when($(".loading-icon").show()).then(redraw_table_view);
  })
  .on("click touch", ".level-one", function () {
    if ($(this).find("i").hasClass("fa-plus")) {
      $(".level-one i").removeClass("fa-minus").addClass("fa-plus");
      $(this).find("i").removeClass("fa-plus").addClass("fa-minus");
    } else {
      $(".level-one i").removeClass("fa-minus").addClass("fa-plus");
      $(this).find("i").removeClass("fa-minus").addClass("fa-plus");
    }
  })
  .on("click touch", ".bg-table-clr2", function () {
    if ($(this).find("i").hasClass("fa-plus")) {
      $(".bg-table-clr2 i").removeClass("fa-minus").addClass("fa-plus");
      $(this).find("i").removeClass("fa-plus").addClass("fa-minus");
    } else {
      $(".bg-table-clr2 i").removeClass("fa-minus").addClass("fa-plus");
      $(this).find("i").removeClass("fa-minus").addClass("fa-plus");
    }
  })
  // .on('click touch', '#accordion', function(){
  //   if($(this).find('i').hasClass('fa-plus')){
  //     $('#accordion i').removeClass('fa-minus').addClass('fa-plus')
  //     $(this).find('i').removeClass('fa-plus').addClass('fa-minus')
  //   }
  //   else {
  //     $('#accordion i').removeClass('fa-minus').addClass('fa-plus')
  //     $(this).find('i').removeClass('fa-minus').addClass('fa-plus')
  //   }
  // })
  .on("click touch", ".table-plus", function () {
    var url_indicator =
      url.searchKey["indicator"] ||
      (url.file == "table"
        ? "composite_score"
        : "% ANC registered in First trimester");
    var indicator_dist = _.find(indicator_mapping, {
      indicator_name: url_indicator,
    }).type_ind;
    if (indicator_dist == "district" && $(this).data("attr") == "district")
      swal(
        "",
        "This is a district level indicator. Data is not available at block level!",
        "info"
      );
  })

  .on("click", ".ui-autocomplete li", function () {
    var ele = $(this).find(".ui-menu-item-wrapper").html().toLowerCase();
    ele = ele.split(" ").join("-");
    var target = $('.table-container #level-one [href="#' + ele + '"]');
    target.find("i").click();
    $('.deepdive-table [data-val="' + ele + '"]').click();
  })
  .on("click", ".level-one-card .level-one", function () {
    if ($(this).attr("aria-expanded") === "true") {
      let val = $(this).attr("href");
      url.update({ toggle: val });
      window.history.pushState({}, "", url.toString());
    } else {
      url.update({ toggle: null });
      window.history.pushState({}, "", url.toString());
    }
  })

  .on("click", ".download-data", function () {
    var today_date = new Date();
    // Data_Report_Requirement-8-1-2020
    var filename = [
      "Data_Report_Requirement",
      today_date.getDate(),
      today_date.getMonth() + 1,
      today_date.getFullYear(),
    ].join("-");

    // TODO - add quarter date filter
    var date_filter =
      table_selection == "year"
        ? moment(get_fin_year(date) - 1 + "-04-01").format("YYYY-MM-DD")
        : date;

    // Case 1 : District download
    if ($(this).attr("geography") == "district") {
      var dist_link =
        download_map["district"][table_selection] +
        "?date=" +
        date_filter +
        "&url_file=" +
        url.file +
        "&area=district&_format=xlsx&_download=" +
        filename +
        "_district.xlsx";
      location.href = dist_link;
    }
    // Case 2 : Division download
    if ($(this).attr("geography") == "division") {
      var div_link =
        download_map["division"][table_selection] +
        "?date=" +
        date_filter +
        "&url_file=" +
        url.file +
        "&area=division&_format=xlsx&_download=" +
        filename +
        "_division.xlsx";
      location.href = div_link;
    }
    // Case 3 : block download
    if ($(this).attr("geography") == "block") {
      var dist_div = url.searchKey.district || url.searchKey.division;
      filename = dist_div + "-" + filename;
      var block_link =
        download_map["block"][table_selection] +
        "?date=" +
        date_filter +
        "&url_file=" +
        url.file +
        "&area=block&_format=xlsx&_download=" +
        filename +
        "_block.xlsx";
      location.href = block_link;
    }
  });
