// ---------------------------------------------------------------------
// 長條圖
// ---------------------------------------------------------------------
var data = [
  30, 60, 90, 200, 110, 222, 666,
  200, 400, 500, 200, 110, 222,
  666, 999, 200, 110, 222, 666,
  999, 200, 999, 200, 110, 222,
  666, 999, 200, 110, 222, 666,
  999, 200, 400, 500, 222, 666,
  999, 200, 110, 222, 666,
  999, 200, 999, 200, 110, 222,
  666, 999, 200, 110, 222, 666,
  999, 200, 400, 500, 222, 666,
  999, 999, 200, 110, 222, 666,
  999, 200, 999, 200, 110, 222,],
  colors = ["#ff0000", "#0cd562", "#fff"],
  width = 1200,
  height = 200,
  padding = 60,
  barWidth = 60,
  outerPadding = 0.2,
  barPadding = 0.2;

var colorScale = d3.scale
  .linear()
  .domain([0, d3.max(data)])
  .range(colors);

var xScale = d3.scale
  .ordinal()
  .domain(d3.range(0, data.length))
  .rangeBands([padding, width - padding], barPadding, outerPadding);

var yScale = d3.scale
  .linear()
  .domain([d3.max(data), 0])
  .range([height - padding * 2, 0]);

var yAxisScale = d3.scale
  .linear()
  .domain([Math.round(d3.max(data)), 0])
  .range([0, height - padding * 2]);

var xAxis = d3.svg
  .axis()
  .scale(xScale)
  .orient("bottom")

var yAxis = d3.svg
  .axis()
  .scale(yAxisScale)
  .orient("left")
  .ticks(7);

var chart = d3
  .select("#chart")
  .style("background", "#0e161f")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var chartBars = chart
  .selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("class", "chart-bar")
  .attr("width", function (d) {
    return xScale.rangeBand();
  })
  .attr("height", 0)
  .attr("fill", function (d) {
    if (d > 600) {
      return colors[1];
    } else if (d >= 0 && d <= 200) {
      return colors[2];
    } else {
      return colors[0];
    }
  })
  .attr("x", function (d, i) {
    return xScale(i);
  })
  .attr("y", height - padding);

var labelSVG = chart
  .selectAll("svg")
  .data(data)
  .enter()
  .append("svg")
  .attr("class", "chart-label-svg")
  .attr("width", 80)
  .attr("height", 30)
  .attr("x", function (d, i) {
    return xScale(i) + xScale.rangeBand();
  })
  .attr("y", function (d) {
    return height - yScale(d) - padding - 30;
  })
  .style("opacity", "0")
  .append("g");

labelSVG
  .append("rect")
  .attr("class", "chart-label-rect")
  .attr("width", 60)
  .attr("height", 30)
  .attr("x", 0)
  .attr("y", 0)
  .attr("fill", "white");

labelSVG
  .append("text")
  .attr("x", "50%")
  .attr("y", "50%")
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .attr("fill", "#1695A3")
  .text(function (d) {
    return d;
  });

var xAxisG = chart
  .append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + (height - padding) + ")")
  .attr("fill", 'none')
  .attr('stroke', '#2f4a6b')
  .attr("font-size", "12px")
  .call(xAxis);

var yAxisG = chart
  .append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" + padding + ", " + padding + ")")
  .attr("fill", 'none')
  .attr('stroke', '#2f4a6b')
  .attr("font-size", "12px")
  .call(yAxis);

var rectTransitions = chartBars
  .on("mouseenter", function (d, i) {
    d3
      .selectAll(".chart-label-svg")
      .filter(function (e, j) {
        if (i === j) {
          return this;
        }
      })
      .style("opacity", "1.0");
  })
  .on("mouseleave", function (d, i) {
    d3
      .selectAll(".chart-label-svg")
      .filter(function (e, j) {
        if (i === j) {
          return this;
        }
      })
      .style("opacity", "0");
  })
  .transition()
  .duration(600)
  .delay(function (d, i) {
    return i * 15;
  })
  .ease("linear")
  .attr("height", function (d) {
    return yScale(d);
  })
  .attr("y", function (d) {
    return height - yScale(d) - padding;
  });



