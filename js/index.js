// ---------------------------------------------------------------------
// 折線圖
// ---------------------------------------------------------------------

d3.csv("data/sales.csv", function (error, data) {
  var margin = { top: 10, left: 50, bottom: 30, right: 50 };
  var totalWidth =
    parseInt(d3.select("#Candlestick").style("width"), 10) - margin.left;
  var totalHeight = parseInt(d3.select("#Candlestick").style("height"), 10);
  var width = totalWidth - margin.left - margin.right;
  var height = totalHeight - margin.top - margin.bottom;

  window.addEventListener("resize", function (e) {
    totalWidth =
      parseInt(d3.select("#Candlestick").style("width"), 10) - margin.left;
    totalHeight = parseInt(d3.select("#Candlestick").style("height"), 10);

    width = totalWidth - margin.left - margin.right;
    height = totalHeight - margin.top - margin.bottom;
    redrawChart();
  });

  // DATA STUFF
  var formatDecimal = d3.format(",.2f");

  var dataLoaded = null;
  var dataModule = function (d) {
    return {
      date: d.date,
      time: d.time,
      sales: parseInt(d.sales),
      close: parseInt(d.close),
      high: parseInt(d.high),
      low: parseInt(d.low),
      open: parseInt(d.open),
      openInt: parseInt(d.openInt),
      volume: parseInt(d.volume)
    };
  };
  var data = data.map(dataModule);
  function setData(data) {
    dataLoaded = data;
  }

  // 重繪 svg
  function redrawChart() {
    if (dataLoaded) {
      d3.select("#candle-chart").remove();
      prepareForBuild(dataLoaded);
      buildChart(dataLoaded);
    }
  }

  // 宣告 xScale=domain x軸標籤 x格線 domain:x軸線
  var xScale, xLabels, xAxis, yIsLinear, yDomain, yRange, yScale, yAxis;

  function prepareForBuild(data) {
    xScale = d3
      .scaleBand()
      .domain(
      data.map(function (d) {
        return d.time;
      })
      )
      .range([0, width])
      .paddingInner(0.2)
      .paddingOuter(0)
      .align(0.5);

    // console.log(xScale.domain())

    xLabels = xScale.domain().filter(function (d, i) {
      return d;
    });
    xAxis = d3
      .axisBottom(xScale)
      // .tickFormat(formatDecimal)
      .tickValues([
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00"
      ]);

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
      .tickSizeInner(-width);
    // .tickFormat(formatDecimal);
  }

  function buildChart(data) {
    var svg = d3
      .select("#Candlestick")
      .append("svg")
      .attr("id", "candle-chart")
      .attr("width", totalWidth + 60)
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

    // 方法-浮動框線
    function setting(id, data, gradColor01, gradColor02, pos) {
      //   漸層遮罩
      var svgDefs = svg.append("defs");
      var mainGradient = svgDefs
        .append("linearGradient")
        .attrs({
          id: "mainGradient",
          x1: "0",
          y1: "0",
          x2: "0",
          y2: "1"
        })
        .attr("id", id);

      mainGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", gradColor01);
      mainGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", gradColor02);
      //   線條svg
      var Guideline = mainGroup
        .append("g")
        .call(textLine)
        .attr("transform", "translate(0," + pos + ")");
      function textLine(g) {
        g
          .attr("class", "tickA")
          .append("path")
          .attr(
          "d",
          "M0 " +
          height / 2 +
          " " +
          (width + 0) +
          " " +
          height / 2 +
          " " +
          (width + 20) +
          " " +
          (height / 2 - 14) +
          " " +
          (width + 90) +
          " " +
          (height / 2 - 14) +
          " " +
          (width + 90) +
          " " +
          (height / 2 + 14) +
          " " +
          (width + 20) +
          " " +
          (height / 2 + 14) +
          " " +
          (width + 0) +
          " " +
          height / 2
          )
          .attr("stroke", gradColor01)
          .attr("fill", "url(#" + id + ")");
      }
      Guideline.append("text")
        .text(function (d) {
          return data;
        })
        .attrs({
          x: width + 26,
          y: height / 2 + 6,
          "font-size": 16 + "px",
          fill: "#fff"
        })
        .styles({
          "text-shadow": "1px 1px rgba(0,0,0,.18)",
          "font-weight": "bold"
        });
    }
    setting("grad01", "17666", "#00a0f7", "#00cbfb", -100);
    setting("grad02", "16888", "#00a0f7", "#00cbfb", -50);
    setting("grad03", "15444", "#c4ae2d", "#fefe02", 0);
    setting("grad04", "14322", "#cd0000", "#ff0505", 50);
    setting("grad05", "13252", "#cd0000", "#ff0505", 100);

    // 浮動線條end

    var eventGroup = mainGroup.append("g").attr("id", "event-overlay");

    var crosshair = eventGroup.append("g").attr("id", "crosshair");

    var eventRect = eventGroup.append("rect");

    var canvasGroup = eventGroup.append("g").attr("id", "circleGroup");

    var crossLabel = eventGroup.append("path").attr("class", "aaaaaaaaa");
    var crossLabelText = eventGroup.append("text");
    var crossLabelTime = eventGroup.append("text");
    var crossCircle02 = eventGroup.append("circle");
    var crossCircle01 = eventGroup.append("circle");

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
      ylabelWidth:
        getTextWidth(formatDecimal(yDomain[1]), "10px sans-serif") + 2,
      xlabelWidth: getTextWidth("30 September 2000", "10px sans-serif"),
      labelHeight: 14,
      labelColor: "#2f4a6b",
      labelStrokeColor: "#fff",
      labelStrokeWidth: "0.5px"
    };

    crosshair.append("line").attrs({
      id: "focusLineX",
      class: "focusLine",
      stroke: "#fff",
      "stroke-width": "1px"
    });
    crosshair.append("line").attrs({
      id: "focusLineY",
      class: "focusLine",
      stroke: "#fff",
      "stroke-width": "1px"
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
        return xScale(d.time) + xScale.bandwidth() * 0.5;
      })
      .attr("y1", function (d) {
        return yScale(d.high);
      })
      .attr("x2", function (d, i) {
        return xScale(d.time) + xScale.bandwidth() * 0.5;
      })
      .attr("y2", function (d) {
        return yScale(d.low);
      })

      .styles({
        stroke: function (d) {
          return d.close > d.open
            ? candleSettings.strokeUp
            : candleSettings.strokeDown;
        }
      })
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
            return xScale(d.time);
          },
          y: function (d, i) {
            return d.close < d.open ? yScale(d.high) : yScale(d.low);
          },
          width: xScale.bandwidth(),
          height: function (d, i) {
            var max = yScale(Math.min(d.close, d.open));
            var min = yScale(Math.max(d.close, d.open));
            var diff = max - min;
            return diff || 1;
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

        crossLabel
          .attr(
          "d",
          "M" +
          xScale(d.time) +
          " " +
          (yScale(d.high) + 10) +
          " " +
          "C" +
          xScale(d.time) +
          " " +
          (yScale(d.high) + 10) +
          "," +
          xScale(d.time) +
          " " +
          yScale(d.high) +
          "," +
          (xScale(d.time) + 10) +
          " " +
          yScale(d.high) +
          " " +
          "L" +
          (xScale(d.time) + 128) +
          " " +
          yScale(d.high) +
          "," +
          "C" +
          (xScale(d.time) + 138) +
          " " +
          yScale(d.high) +
          "," +
          (xScale(d.time) + 148) +
          " " +
          yScale(d.high) +
          "," +
          (xScale(d.time) + 148) +
          " " +
          (yScale(d.high) + 10) +
          " " +
          "L" +
          (xScale(d.time) + 148) +
          " " +
          (yScale(d.high) + 55) +
          "," +
          "C" +
          (xScale(d.time) + 148) +
          " " +
          (yScale(d.high) + 55) +
          "," +
          (xScale(d.time) + 148) +
          " " +
          (yScale(d.high) + 65) +
          "," +
          (xScale(d.time) + 138) +
          " " +
          (yScale(d.high) + 65) +
          " " +
          "L" +
          (xScale(d.time) + 84) +
          " " +
          (yScale(d.high) + 65) +
          "," +
          "L" +
          (xScale(d.time) + 74) +
          " " +
          (yScale(d.high) + 81) +
          "," +
          "L" +
          (xScale(d.time) + 64) +
          " " +
          (yScale(d.high) + 65) +
          "," +
          "L" +
          (xScale(d.time) + 10) +
          " " +
          (yScale(d.high) + 65) +
          "," +
          "C" +
          (xScale(d.time) + 10) +
          " " +
          (yScale(d.high) + 65) +
          "," +
          (xScale(d.time) + 0) +
          " " +
          (yScale(d.high) + 65) +
          "," +
          (xScale(d.time) + 0) +
          " " +
          (yScale(d.high) + 55) +
          " " +
          "Z"
          )
          .attr("fill", "#fff")
          .attr("transform", "translate(-70,-90)");

        crossLabelText
          .text(d.high)
          .attr("fill", "red")
          .attr("font-size", "24px")
          .attr("font-weight", "bold")
          .attr("x", xScale(d.time))
          .attr("y", yScale(d.high))
          .attr("transform", "translate(-60,-60)");

        crossLabelTime
          .text(d.date + " " + d.time)
          .attr("fill", "#223953")
          .attr("font-size", "15px")
          .attr("font-weight", "bold")
          .attr("x", xScale(d.time))
          .attr("y", yScale(d.high))
          .attr("transform", "translate(-60,-40)");

        crossCircle01
          .attr("r", "8")
          .attr("cx", xScale(d.time))
          .attr("cy", yScale(d.high))
          .attr("fill", "rgb(69, 202, 252)")
          .attr("stroke", "#fff")
          .attr("stroke-width", "4")
          .attr("transform", "translate(4,10)");

        crossCircle02
          .attr("r", "16")
          .attr("cx", xScale(d.time))
          .attr("cy", yScale(d.high))
          .attr("fill", "rgba(255,255,255,.6)")
          .attr("transform", "translate(4,10)")
          .attr("class", "circular-breath");

        crosshair.style("display", null);
        setCrosshair(
          xScale(d.time) + xScale.bandwidth() * 0.5,
          yScale(d.close)
        );
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
        .text(xScale.domain()[Math.floor(x / xScale.step())]);

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
        .text(formatDecimal(xScale.domain()[Math.floor(x / xScale.step())]));
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
var colors = ["#ff0000", "#0cd562"];

function renderingLongBar() {
  // 取得資料
  d3.csv("data/sales.csv", function (error, data) {
    if (error) throw error;

    // 資料格式化 string to number
    data.forEach(function (d) {
      d.sales = +d.sales;

    });

    // 宣告DOM
    var longBarChart = d3.select("#longBarChart");
    longBarChart.html("");

    // 宣告寬度高度
    var margin = { top: 20, right: 20, bottom: 40, left: 20 }
    var width = parseInt(d3.select("#longBarChart").style("width"), 10) - margin.left * 2 - margin.right * 2;
    var height = parseInt(d3.select("#longBarChart").style("height"), 10) - margin.bottom;

    // 建立svg
    var svgBar = longBarChart
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var layout = svgBar.append("g")
      .attr("transform", "translate(0,0)")
    // 設定輸出範圍
    var x = d3
      .scaleBand()
      .range([0, width])
      .padding(0.3);
    var y = d3.scaleLinear()
      .range([height, 0]);

    // 設定輸入範圍
    x.domain(
      data.map(function (d) {
        return d.time;
      })
    );

    y.domain([
      d3.min(data, function (d) {
        return -Math.abs(d.sales);
      })
      ,
      d3.max(data, function (d) {
        return Math.abs(d.sales);
      })
    ]);

    // 建立rect，並將x軸資料傳入
    layout
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr('transform', 'translate(30,0)')
      .attr("x", function (d) {
        return x(d.time);
      })

      // 長條圖寬度高度
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        if (d.sales < 0) {
          return 0
        }
        return 0
      })

      // 長條圖位置

      .attr("y", function (d) {
        if (d.sales < 0) {
          return height / 2;
        } else {
          return height / 2;
        }
      })

      // 長條圖顏色
      .style("fill", function (d) {
        if (d.sales > 0) {
          return colors[0];
        } else {
          return colors[1];
        }
      })
      // 特效~
      .transition()
      .duration(1500)
      .delay(function (d, i) { return Math.random() * 10 * i; })

      // 長條圖寬度高度 (特效)
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        if (d.sales < 0) {
          return (height - y(Math.abs(d.sales))) / 2;
        }
        return (height - y(d.sales)) / 2;
      })
      // 長條圖位置 (特效)
      .attr("y", function (d) {
        if (d.sales < 0) {
          return height / 2;
        } else {
          return y(d.sales) / 2;
        }
      })


    // 新增 xAxis 軸線
    layout
      .append("g")
      .attr("id", "xAxis")
      .attr("transform", "translate(30," + height + ")")
      .call(
      d3
        .axisBottom(x)
        .tickValues([
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
          "20:00",
          "21:00",
          "22:00",
          "23:00"
        ])
      );

    // 新增 yAxis 軸線
    layout.append("g")
      .attr("id", "yAxis")
      .attr("transform", "translate(30,0)")
      .call(d3.axisLeft(y)
        .ticks(3)
      )
  });
}

