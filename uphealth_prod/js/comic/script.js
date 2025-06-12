/* globals dict, g1, dumbel_chart, render_map, start_date:true, end_date:true, user_district */
/* exported indian_number_format, alignBubbles, page2_indicator */

let district_id_mapping = {
  "Siddharth Nagar": 1,
  Gonda: 2,
  Pratapgarh: 3,
  Jalaun: 4,
  Ballia: 5,
  Maunathbhanjan: 6,
  Unnav: 7,
  "Ambedkar Nagar": 8,
  Kushinagar: 9,
  Maharajganj: 10,
  "Sant Kabir Nagar": 11,
  Agra: 12,
  Sambhal: 13,
  Azamgarh: 14,
  Bijnor: 15,
  Fatehpur: 16,
  Muzaffarnagar: 17,
  Shrawasti: 18,
  Deoria: 19,
  Mirzapur: 20,
  Etah: 21,
  "Lakhimpur Kheri": 22,
  Bahraich: 23,
  Mathura: 24,
  Jhansi: 25,
  Rampur: 26,
  Firozabad: 27,
  Shahjahanpur: 28,
  Pilibhit: 29,
  Meerut: 30,
  Saharanpur: 31,
  Shamli: 32,
  Amroha: 33,
  Prayagraj: 34,
  "Gautam Buddha Nagar": 35,
  Hamirpur: 36,
  Auraiya: 37,
  Chitrakoot: 38,
  Ghaziabad: 39,
  Sultanpur: 40,
  Barabanki: 41,
  Mahoba: 42,
  Mainpuri: 43,
  Aligarh: 44,
  Gorakhpur: 45,
  Hapur: 46,
  Banda: 47,
  Hathras: 48,
  Farrukhabad: 49,
  Bhadohi: 50,
  Moradabad: 51,
  Bulandshahar: 52,
  Lucknow: 53,
  Jaunpur: 54,
  Varanasi: 55,
  Bareilly: 56,
  "Kanpur Dehat": 57,
  Budaun: 58,
  "Rae Bareli": 59,
  Sitapur: 60,
  Chandauli: 61,
  Etawah: 62,
  Kaushambi: 63,
  Hardoi: 64,
  "Kanpur Nagar": 65,
  Bagpat: 66,
  Ghazipur: 67,
  Lalitpur: 68,
  Ayodhya: 69,
  Kasganj: 70,
  Basti: 71,
  Balrampur: 72,
  Kannauj: 73,
  Sonbhadra: 74,
  Amethi: 75,
};
var curr_mn,
  curr_yr,
  district_name, // eslint-disable-line
  prev_mn,
  prev_yr,
  st,
  max_date,
  new_dumbell_data_,
  glb_wrst_ind;
var short_indicators = {
  "% of C-section delivery against reported delivery (30% to DH)":
    "C-Section Delivery Rate (30% To DH)",
  "% of C-section delivery against reported delivery (70% weightage to CHC)":
    "C-Section Delivery Rate (70% To CHC)",
  "% of PW screened for HIV against estimated pregnancy": "PW Screened for HIV",
  "% of children received full immunization (BCG, Penta 1, 2, 3, Measles)":
    "Full Immunization",
  "% of facilities reported non blank value (including zero) for the identified indicators of ranking":
    "Facilities Reported Non-Blank Value",
  "% of facilities reported outlier for the identified indicators of ranking":
    "Facilities Reported Outlier",
  "% of newborns received HBNC visits (Institutional Delivery and Home Delivery)":
    "Newborns Received HBNC Visits",
  "% of pregnant women delivered in institution against estimated delivery":
    "Institutional Delivery Rate",
  "% of pregnant women received 4 or more ANC and tested for Hb against estimated PW":
    "PW Screened 4 Or More ANC With Hb Testing",
  "Per ASHA expenditure of ASHA incentive fund": "Per ASHA Incentive",
  "Permanent Method accepted per 1000 EC":
    "Permanent Method Accepted Per 1000 EC",
  "Ratio of Pentavalent 3 to BCG": "Ratio Of Pentavalent 3 To BCG",
  "Reversible Method accepted per 1000 EC":
    "Reversible Method Accepted Per 1000 EC",
  "Still birth ratio": "Still Birth Ratio",
  "Total case notification rate of TB against expected TB cases":
    "TB Notification Rate",
};

