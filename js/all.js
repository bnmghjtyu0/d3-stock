// ---------------------------------------------------------------------
// 折線圖
// ---------------------------------------------------------------------
d3.csv("data/sales.csv", function (error, data) {
  var totalWidth = parseInt(d3.select("#Candlestick").style("width"), 10);
  var totalHeight = parseInt(d3.select("#Candlestick").style("height"), 10);

  var margin = { top: 10, left: 50, bottom: 30, right: 50 };

  var width = totalWidth - margin.left - margin.right;
  var height = totalHeight - margin.top - margin.bottom;

  window.addEventListener("resize", function (e) {
    totalWidth = parseInt(d3.select("#Candlestick").style("width"), 10);
    totalHeight = parseInt(d3.select("#Candlestick").style("height"), 10);

    width = totalWidth - margin.left - margin.right;
    height = totalHeight - margin.top - margin.bottom;
    redrawChart();
  });

  // DATA STUFF
  var formatDecimal = d3.format(",.2f");

  var parseDate = d3.timeParse("%Y%m%d"); // 20150630

  var outputFormat = d3.timeFormat("%d %b %Y"); // 30 June 2015

  var dataLoaded = null;

  var dataModelJSON = function (d) {
    return {
      date: parseDate(+d.date),
      time: data.time,
      open: +d.open,
      high: +d.high,
      low: +d.low,
      close: +d.close,
      volume: +d.volume,
      openInt: +d.openInt
    }
  }

  var data = data.map(dataModelJSON);
  function setData(data) {
    dataLoaded = data;
  }

  function redrawChart() {
    if (dataLoaded) {
      d3.select("#candle-chart").remove();
      prepareForBuild(dataLoaded);
      buildChart(dataLoaded);
    }
  }

  var xScale, xLabels, xAxis, yIsLinear, yDomain, yRange, yScale, yAxis;

  function prepareForBuild(data) {
    xScale = d3
      .scaleBand()
      .domain(
      data.map(function (d) {
        return d.date;
      })
      )
      .range([0, width])
      .paddingInner(0.2)
      .paddingOuter(0)
      .align(0.5);

    xLabels = xScale.domain().filter(function (d, i) {
      if (i === data.length - 1) return d;
      var next;

      if (data[i + 1]) {
        next = data[i + 1].date;
      } else {
        return false;
      }

      var monthA = d.getMonth();
      var monthB = next.getMonth();

      return monthB > monthA ? d : monthB === 0 && monthA === 11 ? d : false;
    });

    xAxis = d3
      .axisBottom(xScale)
      .tickFormat(outputFormat)
      .tickValues(xLabels);

    yIsLinear = true;
    yDomain = [d3.min(data, d => d.low), d3.max(data, d => d.high)];
    yRange = [height, 0];
    yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range(yRange)
      .nice(5);
    yAxis = d3
      .axisLeft(yScale)
      .ticks(20)
      .tickSizeInner(-width)
      .tickFormat(formatDecimal);
  }

  function buildChart(data) {
    var svg = d3
      .select("#Candlestick")
      .append("svg")
      .attr("id", "candle-chart")
      .attr("width", totalWidth)
      .attr("height", totalHeight);

    var mainGroup = svg
      .append("g")
      .attr("id", "mainGroup")
      .attr("transform", "translate( " + margin.left + ", " + margin.top + ")");

    var xAxisGroup = mainGroup
      .append("g")
      .attr("id", "xAxis")
      .attr("class", "axis")
      .attr("transform", "translate( " + 0 + "," + height + ")")
      .call(customXAxis);

    function customXAxis(g) {
      g.call(xAxis);
      g.select(".domain").attrs({});
      g
        .selectAll(".tick line")
        .attr("y1", -height)
        .attr("y2", 0)
        .attr("stroke", "#2f4a6b");
    }
    var yAxisGroup = mainGroup
      .append("g")
      .attr("id", "yAxis")
      .attr("class", "axis")
      .call(customYAxis);

    function customYAxis(g) {
      g.call(yAxis);
      g
        .selectAll(".tick line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("stroke", "#2f4a6b");
      g.selectAll(".tick:first-of-type line").remove();

      g.selectAll(".tick text").attr("x", -9);
    }
    var eventGroup = mainGroup.append("g").attr("id", "event-overlay");

    var crosshair = eventGroup.append("g").attr("id", "crosshair");

    var eventRect = eventGroup.append("rect");

    var canvasGroup = eventGroup.append("g").attr("id", "circleGroup");

    // http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
    function getTextWidth(text, font) {
      var textWidth = 0;
      var context = document.createElement("canvas").getContext("2d");
      context.font = font;
      textWidth = context.measureText(text).width;
      return textWidth;
    }

    // 移動窗口設定
    var crosshairSettings = {
      xLabelTextOffset: height + 12,
      yLabelTextOffset: -9,
      ylabelWidth: getTextWidth(formatDecimal(yDomain[1]), "10px sans-serif") + 2,
      xlabelWidth: getTextWidth("30 September 2000", "10px sans-serif"),
      labelHeight: 14,
      labelColor: "#2f4a6b",
      labelStrokeColor: "none",
      labelStrokeWidth: "0.5px"
    };

    crosshair.append("line").attrs({
      id: "focusLineX",
      class: "focusLine"
    });
    crosshair.append("line").attrs({
      id: "focusLineY",
      class: "focusLine"
    });

    crosshair
      .append("rect") // x label bg
      .attrs({
        id: "focusLineXLabelBackground",
        class: "focusLineLabelBackground",
        fill: crosshairSettings.labelColor,
        stroke: crosshairSettings.labelStrokeColor,
        "stroke-width": crosshairSettings.labelStrokeWidth,
        width: crosshairSettings.xlabelWidth,
        height: crosshairSettings.labelHeight
      });

    crosshair.append("text").attrs({
      id: "focusLineXLabel",
      class: "label",
      "text-anchor": "middle",
      "alignment-baseline": "central"
    });

    var ylabel = crosshair.append("g").attr("id", "yLabelGroup");
    ylabel.append("rect").attrs({
      id: "focusLineYLabelBackground",
      class: "focusLineLabelBackground",
      fill: crosshairSettings.labelColor,
      stroke: crosshairSettings.labelStrokeColor,
      "stroke-width": crosshairSettings.labelStrokeWidth,
      width: crosshairSettings.ylabelWidth,
      height: crosshairSettings.labelHeight
    });
    ylabel.append("text").attrs({
      id: "focusLineYLabel",
      class: "label",
      "text-anchor": "end",
      "alignment-baseline": "central"
    });

    setCrosshair(width, 0);

    // k棒設定
    var candleSettings = {
      strokeUp: "#ff0000",
      strokeDown: "#00D56A",
      up: "#ff0000",
      down: "#00D56A",
      hover: "#c35500",
      lineMode: false
    };

    canvasGroup
      .selectAll("line")
      .data(data)
      .enter()
      .append("line")
      .attr("x1", function (d, i) {
        return xScale(d.date) + xScale.bandwidth() * 0.5;
      })
      .attr("y1", function (d) {
        return yScale(d["high"]);
      })
      .attr("x2", function (d, i) {
        return xScale(d.date) + xScale.bandwidth() * 0.5;
      })
      .attr("y2", function (d) {
        return yScale(d["low"]);
      })
      .style("stroke", candleSettings.strokeUp)
      .style("stroke-width", "1px")
      .style("opacity", 1);

    if (xScale.bandwidth() > 1) {
      candleSettings.lineMode = false;
      canvasGroup
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attrs({
          x: function (d, i) {
            return xScale(d.date);
          },
          y: function (d, i) {
            return d.close < d.open ? yScale(d.high) : yScale(d.low);
          },
          width: xScale.bandwidth(),
          height: function (d, i) {
            var max = yScale(Math.min(d.close, d.open));
            var min = yScale(Math.max(d.close, d.open));
            var diff = max - min;
            return diff || 0.1;
          }
        })
        .styles({
          fill: function (d) {
            return d.close > d.open ? candleSettings.up : candleSettings.down;
          },
          stroke: candleSettings.stroke
        });
    } else {
      candleSettings.lineMode = true;
    }

    var els = candleSettings.lineMode
      ? canvasGroup.selectAll("line")
      : canvasGroup.selectAll("rect");
    els
      .on("mouseover", function (d, i) {
        d3
          .select(this)
          .attrs({
            cursor: "pointer"
          })
          .styles({
            stroke: candleSettings.hover
          });
        crosshair.style("display", null);
        setCrosshair(xScale(d.date) + xScale.bandwidth() * 0.5, yScale(d.close));
      })
      .on("mouseout", function (d, i) {
        d3
          .select(this)
          .attrs({})
          .styles({
            fill: function (d) {
              return d.close > d.open ? candleSettings.up : candleSettings.down;
            },
            stroke: candleSettings.stroke,
            "stroke-width": "1px"
          });
      })
      .transition()
      .duration(1500)
      .ease(d3.easeBackInOut)
      .attr("y", function (d) {
        return yScale(Math.max(d.close, d.open));
      });

    eventRect
      .attrs({
        width: width,
        height: height
      })
      .styles({
        opacity: 0.0,
        display: null
      })
      .on("mouseover", function () {
        crosshair.style("display", null);
      })
      .on("mouseout", function () {
        crosshair.style("display", "none");
      })
      .on("mousemove", function handleMouseMove() {
        var mouse = d3.mouse(this);

        var x = mouse[0];
        var y = mouse[1];

        setCrosshair(x, y);
      });

    function setCrosshair(x, y) {
      d3
        .select("#focusLineX")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", height + 6);

      d3
        .select("#focusLineY")
        .attr("x1", -6)
        .attr("y1", y)
        .attr("x2", width)
        .attr("y2", y);

      d3
        .select("#focusLineXLabel")
        .attr("x", x)
        .attr("y", height + 12)
        .text(outputFormat(xScale.domain()[Math.floor(x / xScale.step())]));

      d3
        .select("#focusLineXLabelBackground")
        .attr(
        "transform",
        "translate( " +
        (x - crosshairSettings.xlabelWidth * 0.5) +
        " , " +
        (height + 6) +
        " )"
        )
        .text(outputFormat(xScale.domain()[Math.floor(x / xScale.step())]));

      d3
        .select("#focusLineYLabel")
        .attr("transform", "translate( " + -9 + ", " + y + ")")
        .text(formatDecimal(yScale.invert(y)));
      d3
        .select("#focusLineYLabelBackground")
        .attr(
        "transform",
        "translate( " +
        (-crosshairSettings.ylabelWidth - 6) +
        ", " +
        (y - 6) +
        ")"
        );
    }
  }

  (function (data) {
    setData(data);
    prepareForBuild(data);
    buildChart(data);
  })(data);


});
// ---------------------------------------------------------------------
// 長條圖
// ---------------------------------------------------------------------
var colors = ["#ff0000", "#0cd562", "#fff"];
// get the data
function renderingLongBar() {

  d3.csv("data/sales.csv", function (error, data) {
    if (error) throw error;

    // format the data
    data.forEach(function (d) {
      d.sales = +d.sales;
    });

    var longBarChart = d3.select("#longBarChart");
    longBarChart.html("");

    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = parseInt(d3.select("#longBarChart").style("width"), 10) - margin.left * 2,
      height = parseInt(d3.select("#longBarChart").style("height"), 10) - margin.left * 2;


    // set the ranges
    var x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);
    var y = d3.scaleLinear()
      .range([height, 0]);

    var svgBar = longBarChart.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


    // Scale the range of the data in the domains
    x.domain(
      data.map(function (d) { return d.time; })
    );

    y.domain([0, d3.max(data, function (d) { return d.sales; })]);

    // append the rectangles for the bar chart
    svgBar.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return x(d.time); })
      .attr("width", x.bandwidth())
      .attr("y", function (d) { return y(d.sales); })
      .attr("height", function (d) { return height - y(d.sales); })
      .style("fill", function (d) {
        if (d.sales > 15) {
          return colors[1];
        } else if (d.sales >= 10 && d.sales <= 15) {
          return colors[2];
        } else {
          return colors[0];
        }
      });
    // add the x Axis
    svgBar.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickValues(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']))

    // add the y Axis
    svgBar.append("g")
      .call(d3.axisLeft(y).tickValues(['40']))
  })
}