// 將 window 綁定 resize 事件，並重新繪製圖型
d3.select(window).on("resize", function (e) {
  renderingLongBar(e);
});
renderingLongBar();

// ---------------------------------------------------------------------
// 儀錶板
// ---------------------------------------------------------------------
var gauge = function (container, configuration) {
  var that = {};
  var config = {
    size: parseInt(d3.select(".speedometerRow").style("width")),
    clipWidth: parseInt(d3.select(".speedometerRow").style("width")),
    clipHeight: parseInt(d3.select(".speedometerRow").style("width")),
    ringInset: 20,
    ringWidth: 20,

    pointerWidth: 10,
    pointerTailLength: 5,
    pointerHeadLengthPercent: 0.9,

    minValue: -0,
    maxValue: 10,

    minAngle: -140,
    maxAngle: 140,

    transitionMs: 750,

    majorTicks: 9,
    labelFormat: d3.format("d"),
    labelInset: 45,

    borderColor: "red",

    arcColorFn: d3.interpolateHsl(d3.rgb("#63809E"), d3.rgb("#63809E")),

    g1title: '',
    g1num: '',
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
    var newAngle = config.minAngle + ratio * range;
    return newAngle;
  }

  function configure(configuration) {
    var prop = undefined;
    for (prop in configuration) {
      config[prop] = configuration[prop];
    }

    range = config.maxAngle - config.minAngle;

    r = parseInt(d3.select(".speedometerRow").style("width")) / 2;
    pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

    // a linear scale that maps domain values to a percent from 0..1
    scale = d3
      .scaleLinear()
      .range([0, 1])
      .domain([config.minValue, config.maxValue]);

    ticks = scale.ticks(config.majorTicks);
    tickData = d3.range(config.majorTicks).map(function () {
      return 1 / config.majorTicks;
    });

    arc = d3
      .arc()
      .innerRadius(r - config.ringWidth - config.ringInset)
      .outerRadius(r - config.ringInset)
      .startAngle(function (d, i) {
        var ratio = d * i;
        return deg2rad(config.minAngle + ratio * range);
      })
      .endAngle(function (d, i) {
        var ratio = d * (i + 1);
        return deg2rad(config.minAngle + ratio * range);
      });
  }
  that.configure = configure;
  function centerTranslation() {
    return "translate(" + r + "," + r + ")";
  }

  function isRendered() {
    return svg !== undefined;
  }
  that.isRendered = isRendered;

  function render(newValue) {
    svg = d3
      .select(container)
      .append("svg:svg")
      .attr("class", "gauge")
      .attr("width", config.clipWidth)
      .attr("height", config.clipHeight);

    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "a1")
      .append("rect")
      .attr("x", -6)
      .attr("y", -40)
      .attr(
      "width",
      parseInt(d3.select(".speedometerRow").style("width")) / 2.1
      )
      .attr(
      "height",
      parseInt(d3.select(".speedometerRow").style("width")) / 1
      );

    svg
      .append("circle")
      .attr("clip-path", "url(#a1)")
      .attr("cx", parseInt(d3.select(".speedometerRow").style("width")) / 2.2)
      .attr("cy", parseInt(d3.select(".speedometerRow").style("width")) / 2.2)
      .attr("r", parseInt(d3.select(".speedometerRow").style("width")) / 2.2)
      .attr(
      "stroke-width",
      parseInt(d3.select(".speedometerRow").style("width")) / 45
      )
      .attr("stroke", config.borderColor)
      .attr("fill", "none")
      .attr("transform", "translate(12,10)");

    var centerTx = centerTranslation();

    var arcs = svg
      .append("g")
      .attr("class", "arc")
      .attr("transform", centerTx);

    arcs
      .selectAll("path")
      .data(tickData)
      .enter()
      .append("path")
      .attr("fill", function (d, i) {
        return config.arcColorFn(d * i);
      })
      .attr("d", arc);

    var lg = svg
      .append("g")
      .attr("class", "label")
      .attr("transform", centerTx);
    lg
      .selectAll("text")
      .data(ticks)
      .enter()
      .append("text")
      .attr("transform", function (d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + ratio * range;
        return (
          "rotate(" +
          newAngle +
          ") translate(0," +
          (config.labelInset - r) +
          ")"
        );
      })
      .text(config.labelFormat);

    var lineData = [
      [config.pointerWidth / 2, 0],
      [0, -pointerHeadLength],
      [-(config.pointerWidth / 2), 0],
      [0, config.pointerTailLength],
      [config.pointerWidth / 2, 0]
    ];
    var pointerLine = d3.line().curve(d3.curveLinear);
    var g1 = svg.append("g").attr("class", "g1");
    var g1hr = g1.append("path");
    var g1text = g1.append("text");
    var g1text2 = g1.append("text");
    var g1path = g1.append("path");

    var g1w = parseInt(d3.select(".speedometerRow").style("width")) - 20;
    g1.attr("transform", "translate(10," + (g1w + 20) + ") scale(1)");
    g1path
      .attr(
      "d",
      "M0 10 " +
      "C0 10,0 0,10 0" +
      "L" +
      (g1w - 10) +
      " " +
      "0," +
      "C" +
      (g1w - 10) +
      " 0" +
      "," +
      g1w +
      " 0" +
      "," +
      g1w +
      " 10" +
      "," +
      "L" +
      g1w +
      " " +
      "120," +
      "C" +
      g1w +
      " 120" +
      "," +
      g1w +
      " 130" +
      "," +
      (g1w - 10) +
      " 130" +
      "," +
      "L" +
      "10" +
      " " +
      "130," +
      "C" +
      "10 " +
      " 130" +
      "," +
      "0 " +
      " 130" +
      "," +
      " 0 " +
      " 120" +
      "," +
      "Z"
      )
      .attr("stroke", "#4c709a")
      .attr("fill", "none");
    g1hr
      .attr("d", "M0 " + "52 " + g1w + " 52")
      .attr("stroke", "#4c709a")
      .attr("fill", "none");
    g1text
      .text(config.g1title)
      .attr('class', 'g1title')
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr("stroke", "none")
      .attr("fill", "#4c709a")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("x", (g1w / 2))
      .attr("y", 30);
    g1text2
      .text(config.g1num)
      .attr('class', 'g1num')
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr("stroke", "none")
      .attr("fill", "#fff")
      .attr("font-size", "32px")
      .attr("font-weight", "bold")
      .attr("x", (g1w / 2))
      .attr("y", 90);
    var pg = svg
      .append("g")
      .data([lineData])
      .attr("class", "pointer")
      .attr("transform", centerTx);
    pointer = pg
      .append("path")
      .attr("d", pointerLine /*function(d) { return pointerLine(d) +'Z';}*/)
      .attr("d", "M-4 " + 0 * r + " L 0 " + -0.6 * r + " L4 " + 0 * r + " z")
      .attr("fill", "#fff")
      .attr("stroke", "none")
      .attr("transform", "rotate(" + config.minAngle + ")");
    pg
      .append("circle")
      .attr("r", 0.09 * r)
      .attr("fill", "#061633")
      .attr("stroke-width", "4px")
      .attr("stroke", "#fff");
    update(newValue === undefined ? 0 : newValue);
  }
  that.render = render;
  function update(newValue, newConfiguration) {
    if (newConfiguration !== undefined) {
      configure(newConfiguration);
    }
    var ratio = scale(newValue);
    var newAngle = config.minAngle + ratio * range;
    pointer
      .transition()
      .duration(config.transitionMs)
      .ease(d3.easeElastic)
      .attr("transform", "rotate(" + newAngle + ")");
  }
  that.update = update;

  configure(configuration);

  return that;
};