let district_indicators = [
  "% of C-section delivery against reported delivery (30% to DH)",
  "% of C-section delivery against reported delivery (70% weightage to CHC)",
  "Total case notification rate of TB against expected TB cases",
  "% of pregnant women received 4 or more ANC and tested for Hb against estimated PW",
  "Per ASHA expenditure of ASHA incentive fund",
];

let district_mapping = {
  "Gautam Buddha Nagar": "G B Nagar",
  Maunathbhanjan: "Mau",
  "Sant Kabir Nagar": "Sant K Nagar",
};

let negative_indicators = [
  "Still birth ratio",
  "% of facilities reported outlier for the identified indicators of ranking",
];

let dhq_eliminate = [
  "% of newborns received HBNC visits (Institutional Delivery and Home Delivery)",
];

$("body")
  .on("click", ".button-pdf", function () {
    let url = g1.url.parse(location.href);
    url["pathname"] = `${url.pathname}pdf`;
    let district_name = $.trim($(".dropbtn").text());
    let params = {
      start: ["start"],
      ext: ["pdf"],
      file: [district_name],
    };
    // location.href = `capture?ext=png&selector=.content&delay=5000&width=1650&height=900&file=${district_name}&url=` + encodeURIComponent(url)
    // location.href = `capture?ext=pdf&pageRanges=2-3&delay=5000&file=${district_name}&media=print&format=A4&orientation=landscape&url=` + encodeURIComponent(url)
    params["orientation"] = ["landscape"];
    params["delay"] = ["10000"];
    params["format"] = ["A4"];
    location.href =
      "capture?url=" + encodeURIComponent(url) + "&" + $.param(params, true);
  })
  .on("click", ".select_district", function () {
    // location.reload()
    let district_id = $(this).attr("data-id");
    url = update_url({
      district_id_num: district_id,
    });
    // location.href = '#?' + url.search
    location.reload();
  })
  .on("click", ".translate", function () {
    let selectedLang = $(this).val();
    update_url({
      lang: selectedLang,
    });
    if (selectedLang == "hi") {
      $(".trans-en").addClass("d-none");
      $(".trans-en").removeClass("d-block");
      $(".trans-hi").removeClass("d-none");
      $(".trans-hi").addClass("d-block");
      translator.lang("hi");
      $(".translate").val("en");
      $(".translate").text("English");
    } else {
      $(".trans-en").addClass("d-block");
      $(".trans-en").removeClass("d-none");
      $(".trans-hi").removeClass("d-block");
      $(".trans-hi").addClass("d-none");
      translator.lang("en");
      $(".translate").val("hi");
      $(".translate").text("हिंदी");
    }
    new_dumbell_data_ = _.map(new_dumbell_data_, function (d) {
      d.perc_point == 0 ? (d.perc_point = "0.0") : d.perc_point;
      d.perc_point_prev == 0 ? (d.perc_point_prev = "0.0") : d.perc_point_prev;
      d.chanage == 0 ? (d.chanage = "0.0") : d.chanage;
      d.block_name = d.block_name; // eslint-disable-line
      return d;
    });
    $(".dumbell_chart").empty();
    dumbel_chart(new_dumbell_data_, glb_wrst_ind);
  });
var url = parse_url();
$.get("latestdate", function (data) {
  max_date = moment(data[0].date).format("YYYY-MM-DD");
  let sdate = moment(data[0].date).format("YYYY-MM-DD");
  let edate = moment(data[0].date).subtract(1, "months").format("YYYY-MM-DD");
  let url_params = parse_url().searchKey;
  var district_id_num;
  if (url_params.start_date === undefined) {
    start_date = sdate;
  } else {
    start_date = url_params.start_date;
  }
  if (url_params.end_date === undefined) {
    end_date = edate;
  } else {
    end_date = url_params.end_date;
  }
  if (url_params.district_id_num === undefined) {
    district_id_num =
      district_id_mapping[user_district] != undefined
        ? district_id_mapping[user_district]
        : 12;
  } else {
    district_id_num = url_params.district_id_num;
  }
  url = update_url({
    district_id_num: district_id_num,
    start_date: start_date,
    end_date: end_date,
  });
  st = url.search;
  $.get("find_districts", function (districts) {
    $(".navbar_custom")
      .on("template", function () {
        _.each(districts, function (district) {
          if (district.district_id_num == url.searchKey.district_id_num) {
            $(".btn-text").html(district.district_name);
          }
        });
      })
      .template({
        districts: districts,
      });
  });
  load_page1();
});