// ---------------------------------------------------------------------
// 儀錶板
// ---------------------------------------------------------------------
var svg = d3.select("#speedometer")
  .append("svg:svg")
  .attr("width", 320)
  .attr("height", 320);
var gauge = iopctrl.arcslider()
  .radius(90)
  .events(false)
  .indicator(iopctrl.defaultGaugeIndicator)


gauge.axis().orient("in")
  .normalize(true)
  .ticks(12)
  .tickSubdivide(3)
  .tickSize(4, 8, 10)
  .tickPadding(5)
  .scale(d3.scale.linear()
    .domain([-400, 400])
    .range([-3 * Math.PI / 4, 3 * Math.PI / 4]));


var segDisplay = iopctrl.segdisplay()
  .width(80)
  .digitCount(6)
  .negative(false)
  .decimals(0);

gauge.indicator(function (g, r) {
  // g.append("path").attr("d", "M0 " + 0.2 * r + " L 0 " + -0.8 * r + "")
  g.append("path").attr("d", "M-4 " + 0 * r + " L 0 " + -0.6 * r + " L4 " + 0 * r + " z")
    .attr('fill', '#fff')
    .attr('stroke', 'none')
  g.append("circle")
    .attr("r", 0.09 * r)
    .attr('fill', '#061633')
    .attr('stroke-width', '4px')
})
svg.append('g')
  .attr('class', 'circleStyle')
  .append('path')
  .attr("d", "M0,2.1h0.1c0,0-0.1-1.4,1-2L1,0C1,0-0.1,0.4,0,2.1z")
  .attr('fill', 'red')
  .attr('stroke-width', '4px')


svg.append("g")
  .attr("class", "segdisplay")
  .call(segDisplay);

svg.append("g")
  .attr("class", "gauge")
  .call(gauge);

segDisplay.value(56749);
gauge.value(-100);


// ---------------------------------------------------------------------
// 儀錶板2
// ---------------------------------------------------------------------
var svg = d3.select("#speedometer2")
.append("svg:svg")
.attr("width", 320)
.attr("height", 320);
var gauge = iopctrl.arcslider()
.radius(90)
.events(false)
.indicator(iopctrl.defaultGaugeIndicator)

gauge.axis().orient("in")
.normalize(true)
.ticks(12)
.tickSubdivide(3)
.tickSize(4, 8, 10)
.tickPadding(5)
.scale(d3.scale.linear()
  .domain([-400, 400])
  .range([-3 * Math.PI / 4, 3 * Math.PI / 4]));


var segDisplay = iopctrl.segdisplay()
.width(80)
.digitCount(6)
.negative(false)
.decimals(0);

gauge.indicator(function (g, r) {
// g.append("path").attr("d", "M0 " + 0.2 * r + " L 0 " + -0.8 * r + "")
g.append("path").attr("d", "M-4 " + 0 * r + " L 0 " + -0.6 * r + " L4 " + 0 * r + " z")
  .attr('fill', '#fff')
  .attr('stroke', 'none')
g.append("circle")
  .attr("r", 0.09 * r)
  .attr('fill', '#061633')
  .attr('stroke-width', '4px')
})
svg.append('g')
.attr('class', 'circleStyle')
.append('path')
.attr("d", "M0,2.1h0.1c0,0-0.1-1.4,1-2L1,0C1,0-0.1,0.4,0,2.1z")
.attr('fill', 'red')
.attr('stroke-width', '4px')


svg.append("g")
.attr("class", "segdisplay")
.call(segDisplay);

svg.append("g")
.attr("class", "gauge")
.call(gauge);

segDisplay.value(56749);
gauge.value(0);







