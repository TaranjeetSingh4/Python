// function dumbel_chart(data){
//     let selector = '.dumbell_chart'
//     var margin = {top: 20, right: 100, bottom: 30, left: 150},
//       width = 593 - margin.left - margin.right,
//       height = 500 - margin.top - margin.bottom;
//     var svg = d3.select(selector)
//       .append('svg')
//       .attr("viewBox", function(){
//         let viewBox = "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom)
//         return viewBox
//       })
//       .attr("preserveAspectRatio", "xMinYMin meet")
//       .attr('width', "100%");
//   // add scales
//   var x = d3.scaleLinear().rangeRound([10, width - 10]),
//       y = d3.scalePoint().rangeRound([height, 10]).padding(0.4);
//       z = d3.scalePoint().rangeRound([height, 10]).padding(0.4);

//   var chart = svg.append("g")
//       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//   // import data from csv
//   // d3.json("dumbbell", function(error, data) {
//     // console.log(data, 'csv data')

//     // _.each(data,function(d){
//     //   d.prec_point = +d.prec_point;
//     // })
//     // if (error) throw error;
//     // sort vehicles from highest to lowest inventory
//     data.sort(function(a, b) {
//       // range is flipped, so it ascends from bottom of chart
//       return d3.ascending(+a.perc_point, +b.perc_point);
//     });
//     x.domain([0, d3.max(data, function(d) { return d.perc_point; })]);
//     y.domain(data.map(function(d) { return d.block; }));
//     z.domain(data.map(function(d,i) { return d.chanage; }));

//     // Create scale
//     let points = _.map(data, 'perc_point')
//     var scale = d3.scaleLinear()
//     .domain([d3.min(points), d3.max(points)])
//     .range([0, width - 10])
//     .nice();

//   let xAxisGenerator = d3.axisBottom(scale)
//   xAxisGenerator.ticks(5);

//     // x-axis
//     chart.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(10, -" + 10 + ")")
//         .call(xAxisGenerator)
//       .append("text")
//         .attr("text-anchor", "end")
//         .text("# of Vehicles");

//     // z-axis
//     chart.append("g")
//         .attr("class", "z axis")
//         .attr("transform", "translate(390,0)")
//         .call(d3.axisRight(z));

//     var ticks = d3.selectAll(".z .tick")
//     ticks.each(function() { d3.select(this).append("circle").attr("r", 4).style('fill',function(d) {
//       if(d > 0) {
//         return '#00b441';
//       } else {
//         return '#fdc108';
//       }
//     });
//   });

//     // y-axis
//     chart.append("g")
//         .attr("class", "y axis")
//         .call(d3.axisLeft(y));

//     var dumbbellGroup = chart.append("g")
//         .attr("id", "dumbbellGroup");

//     var dumbbell = dumbbellGroup.selectAll(".dumbbell")
//         .data(data)
//       .enter().append("g")
//         .attr("class", "dumbbell")
//         .attr("transform", function(d) { return "translate(0," + y(d.block) + ")"; });

//     // lines: between dots
//     dumbbell.append("line")
//         .attr("class", "line between")
//         .attr("x1", function(d) { return x(d.perc_point); })
//         .attr("x2", function(d) { return x(d.perc_point_prev); })
//         .attr("y1", 0)
//         .attr("y2", 0)
//         .style('stroke', 'black')
//         .style('stroke-width', '1px')

//     // // lines: before dots
//     // dumbbell.append("line")
//     //     .attr("class", "line before")
//     //     .attr("x1", 0)
//     //     .attr("x2", function(d) { return x(d.num_vehicles_t); })
//     //     .attr("y1", 0)
//     //     .attr("y2", 0);

//     // dots: current inventory
//     dumbbell.append("circle")
//         .attr("class", "circle current")
//         .attr("cx", function(d) { return x(d.perc_point); })
//         .attr("cy", 0)
//         .attr("r", 6)
//         .style('fill','#54492C');

//     // data labels: current
//     dumbbell.append("text")
//         .attr("class", "text current")
//         .attr("x", function(d) { return x(d.perc_point); })
//         .attr("y", 0)
//         .attr("dy", ".35em")
//         .attr("dx", 10)
//         .text(function(d) { return d.perc_point; });

//     // data labels: future
//     dumbbell.append("text")
//         .attr("class", "text future")
//         .attr("x", function(d) { return x(d.perc_point_prev); })
//         .attr("y", 0)
//         .attr("dy", ".35em")
//         .attr("dx", -10)
//         .attr("text-anchor", "end")
//         .text(function(d) { return d.perc_point_prev; });

//     // d3.select(".dumbbell:last-child")
//     //   .append("text")
//     //     .attr("class", "label current")
//     //     .attr("x", function(d) { return x(d.perc_point); })
//     //     .attr("y", 0)
//     //     .attr("dy", -20)
//     //     .attr("text-anchor", "middle")
//     //     .text("Current");
//     // d3.select(".dumbbell:last-child")
//     //   .append("text")
//     //     .attr("class", "label future")
//     //     .attr("x", function(d) { return x(d.perc_point_prev); })
//     //     .attr("y", 0)
//     //     .attr("dy", -20)
//     //     .attr("text-anchor", "middle")
//     //     .text(function(d) { return d.time + " Days"; });

//     // dots: future inventory
//     dumbbell.append("circle")
//         .attr("class", "circle future")
//         .attr("cx", function(d) { return x(d.perc_point_prev); })
//         .attr("cy", 0)
//         .attr("r", 6)
//         .style("stroke","#414E68")
//         .style("fill","#F6F2E8");
//     // });
//   }