function update_url(obj) {
  var url_args = parse_url().update(obj);
  history.pushState({}, "", "?" + url_args.search);
  return url_args;
}

function parse_url() {
  return g1.url.parse(location.href);
}

function load_page1() {
  $.get("page1_data?" + st, function (data) {
    curr_mn = data["curr_month"][0].curr_month;
    curr_yr = data["curr_year"][0].curr_year;
    prev_mn = data["prev_month"][0].prev_month;
    prev_yr = data["prev_year"][0].prev_year;
    $(".district-summary-wrapper")
      .on("template", function () {
        render_map(data["block_data"]);
      })
      .template({
        block_data: remove_district_name(
          data["block_data"],
          data["district_name"][0].district_name
        ),
        block_data_prev: remove_district_name(
          data["block_data_prev"],
          data["district_name"][0].district_name
        ),
        rank_curr: data["rankdata_curr"][0],
        rank_prev: data["rankdata_prev"][0],
        dname:
          district_mapping[data["district_name"][0].district_name] !== undefined
            ? district_mapping[data["district_name"][0].district_name]
            : data["district_name"][0].district_name,
        curr_mn: curr_mn,
        prev_mn: prev_mn,
        curr_yr: curr_yr,
        prev_yr: prev_yr,
      });

    var SVG = d3.select("#my_dataviz3");

    // create a list of keys
    var keys = ["1", "2", "3"];

    // Usually you have a color scale in your chart already
    var color = d3
      .scaleOrdinal()
      .domain(keys)
      .range(["red", "green", "orange"]);

    var size = 5;

    SVG.append("text")
      .attr("x", 10)
      .attr("y", 5) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", "black")
      .text("Top")
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .style("font-size", "12px");

    // Add one dot in the legend for each name.
    SVG.selectAll("mydots")
      .data(keys)
      .enter()
      .append("rect")
      .attr("x", 10)
      .attr("y", function (d, i) {
        return 20 + i * (size + 5);
      }) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", 40)
      .attr("height", 5)
      .style("fill", function (d) {
        return color(d);
      });

    SVG.append("text")
      .attr("x", 10)
      .attr("y", 60) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", "black")
      .text("Bottom")
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .style("font-size", "12px");

    load_page2();
  });
}

//rendering bubbles
function alignBubbles() {
  // let position = $(".area").position();
  let areaWidth = $(".line")[0].getBBox();
  // $('.bubble-main').css('margin-left', -margin.left)
  $(".bubble-main").css("max-width", areaWidth.width + 30);
}

