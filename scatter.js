ml = 50;
mr = 10;
mb = 45;
let graph_2_width = (document.getElementById("g2").offsetWidth - ml - mr - 40),
	graph_2_height = 275;

var runtimes_years = []
var runtimes_by_year;
var svg2;
var x2;
var y2;
var scatterBottomAxis;
var scatterLeftAxis;
var dots;
var avgline;
var scope_avg = 0;
var scope_dev = 0;
var devs_by_year;
var low_by_year;
var high_by_year;
var countyear;

function updateStats(from) {
	let scope_25 = d3.quantile([...from], 0.25)
	let scope_75 = d3.quantile([...from], 0.75)
	let scope_avg = d3.mean([...from])
	let scope_med = d3.median([...from])
	let scope_dev = d3.deviation([...from])
	document.getElementById("stat_25").innerText = (Math.round(scope_25 * 10) / 10).toFixed(1);
	document.getElementById("stat_75").innerText = (Math.round(scope_75 * 10) / 10).toFixed(1);
	document.getElementById("stat_count").innerText = [...from].length.toLocaleString();
	document.getElementById("stat_sum").innerText = parseInt(d3.sum([...from]) / 60).toLocaleString();
	document.getElementById("stat_mean").innerText = (Math.round(scope_avg * 10) / 10).toFixed(1);
	document.getElementById("stat_median").innerText = (Math.round(scope_med * 10) / 10).toFixed(1);
	document.getElementById("stat_dev").innerText = (Math.round(scope_dev * 10) / 10).toFixed(1);
}

function updateScatter(m) {
	runtimes_by_year = {}
	runtimes_years = []
	m.forEach(d => {
		runtimes_years.push({
			"year": parseInt(d.release_year),
			"title": d.title,
			"duration": parseInt(d.duration)
		})
		if (!(parseInt(d.release_year) in runtimes_by_year)) {
			runtimes_by_year[parseInt(d.release_year)] = []
		}
		runtimes_by_year[parseInt(d.release_year)].push(parseInt(d.duration))
	})
	
	let scope_durs = runtimes_years.map(d => d.duration).sort((a, b) => a > b)
	// scope_durs.sort(d3.quantile(scope_durs, 0.5), d3.quantile(scope_durs, 0.5), d3.median(scope_durs))
	updateStats(scope_durs)
	
	
	devs_by_year = {}
	low_by_year = {}
	high_by_year = {}
	countyear = {}
	
	for (var key in runtimes_by_year) {
		countyear[key] = runtimes_by_year[key].length
		dev = d3.deviation(runtimes_by_year[key])
		dev = dev == undefined ? 0 : dev
		devs_by_year[key] = dev
		let ls = [...runtimes_by_year[key]].sort((a, b) => a > b)
		low_by_year[key] = d3.quantile(ls, 0.25);
		high_by_year[key] = d3.quantile(ls, 0.75);
		runtimes_by_year[key] = d3.mean(runtimes_by_year[key])
	}
	
	x2.domain([Math.min(...Object.values(runtimes_years).map(d => d.year)), Math.max(...Object.values(runtimes_years).map(d => d.year))])
	
	y2.domain([0, Math.max(...Object.values(runtimes_years).map(d => d.duration))])
	
	scatterLeftAxis.call(d3.axisLeft(y2));
	scatterBottomAxis.call(d3.axisBottom(x2).tickFormat(d3.format(".0f")));
	
	svg2.selectAll("circle").remove()
	svg2.selectAll("path").remove()
	
	// Add dots
	dots = svg2.append('g')
		.selectAll("dot")
		.data(runtimes_years)
		.enter()
		.append("circle")
		.attr("cx", d => x2(d.year))
		.attr("cy", d => y2(d.duration))
		.attr("r", 2)
		.style("fill", "rgba(135, 206, 235, 0.2)");
	
	svg2.append("path")
	  .datum(Object.keys(runtimes_by_year))
	  .attr("fill", "steelblue")
	  .attr("opacity", 0.2)
	  .attr("stroke", "none")
	  .attr("d", d3.area()
		.x(function(d) { return x2(d) })
		.y0(function(d) { 
			// 
			// 
			return y2(low_by_year[d]);
		})
		.y1(function(d) { return y2(high_by_year[d])})
		)


		// Create the text that travels along the curve of chart
		var TooltipScatter = d3.select("#tooltipScatter")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		

	avgline = svg2.append("path")
		.datum(Object.keys(runtimes_by_year))
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", 1.5)
		.attr("d", d3.line()
			.x(function(d) { return x2(d) })
			.y(function(d) { return y2(runtimes_by_year[d]) })
		);
		
		
// Create the circle that travels along the curve of chart
  var focus = svg2
	.append('g')
	.append('circle')
	  .style("fill", "black")
	  .attr("stroke", "black")
	  .attr('r', 5)
	  .style("opacity", 0)
	  
	  // What happens when the mouse move -> show the annotations at the right positions.
		function mouseoverScatter() {
		  focus.style("opacity", 1)
		  TooltipScatter.style("opacity",1)
		}
	  
		function mousemoveScatter(d) {
		  // recover coordinate we need
		  var x0 = parseInt(x2.invert(d3.mouse(this)[0]));
		  arr = Object.keys(runtimes_by_year).map(y => parseInt(y))
		  var i = d3.bisect(arr, x0);
		  selectedData = Object.keys(runtimes_by_year)[i]
		  focus
			.attr("cx", x2(selectedData))
			.attr("cy", y2(runtimes_by_year[selectedData]))
		  TooltipScatter
			.html(`<div><strong>Year:</strong> ${selectedData}</div>
				<div><strong>Number of Films:</strong> ${countyear[selectedData]}</div>
				<div><strong>Mean Duration:</strong> ${(Math.round(runtimes_by_year[selectedData] * 10) / 10).toFixed(1)} minutes</div>
				<div><strong>Std. Deviation:</strong> ${(Math.round(devs_by_year[selectedData] * 10) / 10).toFixed(1)} minutes</div>
				<div><strong>25<sup>th</sup> Percentile:</strong> ${(Math.round(low_by_year[selectedData] * 10) / 10).toFixed(1)} minutes</div>
				<div><strong>75<sup>th</sup> Percentile:</strong> ${(Math.round(high_by_year[selectedData] * 10) / 10).toFixed(1)} minutes</div>`)
			.style("left", (d3.event.pageX-200) + "px")
			.style("top", (d3.event.pageY-20) + "px")
		  }
		function mouseoutScatter() {
		  focus.style("opacity", 0)
		  TooltipScatter.style("opacity", 0)
		}

		// Create a rect on top of the svg area: this rectangle recovers mouse position
		  svg2
			.append('rect')
			.style("fill", "none")
			.style("pointer-events", "all")
			.attr('width', graph_2_width)
			.attr('height', graph_2_height)
			.on('mouseover', mouseoverScatter)
			.on('mousemove', mousemoveScatter)
			.on('mouseout', mouseoutScatter);

}

