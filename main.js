// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 20, right: 30, bottom: 150, left: 60 };

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like

var genre_count = {}
var chord_genre = "Stand-Up Comedy";

d3.csv("data/netflix.csv").then(function(data) {
	data = data.map(d => {
		copy = d
		copy.date_added = Date.parse(copy.date_added)
		return copy
	})
	movies = data.filter(d => d.type == "Movie")

	dates = [...new Set(data.map(d => d.date_added))].sort()

	var slider = d3
		.sliderHorizontal()
		.ticks(0)
		.min(d3.min(dates))
		.max(d3.max(dates))
		.width(300)
		.displayFormat(d3.timeFormat("%B %d, %Y"))
		.displayValue(true)
		.default(Date.parse("March 23, 2021"))
		.on('onchange', (val) => {
			updateGraphs(data, val);
		});

	d3.select('#slider')
		.append('svg')
		.attr('width', 500)
		.attr('height', 80)
		.append('g')
		.attr('transform', 'translate(60,30)')
		.call(slider);
		
		
		var gslider = d3
		.sliderHorizontal()
		.ticks(0)
		.min(5)
		.max(150)
		.width(document.getElementById("chord-slide").offsetWidth - 40)
		.displayValue(false)
		.default(25)
		.on('onchange', val => {
			updateChordRecent(parseInt(val));
		});

	d3.select('#gslider')
		.append('svg')
		.attr('height', 18)
		.append('g')
		.attr('transform', `translate(${20},7)`)
		.call(gslider);

	movies = data.filter(d => d.type == "Movie")

	genres = [...new Set(data.filter(d => d.type == "Movie").flatMap(d => d.listed_in.split(", ")))]

	// add the options to the button
	d3.select("#chord-genre-select")
		.selectAll('myOptions')
		.data(genres)
		.enter()
		.append('option')
		.property("selected", function(d){ return d === "Stand-Up Comedy"; })
		.text(function(d) { return d; }) // text showed in the menu
		.attr("value", function(d) { return d; }) // corresponding value returned by the button
		
	// When the button is changed, run the updateChart function
	d3.select("#chord-genre-select").on("change", function(d) {
		// recover the option that has been chosen
		var selectedOption = d3.select(this).property("value")
		// run the updateChart function with this selected option
		updateChordGenre(selectedOption);
	});
	
	makeBar(data);
	makeScatter(movies);
	makeChord(movies);
	makeMap(data);

});
function updateGraphs(data, date) {
	data = data.filter(d => d.date_added <= date)
	updateBar(data);
	makeMap(data);

	movies = data.filter(d => d.type == "Movie")

	updateChordData(movies);
	updateScatter(movies);
}