var chart_data_;
var page2_indicator;
var indicator_sequence;
// $.get("page2_areachart?"+st, function(chart_data) {
//   chart_data_ = chart_data
// })
function load_page2() {
  $.get("page2_data?" + st, function (indicator_data) {
    indicator_sequence = indicator_data.indicator_sequence;
    $.get(
      `page2_areachart?${st}&indicator_id=${indicator_data.worst_indicator[0].indicator_id}&district=${indicator_data.district_name[0].district_name}`,
      function (chart_data) {
        chart_data_ = chart_data;
        page2_indicator = indicator_data.worst_indicator[0].name;
        //if number of indicators below up avg are 0
        let mindate = chart_data.min_date_filter[0].min_date;
        let min_date = moment(mindate).add(1, "months").format("YYYY-MM-DD");
        let worst_indicator_data;
        if (indicator_data.comp_up_avg[0].below_up_avg < 0) {
          worst_indicator_data = indicator_data.worst_indicator[0];
        } else {
          worst_indicator_data = {
            name: indicator_data.res[0].indicator_name,
            score: indicator_data.res[0].month_wise,
            up_avg: indicator_data.res[0].up_avg,
            best_dist: indicator_data.res[0].best_district_name,
            best_dist_score: indicator_data.res[0].best_district_score,
          };
        }
        let district_worst_indicator;
        for (let i = 0; i < indicator_data.res.length; i++) {
          if (
            !district_indicators.includes(indicator_data.res[i].indicator_name)
          ) {
            district_worst_indicator = indicator_data.res[i].indicator_name;
            break;
          }
        }
        $(".indicator-summary-wrapper")
          .on("template", function () {
            let start_date = parse_url().searchKey.start_date;

            $("#datepicker").datepicker({
              maxDate: max_date,
              minDate: min_date,
              // dateFormat: 'yy-mm-d',
              // container: container,
              todayHighlight: true,
              autoclose: true,
              dateFormat: "yy-mm-dd",
              changeMonth: true,
              changeYear: true,
              showButtonPanel: true,
              // defaultDate: '01-01-2021',
              onClose: function () {
                var month = $(
                  "#ui-datepicker-div .ui-datepicker-month :selected"
                ).val();
                var year = $(
                  "#ui-datepicker-div .ui-datepicker-year :selected"
                ).val();
                $(this).val(
                  $.datepicker.formatDate("yy-mm-dd", new Date(year, month, 1))
                );
                console.log($("#datepicker").val());
                update_url({
                  start_date: $("#datepicker").val(),
                  end_date: moment($("#datepicker").val(), "YYYY-MM-DD")
                    .subtract(1, "month")
                    .format("YYYY-MM-DD"),
                });
                console.log(location);
                location.reload();
              },
            });
            $("#datepicker").datepicker("setDate", start_date);

            // .on('change', function(selected){
            //   // update_url({
            //   //   start_date: district_id
            //   // })
            //   console.log(selected, 'selected')
            //   console.log("startDate..."+moment(selected.timeStamp).format('DD MMM YYYY'));
            //   console.log($('#datepicker').val())
            // });

            $("#datepicker").focus(function () {
              $(".ui-datepicker-calendar").hide();
              $("#ui-datepicker-div").position({
                my: "center top",
                at: "center bottom",
                of: $(this),
              });
            });

            // set the dimensions and margins of the graph
            var margin = { top: 10, right: 30, bottom: 30, left: 15 },
              width = 350 - margin.left - margin.right,
              height = 250 - margin.top - margin.bottom;

            function getmonColor(rank) {
              if (rank < 26) return "#85D5AA";
              else if (rank < 51) return "#F8E06A";
              else return "#e74d4d80";
            }

            // console.log(d3.select("#my_dataviz"), "data viz");

            // append the svg object to the body of the page
            var svg = d3
              .select("#my_dataviz")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
              );

            //  d3.json("page2_areachart?"+st,
            // function(data) {
            let data = chart_data_.area_chart;
            data.forEach(function (d) {
              d.date = d.date; // eslint-disable-line
              d.value = d.value; // eslint-disable-line
            });

            // Add X axis --> it is a date format
            var x = d3
              .scaleTime()
              .domain(
                d3.extent(data, function (d) {
                  return d.date;
                })
              )
              .range([0, width]);
            // svg.append("g")
            // .attr("transform", "translate(0," + (height+5) + ")")
            // .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

            // Add Y axis
            var y = d3
              .scaleLinear()
              .domain(
                d3.extent(data, function (d) {
                  return +d.value;
                })
              )
              .range([height, 100]);

            var arr = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            svg
              .selectAll("monthlabels")
              .data(data)
              .enter()
              .append("text")
              .attr("x", function (d) {
                return x(d.date);
              })
              .attr("y", 10) // 100 is where the first dot appears. 25 is the distance between dots
              .style("fill", "#747474")
              .text(function (d) {
                return arr[new Date(d.date).getMonth()];
              })
              .attr("text-anchor", "middle")
              // .style("alignment-baseline", "left")
              .style("font-size", "10px");

            var cir_radius = 12;
            svg
              .selectAll(".myMonthCircles")
              .data(data)
              .enter()
              .append("circle")
              .attr("class", "myMonthCircles")
              .attr("fill", function (d) {
                return getmonColor(d.indicator_rank);
              })
              .attr("stroke", "none")
              .attr("cx", function (d) {
                return x(d.date);
              })
              .attr("cy", 30)
              .attr("r", cir_radius);

            svg
              .selectAll(".myMonthCircles-text")
              .data(data)
              .enter()
              .append("text")
              .attr("class", "myMonthCircles-text")
              .attr("fill", "black")
              .attr("stroke", "none")
              .attr("x", function (d) {
                return x(d.date) - cir_radius / 2;
              })
              .attr("y", 30 + cir_radius / 2)
              .text(function (d) {
                return d.indicator_rank;
              })
              .style("font-size", "12px");

            // Add the area
            svg
              .append("path")
              .datum(data)
              .attr("fill", "#EBE4D3")
              .attr("fill-opacity", 0.6)
              .attr("stroke", "none")
              .attr("class", "area")
              .attr(
                "d",
                d3
                  .area()
                  .x(function (d) {
                    return x(d.date);
                  })
                  .y0(height)
                  .y1(function (d) {
                    return y(d.value);
                  })
              );

            // Add the line
            svg
              .append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "#202121")
              .attr("stroke-width", 1)
              .attr("class", "line")
              .attr(
                "d",
                d3
                  .line()
                  .x(function (d) {
                    return x(d.date);
                  })
                  .y(function (d) {
                    return y(d.value);
                  })
              );

            // Add the line
            svg
              .selectAll("myCircles")
              .data(data)
              .enter()
              .append("circle")
              .attr("fill", "#202121")
              .attr("stroke", "none")
              .attr("cx", function (d) {
                return x(d.date);
              })
              .attr("cy", function (d) {
                return y(d.value);
              })
              .attr("r", 3);

            svg
              .selectAll(".myCircles-text")
              .data(data)
              .enter()
              .append("text")
              .attr("class", "myCircles-text")
              .attr("fill", "black")
              .attr("stroke", "none")
              .attr("x", function (d) {
                return x(d.date) - cir_radius / 2;
              })
              .attr("y", function (d) {
                return y(d.value) - 10;
              })
              .text(function (d) {
                return d.value.toFixed(1);
              })
              .style("font-size", "12px");

            // alignBubbles()
            // })
            load_page3();
          })
          .template({
            table_data: indicator_data.res,
            last: indicator_data.last,
            comp_up_avg: indicator_data.comp_up_avg[0],
            worst_indicator: worst_indicator_data,
            curr_mn: curr_mn,
            curr_yr: curr_yr,
            chart_data: chart_data_.area_chart,
            district_worst_indicator: district_worst_indicator,
            dname:
              district_mapping[
                indicator_data.district_name[0].district_name
              ] !== undefined
                ? district_mapping[
                    indicator_data.district_name[0].district_name
                  ]
                : indicator_data.district_name[0].district_name,
          });
      }
    );
  });
}

