// D3 Visualization Setup
var width = document.getElementById('map').offsetWidth;
var height = document.getElementById('map').offsetHeight;
var country;
var centered;
var state;
var stateCompactness = {};
var congress;

var svg = d3.select('#map').append('svg')
  .attr('width', width)
  .attr('height', height);

var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale([width]);

var path = d3.geoPath().projection(projection);

var g = svg.append('g')
  .classed('graphic', true);

function clicked(d) {
  state = d.properties.NAME;

  loadCounties({
    state: state,
    congress: congress
  });

  if (d && centered !== d && d3.select(this).attr('class') !== 'district' && d3.select(this).attr('class') !== 'county') {
    setTimeout(function() {
      loadDistricts({
        state: state,
        congress: congress
      });
    }, 500)
  } else {
    loadDistricts({
      state: state,
      congress: congress
    });
  };

  var x, y, k;

  if (d && centered !== d && d3.select(this).attr('class') !== 'district' && d3.select(this).attr('class') !== 'county') {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    if (state == 'Texas' || state == 'California' || state == 'Nevada') {
      k = 3;
    } else if (state == 'Maryland' || state == 'Rhode Island' || state == 'Delaware' || state == 'New Jersey') {
      k = 5;
    } else {
      k = 4;
    };
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  };

  g.transition()
    .duration(400)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");

  g.selectAll('state')
    .style('stroke-width', 0.5);
};

function loadCongress(congressNumber) {
  congress = congressNumber;
};

loadCongress(115);

d3.csv('data/compactness.csv', function(error, data) {
  var states = [];
  var averages = [];
  var compactnessByState = d3.nest()
    .key(function(d) {
      return d.district.substring(0, 2);
    })
    .entries(data);

  for (i = 0; i < compactnessByState.length; i++) {
    var obj = compactnessByState[i];
    states.push(obj.key);
  };

  for (i = 0; i < compactnessByState.length; i++) {
    var obj = compactnessByState[i];
    var compactness = [];

    for (f = 0; f < obj.values.length; f++) {
      compactness.push(obj.values[f].compactness);
    };

    // console.log(compactness);
    var sum = compactness.reduce(function(total, num) {
      return parseFloat(total) + parseFloat(num);
    })
    averages.push(sum / obj.values.length);
  };

  // console.log(states);
  // console.log(averages);

  for (i = 0; i < states.length; i++) {
    stateCompactness[states[i]] = averages[i];
  };

  // console.log(stateCompactness);
});