// 將 window 綁定 resize 事件，並重新繪製圖型
d3.select(window).on('resize', function (e) {
  renderingLongBar(e);
})
renderingLongBar();


// ---------------------------------------------------------------------
// 儀錶板
// ---------------------------------------------------------------------
var gauge = function (container, configuration) {
  var that = {};
  var config = {
    size: 200,
    clipWidth: 200,
    clipHeight: 110,
    ringInset: 20,
    ringWidth: 20,

    pointerWidth: 10,
    pointerTailLength: 5,
    pointerHeadLengthPercent: 0.9,

    minValue: -400,
    maxValue: 400,

    minAngle: -140,
    maxAngle: 140,

    transitionMs: 750,

    majorTicks: 9,
    labelFormat: d3.format('d'),
    labelInset: 45,

    borderColor: 'red',

    arcColorFn: d3.interpolateHsl(d3.rgb('#63809E'), d3.rgb('#63809E'))
  };
  var range = undefined;
  var r = undefined;
  var pointerHeadLength = undefined;
  var value = -400;

  var svg = undefined;
  var arc = undefined;
  var scale = undefined;
  var ticks = undefined;
  var tickData = undefined;
  var pointer = undefined;

  var donut = d3.pie();

  function deg2rad(deg) {
    return deg * Math.PI / 180;
  }

  function newAngle(d) {
    var ratio = scale(d);
    var newAngle = config.minAngle + (ratio * range);
    return newAngle;
  }

  function configure(configuration) {
    var prop = undefined;
    for (prop in configuration) {
      config[prop] = configuration[prop];
    }

    range = config.maxAngle - config.minAngle;
    r = config.size / 2;
    pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

    // a linear scale that maps domain values to a percent from 0..1
    scale = d3.scaleLinear()
      .range([0, 1])
      .domain([config.minValue, config.maxValue]);

    ticks = scale.ticks(config.majorTicks);
    tickData = d3.range(config.majorTicks).map(function () { return 1 / config.majorTicks; });

    arc = d3.arc()
      .innerRadius(r - config.ringWidth - config.ringInset)
      .outerRadius(r - config.ringInset)
      .startAngle(function (d, i) {
        var ratio = d * i;
        return deg2rad(config.minAngle + (ratio * range));
      })
      .endAngle(function (d, i) {
        var ratio = d * (i + 1);
        return deg2rad(config.minAngle + (ratio * range));
      });
  }
  that.configure = configure;

  function centerTranslation() {
    return 'translate(' + r + ',' + r + ')';
  }

  function isRendered() {
    return (svg !== undefined);
  }
  that.isRendered = isRendered;

  function render(newValue) {
    svg = d3.select(container)
      .append('svg:svg')
      .attr('class', 'gauge')
      .attr('width', config.clipWidth)
      .attr('height', config.clipHeight);

    svg.append('defs')
      .append('clipPath')
      .attr('id', "a1")
      .append('rect')
      .attr('x', -6)
      .attr('y', -20)
      .attr('width', 100)
      .attr('height', 200)

    svg.append('circle')
      .attr('clip-path', 'url(#a1)')
      .attr("cx", "101")
      .attr("cy", "101")
      .attr("r", "101")
      .attr('stroke-width', '5px')
      .attr('stroke', config.borderColor)
      .attr('fill', 'none')
      .attr('transform', 'translate(10,10)')

    var centerTx = centerTranslation();

    var arcs = svg.append('g')
      .attr('class', 'arc')
      .attr('transform', centerTx);

    arcs.selectAll('path')
      .data(tickData)
      .enter().append('path')
      .attr('fill', function (d, i) {
        return config.arcColorFn(d * i);
      })
      .attr('d', arc);

    var lg = svg.append('g')
      .attr('class', 'label')
      .attr('transform', centerTx);
    lg.selectAll('text')
      .data(ticks)
      .enter().append('text')
      .attr('transform', function (d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + (ratio * range);
        return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
      })
      .text(config.labelFormat);

    var lineData = [[config.pointerWidth / 2, 0],
    [0, -pointerHeadLength],
    [-(config.pointerWidth / 2), 0],
    [0, config.pointerTailLength],
    [config.pointerWidth / 2, 0]];
    var pointerLine = d3.line().curve(d3.curveLinear)

    var pg = svg.append('g').data([lineData])
      .attr('class', 'pointer')
      .attr('transform', centerTx);

    pointer = pg.append('path')
      .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/)
      .attr("d", "M-4 " + 0 * r + " L 0 " + -0.6 * r + " L4 " + 0 * r + " z")
      .attr('fill', '#fff')
      .attr('stroke', 'none')
      .attr('transform', 'rotate(' + config.minAngle + ')');

    pg.append("circle")
      .attr("r", 0.09 * r)
      .attr('fill', '#061633')
      .attr('stroke-width', '4px')
      .attr('stroke', '#fff')

    update(newValue === undefined ? 0 : newValue);
  }
  that.render = render;
  function update(newValue, newConfiguration) {
    if (newConfiguration !== undefined) {
      configure(newConfiguration);
    }
    var ratio = scale(newValue);
    var newAngle = config.minAngle + (ratio * range);
    pointer.transition()
      .duration(config.transitionMs)
      .ease(d3.easeElastic)
      .attr('transform', 'rotate(' + newAngle + ')');
  }
  that.update = update;

  configure(configuration);

  return that;
};


