var map_svg = d3.select("#mapdiv"),
width = +map_svg.attr("width") - 40,
height = +map_svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
.scale(width / 1.3 / Math.PI)
.translate([width / 2, height / 2])

const country_conversions = {
	"USA": ["United States"],
	"England": ["United Kingdom"],
	"Russia": ["Soviet Union"],
	"Germany": ["East Germany", "West Germany"],
	"Republic of Serbia": ["Serbia"]
}

var counts;

function getCount(country) {
	var check = [country]
	var count = 0
	if (country in country_conversions) {
		console.log("country in", country)
		check = check.concat(country_conversions[country])
		console.log(check)
	}
	check.forEach(c => {
		if (c in counts) {
			count = count + counts[c]
		}
	})
	return count;
}

function makeMap(data) {
	countries = data.flatMap(d => d.country.split(",").map(s => s.trim())).filter(d => d.length > 0)
	
	counts = {}
	countries.forEach(country => {
		counts[country] = 1 + (country in counts ? counts[country] : 0)
	})
	
	
	d3.json('./data/world.geojson').then(geo => {
		map_svg.selectAll("path").remove()
		
		map_svg.append("g")
		.selectAll("path")
		.data(geo.features)
		.enter()
		.append("path")
			.attr("fill", d => {
				var country = d.properties.name
				let count = getCount(country)
				
				if (count > 0) {
					return "#e50914";
				}
				return "#444";
			})
			.attr("d", d3.geoPath()
				.projection(projection)
			)
			.style("stroke", "#fff")
			.on("mouseover", mouseoverMap)
			.on("mousemove", mousemoveMap)
			.on("mouseleave", mouseleaveMap);
	}).then(_ => {
		console.log("remaining", counts)
	})
}

// create a tooltip
  var TooltipMap = d3.select("#tooltipMap")
	.append("div")
	.style("opacity", 0)
	.attr("class", "tooltip")

var tooltipMaxListings = 5

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseoverMap = function(d) {
	TooltipMap
	  .style("opacity", 1)
	d3.select(this)
	  .style("stroke", "#444")
  }
  var mousemoveMap = function(d) {
	  count = getCount(d.properties.name)
	TooltipMap
	  .html(`<div>${count > 0 ? count : "No"} item${count != 1 ? "s" : ""} in the Netflix catalog have been produced in <span style="padding: 1px 3px 1px 3px; border-radius: 4px;color: white; background-color: ${count > 0 ? "#e50914" : "#444"};"><strong>${d.properties.name}</strong></span></div>`)
	  .style("left", (d3.event.pageX+20) + "px")
	  .style("top", (d3.event.pageY-20) + "px")
  }
  var mouseleaveMap = function(d) {
	TooltipMap
	  .style("opacity", 0)
	d3.select(this)
	  .style("stroke", "#fff")
  }