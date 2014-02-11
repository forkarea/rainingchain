

/*
Db.map['test'] = function(){	//'test' = mapId
	var m = {};
	m.name = "Test";				//display name of name
	m.grid = ['111000001']			//used for collision test. (generate via lua.js and tiled)
	m.hotspot = {					//list of location used to create actor, drop, attack zone etc... (generate via lua.js and tiled)
		'main':{						//id of the loop that has access to those hotspot
			a:{x:1,y:12},					//pt hotspot
			b:{x:21,y:12},
			c:[minX,maxX,minY,maxY],		//zone hotspot
		}
	},	
	
	
	m.cst = {};						//list of oftenly used objects all instance maps share same copy (main point of cst is performance)
	m.cst.main = {						//.main = cst for the loop 'main'
		atk:{'type':"bullet",'angle':15,'amount':1, 'aim': 0,'objImg':{'name':"iceshard",'sizeMod':1},'hitImg':{'name':"ice2",'sizeMod':0.5},
			'dmg':{'main':1,'ratio':{'melee':0,'range':10,'magic':80,'fire':10,'cold':0,'lightning':0}}},	
		anything:'youwant',
	};
	
	m.variable = {};						//list of custom variable used by map to remember stuff. each map has its own copy
	m.variable.main = {						//.main = variable for the loop 'main'
		rotation:-1
	};
	
	
	m.load = {};					//actions generated only once when loading the map.
	
	m.load.main = function(map,hotspot,variable,cst){	//main: loadId, map:instancedName, hotspot = map.hotspot[loadId], variable = map.variable[loadId], cst = map.cst[loadId],
		//######################
		Actor.creation({				//create 1 enemy that cant respawn
			'xy':hotspot.c,				//location
			'map':map,					//always put 'map':map.
			"category":"system",		
			"variant":"switch",
			"extra":{},
		});
		
		//#############
		//EXTRA: Create a enemy with certain attributes different than the DB
		//#####
		//Normal format:	99% case
		extra:{
			'attribute':value,
			'att2':value2
		}
		
		//#####
		//Via Array: If you want to access a sub-attribute, use viaArray
		extra:{
			'viaArray':[
				{'array':['target','sub','period','first'],'value':100},
			],
			'normalAtt':value,
		},
		//#####
		//Function: use when needs to know mortId
		extra:function(mort){		//@param: enemy object
			mort.hp = 100;
		}
		//#####
		//#####
		//COMMON EXTRA:		
		PARAM: key: playerID, | mort:enemy Obj that has this properties, | mortid: enemy Id that has this properties, | map: mapId 
		
		//can right click to talkTo. used to trigger dialogues.
		dialogue:function(key){
			if(List.main[key].quest.Qtest.stuff){			
				Quest.complete(key,'Qtest');
				Dialogue.start(key,{'name':'Qtest','convo':'Jenny','node':'gratz2'});
			} else {
				Dialogue.start(key,{'name':'Qtest','convo':'Jenny','node':'first'});
			}		
		},
		
		//list of abilities the enemy will trigger when dying. ABILITIES NEED TO BE IN .ability . if want only to be cast at death, put 0 chance to trigger for ai
		deathAbility:[		
			'fireball',
			'explosion',
		],
		
		//called for each player who dealt 1+ dmg to this monster when this monster dies
		deathFunc:function(key,mort,map){},		
		
		//called once whe monsters dies. killers is array of playerId. first id is guy who has the drop
		deathFuncArray:function(killers,mort,map){},	
		
		//delete this enemy when he dies. 
		deleteOnceDead:1,
		
		//enemy in combat? overwrite Db.enemy
		combat:0,
		
		//change condition so attacks will hit another actor. check Combat.hitIf
		hitIf:function(defObj,atkObj){
			return 
		},
		hitIf:'enemy',		//can also be string and will refer to Combat.hitIf.list
		
		//test if defObj can be a target of the enemy.
		targetIf:		exact same than hitIf
		
		//set a function to call when player click on the enemy. onclick info will be added to optionList automatically
		onclick:{
			'shiftLeft':{
				'func':function(key,param0,param1...){},
				'param':['param0','param1',...]		
			},
			'left':same,
			'shiftRight':same,
			'right':same,	//NOT RECOMMENDED. leave for optionList						
		}
		
		//change the respawnLoc of the player aka place the player respawn when dead
		waypoint:{
			x:10,
			y:10,
			map:map,		
		},
		
		//an enemy that acts as a switch. REQ: enemy needs to have anim:'off' and 'on'
		mort.switch = {		
			on:function(key,mort,map){	//function when player activate the switch. map = map Obj
				map.variable.Qtutorial.rotation *= -1;
			},
			off:function(key,mort,map){ //function when player desactivate the switch
				map.variable.Qtutorial.rotation *= -1;		
			}
			off:null		//once activated, the switch cant be desactivated.
		
		}
		
		//an enemy that acts as a chest. can only be opened once REQ: enemy needs to have anim:'open' and 'close'. NOTE: will be trasnformed to {func:,list:[]}
		//must return a boolean about the success of the action (Ex: if enough inventory space)
		mort.treasure = function(key,eId){
			Itemlist.add(List.main[key].invList,'gold',1000);
			return true;
		} 
		
		
		
		
		

		
		//######################
		Actor.creation.group(			//create a group of monsters that respawns
			{
				'x':1060,				//or 'xy':hotspot.a
				'y':1900,
				'map':map,				//always put 'map':map.
				'respawn':100			//frames before enemy group respawns. (timer starts when every members is dead)
			},
			[
				{							//first enemy type of the group
					'amount':3,					//amount
					"category":"troll",			//enemy category
					"variant":"ice",			//enemy variant
					'lvl':0,					//enemy lvl
					'modAmount':1				//amount of mods each enemy has (see modList)
				},
				{'amount':3,"category":"troll","variant":"ice",'lvl':0,'modAmount':1},		//second enemy type of the group
			]
		);
		
		//######################
		Drop.creation({						//create a drop on the ground
			'xy':hotspot.o,
			'map':map,
			"item":"Q-tutorial-staff",		//itemId
			"amount":1,						//item amount
			'timer':1/0						//how long it will stay on the ground b4 dissappearing
		});
		
	}


	
	m.loop = {};				//actions generated every frame for each instance
	m.loop.main = function(map,hotspot,variable,cst){	//main: loadId, map:instancedName, hotspot = map.hotspot[loadId], variable = map.variable[loadId], cst = map.cst[loadId],
		
		//######################
		if(Loop.interval(10)){		//only happens 1 times out of 10 frames
			//stuff
		}		

		//######################
		Map.collisionRect(		//call a function for each actor in a zone
			map,					//map
			zone,					//zone that will trigger the function (use hotspot)
			type,					//either 'player' or 'enemy'. for both, create 2 Map.collisionRect
			function(key){			//function that will be called for each actor thats in the zone. param is their id
				List.all[key].hp -= 100;
			}
		);
		
		//######################
		Attack.creation(		//create an attack generated by the map
			{
				hitIf:'player-simple',		//condition to hit. either 'player-simple' or 'enemy-simple'
				xy:hotspot.a,				//position
				map:map,					//map
				angle:Math.randomML()*2		//angle used to shoot bullets
			},
			useTemplate(Attack.template(),cst.arrow)	//attack information. use cst to generate attack that are often used
		);

	}
	




*/