function onDocumentReady() {
  var powerGauge = gauge('#speedometer', {
    size: 220,
    clipWidth: 220,
    clipHeight: 220,
    ringWidth: 2,
    maxValue: 9,
    transitionMs: 2000,
    borderColor: '#00D56A',
  });


  powerGauge.render();

}

function onDocumentReady2() {
  var powerGauge = gauge('#speedometer2', {
    size: 220,
    clipWidth: 220,
    clipHeight: 220,
    ringWidth: 2,
    maxValue: 9,
    transitionMs: 2000,
    borderColor: '#ff0000',
  });


  powerGauge.render();

}

if (!window.isLoaded) {
  window.addEventListener("load", function () {
    onDocumentReady();
    onDocumentReady2();
  }, false);
} else {
  onDocumentReady();
  onDocumentReady2();
}


// tableRwd
function tableResponsive(el) {
  try {
    var array = [];
    var table = document.querySelector(el);
    var th = table.getElementsByTagName("th");
    for (var i = 0; i < th.length; i++) {
      var headingText = th[i].innerHTML;
      array.push(headingText);
    }
    var style = document.createElement("style"),
      styleSheet;
    document.head.appendChild(style);
    styleSheet = style.sheet;
    for (var i = 0; i < array.length; i++) {
      styleSheet.insertRule(
        el +
        " td:nth-child(" +
        (i + 1) +
        ')::before {content:"' +
        array[i] +
        ': ";}',
        styleSheet.cssRules.length
      );
    }
  } catch (e) {
    console.log("錯誤:" + e);
  }
}

