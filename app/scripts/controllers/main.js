'use strict';

/**
 * @ngdoc function
 * @name geocoderApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the geocoderApp
 */
angular.module('geocoderApp')

.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyB7YXoHGTXoXMqZfXojJKU_8trH8Go_gH4',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
  });
})

.directive('resize', function ($window) {
    return function (scope, element) {

        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return { 'h': w.height(), 'w': w.width() };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {


        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
})

.controller("MainCtrl", function($scope, $routeParams, $location, $http, uiGmapGoogleMapApi) {
    // Do stuff with your $scope.
    // Note: Some of the directives require at least something to be defined originally!
    // e.g. $scope.markers = []

    // uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.



	$scope.map = {
					center: {
						latitude: 51.47732,
						longitude: -0.00037
					},
					options: {
						maxZoom: 20,
						minZoom: 3
					},
					zoom: 3,
					control: {},
					marker: {
						idk:0
					}
				};

    uiGmapGoogleMapApi.then(function(maps) {

  		//Map heigth and other fixes on window resize and after the map is loaded

	    $(window).on('resize',function() {

	          var w = $(window).width();
	          var h = $(window).height();
	          if(w < 992) {

	              $('#datacol').css({overflow:"hidden"});
	              $('#datacol').css({height: "auto"});
	              $('.angular-google-map-container').height(400);

	          } else {

	               // resize map container to new height
	              $('.angular-google-map-container').height(h - 0);
	              $('#datacol').height(h - 0);
	          }

	      }).trigger('resize');
	    
	    //------------------------


    	//geocode
	  	$scope.codeAddress = function (address) {

			var elevationService = new google.maps.ElevationService();
		   	var geocoder = new google.maps.Geocoder();
		    geocoder.geocode( { 'address': address}, function(results, status) {

		      if (status == google.maps.GeocoderStatus.OK) {

	    		var loc = results[0].geometry.location;
	    		var lat = loc.lat();
	    		var lng = loc.lng();

		        $scope.formatted_address = results[0].formatted_address;
        		$scope.address_components = results[0].address_components;



	        	//$scope.map.control.getGMap().fitBounds(results[0].geometry.viewport);

				var southwest = results[0].geometry.viewport.getSouthWest();
				var northeast = results[0].geometry.viewport.getNorthEast();


				$scope.map.bounds = {
				  northeast: {
				    latitude:  northeast.lat(),
				    longitude:  northeast.lng()
				  },
				  southwest: {
				    latitude: southwest.lat(),
				    longitude: southwest.lng()
				  }
				}

				$scope.map.marker.idk = 1;
				//results[0].formatted_address; //something uniq
		        $scope.map.marker.latitude = lat;
		        $scope.map.marker.longitude = lng;


		        $scope.panelsLocation =  [{

			        	 Prop: "Latitude",
			        	 Icon: "glyphicon-map-marker",
			        	 Unit: "Decimal Degrees",
			        	 Value: lat.toFixed(5)

		        	  }, 

		        	  {

			        	 Prop: "Longitude",
			        	 Icon: "glyphicon-map-marker",
			        	 Unit: "Decimal Degrees",
			        	 Value: lng.toFixed(5)

		        	  },

		        	  {

	        	  		 Prop: "Latitude",
			        	 Icon: "glyphicon-globe",
			        	 Unit: "Degrees Minutes Seconds",
			        	 Value: convLATtoDMS(lat)

		        	  }, 

		        	  {

			        	 Prop: "Longitude",
			        	 Icon: "glyphicon-globe",
			        	 Unit: "Degrees Minutes Seconds",
			        	 Value: convLNGtoDMS(lng)

		        	  }];

		        	  

		      

		        var positionalRequest = {'locations': [loc]};

				elevationService.getElevationForLocations(positionalRequest, function (results, status) {
					if (status == google.maps.ElevationStatus.OK && results[0]){

						var elevationM = parseFloat(results[0].elevation);
						var elevationF = elevationM * 3.2808;

					   $scope.panelsElevation = [{

							Prop: "Elevation",
							Icon: "glyphicon-globe",
							Unit: "Meters",
							Value: elevationM.toFixed(2)

					   	}, {

							Prop: "Elevation",
							Icon: "glyphicon-globe",
							Unit: "Feet",
							Value: elevationF.toFixed(1)

					   	}];	


					}
				});


				var timestamp = (Math.round((new Date().getTime())/1000)).toString()
				$http.get("https://maps.googleapis.com/maps/api/timezone/json?location=" + lat + "," + lng + "&timestamp=" + timestamp + "&sensor=false&key=AIzaSyB7YXoHGTXoXMqZfXojJKU_8trH8Go_gH4")
				.success(function(response) {
					if(response.timeZoneId != null){



						$scope.panelsTimeZone = [{

							Prop: "Offset for DST",
							Icon: "glyphicon-time",
							Unit: "Seconds",
							Value: response.dstOffset

						}, {

							Prop: "Offset from UTC",
							Icon: "glyphicon-time",
							Unit: "Seconds",
							Value: response.rawOffset

						}, {

							Prop: "Time Zone",
							Icon: "glyphicon-globe",
							Unit: "",
							Value: response.timeZoneName

						}, {

							Prop: "Time Zone Id",
							Icon: "glyphicon-globe",
							Unit: "",
							Value: response.timeZoneId

						}];	

					}
					
				});

				//https://maps.googleapis.com/maps/api/streetview?size=600x300&location=46.414382,10.013988&fov=60&key=AIzaSyB7YXoHGTXoXMqZfXojJKU_8trH8Go_gH4
				//to be < 5000
				//$http.get("https://maps.googleapis.com/maps/api/streetview?size=140x140&location=46.414382,10.013988&fov=60&key=AIzaSyB7YXoHGTXoXMqZfXojJKU_8trH8Go_gH4")
				//.success(function(response) {
					/*alert(response.length)*/
				//$scope.google_image = "https://maps.googleapis.com/maps/api/streetview?size=120x120&location=" + lat + "," + lng + "&fov=60&key=AIzaSyB7YXoHGTXoXMqZfXojJKU_8trH8Go_gH4"
				// });

				$location.search('address', encodeURI($scope.formatted_address));

				var this_long_url = {"longUrl": $location.absUrl()};

				$http.post("https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyB7YXoHGTXoXMqZfXojJKU_8trH8Go_gH4",
				this_long_url
				).success(function(response) {
						$scope.short_url = response.id;
				});

				

		      } else {
		        alert('Geocode was not successful for the following reason: ' + status);
		      }
		    });
		    return;

	  }; //end geocde


		// formats a number as a latitude (e.g. 40.46... => "40°27'44"N")
		function convLATtoDMS(input) {

	        input = input * 1;
	        var ns = input > 0 ? "N" : "S";
	        input = Math.abs(input);
	        var deg = Math.floor(input);
	        var min = Math.floor((input - deg) * 60);
	        var sec = ((input - deg - min / 60) * 3600).toFixed(1);
	        return deg + "° " + min + "' " + sec + '" ' + ns;
	    };

		// formats a number as a longitude (e.g. -80.02... => "80°1'24"W")
		function convLNGtoDMS(input) {

		        input = input * 1;
		        var ew = input > 0 ? "E" : "W";
		        input = Math.abs(input);
		        var deg = Math.floor(input);
		        var min = Math.floor((input - deg) * 60);
		        var sec = ((input - deg - min / 60) * 3600).toFixed(1);
		        return  deg + "° " + min + "' " + sec + '" ' + ew;

		};



		//Run------------------------------------------
		var current_address = "";//($location.search()).address;
		if ( ($location.search()).address  != undefined) {
			 current_address = ($location.search()).address;
		}

		if(current_address.length > 0) {
			$scope.address =  decodeURI(current_address);
			$scope.codeAddress($scope.address);

		} else {

			$scope.address = "Blackheath Avenue, London SE10 8XJ, United Kingdom";
			$scope.codeAddress($scope.address);

		}
		//---------------------------------------------


    });



})

.filter('remove_underscore', function() {
  return function(input) {
    return input = input.replace(/_/g, " ");;
  };
})

.filter('CapitalizeFirst', function() {
  return function(input) {
    return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };
});



;


