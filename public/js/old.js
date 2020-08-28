// global variables to deal with multiple uses in diffrent functions
var map;
var markers = [];
var descriptionText;
var lastInfo;
var myWrapper = $("#wrapper");
// var mc;
var hmarker = [];
var heatmap;
// image sources for map icons
var icons = {
  pv: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/pv.png'
  },
  hydro: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/hydro.png'
  },
  wind: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/wind.png'
  },
  biogas: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/biogas.png'
  },
  storage: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/battery.png'
  }
};
var clusterimage = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';

// after the geojson is loaded, iterate through the map data to create markers
// and add the info to the side bar
function loadMarkers() {
  console.log('loading markers')
  // source of geojson data
  geojson_url = 'https://raw.githubusercontent.com/edama-research/RE-Map/master/re-projects-markers.geojson'
  // load features into variables for display and manipulation
  $.getJSON(geojson_url, function(result) {
      data = result['features']
      $.each(data, function(key, val) {
        var point = new google.maps.LatLng(
                parseFloat(val['geometry']['coordinates'][1]),
                parseFloat(val['geometry']['coordinates'][0]));
        var titleText = val['properties']['project']
        descriptionText = val['properties']['description']
        var marker = new google.maps.Marker({
          position: point,
          title: titleText,
          animation: google.maps.Animation.DROP,
          map: map,
          // label: {
          //     color: 'white',
          //     fontWeight: 'bold',
          //     text: titleText
          //   },
          province: val['properties']['province'],
          type: val['properties']['tech'],
          grantType: val['properties']['project-type'],
          status: val['properties']['status'],
          icon: {
            url: icons[val['properties']['tech']].icon,
            labelOrigin: new google.maps.Point(30, 65),
            // size: new google.maps.Size(30, 30),
          },
          ac: val['properties']['ac'],
          dc: val['properties']['dc'],
          price: val['properties']['price'],
          location: val['properties']['location'],
          owner: val['properties']['owner'],
          epc: val['properties']['epc'],
          invest: val['properties']['invest'],
          cod: val['properties']['cod'],
          note: val['properties']['note'],
          storage: val['properties']['storage'],
          coord: [point.lat(0),point.lng(0)]
          });
        // unit display properly from fraction of MW to KW
        var unitsizeac = marker.ac;
        var unitsizedc = marker.dc;
        var unitac;
        var unitdc;
        if (unitsizeac < 1) {
          unitsizeac = unitsizeac*1000;
          unitac = "kW";
        } else {
          unitac = "MW";
        } 
        if (unitsizedc < 1) {
          unitsizedc = unitsizedc*1000;
          unitdc = "kW";
        } else {
          unitdc = "MW";
        } 
        var markerInfo = 
        "<div style='color:#e4e4e4;''><h2>" + titleText + "</h2></div>" 
        + "<table>"
        + (  marker.ac !== null ?  "<div><tr><th>AC capacity </th><td>" + unitsizeac + unitac + "&nbsp;</td></tr></div>" : "" )
        + (  marker.dc !== null  ?  "<tr><th>DC capacity </th><td>" + unitsizedc + unitdc + " </td></tr>" : "" )
        + (  marker.storage !== "" ?  "<tr><th>Capacity </th><td>" + marker.storage + " </td></tr>" : "" )
        + (  marker.price !== null ?  "<tr><th>kWh price </th><td>" + marker.price + " piasters/kWh</td></tr>" : "" )
        + (  marker.location !== "" ?  "<tr><th>Location </th><td>" + marker.location + "</td></tr>" : "" )
        + (  marker.owner !== "" ?  "<tr><th>Owner </th><td>" + marker.owner + "</td></tr>" : "" )
        + (  marker.epc !== "" ?  "<tr><th>EPC </th><td>" + marker.epc + "</td></tr>" : "" )
        + (  marker.invest !== null ?  "<tr><th>Investment  </th><td>" + marker.invest + " million USD</td></tr>" : "" )
        + (  marker.cod !== "" ?  "<tr><th>Operation Date </th><td>" + marker.cod + "</td></tr>" : "" )
        + (  marker.note !== "" ?  "<tr><th>Notes </th><td>" + marker.note + "</td></tr>" : "" )
        + (  "<tr><th>Coordinates </th><td>" + marker.coord + "</td></tr>")
        + "</table>";
        // marker clusterer                   
        // google.maps.event.addListener(marker, 'visible_changed', function(){
        //         mc.clearMarkers();
        //         mc = new MarkerClusterer(map, markers,{imagePath: clusterimage});
        //         mc.repaint();      
        //     });  
        // A bunch of listerners for double click zoom and marker info to the side bar and transition element function
        marker.addListener('dblclick', function() {
          map.panTo(marker.position);
          map.setZoom(16);
        });

        marker.addListener('click', function() {
        Addinfo(markerInfo);
        $("#wrapper").addClass("toggled");
        myWrapper.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
          // code to execute after transition ends
          google.maps.event.trigger(map,'resize');
        });
        });
        markers.push(marker);
        hmarker.push(marker.position);
      });

      // Add a marker clusterer to manage the markers.
      // mc = new MarkerClusterer(map, markers,{imagePath: clusterimage});
  });
}

