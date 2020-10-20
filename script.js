const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

var width = 800;
var height = 400;
var paddingLeft = 60;
var paddingTop = 10;
var paddingRight = 20;
var paddingBottom = 200;

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "Novemeber", "December"];

// Create tooltip
var tooltip = d3.select("body").append("div")
  .attr("id", "tooltip");

// Create SVG, assign width and height
var svg = d3.select("body").append("svg")
  .attr("width", width + paddingLeft + paddingRight)
  .attr("height", height + paddingTop + paddingBottom);  

var baseTemperature;

d3.json(dataUrl).then((response) => {  
  // convert Time attribute to Date object
  baseTemperature = response.baseTemperature;
  var data = response.monthlyVariance;
  data.forEach(x => {
    x.month--;
  })
  
  // create scale for color
  var colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateRdYlBu)
    .domain([d3.max(data, d => baseTemperature + d.variance), d3.min(data, d => baseTemperature + d.variance)]);
  // custom invert function
  colorScale.invert = (function(){
      var domain = colorScale.domain()
      var range = colorScale.range()
      var scale = d3.scaleSequential()
        .interpolator(d3.interpolateBuYlRd)
        .domain(range)
        .range(domain);

      return function(x){
          return scale(x)
      }
  })()
  
  
  // create scale for x axis
  var xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
    .range([0, width]);
  
  // create scale for y axis
  var yScale = d3.scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range([0, height]);
  
  // create x axis
  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).tickSize(10, 0);
  
  // create y axis
  
  var yAxis = d3.axisLeft(yScale)
    .tickSize(10, 0)
    .tickFormat(function(month){
      return months[month];
    });
  
  // append x axis
  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(" + paddingLeft + ", " + (height + paddingTop) + ")")
    .call(xAxis);
  
  // append y axis
  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + paddingLeft + ", " + (paddingTop) + ")")
    .call(yAxis);
  
  // create all the dots from the dataset
  var dataContainer = svg.append("g");
  dataContainer.selectAll("rect")
    .data(data)
    .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-year", d => d.year)
      .attr("data-month", d => d.month)
      .attr("data-temp", d => baseTemperature + d.variance)
      .attr("fill", d => colorScale(baseTemperature + d.variance))
      .attr("height", height/12)
      .attr("width", width*12/data.length)
      .attr("x", d => xScale(d.year) + paddingLeft)
      .attr("y", d => yScale(d.month) + paddingTop)
      .on("mouseover", handleMouseoverCurry(data))
      .on("mouseout", handleMouseoutCurry(data));
  
      var legend = svg.append("g")
        .attr("transform", "translate(" + paddingLeft + ", " + (paddingTop + height + 50) + ")")
        .attr("y", paddingTop + height + 50)
        .attr("id", "legend");
  
      var numLegendParts = 10;
  
      var legendColorScale = d3.scaleSequential()
        .interpolator(d3.interpolateRdYlBu)
        .domain([numLegendParts - 1, 0]);
  
      for(var i = 0; i < numLegendParts; i++) {
        var color = legendColorScale(i);
        var label = Math.round(colorScale.invert(color) * 10) / 10;
        
        var tick = legend.append("g").attr("class", "tick");
        tick.append("rect")
          .attr("x", i * 30)
          .attr("height", 30)
          .attr("width", 30)
          .attr("stroke", "black")
          .attr("fill", color);
      }
        legend.append("text")
          .style("text-anchor", "middle")
          .attr("x", 0)
          .attr("y", 30 * 2)
          .text(Math.round(d3.min(data, d => baseTemperature + d.variance) * 10 ) / 10 + "");
        legend.append("line")
          .attr("stroke", "black")
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", 30)
          .attr("y2", 40);
  
        legend.append("text")
          .style("text-anchor", "middle")
          .attr("x", i * 30)
          .attr("y", 30 * 2)
          .text(Math.round(d3.max(data, d => baseTemperature + d.variance) * 10 ) / 10 + "");
        legend.append("line")
          .attr("stroke", "black")
          .attr("x1", i * 30)
          .attr("x2", i * 30)
          .attr("y1", 30)
          .attr("y2", 40);
});


function handleMouseoverCurry(data) {
  return function(e) {
    var circle = d3.select(this);
    var year = circle.attr("data-year");
    var month = circle.attr("data-month");
    
    var dp = data.filter(d => d.month == month && d.year == year)[0];
    var sign = dp.variance > 0 ? "+" : "";
    var temp = Math.round((baseTemperature + dp.variance) * 1000) / 1000;
    tooltip.html(dp.year + " - " + months[dp.month] + "<br>" + temp + "<br>" + sign + dp.variance)
      .attr("data-year", year)
      .style("left", (e.pageX + 30) + "px")
      .style("top", (e.pageY - 50) + "px")
      .transition()
        .duration(100)
        .style("opacity", 0.9);
  }
}

function handleMouseoutCurry(data) {
  return function() {
    tooltip.transition().duration(100).style("opacity", 0);
  }
}