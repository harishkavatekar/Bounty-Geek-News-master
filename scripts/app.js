//creating a module for our application
var app = angular.module('myApp', ['ngRoute','ngStorage']);

//setting the routing
app.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when("/", {
		templateUrl: 'template/posts.html',
		controller: 'myController'
	})
	.when("/postDetail/:id", {
		templateUrl: 'template/postDetail.html',
		controller: 'postController'
	});
	$routeProvider.otherwise({
		redirecTo: '/'
	});
	$locationProvider.html5Mode(true);
})

//attaching a module to the controller
app.controller('myController', function($scope, $http, $log, $sce, $localStorage){
	//getting the url for the top stories which gives IDs of all the posts
	var url = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty'
	var trustedUrl = $sce.trustAsResourceUrl(url);
	var id_list = {};
	$scope.post_details =[];
	
	var i;

	//Using $http service to get the live data.
		$http.get(trustedUrl)
		 .then(function(response){
			id_list = response.data;
			$scope.id_list = id_list;
			console.log($scope.id_list)

			for(i = 0; i < $scope.id_list.length; i++){
				var index = $scope.id_list[i]
				// console.log(index);

				// getting each item details by passing IDs
				var url_id = "https://hacker-news.firebaseio.com/v0/item/" + index + ".json?print=pretty"
				var trustUrl = $sce.trustAsResourceUrl(url_id);

				$http.get(trustUrl)
						.then(function(response){
							$scope.post_details.push(response.data);
							// console.log($scope.post_details);
							// console.log(angular.toJson($scope.user_details));
						}, function(reason){
							$scope.error_id = reason.data;
						})
			}
		}, function(reason){
			$scope.error = reason.data;
			$log.info(reason);
		})
		
});

//Getting the data of each post in this controller and storing the information locally
app.controller('postController', function($scope, $http, $routeParams, $sce, $localStorage, $location){
	$scope.storage_details = [];
	$scope.post_detail = {};
	console.log($routeParams);
	
	$http({
			url: "https://hacker-news.firebaseio.com/v0/item/" + $routeParams.id + ".json?print=pretty",
			params: {id: $routeParams.id},
			method: "GET"
		})
		.then(function(response){
			$scope.post_detail = response.data;
			$scope.post_detail.tag = '';
		 	$scope.post_detail.comment = '';
			console.log($scope.post_detail);
		}, function(reason){
			$scope.error = reason.data;
		})

		$localStorage.data = [];
		$scope.saveLink = function() {
			var i;
			var found = false;
		 	
		 	// console.log($scope.post_detail.url);
		 	// console.log($scope.post_detail.tag);
		 	// console.log($scope.post_detail.comment);
		 	for(i = 0; i< $localStorage.data.length; i++){
		 		console.log($localStorage.data[i].id);
		 		console.log($scope.post_detail.id);
		 		if($localStorage.data[i].id == $scope.post_detail.id){
		 			found = true;
		 			console.log(found);
		 		}
		 	}
		 	if(!found) {
			 	$localStorage.data.push({id:$scope.post_detail.id, url:$scope.post_detail.url, tag:$scope.post_detail.tag, comment:$scope.post_detail.comment});
			}
		 	$localStorage.fav_link = $localStorage.data;
		 	$scope.storage_details.push($localStorage.fav_link);
		 	console.log($localStorage.data.length);
		 	$scope.isClicked = true;
		 	if($scope.isClicked){
		 		$scope.message = "Your comments are saved";
		 	}

		}

		$scope.redirect = function(path){
			$location.path(path)
		}
})