// ---------------------------------------------------------------------
// 折線圖
// ---------------------------------------------------------------------
var data = [
  { x: 01, y: 10770 },
  { x: 02, y: 10764 },
  { x: 03, y: 10768 },
  { x: 04, y: 10762 },
  { x: 05, y: 10752 },
  { x: 06, y: 10750 },
  { x: 07, y: 10728 },
  { x: 08, y: 10729 },
  { x: 09, y: 10739 },
  { x: 10, y: 10736 },
  { x: 11, y: 10762 },
  { x: 12, y: 10733 },
  { x: 13, y: 10736 },
  { x: 14, y: 10732 },
  { x: 15, y: 10742 },
  { x: 16, y: 10746 },
  { x: 17, y: 10752 },
  { x: 18, y: 10750 },
  { x: 19, y: 10760 },
  { x: 20, y: 10762 },
  { x: 21, y: 10764 },
];
// svg的size
var width = 1100;
var height = 420;

// 畫外框
var svg = d3
  .select(".d3")
  .append("svg")
  .attr({
    width: "1200",
    height: "480"
  })

// 找出資料內的最大最小值 max&min
var minX = d3.min(data, function (d) {
  return d.x;
});
var maxX = d3.max(data, function (d) {
  return d.x;
});
var minY = d3.min(data, function (d) {
  return d.y;
});
var maxY = d3.max(data, function (d) {
  return d.y;
});

var scaleX = d3.scale
  .linear()
  .range([0, width])
  .domain([minX, maxX]);
var scaleY = d3.scale
  .linear()
  .range([0, height])
  .domain([maxY, minY]);

// 加入參數 scaleX(),scaleY()
var line = d3.svg
  .line()
  .x(function (d) {
    return scaleX(d.x);
  })
  .y(function (d) {
    return scaleY(d.y);
  });

// 設定坐標軸
// axis.orient([orientation])
var axisX = d3.svg
  .axis()
  .scale(scaleX)
  .orient("bottom")
  .ticks(20)
  // .tickValues([1, 2, 3, 5, 7, 9])  //可自訂底層的數值
  .tickFormat(function (d) {
    return d;
  })//加入單位
  .tickPadding(6);

var axisY = d3.svg
  .axis()
  .scale(scaleY)
  .orient("left")
  .ticks(10)
  .tickFormat(function (d) {
    return d;
  }) //加入單位
  .tickPadding(6);

// 把線加入svg
svg.append("path").attr({
  d: line(data),
  stroke: "#e7f3ff",
  fill: "none",
  transform: "translate(60,20)" //折線圖也要套用 translate
});

// x坐標軸
svg
  .append("g")
  .call(axisX) //call axisX
  .attr({
    fill: "none",
    stroke: "#2f4a6b",
    transform: "translate(60," + (height + 20) + ")"
  })
  .style({
    "font-size": "11px"
  })
  .selectAll("text")
  .attr({
    fill: "#e7f3ff",
    stroke: "none"
  })
  .style({
    "font-size": "12px"
  });

// y坐標軸
svg
  .append("g")
  .call(axisY) //call axisY
  .attr({
    fill: "none",
    stroke: "#2f4a6b",
    transform: "translate(60,20)"
  })
  .selectAll("text")
  .attr({
    fill: "#e7f3ff",
    stroke: "none"
  })
  .style({
    "font-size": "12px"
  });

// tickSize 表達的是座標軸上刻度線條的尺寸 (需再創一組 svg.append('g'))
var axisXGrid = d3.svg
  .axis()
  .scale(scaleX)
  .orient("bottom")
  .ticks(20)
  .tickFormat("")
  .tickSize(-height, 0);

var axisYGrid = d3.svg
  .axis()
  .scale(scaleY)
  .orient("left")
  .ticks(10)
  .tickFormat("")
  .tickSize(-width, 0);

svg
  .append("g")
  .call(axisXGrid) //call axisX

  .attr({
    fill: "none",
    stroke: "#2f4a6b",
    transform: "translate(60," + (height + 20) + ")"
  });
svg
  .append("g")
  .call(axisYGrid) //call axisY
  .attr({
    fill: "none",
    stroke: "#2f4a6b",
    transform: "translate(60,20)"
  });


