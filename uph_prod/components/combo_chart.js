/* global vega */
/* exported draw_combo_chart */
function draw_combo_chart(selector, view, data) {
  $(selector).empty();
  var _width = 400;
  if (window.innerWidth < 900) _width = 200;
  else if (window.innerWidth < 1300) _width = 250;

  var spec = {
    $schema: "https://vega.github.io/schema/vega/v4.json",
    width: _width, // For Ipad Resolution
    height: 75,
    autosize: "fit",
    data: [
      {
        name: "table",
        values: data,
      },
    ],
    signals: [
      {
        name: "offset",
        update: "bandwidth('xscale')/2",
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
        round: true,
        padding: 0.4,
      },
      {
        name: "yscale",
        type: "linear",
        domain: [0, data_max],
        range: "height",
      },
    ],
    axes: [
      {
        orient: "bottom",
        scale: "xscale",
        ticks: false,
        labelPadding: 10,
      },
    ],
    marks: [
      {
        name: "max",
        type: "area",
        from: {
          data: "table",
        },
        encode: {
          update: {
            x: {
              scale: "xscale",
              field: "date",
              offset: { signal: "offset" },
            },
            width: {
              scale: "xscale",
              band: 1,
            },
            y: {
              scale: "yscale",
              field: "max",
            },
            y2: {
              scale: "yscale",
              value: 0,
            },
            fill: {
              value: "#ccc",
            },
          },
        },
      },
      {
        name: "max-dots",
        type: "symbol",
        from: {
          data: "table",
        },
        encode: {
          update: {
            x: {
              scale: "xscale",
              field: "date",
              offset: { signal: "offset" },
            },
            y: {
              scale: "yscale",
              field: "max",
            },
            fill: {
              value: "#ccc",
            },
            stroke: {
              value: "white",
            },
            size: {
              value: 70,
            },
            tooltip: { signal: "{'Best Performance' : datum.max}" },
          },
        },
      },
      {
        name: view != "geo" ? "bars" : "first-bars",
        type: "rect",
        from: {
          data: "table",
        },
        encode: {
          update: {
            fill: {
              value: view != "geo" ? "#E09C24" : "#DB5F3B",
            },
            x: {
              scale: "xscale",
              field: "date",
            },
            width: {
              scale: "xscale",
              band: view != "geo" ? 1 : 0.5,
            },
            y: {
              scale: "yscale",
              field: "score",
            },
            y2: {
              scale: "yscale",
              value: 0,
            },
            tooltip: { signal: "{'Value' : datum.score}" },
          },
        },
      },
      {
        name: "avg",
        type: "line",
        from: {
          data: "table",
        },
        encode: {
          enter: {
            x: {
              scale: "xscale",
              field: "date",
              offset: { signal: "offset" },
            },
            y: {
              scale: "yscale",
              field: "avg",
            },
            stroke: {
              value: "blue",
            },
            strokeWidth: {
              value: 2,
            },
          },
        },
      },
      {
        name: "avg-dots",
        type: "symbol",
        from: {
          data: "table",
        },
        encode: {
          enter: {
            x: {
              scale: "xscale",
              field: "date",
              offset: { signal: "offset" },
            },
            y: {
              scale: "yscale",
              field: "avg",
            },
            stroke: {
              value: "blue",
            },
            strokeWidth: {
              value: 3,
            },
            shape: {
              value: "circle",
            },
            size: {
              value: 10,
            },
            tooltip:
              view != "geo"
                ? { signal: "{'UP Average' : datum.avg}" }
                : { signal: "{'Average' : datum.avg}" },
          },
        },
      },
    ],
    config: {},
  };

  if (data.length) {
    var data_max;
    if (view != "geo") {
      data_max = _.max([
        _.maxBy(data, "score").score,
        _.maxBy(data, "avg").avg,
        _.maxBy(data, "max").max,
      ]);
      spec["scales"][1].domain = [0, data_max];
    } else {
      data_max = _.max([
        _.maxBy(data, "score").score,
        _.maxBy(data, "score2").score2,
        _.maxBy(data, "avg").avg,
        _.maxBy(data, "max").max,
      ]);
      spec["scales"][1].domain = [0, data_max];
      spec["marks"].push({
        name: "second-bars",
        type: "rect",
        from: {
          data: "table",
        },
        encode: {
          update: {
            fill: {
              value: "#000",
            },
            x: {
              scale: "xscale",
              field: "date",
              offset: {
                signal: "offset",
              },
            },
            width: {
              scale: "xscale",
              band: 0.5,
            },
            y: {
              scale: "yscale",
              field: "score2",
            },
            y2: {
              scale: "yscale",
              value: 0,
            },
            tooltip: {
              signal: "{'Value' : datum.score2}",
            },
          },
        },
      });
    }
    new vega.View(vega.parse(spec))
      .renderer("svg")
      .logLevel(vega.Warn)
      .initialize(selector)
      .hover()
      .run();
  }
}