var dumbell_data_;
function load_page3() {
  $.get("page3_data?" + st, function (block_data) {
    $.get("page3_dumbellchart?" + st, function (dumbell_data) {
      let dist_curr_year = _.cloneDeep(dumbell_data.dist_curr);
      let dist_prev_year = _.cloneDeep(dumbell_data.dist_prev);
      let formatData = prepareData(dumbell_data, block_data);
      dumbell_data = formatData.final_data;
      block_data = formatData.block_final_data;
      dumbell_data_ = dumbell_data;
      let curr_mn = moment(url.searchKey.start_date).format("MMM");
      let curr_yr = moment(url.searchKey.start_date).format("YYYY");
      let prev_yr = moment(url.searchKey.start_date)
        .subtract(1, "years")
        .format("YYYY");
      let reduced_performance = find_least_blocks(
        remove_district_name(
          dumbell_data_,
          block_data.district_avg[0].district_name
        ),
        block_data.district_avg[1],
        block_data.worst_indicator.indicator_name
      );
      let least_blocks = _.cloneDeep(reduced_performance);
      if (least_blocks.length > 2) {
        least_blocks = _.pullAt(least_blocks, 0, 1, 2);
      }
      let least_blocks_hindi = _.map(least_blocks, (d) =>
        dict[d] ? dict[d]["hi"] : d
      );
      least_blocks = least_blocks.join(", ");
      least_blocks_hindi = least_blocks_hindi.join(", ");
      let district_worst_indicator_curr_year = _.filter(dist_curr_year, {
        indicator_name: block_data.worst_indicator.indicator_name,
      });
      let district_worst_indicator_prev_year = _.filter(dist_prev_year, {
        indicator_name: block_data.worst_indicator.indicator_name,
      });
      $(".block-summary-wrapper")
        .on("template", function () {
          //we have to show 0 as 0.0 so below code is written. JS always convert 0 as an integer instead of decimal.
          new_dumbell_data_ = _.map(dumbell_data_, function (d) {
            d.perc_point == 0 ? (d.perc_point = "0.0") : d.perc_point;
            d.perc_point_prev == 0
              ? (d.perc_point_prev = "0.0")
              : d.perc_point_prev;
            d.chanage == 0 ? (d.chanage = "0.0") : d.chanage;
            d.block_name = d.block_name; // eslint-disable-line
            return d;
          });
          glb_wrst_ind = block_data.worst_indicator;
          dumbel_chart(new_dumbell_data_, block_data.worst_indicator);
          if (parse_url().searchKey.lang == "hi") {
            translator.lang("hi");
          }
        })
        .template({
          total_blocks: dumbell_data_.length,
          least_blocks: least_blocks,
          least_blocks_hindi: least_blocks_hindi,
          worst_indicator: block_data.worst_indicator,
          dname:
            district_mapping[block_data.district_avg[0].district_name] !==
            undefined
              ? district_mapping[block_data.district_avg[0].district_name]
              : block_data.district_avg[0].district_name,
          curr_mn: curr_mn,
          curr_yr: curr_yr,
          prev_yr: prev_yr,
          district_avg: block_data.district_avg,
          up_avg_curr_mnth: block_data.up_avg_curr_mnth[0],
          up_avg_prev_mnth: block_data.up_avg_prev_mnth[0],
          reduced_performance: reduced_performance,
          short_indicators: short_indicators,
          district_worst_indicator_curr_year:
            district_worst_indicator_curr_year,
          district_worst_indicator_prev_year:
            district_worst_indicator_prev_year,
        });
    });
  });
}