function makeScatter(m) {
	
	svg2 = d3.select("#graph2")
		.append("svg")
		.attr("width", graph_2_width + ml + margin.right)
		.attr("height", graph_2_height + mb)
		.append("g")
		.attr("transform",
			"translate(" + ml + "," + 0 + ")")
			
	// Add X axis
	x2 = d3.scaleLinear()
		.range([0, graph_2_width]);
	
	scatterBottomAxis = svg2.append("g")
		.attr("transform", `translate(0,` + graph_2_height + ")")
		.call(d3.axisBottom(x2).tickFormat(d3.format(".0f")));
	
	svg2.append("text")
	.attr("transform", `translate(${graph_2_width / 2}, ${graph_2_height + mb})`)
	.style("text-anchor", "middle")
	.attr("fill", "black")
	.text("Release Year");
	
	svg2.append("text")
	.attr("transform", `translate(${-40}, ${graph_2_height / 2})rotate(-90)`)
	.style("text-anchor", "middle")
	.style("width", 20)
	.attr("fill", "black")
	.attr("dy", "0em")
	.text("Duration (min)");
	
	// svg2.append("text")
	// .attr("transform", `translate(${-30}, ${graph_2_height / 2})`)
	// .style("text-anchor", "end")
	// .style("width", 20)
	// .attr("fill", "black")
	// .attr("dy", "1em")
	// .text("(min)");

	// Add Y axis
	y2 = d3.scaleLinear()
		.range([graph_2_height, 0]);
		
	scatterLeftAxis = svg2.append("g")
		.call(d3.axisLeft(y2));
		
	updateScatter(m);
}
  