// D3 Visualization Execution
d3.json('data/states.json', function(error, map) {
  if (error) throw error;

  country = g.append('g').classed('country', true);

  country.selectAll()
    .data(map.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', '#fff')
    .style('stroke-width', '1')
    .style('opacity', function(d) {
      if (stateCompactness[d.properties.ABBR] !== 1) {
        return 1 - stateCompactness[d.properties.ABBR] * 2;
      } else {
        return 0.05;
      };
    })
    .classed('state', true)
    .attr('id', function(d) {
      return d.properties.ABBR;
    })
    .on('mouseenter', stateMouseEnter)
    .on('mouseleave', stateMouseExit)
    .on('click', clicked);
});

// Load Counties into Visualization
var loadCounties = function(config) {
  var state = config.state;

  d3.selectAll('.counties').remove();

  d3.json('data/counties.json', function(error, data) {
    if (error) throw error;

    var counties = g.append('g').classed('counties', true);

    var length = data.features.length;
    var stateCounties = [];

    for (var i = 0; i < length; i++) {
      if (data.features[i].properties.STATE == state) {
        stateCounties.push(data.features[i]);
      };
    };

    counties.selectAll('path')
      .data(stateCounties)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', '#fff')
      .style('stroke-width', '0.5')
      .style('fill', '#c1f7dc')
      .classed('county', true)
      .on("click", clicked);
  });
};

// Load Districts into Visualization
var loadDistricts = function(config) {
  d3.selectAll('.districts').remove();

  // State Selector for Visualization
  var state = config.state;
  var congress = config.congress;

  // Modify Chart Title
  d3.select('#titleText').remove();
  d3.select('#intro').remove();

  if (state !== undefined) {
    d3.select('.legend').style('display', 'none');
    d3.select('.timeline').style('display', 'block');
  } else {
    d3.select('.legend').style('display', 'block');
    d3.select('.timeline').style('display', 'none');
  };

  var congressParse = congress.toString().substring(congress.toString().length - 2, congress.toString().length);

  // All this huge chunk of code does is decide whether
  // the number should have a "st", "nd" or "th" after
  // it. What the hell am I doing with my life.
  if (congressParse.substring(1) == '1' && congressParse !== '11') {
    if (state !== undefined) {
      d3.select('#title')
        .append('p')
        .attr('id', 'titleText')
        .text(congress + 'st Congress, District Map of ' + state);
    } else {
      d3.select('#title')
        .append('p')
        .attr('id', 'titleText')
        .text(congress + 'st Congress of the United States');
      // d3.select('.legend').style('display', 'block');
    };
    // } else if (congressParse == '02' || congressParse == '22' || congressParse == '32' || congressParse == '42' || congressParse == '52' || congressParse == '62' || congressParse == '72' || congressParse == '82' || congressParse == '92') {
  } else if (congressParse.substring(1) == '2' && congressParse !== '12') {
    if (state !== undefined) {
      d3.select('#title')
        .append('p')
        .attr('id', 'titleText')
        .text(congress + 'nd Congress, District Map of ' + state);
    } else {
      d3.select('#title')
        .append('p')
        .attr('id', 'titleText')
        .text(congress + 'nd Congress of the United States');
      // d3.select('.legend').style('display', 'block');
    };
  } else {
    if (state !== undefined) {
      d3.select('#title')
        .append('p')
        .attr('id', 'titleText')
        .text(congress + 'th Congress, District Map of ' + state);
    } else {
      d3.select('#title')
        .append('p')
        .attr('id', 'titleText')
        .text(congress + 'th Congress of the United States');
      // d3.select('.legend').style('display', 'block');
    };
  };

  d3.csv('data/codes.csv', function(error, data) {
    if (error) throw error;

    var stateCode;

    for (var i = 0; i < data.length; i++) {
      if (data[i].State == state) {
        stateCode = data[i].Code;
        console.log(stateCode)
      };
    };

    d3.json('data/districts/' + congress + '.json', function(error, data) {
      if (error) throw error;

      var districts = g.append('g').classed('districts', true);

      var length = data.features.length;
      var stateDistricts = [];

      console.log(stateCode);
      for (var i = 0; i < length; i++) {
        console.log(stateCode);
        if (data.features[i].properties.STATEFP !== undefined) {
          if (data.features[i].properties.STATEFP == stateCode) {
            stateDistricts.push(data.features[i]);
          };
        } else {
          if (data.features[i].properties.STATENAME == state) {
            stateDistricts.push(data.features[i]);
          }
        }
      };

      districts.selectAll('path')
        .data(stateDistricts)
        .enter()
        .append('path')
        .attr('d', path)
        .style('stroke', '#36c87e')
        .style('stroke-width', '0.5')
        .style('fill', 'rgba(0, 0, 0, 0)')
        .classed('district', true)
        .on("click", clicked);
    });
  });
};

// Make Visualization Interact w/ Pointer
function stateMouseEnter(d) {
  d3.select(this).style('opacity', 1);
};

function stateMouseExit(d) {
  d3.select(this).style('opacity', function(d) {
    if (stateCompactness[d.properties.ABBR] !== 1) {
      return 1 - stateCompactness[d.properties.ABBR] * 2;
    } else {
      return 0.05;
    };
  });
};

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
