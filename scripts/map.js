// D3 Visualization Setup
var width = document.getElementById('map').offsetWidth;
var height = document.getElementById('map').offsetHeight;
var centered;

var svg = d3.select('#map').append('svg')
  .attr('width', width)
  .attr('height', height);

var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale([width]);

var path = d3.geoPath().projection(projection);

var g = svg.append('g');

// D3 Visualization Execution
d3.json('data/states.json', function(error, map) {
  if (error) throw error;

  var country = g.append('g').classed('continent', true);

  country.selectAll()
    .data(map.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', '#fff')
    .style('stroke-width', '1')
    // .style('fill', '#f2f2f2')
    .classed('state', true)
    .attr('id', function(d) {
      return d.properties.NAME;
    })
    .on("click", clicked);
});

function clicked(d) {
  d3.selectAll('.counties').remove();
  d3.selectAll('.districts').remove();
  d3.select('#titleText').remove();

  state = d.properties.NAME;
  congress = 114;

  if (state !== undefined) {
    d3.select('#title')
      .append('p')
      .attr('id', 'titleText')
      .text(congress + 'th Congress, District Map of ' + state);
  };

  loadDistricts({
    state: state,
    congress: congress
  });
}

// Load Districts into Visualization
var loadDistricts = function(config) {

  // State Selector for Visualization
  var state = config.state;
  var congress = config.congress;

  d3.json('data/counties.json', function(error, data) {
    if (error) throw error;

    var counties = g.append('g').classed('counties', true);

    var length = data.features.length;
    var stateCounties = [];

    for (var i = 0; i < length; i++) {
      if (data.features[i].properties.STATE == state) {
        stateCounties.push(data.features[i]);
      }
    }

    counties.selectAll('path')
      .data(stateCounties)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', '#fff')
      .style('stroke-width', '1')
      .style('fill', '#e3e3e3')
      .classed('county', true)
      .on("click", clicked);
  });

  d3.json('data/districts/' + congress + '.json', function(error, data) {
    if (error) throw error;

    var districts = g.append('g').classed('districts', true);

    var length = data.features.length;
    var stateDistricts = [];

    for (var i = 0; i < length; i++) {
      if (data.features[i].properties.STATENAME == state) {
        stateDistricts.push(data.features[i]);
      }
    }

    districts.selectAll('path')
      .data(stateDistricts)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', '#36c87e')
      .style('stroke-width', '1')
      .style('fill', 'rgba(0, 0, 0, 0)')
      .classed('district', true)
      .on("click", clicked);
  });

  //Download SVG
  // $('#map').click(function() {
  //   var svgData = $('svg')[0].outerHTML;
  //   var svgBlob = new Blob([svgData], {
  //     type: 'image/svg+xml;charset=utf-8'
  //   });
  //   var svgUrl = URL.createObjectURL(svgBlob);
  //   var downloadLink = document.createElement('a');
  //   downloadLink.href = svgUrl;
  //   downloadLink.download = state + '_' + congress + '.svg';
  //   document.body.appendChild(downloadLink);
  //   downloadLink.click();
  //   document.body.removeChild(downloadLink);
  // });
}