Init.db.map = function (){
	Db.map = {};
	
	Db.map['test'] = function(){
		var m = {};
		m.name = "Test";
		m.grid = ['000000000000000000000000000000000000100000000000000000000000100000000000000000000000000000000000','000000000000000000000000000000000000100000000000000000000000100000000000000000000000000000000000','000000000000000000000000000000000000100000000000000000000000100000000000000000000000000000000000','000000000000000000000000000000000000100000000000000000000000100000000000000000000000000000000000','000000000000000000000000000000000000100000000100000010011000100000000000000000000000000000000000','000000000000000000000000000000000000100000000100000010000000100000000000000000000000000000000000','000000000000000000000000000000000000100000000000000000000000100000111110000000000000000000000000','000000000000000000000000111111111111100000000000000000000000111111100010000000000000000000000000','000000000000000000000000100000000000000000000000000000000000000000000010000001111100000000000000','000000000000000000000000100110000000000000000000000000000000000000000010000111000110000000000000','000000000000000000000000100110000000000000000000000000000000000000000001111100000110000000000000','000000011111000000000000100000000000000000000000000000000000000000011000000000000110000000000000','000000010001000000000000100000000000100000000000000000000000000000011000000000000010000000000000','000001110001000000000000100000000000000000000000000000000000000110000000000000000010000000000000','000001000001000000000000100000000000000000000000000000000000000000000000000000000010000000000000','000001001101000000000000100000000000000000000000000000000000000000000000000000000010000000000000','000001001101000000000000111110000000000000000011000000000000000000000000001111111111110000000000','000001000001000000000000111010000000000000000011000000000000000000000000011000000010010000000000','000001110111000000000000110010000000000000000000000000000000000000000000010000000001010000000000','000000010111000000000000110010000000000000000000000000000000000000000000010000000001010000000000','000000010001000000000000110010000000000000000000000000000000000000000000010000000000111100000000','000000010001000000000000111110000000000000000000000011111100000000000000010000000000010110000000','000000010001111111111111100000000000000000000000111110000100001100000000010000000000010010000000','000000010000000000000000000000000000000000001111100000000110001100000000010000000000010010000000','000000010000000000000000000000000000000001111000000000000010001100000000010000000000010010000000','000000010000000000000000000000000000111111000000000000000010001100000000011100000011110110000000','000000010001100000000000000000000000100000000000000000000011100000000000001000000010000100000000','000000010001100000000000000000000000100000000000000000000000100000000000001000000010000100000000','000000110000000000000000000000000001100000000000000011000000100000000011111000000010000100000000','000000100000000000000000000000000001000000110000000011000000100000000011111111111110000100000000','000000100000000000000001000000000001000000110011110000000000100000000000000000000000000100000000','000000100000000000000000000000000001000000110011110000000000100000000000000000000000000100000000','000000110000000000000000000000000011000000001000000000000000100000000000000000000000000111000000','000000010000000000000000000000000010000000000000000000000111100000000000000000000000000001100000','000000010000000000000000000000000010000000000000000000000111100010000000000000000011000001100000','000000010000000000000000000000000010000000000000000000000111100000000000001111000011000000100000','000000011111000000000000000000000010000000000000000000000111100000000000001111000000000000100000','000000000001000000000000000000000010000000000000000000000111100000000000001111000000000000100000','000000000001111000000000000000000011000000000000000000000100000000000000000000000000000001100000','000000000000001000000000000000000011100000000000000000000100000000000000001111000000000001000000','000000000000001001000000000000000011110000000000000000000100000000000000011001111000000001000000','000000000000001000000000000011000011111100000000000000000100000000000000010000001111000001000000','000000000000001000000000000011000001111110000000000000000100000000000000010000000001100111000000','000000000000001100000000000000000000111111000001100000001100000000000000010000000000111100000000','000000000000000100000000000000000000111111000001111111111100000000000000010000000000000000000000','000000000000000100000000000000000000001111000001111011100100000001000000010000000000000000000000','000000000000000100000000000000000000000011000001100000000100000000000000010000110000000000000000','000000000000000100000000000000000000000011000001100000011100000000000000010000110000000000000000','000000000000000100000000000000000000000000000000111111110000000000000000011000000000000000000000','000000000000000100000000000000000000000000000000000000000000000000000000001000000000000000000000','000000000000000100000000000000000000000000000000000000000000000000000000001000000000000000000000','000000000000000100000110000000000000000000000000000000110000000000000000001000000000000000000000','000000000000000100000110000000000000000000000000000000110000000000000000001000000000000000000000','000000000000001100000110000000000000000000000000000000000000000000000011001000000000000000000000','000000000000001000000110000000000000000000000000000000000000000000000011001100000000000000000000','000000000000001000000000000000000000000000000000000000000000000000000011000100000000000000000000','000000000000001000000000000000000000000000000000000000000000000000000011000100000000000000000000','000000000000001000000000000000000000000000000000000000000001000000000000000100000000000000000000','000000000000111000000000000000000000000000000000000000000000000000000000000111110000000000000000','000000000011100000000000000000000000000000000011110000000000000000000000000000010000000000000000','000000001110000000000000000001000000000000000011110000000000000000000000000000011100000000000000','000000001000000000000000000000000000000000000000000000000000000000000000000000000100000000000000','000000001000000000111111110000000000000000000000000000000000000000000000000000000100000000000000','000000001000000011100000011100000000000000000000000000000000000000111111111111100100000000000000','000000011000001110000000000100000000000111100000000000000000001111100000000000111100000000000000','000000010000001010000000000100000000000111100000000000000000001000000000000000001100000000000000','000000010000001000000000000100000000000111100000000000000000011000000000000000000111000000000000','000000010000001000000000000100000000000000000000000000000000010000000000000000000101010000000000','000000010000001000000000000100000000000000000000000000000000010000000000000000000101110000000000','000000011100001110000000111100000000000000000000000000000000010000000000000000000100111000000000','000000000100000010000000100000000000000000000000000000000000010000000000000000000100011000000000','000000000100000010000000100000000000000000000000000000110000010000000000000000000100011000000000','000000000100000010000000100000000110000000000000000000110000011110000000000000000100011000000000','000000000100000011111111100000000110000000000000000000000000000010000000000000000100001000000000','000000000100000000000000000000000000000000000000000000000000000010000000000000011100001000000000','000000000100000000000000000000000000000000000000000000000000000010000000000000010000011000000000','000000000100000000000000000000000000000000000110000000000000000010000000000000010000010000000000','000000000100000000000000000000000000000010000110000000000000000010000000000000010000010000000000','000000000100000000000000000000000000000000000000000110000000000011111111111111110000010000000000','000000000111111100000000000000000000000000000000000000000000000000000000110000000000010000000000','000000000000000100000000000000000000000000000000000000000000000000110000110111100000010000000000','000000000000000110000000000000000000000000000000000000000000000000000000000111100000010000000000','000000000000000010000000000000000000000000000000000000000000000000000000000000000000010000000000','000000000000000010000000000000000000000000000000000000000000000000000000000000000000010000000000','000000000000000011000000000000000000000000000000000000000000000000000000000000000000110000000000','000000000000000001000000000000000000000000000000000000000000000000000000000000000000100000000000','000000000000000001000000000000000000000000000000000011000000000000011110000000000111100000000000','000000000000000001100000000000000000000000000000000011000000001111011110000000000100000000000000','000000000000000000100000000000000000000000011111000000000000001111000000000000000100000000000000','000000000000000000100000000001111111111000010001110000000000000000000000000000111100000000000000','000000000000000000111000000001000000001000010000011111111111111111110000000000100000000000000000','000000000000000000001000000001000000001111110000000000000000000000011000111111100000000000000000','000000000000000000001111111111000000000000000000000000000000000000001111100000000000000000000000','000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000']
		m.hotspot = {};
		
		m.load = {};
		m.load.main = function(map,hotspot,variable,cst){
			Actor.creation.group({'x':1060,'y':1900,'map':map,'respawn':100},[
				{'amount':3,"category":"troll","variant":"ice",'lvl':0,'modAmount':1},
			]);
		}
		
		m.loop = {};
		m.loop.main = function(map,hotspot,variable,cst){
			if(Loop.interval(10) && false){
				Map.collisionRect(map,[1000,1400,1000,1400],'player',function(key){
					var mort = List.all[key];
					mort.hp -= 100;
					
					Attack.creation(
						{x:mort.x,y:mort.y,map:map,hitIf:'player-simple',angle:mort.angle},
						useTemplate(Attack.template(),cst.atk)
					);
					
				});
			}
		}
		
		
		m.cst = {};
		m.cst.main = {
			atk:{'type':"bullet",'angle':15,'amount':1, 'aim': 0,'objImg':{'name':"iceshard",'sizeMod':1},'hitImg':{'name':"ice2",'sizeMod':0.5},
				'dmg':{'main':1,'ratio':{'melee':0,'range':10,'magic':80,'fire':10,'cold':0,'lightning':0}}},	
		};
		return m;
	};
	//ts("Actor.creation.group({'x':1060,'y':1900,'map':'test@MAIN','respawn':100},[{'amount':1,'category':'boss','variant':'iceTroll','lvl':0,'modAmount':1},]);")
			
		

	Db.map['tutorial'] = function(){
		var m = {};
		m.name = "Tutorial";
		m.grid = ["11111111111111111111111111111111111110000001111111111111111111111111111111111111","11111111111111111111111111011000000000000001111111111111111111111111111111111111","11111111111111111111111111011000000000000001111111111111111111111111111111111111","11111111111111111111111111000000000000000001111111111111111111111111111111111111","11111111111111111111111111000000000000000001111111111111111111111111111111111111","11111111111111111111111111000000000000000001111111111111111111111111111111111111","11111111111111111111111111000000000001111001111111111111111111111111111111111111","11111111111111111111111111000000001101111001111111111101111111110111111111111111","11111111111111111111111111000000001101111001111111111101111111110111111111111111","11111111111111111111111111111111110000000001111111111100011111000111111111111111","11111111111111111111111111111111111111111101111111111100000000000111111111111111","11111111111111111111111111100000011111111111111111111100000000000111111111111111","11111111111111111111111111100000011111111111111111111100000000000111111111111111","11111111111111111100000000100000010000000011111111111100000000000111111111111111","11111111111111111101111000000000000001100011111111111100000000111111111111111111","11111111111111111101111000000000000001100011111111111100000001111111111111111111","11111111111111111101111000000000000000000011111111111000000011111111111111111111","11111111111111111100000000000000000000000001111111110000000111111111111111111111","11111111111111111100000000000000000000000000111111100000000111111111111111111111","11111111111111111100000000000000000000000000000000000000000211111111111111111111","11111111111111111100000000000000000000000000000000000000002221111111111111111111","11111111111111111100000000000000000000000000000000000000022222111111111111111111","11111111111111111100000000000000000000000000111111100000222222222222222221111111","11111111111111111100000000000000000000111101111111110000222222222222222221111111","11111111111111111100000000000000000000111111111111111000222222222222222222111111","11111111111111111100000000000000000000111111111111111122222222222222222222111111","11111111111111111100000000000000000000000011111111111122222222222222222222111111","11111111111111111100000000000000000000011111111111111122222222222222222222111111","11111111111111111100000000000000000000111111111111111122222222222222222221111111","11111111111111111111110000000000000001111111111111111122222222111111111111111111","11111111111111111111111000000000000011111111111111111122222221111111111111111111","11111111111111111111111100010000100011111111111111111122222211111111111111111111","11111111111111111111111101110000111011111111111111111122222111111111111111111111","11111111111111111111111111110000111111111111111111111122222111111111111111111111","11111111111111111111111110010000100111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000110111111111111111111111111111111111111111111111","11111111111111111111111110000000110111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000100100111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111000111110100111111111111111111111111111111111111111111111111","11111111111111111111000111110000011111111111111111111111111111111111111111111111","11111111111111111111000111110000011111111111111111111111111111111111111111111111","11111111111111111111000111110000011111111111111111111111111111111111111111111111","11111111111111111111000111110000011111111111111111111111111111111111111111111111","11111000001111111111000111110000011111111111111111111111111111111111111111111111","11111000000000020000000111110000011111111111111111111112221111111111111111111111","11111000000000020000000111110000011111111111111111111112221111111111111111111111","11111000000000020000000111110000011111111111111111111122222111111111111111111111","11111000001111110000000111110000011111111111111111111222222211111111111111111111","11111000001111110000000011100000011111111111111111112222222221111111111111111111","11111111111111110000000001000000011111111110000022222222222222200011011111111111","11111111111111110000000000000000011111111110000011111111111111100011011111111111","11111111111111110000000000000000111111111110000000000000000000000000011111111111","11111111111111111111111000000001111111111110000000000000000000000000011111111111","11111111111111111111111100000001111111111110000011111111111111100000011111111111","11111111111111111111111110000001111111111110000022222222222222200000011111111111","11111111111111111111111111000001111111111110000022222222222222200000011111111111","11111111111111111111111111000001111111111110000002222222222222111110011111111111","11111111111111111111111111000000111111111100000000222222222221111110011111111111","11111111111111111111111111000000011111111000000000000222222221111110011111111111","11111111111111111111111111000000001111110000000000000002222221111110011111111111","11111111111111111111111111000000000000001111000000000000222221111110011111111111","11111111111111111111111111011000000000001111000000000000222221111110011111111111","11111111111111111111111111111000000000001111111100000000222221100000011111111111","11111111111111111111111111111000000000000000111100000000222222001100011111111111","11111111111111111111111111111111111110000000111100000000222222001100011111111111","11111111111111111111111111111111111111000000000020000000222222200000011111111111","11111111111111111111111111111111111111100000000020000000222222220000011111111111","11111111111111111111111111111111111111100000000020000000222222222111111111111111","11111111111111111111111111111111111111100000000000000000222222222111111111111111","11111111111111111111111111111111111111100000000000000011122222221111111111111111","11111111111111111111111111111111111111111110000000000100012222221111111111111111","11111111111111111111111111111111111111111111000000001100001222222111111111111111","11111111111111111111111111111111111111111111100000011111000122222111111111111111","11111111111111111111111111111111111111111111110000111111000012222111111111111111","11111111111111111111111111111111111111111111110000111111000001111111111111111111","11111111111111111111111111111111111111111111110000100000011111111111111111111111","11111111111111111111111111111111111111111111111001100000011111111111111111111111","11111111111111111111111111111111111111111111111001100000011111111111111111111111","11111111111111111111111111111111111111111111110000110000000011111111111111111111","11111111111111111111111111111111111111111111110000111000000011122211111111111111","11111111111111111111111111111111111111111111100000011100111111122211111111111111","11111111111111111111111111111111111111111111000000001100111111222211111111111111","11111111111111111111111111111111111111111110000000110100111112222211111111111111","11111111111111111111111111111111111111100000000000110000112222222211111111111111","11111111111111111111111111111111111111100000000000000000112222222211111111111111","11111111111111111111111111111111111111100000000000000000002222222211111111111111","11111111111111111111111111111111111111101111000000000000000222222211111111111111","11111111111111111111111111111111111111101111000000000000000222222211111111111111","11111111111111111111111111111111111111101111000000000000000222222211111111111111","11111111111111111111111111111111111111100000000000000000000222222211111111111111","11111111111111111111111111111111111111100000000000000000002222222211111111111111","11111111111111111111111111111111111111111111111111111111111112222211111111111111","11111111111111111111111111111111111111111111111111111111111111222211111111111111","11111111111111111111111111111111111111111111111111111111111111122211111111111111","11111111111111111111111111111111111111111111111111111111111111112111111111111111","11111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111"] ;
			
		
		return m;
	};
	
	for(var m in Db.map){	
		Db.map[m] = Db.map[m]();
		Db.map[m].id = m;
		Map.creation.model(Db.map[m]);
	}
	
}