// adds info entry to sidebar while removing previous element
Addinfo = function(description){
  var sidebar = $('#side_bar');
  $('<li></li>').html(description).appendTo(sidebar);
  var element = sidebar.children();
  if (element[3]){
    element[3].parentNode.removeChild(element[2]);
  }
}

// filters according to the filter tab 
filterMarkers = function (){
  // var province = document.getElementById('filterProv').value;
  var type = document.getElementById('filterType').value;
  var loan = document.getElementById('filterLoan').value;
  var status = document.getElementById('filterStatus').value;
  var size = document.getElementById('filterSize').value;
  // close sidebar when filter is made
  $("#wrapper").removeClass("toggled");
  //case for size selection
    for (i = 0; i < markers.length; i++) {
        var fsize = false;
        marker = markers[i];
        var ksize = marker.ac*1000;
      if (marker.ac != null) {
        switch(size) {
          case "1":
            if (ksize < 5) {
                fsize = true;
            };
            break;
          case "2":
            if (ksize >= 5 && ksize < 31) {
                fsize = true;
            };
            break;
          case "3":
            if (ksize >= 31 && ksize < 101) {
                fsize = true;
            };
            break;
          case "4":
            if (ksize >= 101 && ksize < 501) {
                fsize = true;
            };
            break;
          case "5":
            if (ksize >= 501 && ksize < 1001) {
                fsize = true;
            };
            break;
          case "6":
            if (ksize >= 1001 && ksize < 5001) {
                fsize = true;
            };
            break;
          case "7":
            if (ksize >= 5001 && ksize < 20001) {
                fsize = true;
            };
            break;
          case "8":
            if (ksize > 20001) {
                fsize = true;
            };
        };
      };
        // If all filters match or no selection is made
        if (
            // (marker.province == province || province.length === 0) &&
            (fsize == true || size.length === 0) &&
            (marker.type == type || type.length === 0) &&
            (marker.grantType == loan || loan.length === 0) &&
            (marker.status == status || status.length === 0)
          )
        {
            marker.setVisible(true);
        }
        // Categories don't match 
        else {
            marker.setVisible(false);
        }
    }
}

// Map initilizer
function initMap() {
    map_options = {
      zoom: 7,
      center: {lat: 31.324, lng: 37.5},
      mapTypeId: 'hybrid'
    }
    map_document = document.getElementById('map')
    map = new google.maps.Map(map_document,map_options);
    //closes sidebar when map is clicked
    google.maps.event.addListener(map, 'click', function(e) {
      $("#wrapper").removeClass("toggled");
    });
    loadMarkers();
    heatmap = new google.maps.visualization.HeatmapLayer({
      data: hmarker,
      // map: map
    });
    map.data.loadGeoJson(
          'https://raw.githubusercontent.com/OceanXIS/RE_projects/master/province_map.geojson');
    // Color each letter gray. Change the color when the isColorful property
    // is set to true.
    map.data.setStyle(function(feature) {
      var color = 'gray';
      if (feature.getProperty('isColorful')) {
        color = feature.getProperty('color');
      }
      return /** @type {!google.maps.Data.StyleOptions} */({
        fillColor: color,
        strokeColor: color,
        strokeWeight: 2
      });
    });

    // // When the user clicks, set 'isColorful', changing the color of the letters.
    // map.data.addListener('click', function(event) {
    //   event.features.setProperty('isColorful', true);
    // });

    // When the user hovers, tempt them to click by outlining the letters.
    // Call revertStyle() to remove all overrides. This will use the style rules
    // defined in the function passed to setStyle()
    map.data.addListener('mouseover', function(event) {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, {strokeWeight: 8});
    });

    map.data.addListener('mouseout', function(event) {
      map.data.revertStyle();
    });
  }

// Reset button to zoom back into jordan and restart filters
function reset() {
    $('select').prop('selectedIndex', 0);
    filterMarkers();
    map.panTo({lat: 31.324, lng: 37.5});
    map.setZoom(7);
}

// // initializes heat map when needed
// function heatmap() {
//   heatmap.setMap(heatmap.getMap() ? null : map);
//   console.log(heatmap.getMap());
// }

// collapsable script disclaimer
var coll = document.getElementsByClassName("collapsible");
var i;
for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}
