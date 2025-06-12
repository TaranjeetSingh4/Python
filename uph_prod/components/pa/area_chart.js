/* exported get_area_chart_spec */
function get_area_chart_spec(_config) {
  // var color_scale = d3.scaleLinear().range(['#FE4C46', '#FFBF55', '#4DC61D'])
  // color_scale.domain([0, 50, 100])
  // var color_date = moment(url.searchKey['date']).format("MMM-YY").toUpperCase()
  // var color_value = _.find(_config.data, function(d) {return d.date == color_date})
  // var cell_color = color_value ? color_scale(color_value['value'] || 0) : ""
  // var filling_color = "(datum.date == '"+color_date+"') ? '"+cell_color+"' : 'white'"
  var spec = {
    $schema: "https://vega.github.io/schema/vega/v4.json",
    width: _config.width,
    height: _config.height,
    autosize: "fit",
    data: [
      {
        name: "table",
        values: _config.data,
      },
    ],
    scales: [
      {
        name: "xscale",
        type: "band",
        domain: {
          data: "table",
          field: "date",
        },
        range: "width",
        // "padding": 0.7,
        paddingInner: 1,
      },
      {
        name: "yscale",
        domain: {
          data: "table",
          field: "value",
        },
        range: "height",
      },
    ],
    axes: [
      {
        orient: "bottom",
        scale: "xscale",
        ticks: false,
        labelPadding: 5,
        labelFontSize: 8,
        domainColor: "#9E9E9E",
        encode: {
          labels: {
            update: {
              fill: { value: "#999CA1" },
            },
          },
        },
      },
    ],
    marks: [
      {
        type: "area",
        from: {
          data: "table",
        },
        encode: {
          enter: {
            x: {
              scale: "xscale",
              field: "date",
            },
            width: {
              scale: "xscale",
              band: 1,
            },
            y: {
              scale: "yscale",
              field: "value",
            },
            y2: {
              scale: "yscale",
              value: 0,
            },
            fill: {
              value: "rgb(189, 219, 239)",
            },
            fillOpacity: { value: 0.7 },
            interpolate: { value: "linear" },
          },
        },
      },
      {
        name: "color-cell-datum",
        type: "rule",
        from: { data: "table" },
        encode: {
          enter: {
            x: { scale: "xscale", field: "date" },
            width: { scale: "xscale", band: 1 },
            y: { scale: "yscale", field: "value" },
            y2: { scale: "yscale", value: 0 },
          },
          update: {
            stroke: { value: "white" },
            fill: { value: "white" },
          },
        },
      },
      {
        name: "top_line",
        type: "line",
        from: {
          data: "table",
        },
        encode: {
          enter: {
            x: {
              scale: "xscale",
              field: "date",
            },
            y: {
              scale: "yscale",
              field: "value",
            },
            stroke: {
              value: "#007bff",
            },
          },
          update: {},
        },
      },
      {
        type: "symbol",
        from: {
          data: "table",
        },
        encode: {
          enter: {
            x: {
              scale: "xscale",
              field: "date",
            },
            y: {
              scale: "yscale",
              field: "value",
            },
            stroke: {
              value: "#ABD2FF",
            },
            size: {
              value: 70,
            },
          },
          update: {
            fill: { value: "#FFFFFF" },
            tooltip: { signal: "{'Curr. Score': format(datum.value, '0.2f')}" },
          },
          hover: {
            fill: { value: "#5395E2" },
          },
        },
      },
    ],
  };
  return spec;
}

$("body")
  .on("mouseover", ".mark-symbol", function () {
    $("#vg-tooltip-element").addClass(
      "bg-white border border-primary rounded tail-bc"
    );
  })
  .on(".indicator_district_card")
  .mouseout(function () {
    $("#vg-tooltip-element").removeClass(
      "bg-white border border-primary rounded tail-bc"
    );
  });
