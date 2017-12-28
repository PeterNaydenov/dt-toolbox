'use strict'

module.exports = {

	    test_0 : { 
	    				  name    : 'Peter'
	    				, age     : '42'
	    				, eyes    : 'blue' 
	    				, profile : { active : true }
	    				, array   : [ 1, 2, 3]  
		    		}
		, test_1 : {
		  			   a : 'test-value-1'
		  			 , b : 'test-value-2'
		  			 , c : [
		  			 		    'inArray-1'
		  			 		  , 'inArray-2'
		  			 	   ]
		  			 , d : function () { console.log('ale') }
		  			 , set : {
		  			 		      deep    : 0
		  			 		    , more    : false
		  			 		    , ah      : 'abra-cadabra'
		  			 		    , grind   : function () { console.log ( 'GRINDAAA') }
		  			 		    , options : {
		  			 		    				  select  : 'all'
		  			 		    				, more    : [ 12, 55, 128 ] 
		  			 		    				, deep    : '9999'
		  			 		    				, options : { select : 33 }
		  			 		    				, title   : 'harizma'
		  			 		    				, ah      : [44,66]
		  			 		    			}
		  			 		 }
	          }
	    
	    , test_2 : [ 12, 14, 16, { s: 7, b:12 }   ]
	    , test_3 : [
	    			   [ ['LinkedIn', 'Facebook', 'Google Plus'], [ 'fine', 'good', 'exelent' ]   ]
	    			 , { a: 12, b: 24, name: 'hama', items: { name : 'book', pages: 344 } }
	    			 , { a: 33, b: 66, name: 'bose' }
	    			 , [ 'Iskra', 'Elica', 'Adi' ]
	    			 , { a:44, b:88, resume: false, id: 'Lynda' }
	    			 , 14
	    			]
	    , test_4 : [
	    				  { name: 'Peter', comments: 23  }
	    				, { name: 'Ivan', comments: 62   }
	    				, { name: 'Stefan', comments: 41 }
	    		   ]
	    , test_5 : [
		    		   [[
		    				  { name: 'Peter' , comments: 23, age: 12 }
		    				, { name: 'Ivan'  , comments: 62, age: 32, gender:'male'   }
		    				, { name: 'Stefan', comments: 41, age: 38 }
		    		   ]]
		    		   , { name: 'Ludmil', comments: 12 , age: 44 }
					     , { name: 'Alina', comments: 153 , age: 51 }
					     , { name: 'Yordan', comments: 66 , age: 18 }
					     , 'test'
	    		   ]
	    , test_6 : { 
	    				  'root/id' : 23
	    				, 'root/profile/friends/hale': 76
	    				, 'root/profile/name': 'Peter'
	    				, 'root/profile/friends/0': 66 
	    				, 'root/profile/type': 'user'
	    				, 'root/profile/friends/1': 86
	    				, 'root/details/eyes' : 'blue'
	    				, 'root/details/hair' : 'blond'
	    				, 'root/sim' : '52345'
	    			}
	    , test_7 : {
	    			   'root/profile/name'   : 'Peter'
	    			 , 'root/profile/credit' : 'user'
	    			 , 'root/profile/gender' : 'male'
	    			 , 'root/profile/comments' : 64
	    			 , 'root/id' : 23
	    			 , 'root/sim' : 523452
	    		   }
	    , test_8 : [
		    				{ 
	                             genre  : 'comedy'
	                           , videos : [
	                           				    {
	                           				         id          : '11111'
	                           				       , title       : 'Hey you!'
	                           				       , description : 'Ha-ha-ha'
	                                            }
	                           				  , {
	                           				         id          : '11122'
	                           				       , title       : 'Another day in the paradice'
	                           				       , description : 'he he he he'
	                                            }
	                                      ]
		    				  }
		    			  , { 
	                             genre  : 'drama'
	                           , videos : [
	                           				    {
	                           				         id          : '22222'
	                           				       , title       : 'Black friday'
	                           				       , description : 'It is sad...'
	                                            }
	                           				  , {
	                           				         id          : '22233'
	                           				       , title       : 'Killing love'
	                           				       , description : 'Sad love story'
	                                            }
	                                      ]
		    				}
		    			  , { 
	                             user    : 'peter'
	                           , profile : {
	                           				     gender     : 'male'
	                           				   , age        : '42'
	                           				   , onboarding : '2016.05.24'
	                           				   , fav        : [ '11111' , '22233' ]
	                           			   }
		    				}
	    		   ]
	    , test_9 : [
	    				  'rootFolder/profile/name/Peter'
	    				, 'rootFolder/profile/age/42'
	    				, 'rootFolder/profile/gender/male'
	    				, 'rootFolder/logs/log.txt'
	    				, 'rootFolder/friends/Dimitar'
	    				, 'rootFolder/friends/Stefan'
	    				, 'rootFolder/friends/Ivan'
	    				, 'rootFolder/friends/Grigor'
	    		   ]
	    , test_10 : [
	    				  'friends/Ivo'
	    				, 'friends/Georgy'
	    				, 'friends/Nikolay'
	    			]
}

	
