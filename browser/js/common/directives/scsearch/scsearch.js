app.directive('scsearch', function($http) {
  return {
    templateUrl: 'js/common/directives/scsearch/scsearch.html',
    restrict: 'E',
    scope: {
      kind: '@',
      returnitem: '&',
      customstyle: '@'
    },
    controller: ['$scope', function scSearchController($scope) {
      $scope.searchSelection = [];
      $scope.searchString = "";
      $scope.sendSearch = function() {
        $scope.searchSelection = [];
        $scope.searchError = undefined;
        $scope.searching = true;
        if ($scope.searchString != "") {
          $http.post('/api/search', {
            q: $scope.searchString,
            kind: $scope.kind
          }).then(function(res) {
            $scope.searching = false;
            var item = res.data.item;
            if (item) {
              if (item.title == '--unknown--') {
                $scope.showSearchPlayer = true;
                var searchWidget = SC.Widget('searchPlayer');
                searchWidget.load($scope.searchString, {
                  auto_play: false,
                  show_artwork: false,
                  callback: function() {
                    searchWidget.getCurrentSound(function(item) {
                      $scope.showSearchPlayer = false;
                      if (!item || item.kind != $scope.kind) {
                        $scope.searchError = "Please enter a " + $scope.kind + " Url.";
                      } else {
                        $scope.setItemText(item);
                        $scope.selectedItem(item);
                      }
                      $scope.$digest();
                    })
                  }
                });
              } else {
                if (item.kind != $scope.kind) {
                  $scope.searchError = "Please enter a " + $scope.kind + " Url.";
                } else {
                  $scope.setItemText(item);
                  $scope.selectedItem(item);
                }
              }
            } else {
              if (res.data.collection.length > 0) {
                $scope.searchSelection = res.data.collection;
                $scope.searchSelection.forEach(function(item) {
                  $scope.setItemText(item);
                })
              } else {
                $scope.searchError = "We could not find a " + $scope.kind + "."
              }
            }
            if ($scope.searching || $scope.searchError != "" || $scope.searchSelection.length > 0) {
              window.onclick = function(event) {
                $scope.searching = false;
                $scope.searchError = "";
                $scope.searchSelection = [];
                $scope.$apply();
              };
            }
          }).then(null, function(err) {
            console.log(err);
            $scope.searching = false;
            console.log('We could not find a ' + $scope.kind);
            $scope.searchError = "We could not find a " + $scope.kind + "."
            if ($scope.searching || $scope.searchError != "" || $scope.searchSelection.length > 0) {
              window.onclick = function(event) {
                $scope.searching = false;
                $scope.searchError = "";
                $scope.searchSelection = [];
                $scope.$apply();
              };
            }
          });
        }
      }

      $scope.directSearch = function() {
        if ($scope.searchString.indexOf('soundcloud.com') > -1) {
          $scope.sendSearch();
        }
      }

      $scope.setItemText = function(item) {
        switch (item.kind) {
          case 'track':
            item.displayName = item.title + ' - ' + item.user.username;
            item.header = item.title;
            item.subheader = item.user.username;
            break;
          case 'playlist':
            item.displayName = item.title + ' - ' + item.user.username;
            item.header = item.title;
            item.subheader = item.user.username;
            break;
          case 'user':
            item.displayName = item.username + ' - ' + item.followers_count + " followers";
            item.header = item.username;
            item.subheader = item.followers_count + " followers";
            break;
        }
      }

      $scope.selectedItem = function(item) {
        $scope.searchSelection = [];
        $scope.searchError = undefined;
        $scope.searchString = item.displayName;
        $scope.searching = false;
        $scope.returnitem({
          item: item
        });
      }

      $scope.keypress = function(keyEvent) {
        if (keyEvent.which === 13) {
          $scope.sendSearch();
          keyEvent.stopPropagation();
          keyEvent.preventDefault();
        }
      }

    }]
  }
}).filter('capitalize', function() {
  return function(input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  }
});