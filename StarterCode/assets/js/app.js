var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// initial params

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"; 

// updating x-scale var when clicking the axis label
function xScale(censusData, chosenXAxis) {
  
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// updating x-axis var when clicking the axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

//  updating y-scale
function yScale(censusData, chosenYAxis) {
  
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, width]);

  return YLinearScale;

}

// updating y-axis 
function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return yAxis;
}
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newXScale(d[chosenYAxis]));

  return circlesGroup;
}

// text within circles 
function renderText(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlestextGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newXScale(d[chosenYAxis]));

  return circlestextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
// for x
 
  if (chosenXAxis === "poverty") {
    var label = "Poverty:";
  }
  else {
    label = "Average Poverty"
  }
  
// for y

  if (chosenYAxis === "healthcare") {
    var label = "Healthcare Access";
  }

    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.healthcare}<br>${label} ${d[chosenXAxis]}`);
    });

  
  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// import data
d3.csv("/assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;

  // parse
    censusData.forEach(function(data) {
      data.abbr = +data.abbr
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow
      data.healthcareHigh = +data.healthcareHigh
      data.age = +data.age;
      data.income = +data.income;
      data.incomeMoe = +data.incomeMoe;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
  });


var xLinearScale = xScale(censusData, chosenXAxis);
var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d.chosenYAxis)])
    .range([height, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);
// append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
chartGroup.append("g")
  .call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll("circle")
  .data(censusData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d.healthcare))
  .attr("r", 20)
  .attr("fill", "lightblue")
  .attr("opacity", ".5");

 // Create group for two x-axis labels
var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertyLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("In Poverty (%)");

var healthcareLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 40)
   .attr("value", "healthcare") // value to grab for event listener
   .classed("inactive", true)
   .text("Lacks Healthcare %");

chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Healthcare vs Poverty);

var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

// event listener
labelsGroup.selectAll("text")
  .on("click", function() {
  // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      chosenXAxis = value;

      xLinearScale = xScale(censusData, chosenXAxis);

      xAxis = renderAxes(xLinearScale, xAxis);

      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

    if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

