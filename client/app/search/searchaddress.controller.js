(function () {
angular.module('notinphillyServerApp')
  .controller('searchAddressController', [ '$scope', '$http', '$rootScope', '$cookies', 'mapService', 'APP_EVENTS', 'APP_CONSTS', function($scope, $http, $rootScope, $cookies, mapService, APP_EVENTS, APP_CONSTS) {
    $scope.searchAddress = {
      streets: [],
      streetsGeoJSON: [],      
      pagedStreets: [],
      streetsPage: 1,
      streetsPageSize: 4,
      hasMoreStreets: false,
      location: undefined
    };

    $scope.autocompleteOptions = {
      country: 'us'
    };
    $scope.autocomplete = undefined;
    $scope.addressDetails = undefined;

    $scope.noStreetsFound = false;

    $scope.$watch(function() { return $scope.addressDetails; }, function(searchDetails) {
      $scope.noStreetsFound = false;

      if(searchDetails)
      {
        $scope.findStreet();
      }
      else {
        $scope.clearSearch();
      }
    });

    $scope.switchToMap = function() {
      mapService.showStreetsNear($scope.searchAddress.location);
      $rootScope.$broadcast(APP_EVENTS.OPEN_EXPLORE);
    }

    $scope.clearSearch = function() {
      $scope.addressDetails = $scope.autocomplete = undefined;
      $scope.searchAddresspagedStreets = $scope.searchAddress.streets = [];
      $scope.searchAddress.streetsPage = 1;
      mapService.setNeighborhoodLayers();
    };

    $scope.findStreet = function() {
      $rootScope.$broadcast(APP_EVENTS.SPINNER_START);
      $scope.searchAddress.pagedStreets = [];
      var addressDetails = $scope.addressDetails;
      if(addressDetails && addressDetails.location)
      {
        $cookies.putObject(APP_CONSTS.FOUND_STREET, {placeId: addressDetails.placeId, fullAddress: addressDetails.fullAddress});

        $scope.searchAddress.location = addressDetails.location;
        mapService.findStreetsNear($scope.searchAddress.location).then(function(searchResults)
        {
          $scope.searchAddress.streets = searchResults;
          $scope.noStreetsFound = searchResults.length === 0;

          setPagedStreets($scope.searchAddress.streets, $scope.searchAddress.streetsPage, $scope.searchAddress.streetsPageSize);

          mapService.findStreetsNearGeoJSON($scope.searchAddress.location).then(function(searchResults)
          {
            $scope.searchAddress.streetsGeoJSON = searchResults;
          });
          $rootScope.$broadcast(APP_EVENTS.SPINNER_END);
        });
      }
    };

    $scope.loadMore = function() {
      $scope.searchAddress.streetsPage++;
      setPagedStreets($scope.searchAddress.streets, $scope.searchAddress.streetsPage, $scope.searchAddress.streetsPageSize);
    }

    $scope.hasAddress = function() {
      var addressDetails = $scope.addressDetails;
      return addressDetails != undefined;
    };

    $scope.hasStreets = function(){
      return $scope.searchAddress.streets.length > 0;
    };

    var setPagedStreets = function(streets, page, pageSize)
    {
        var startIndex = ((page - 1) * pageSize);
        var endIndex = page * pageSize;
        endIndex = streets.length < endIndex ? streets.length : endIndex;

        var pagedStreets = streets.slice(startIndex, endIndex);

        $scope.searchAddress.pagedStreets = $scope.searchAddress.pagedStreets.concat(pagedStreets);
        $scope.searchAddress.hasMoreStreets = endIndex < streets.length;
    }
  }]);
})();
