(function() {
	'use strict';
                	
	var app = angular.module("mynews", ['ui.router']);
	
	app.config(function($stateProvider, $urlRouterProvider) {

    			$stateProvider									
    			.state('news', {
			      url: "/",
			      controller: "NewsController",	 
			      templateUrl: "news.html"
 			})
    			.state('sources', {
			      url: "/sources",
			      controller: "SourcesController",
			      templateUrl: "sources.html"
 			});
    			$urlRouterProvider.otherwise('/');                           						
			
	}); 
	
	// Служба загрузки источников
	app.factory('SourcesService', function($q) {

	   return {
	     sources: [],
	     
	     getSources: function(){
            	var deferred = $q.defer();
		JsAPI.Dao.getProperties({
			  	  block_id: 84683
				  }, function(blockProps) {				        
					deferred.resolve(blockProps.publishers);
				  }, function(reason) {
				  	deferred.reject(reason);					
				  });
            	
               return deferred.promise; 	
             }             
            
	  }	
			     
	});

	// Служба загрузки новостей
	app.factory('NewsService', function($q) {

	   return {    	     
	     getNews: function(cnt,publishers,articleIds){
            	var deferred = $q.defer();
		JsAPI.Dao.getArticles({
				block_id: 84683,
				count: cnt,
				fields: 0xFFFF,
				filter_publishers: publishers,
				filter_articles: articleIds
				}, function(articles) {					
					deferred.resolve(articles);					
				}, function(reason) {
					deferred.reject(reason);					
				});                  		

            	
               return deferred.promise; 	
             }             
            
	  }	
			     
	});

        

	function MainController($scope)
	{
	    $scope.hello = "Новостной агрегатор";	   	
	}

	app.controller("MainController", MainController);			


	// NewsController
	app.controller("NewsController", function ($scope,NewsService,SourcesService) {
		
	  $scope.articles = [];

	  // загрузка статей
	  $scope.loadArticles = function(cnt)  { 
		 var publishers = [];
	 	 var articleIds = [];

		 // Заполняем список загруженных статей
	 	 $.each($scope.articles, function(){                    
		    articleIds = articleIds.concat(this.id);		
    		 });
		
		 // Заполняем массив отключенных источников
	 	 $.each(SourcesService.sources, function(){                    
		    if (this.show == false)  publishers = publishers.concat(this.id);		
    		 });


		var promiseObj=NewsService.getNews(cnt,publishers,articleIds);
	        promiseObj.then(function(articles) { 			
                      	$scope.articles = $scope.articles.concat(articles);							
		});		 

	   };	

           
	   // событие прокрутки    	   
      	   $(window).scroll(function() {
        	if($(window).scrollTop()+$(window).height()==($(document).height())){ 		 
		// если дошли до конца страницы - подгружаем новые статьи
		$scope.loadArticles(30);   		 
	     } 
      	   });
	   
	   // Начальная загрузка статей
	   $scope.loadArticles(60); 	
	  

	});	

	// SourcesController
	app.controller("SourcesController", function ($scope,SourcesService) {	   
	        if (SourcesService.sources.length == 0)
		{
			var promiseObj=SourcesService.getSources();
	        	promiseObj.then(function(sources) { 
				SourcesService.sources=sources; 
				$scope.sources = SourcesService.sources;
				// Изначально все источники включены
				$.each(SourcesService.sources, function(){                    			
		    			this.show = true;		
    		 		});
			});
		}
		else
		{
			$scope.sources = SourcesService.sources;
		}
		
	});	



})();