function onDocumentReady() {
  var powerGauge = gauge("#speedometer", {
    size: 220,
    clipWidth: parseInt(d3.select(".speedometerRow").style("width")),
    clipHeight: parseInt(d3.select(".speedometerRow").style("width")) * 2,
    ringWidth: 2,
    maxValue: 9,
    transitionMs: 2000,
    borderColor: "#00D56A",
    g1title: '現貨能量 mlm ↓↓',
    g1num: '0'
  });
  powerGauge.render();
}

function onDocumentReady2() {
  var powerGauge = gauge("#speedometer2", {
    size: 220,
    clipWidth: parseInt(d3.select(".speedometerRow").style("width")),
    clipHeight: parseInt(d3.select(".speedometerRow").style("width")) * 2,
    ringWidth: 2,
    maxValue: 9,
    transitionMs: 2000,
    borderColor: "#ff0000",
    g1title: '現貨力道 P80 ↓↓',
    g1num: '-0.05'
  });
  powerGauge.render();
}
function resize(e) {
  console.log(svg)
  // svg.html("");
  isLoaded();
}
window.addEventListener('resize', resize);

function isLoaded() {
  if (!window.isLoaded) {
    window.addEventListener(
      "load",
      function () {
        onDocumentReady();
        onDocumentReady2();
      },
      false
    );
  } else {
    onDocumentReady();
    onDocumentReady2();
  }
}
isLoaded();
