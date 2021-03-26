let graph_1_width = (document.getElementById("g1").offsetWidth - 40),
	graph_1_height = 500;

barMarginLeft = 150;
barMarginright = 15;
var x;
var y;
var svg;
var topAxis;
var mybars;


var spectral = d3.scaleSequential(d3.interpolateOranges);

function updateBar(data) {
	genre_count = {}
	data.forEach(d => {
		genres = d['listed_in'].split(", ")
		genres.forEach(genre => {
			if (!(genre in genre_count)) {
				genre_count[genre] = {
					count: 0,
					list: []
				}
			}
			genre_count[genre].count = genre_count[genre].count + 1
			genre_count[genre].list.push(d['title'])
		})
	})
	
	all_genres = Object.keys(genre_count)
	num_genres = all_genres.length
	
	
	x.domain([Math.max(...Object.values(genre_count).map(d => d.count)), 0]);
	topAxis.call(d3.axisTop(x).ticks(5).tickFormat(d3.format(".0f")));
	
	svg.selectAll("rect").remove()
	
	mybars = svg.selectAll("rect").data(Object.keys(genre_count))
	
	mybars.enter()
	.append("rect")
	.merge(mybars)
	.attr("x", function(d) { return x(d); })
	.attr("y", d => {
		return y(genre_count[d].count)
	})
	.attr("height", y.bandwidth())
	.attr("width", d => x(genre_count[d].count))
	.attr("transform", d => `translate(0, ${y(d)})`)
	.attr("fill", (d, i) => {
		var adjusted = d3.rgb(spectral(1- ((y(d) * 0.6) / graph_1_height)))
		adjusted = d3.hsl(adjusted)
		adjusted = adjusted.rgb()
		return `rgb(${adjusted.r}, ${adjusted.g}, ${adjusted.b})`;
	})
	.style("stroke", "none")
	.style("opacity", 0.7)
	.on("mouseover", mouseover)
	.on("mousemove", mousemove)
	.on("mouseleave", mouseleave);
}

function makeBar(data) {
	data.forEach(d => {
		genres = d['listed_in'].split(", ")
		genres.forEach(genre => {
			if (!(genre in genre_count)) {
				genre_count[genre] = {
					count: 0,
					list: []
				}
			}
			genre_count[genre].count = genre_count[genre].count + 1
			genre_count[genre].list.push(d['title'])
		})
	})
	
	svg = d3.select("#graph1")
		.append("svg")
		.attr("width", graph_1_width)
		.attr("height", graph_1_height + margin.top)
		.append("g")
		.attr("transform",
			"translate(" + barMarginLeft +  "," + margin.top + ")")

	y = d3.scaleBand()
		.range([0, graph_1_height])
		.domain(Object.keys(genre_count).sort((a, b) => genre_count[a].count < genre_count[b].count))
		.padding(0.1);

	svg.append("g")
		.attr("transform", "translate(0," + 0 + ")")
		.call(d3.axisLeft(y))
		.selectAll("text")
		.attr("transform", "translate(0,0)")
		.style("text-anchor", "end");

	x = d3.scaleLinear()
		.range([graph_1_width - barMarginLeft - barMarginright, 0]);
	topAxis = svg.append("g")
		.call(d3.axisTop(x));
	
	updateBar(data)
}

// create a tooltip
  var Tooltip = d3.select("#tooltip")
	.append("div")
	.style("opacity", 0)
	.attr("class", "tooltip")

var tooltipMaxListings = 5

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
	Tooltip
	  .style("opacity", 1)
	d3.select(this)
	  .style("opacity", 0.8)
  }
  var mousemove = function(d) {
	Tooltip
	  .html(`<h5>${(genre_count[d].count).toLocaleString()} titles in ${d}</h5>
		  <ul>
		  ${function() {
			  leftover = genre_count[d].count - tooltipMaxListings
			  var text = ""
			  selected = genre_count[d].list.slice(0, tooltipMaxListings)
			  selected.forEach(x => text = text.concat(`<li>${x}</li>`))
			  if (leftover > 0) {
				  text = text.concat(`<li><em>${(leftover).toLocaleString()} other`)
				  if (leftover > 1) {
					  text = text.concat("s")
				  }
				  text = text.concat(`</em></li>`)
			  }
			  return text
		  }()
		  }
		  </ul>`)
	  .style("left", (d3.event.pageX+20) + "px")
	  .style("top", (d3.event.pageY-20) + "px")
  }
  var mouseleave = function(d) {
	Tooltip
	  .style("opacity", 0)
	d3.select(this)
	  .style("stroke", "none")
	  .style("opacity", 0.7)
  }