function find_least_blocks(dumbell_data_, district_avg, worst_indicator_name) {
  let data = _.cloneDeep(dumbell_data_);
  let least_blocks;
  if (negative_indicators.includes(worst_indicator_name)) {
    least_blocks = _.filter(data, function (d) {
      if (d.perc_point > district_avg.month_wise)
        return d.block_name.toString();
    });
    least_blocks = _.orderBy(least_blocks, ["perc_point"], ["desc"]);
  } else {
    least_blocks = _.filter(data, function (d) {
      if (d.perc_point < district_avg.month_wise)
        return d.block_name.toString();
    });
    least_blocks = _.orderBy(least_blocks, ["perc_point"], ["asc"]);
  }
  if (dhq_eliminate.includes(worst_indicator_name)) {
    least_blocks = _.remove(least_blocks, function (n) {
      n.block_name = n.block_name.toUpperCase();
      return !n.block_name.includes("DHQ");
    });
  }
  // least_blocks = _.sortBy(least_blocks, d => d.perc_point)
  least_blocks = _.map(least_blocks, (d) => d.block_name);
  return least_blocks;
}

function indian_number_format(num) {
  var n1, n2;
  num = num + "" || "";
  n1 = num.split(".");
  n2 = n1[1] || null;
  n1 = n1[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
  num = n2 ? n1 + "." + n2 : n1;
  return num;
}

function remove_district_name(blocks, district_name) {
  let new_blocks = _.map(blocks, function (d) {
    if (d.block_name.includes("C S M Nagar")) {
      d.block_name = d.block_name.replace("C S M Nagar", "");
      return d;
    } else {
      d.block_name = d.block_name.includes(district_name)
        ? d.block_name.replace(`${district_name} `, "")
        : d.block_name;
      return d;
    }
  });
  return new_blocks;
}

function prepareData(dumbell_data1, block_data) {
  // Per ASHA expenditure of ASHA incentive fund this is indicator is added because this we should not show in page 3 as per client request
  var data;
  var new_worst_ind;
  let district_avg;
  for (let i = 0; i < indicator_sequence.length; i++) {
    data = _.filter(dumbell_data1.curr, function (d) {
      // console.log(d)
      if (d.indicator_name == indicator_sequence[i].indicator_name) {
        d["perc_point"] = d.score;
        return d;
      }
    });
    district_avg = _.filter(block_data.district_avg, function (d) {
      if (d.indicator_name == indicator_sequence[i].indicator_name) return d;
    });
    data = find_least_blocks(
      data,
      district_avg[1],
      indicator_sequence[i].indicator_name
    );
    if (
      !district_indicators.includes(indicator_sequence[i].indicator_name) &&
      data.length != 0
    ) {
      new_worst_ind = indicator_sequence[i];
      break;
    }
  }
  var prev_data = _.filter(dumbell_data1.prev, function (d) {
    if (d.indicator_name == new_worst_ind.indicator_name) {
      d["prev_perc_point"] =
        new_worst_ind.indicator_name ==
          "Permanent Method accepted per 1000 EC" ||
        new_worst_ind.indicator_name == "Reversible Method accepted per 1000 EC"
          ? d.score.toFixed(2)
          : new_worst_ind.indicator_name ==
            "Per ASHA expenditure of ASHA incentive fund"
          ? Math.round(d.score)
          : d.score.toFixed(1);
      return d;
    }
  });
  var curr_data = _.filter(dumbell_data1.curr, function (d) {
    if (d.indicator_name == new_worst_ind.indicator_name) {
      d["perc_point"] =
        new_worst_ind.indicator_name ==
          "Permanent Method accepted per 1000 EC" ||
        new_worst_ind.indicator_name == "Reversible Method accepted per 1000 EC"
          ? d.score.toFixed(2)
          : new_worst_ind.indicator_name ==
            "Per ASHA expenditure of ASHA incentive fund"
          ? Math.round(d.score)
          : d.score.toFixed(1);
      return d;
    }
  });

  let final_data = [];
  _.each(curr_data, function (cdata) {
    _.each(prev_data, function (pdata) {
      if (cdata.block_name == pdata.block_name) {
        final_data.push({
          block_name: cdata.block_name,
          perc_point: parseFloat(cdata.perc_point),
          perc_point_prev: parseFloat(pdata.prev_perc_point),
          chanage:
            cdata.indicator_name == "Permanent Method accepted per 1000 EC" ||
            cdata.indicator_name == "Reversible Method accepted per 1000 EC"
              ? (cdata.perc_point - pdata.prev_perc_point).toFixed(2)
              : cdata.indicator_name ==
                "Per ASHA expenditure of ASHA incentive fund"
              ? Math.round(cdata.perc_point - pdata.prev_perc_point)
              : (cdata.perc_point - pdata.prev_perc_point).toFixed(1),
        });
      }
    });
  });
  // _.map(data, function(d) {
  //   d['perc_point'] = d.score
  // })
  // data = find_least_blocks(data, district_avg, worst_indicator_name)
  // console.log(data)
  let up_avg_curr = _.filter(block_data.up_avg_curr_mnth, function (d) {
    if (d.indicator_name == new_worst_ind.indicator_name) return d;
  });
  let up_avg_prev = _.filter(block_data.up_avg_prev_mnth, function (d) {
    if (d.indicator_name == new_worst_ind.indicator_name) return d;
  });
  let block_final_data = {
    total_blocks: block_data.total_blocks,
    worst_indicator: new_worst_ind,
    district_avg: district_avg,
    up_avg_curr_mnth: up_avg_curr,
    up_avg_prev_mnth: up_avg_prev,
  };
  return { final_data, block_final_data };
}

// var dict = {
//   // "text to translate": {
//   //   pt: "texto para traduzir"
//   // },
//   // "Download plugin": {
//   //   pt: "Descarregar plugin",
//   //   en: "Download plugin"
//   // }
//   "Hi Data Singh, I Want to know the key insights": {
//     hi:"हाय दाता सिंह, मैं मुख्य अंतर्दृष्टि जानना चाहता हूँ",
//     en:"Hi Data Singh, I Want to know the key insights"
//   },
//   "for Siddharth Nagar": {
//     hi:"सिद्धार्थ नगर के लिए",
//     en:" for Siddharth Nagar"
//   },
//   "FOR Apr 2021.": {
//     hi:"अप्रैल 2021 के लिए।",
//     en:"FOR apr 2021."
//   },
//   "Could you check if the data has been updated on the dashboard?": {
//     hi:"क्या आप जांच सकते हैं कि डेटा डैशबोर्ड पर अपडेट किया गया है या नहीं?",
//     en:" Could you check if the data has been updated on the dashboard?"
//   }
// }

var translator = $("body").translate({
  lang: "hi",
  t: dict,
});
