function Country(name, numberOfCases) 
{
	this.name = name;
	this.numberOfCases = numberOfCases;
}

Country.prototype.name = '';
Country.prototype.numberOfCases = '';

function Location(latitude, longitude) 
{
	this.latitude = latitude;
	this.longitude = longitude;
}

Location.prototype.latitude = 0;
Location.prototype.longitude = 0;

var WHO_CHOLERA_REQUEST_URL = "http://apps.who.int/gho/athena/api/GHO/WHS3_40.json?profile=simple&filter=YEAR:2011&callback=?";
var COUNTRY_LIST_URL = "http://opendata.socrata.com/resource/mnkm-8ram.json?country=";
var map;

function addMarker(country)
{
	var countryName = encodeURIComponent(country.name); // Encode the url parameter.

	$.getJSON(COUNTRY_LIST_URL + countryName, function(data) 
	{
		if(data.length > 0)
		{
			var location = new Location(data[0].latitude_average, data[0].longitude_average);
			var markerSize = determineMarkerSize(country.numberOfCases);
			var image = {
				url: 'images/cholera_marker.png',
				size: new google.maps.Size(150, 150),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(markerSize, markerSize)
			};
			var imageSelected = {
				url: 'images/cholera_marker_selected.png',
				size: new google.maps.Size(150, 150),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(markerSize, markerSize)
			};
			var marker = new google.maps.Marker(
			{
				position: new google.maps.LatLng(location.latitude, location.longitude), 
				map: map,
				icon: image,				
				title: country.name
			});
			
			google.maps.event.addListener(marker, 'mouseover', function() {
				$('#country-value').text(country.name);
				$('#cases-value').text(country.numberOfCases);
			
				marker.setIcon(imageSelected); // Set the selected image.
			});
			google.maps.event.addListener(marker, 'mouseout', function() {
				$('#country-value').text('');
				$('#cases-value').text('');
				
				marker.setIcon(image); // Revert the image on mouseout.
			});
		}
	});
}

function determineMarkerSize(numberOfCases)
{
	if(numberOfCases >= 0 && numberOfCases <= 100) // 0 > 100 cases
	{
		return 50;
	}
	else if(numberOfCases > 100 && numberOfCases <= 500) // 101 > 500 cases
	{
		return 75;
	}
	else if(numberOfCases > 500 && numberOfCases <= 1000) // 501 > 1000 cases
	{
		return 100;
	}
	else if(numberOfCases > 1000) // 1000+ cases
	{
		return 125;
	}
	else
	{
		return 100;
	}
}

function getCholeraData()
{
	// Get the data from the WHO API. Use JSONP because of SOP. 
	$.getJSON(WHO_CHOLERA_REQUEST_URL, function(data) 
	{
		for(var i = 0; i < data.fact.length; i++) 
		{
			var cases = parseFloat(data.fact[i].Value); // Convert to a number.
			var country = new Country(data.fact[i].COUNTRY, cases);
			
			if(country.name != 'undefined')
			{
				// Add a marker to the map, representing this country.
				addMarker(country);
			}
		}
	});
}

function initialiseMap() 
{
	var mapOptions = {
		zoom: 3,
		center: new google.maps.LatLng(53.5500, 2.4333)
	};
	
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	
	// Get the cholera data from the WHO and map it.
	getCholeraData();
}

//==================================================================================================
// Events
//==================================================================================================

google.maps.event.addDomListener(window, 'load', initialiseMap);