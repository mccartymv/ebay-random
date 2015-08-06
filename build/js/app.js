(function() {

    'use strict';

    angular.module('app', [
        //'app.core',
        'app.categories'
    ]);

})();

(function() {
    'use strict';

    angular.module('app.categories', []);

})();

(function() {
    'use strict';

    angular
    .module('app.categories')
    .controller('Categories', Categories);

    Categories.$inject = ['$scope', '$http'];

    function Categories($scope, $http) {
        $scope.docs = [];
        $scope.budget = 17;
        $scope.listingType = 'all';

        $scope.results = [];

        var spinner = null;
        var spinnerDiv = $('#spinner').get(0);
        var spinnerOpts = {
              lines: 15 // The number of lines to draw
            , length: 56 // The length of each line
            , width: 19 // The line thickness
            , radius: 73 // The radius of the inner circle
            , scale: 0.2 // Scales overall size of the spinner
            , corners: 0.1 // Corner roundness (0..1)
            , color: '#000' // #rgb or #rrggbb or array of colors
            , opacity: 0.25 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1 // Rounds per second
            , trail: 60 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '50%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: false // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        };

        angular.element(document).ready(function() {
            $scope.getCats();
        });

        $scope.getCats = function() {
            $http.get('/api/categories')
            .success(function(data) {
                var documents = _.chain(data.docs)
                    .groupBy('shop')
                    .pairs()
                    .map(function(item) {
                        return {
                            shop: item[0],
                            categories: item[1],
                            open: false
                        };
                    })
                    .sortBy('shop')
                    .value();
                $scope.docs = documents;
            })
            .error(function(data) {
                console.log('error: ' + data.msg);
            });
        };

        $scope.toggleStore = function(shop, pref) {
            var catBool = pref === 'check' ? true : false;

            _.each($scope.docs, function(obj) {
                if (obj.shop === shop) {
                    _.each(obj.categories, function(cat) {
                        $scope.toggleCat(obj.shop, cat.category, catBool);
                    });
                }
            });
        };

        $scope.toggleCat = function(shop, cat, pref) {
            //console.log(shop + " " + cat + " " + pref);
            _.each($scope.docs, function(obj) {
                if (obj.shop === shop) {
                    _.each(obj.categories, function(category) {
                        if (category.category === cat) {
                            category.checked = pref;
                        }
                    });
                }
            });
            _.each($scope.results, function(obj) {
                if (obj.shop === shop && obj.category === cat) {
                    obj.checked = pref;
                }
            });
        };

        $scope.getEbayItem = function() {
            if(spinner === null) {
                spinner = new Spinner(spinnerOpts).spin(spinnerDiv);
            } else {
                spinner.spin(spinnerDiv);
            }
            $scope.results.unshift({status : 'loading'});
            /**
            var target = document.getElementById('results-container');
            console.log(target);
            var spinner = new Spinner().spin();
            target.appendChild(spinner.el);
            **/

            // settting up random category + budget
            var approvedCats = [];
            _.each($scope.docs, function(obj) {
                _.each(obj.categories, function(cat) {
                    if (cat.checked) {
                        approvedCats.push({
                            shop: obj.shop,
                            category: cat.category,
                            url: cat.url
                        });
                    }
                });
            });
            var selectedCat = _.sample(approvedCats);
            var bestBudget = $scope.budget + ((_.random(-50, 50)) / 100);
            selectedCat.checked = true;
            switch ($scope.listingType) {
                case 'all':
                    selectedCat['url'] += '/i.html?_mPrRngCbx=1&_udlo=' + bestBudget + '&_udhi=&rt=nc&_sop=15&_dmd=1';
                    break;
                case 'auc':
                    selectedCat['url'] += '/i.html?_mPrRngCbx=1&_udlo=' + bestBudget + '&_udhi=&LH_Auction=1&_sop=15&_dmd=1';
                    break;
                case 'bin':
                    selectedCat['url'] += '/i.html?_mPrRngCbx=1&_udlo=' + bestBudget + '&_udhi=&rt=nc&LH_BIN=1&_sop=15&_dmd=1';
                    break;
            }

            //console.log(selectedCat);
            $http.post('/api/scrape', selectedCat)
            .success(function(data) {
                data.status = 'loaded';
                spinner.stop(spinnerDiv);
                $scope.results[0] = data;
            })
            .error(function(data) {
                console.log('failure ' + data);
            });
        };

        $scope.loadSpinner = function() {
            console.log(this);
            var spinner = new Spinner().spin();
            document.getElementById('results-container').getElementsByClassName('load-spin')[0].appendChild(spinner.el);
        };
    }
})();
