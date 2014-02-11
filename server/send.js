Change = {};

Change.send = function(){
	//Send what has changed to the client.for (var key in List.socket){
	for(var key in List.socket){	
		
		var sa = Change.send.template();
		
		//Update Private Player
		var player = List.all[key];
		sa.p = player.privateChange;
		sa.p = Change.send.compressXYA(sa.p);
		
		//Update ActiveList AKA List.all
		var array = [];
		for (var i in player.activeList){
			var bool = true;	
			var obj = List.all[i];
			if(!obj){ delete player.activeList[i]; continue; }
			
			for(var j in obj.viewedBy){	if(j === player.id){bool = false;}}	//test if player is in viewedBy list of obj
				
			var id = obj.publicId || obj.id;
			
			if(bool){		//Need to Init
				sa.i[id] = Change.send.init(obj);
				obj.viewedBy[key] = player.id;		//Add so the next time it will update instead of init
			} else {			//Only Update
				sa.u[id] = obj.change;
				sa.u[id] = Change.send.compressXYA(sa.u[id]);
			}
			
		}
		//Remove List
		sa.r = player.removeList;
		
		//Main
		sa.m = List.main[key].change;
		
		//Anim
		//note: remove map and viewedif from .target and slot?
		for(var i in List.anim){
			
			var anim = List.anim[i];
			var testTarget = anim.target;
			if(typeof testTarget === 'string'){ testTarget = List.all[testTarget]; }	//aka target is an obj
			//else target is already in form {x:1,y:1,map:1}
			
			if(testTarget && ActiveList.test(player,testTarget)){
				if(typeof anim.target === 'string'){ anim.target = testTarget.publicId; }
				
				anim = Change.send.init.anim(anim);
				sa.a.push(anim); 
			}	
		//ts("Anim.creation('fire2',{x:p.x,y:p.y,map:p.map})")	
		}
		
		
		//Delete things that are empty
		sa = Change.send.clearEmpty(sa);
		//if(Object.keys(sa).length === 0){ continue; }
		
		//Send
		List.socket[key].emit('change', sa );
		
	    Test.bandwidth('upload',sa);
	}
	
	Change.send.reset();

}

Change.send.template = function(){
	return {
		i:{},  //init (first time seen by player		
		u:{},  //update (already init-ed)
		p:{},	//player
		m:{},	//main
		r:[],	//removeList
		a:[],  //animation
	}
}

Change.send.clearEmpty = function(sa){
	if(sa.a.length === 0){ delete sa.a }
		
	if(Object.keys(sa.i).length === 0){ delete sa.i }
	if(Object.keys(sa.p).length === 0){ delete sa.p }
	if(Object.keys(sa.m).length === 0){ delete sa.m }
	if(Object.keys(sa.r).length === 0){ delete sa.r }
	
	if(Loop.frameCount % 10 !== 0 ){ //other, if nothing moves, client thinks enemy is removed
		for(var i in sa.u) if(Object.keys(sa.u[i]).length === 0) delete sa.u[i] 
	}
	if(Object.keys(sa.u).length === 0){ delete sa.u }
	
	return sa;

}

Change.send.compressXYA = function(info){
	//if only change is x,y and angle, compress it into [x,y,angle]
	if(info.x !== undefined && info.y !== undefined){ 
		if(info.angle !== undefined){
			if(Object.keys(info).length === 3){ info = [info.x,info.y,info.angle];}
			else { info.xya = [info.x,info.y,info.angle]; }
		} else {
			if(Object.keys(info).length === 2){ info = [info.x,info.y];}
			else { info.xy = [info.x,info.y]; }
		}
		
		delete info.x
		delete info.y
		delete info.angle		
	}
	return info;
}

Change.send.reset = function(){
	List.anim = {};
	for(var i in List.all){ List.all[i].change = {}; }
	for(var i in List.main){ 
		List.main[i].change = {}; 
		List.all[i].privateChange = {}; 	
		List.all[i].removeList = [];
	}
}

//####################################
Change.send.init = function(obj){
	//convertInit: create object that has all needed information for the client to init the object. these information are only sent when init.
	if(obj.type == 'bullet'){return Change.send.init.bullet(obj)}
	if(obj.type == 'drop'){return Change.send.init.drop(obj)}
	if(obj.type == 'enemy' || obj.type == 'player'){	return Change.send.init.actor(obj)}
}

Change.send.init.bullet = function(bullet){	//For Init
	var draw = [
		'b',
		Math.round(bullet.x),
		Math.round(bullet.y),
		Math.round(bullet.angle),
		bullet.sprite.name,
		bullet.sprite.sizeMod,
	];
	if(bullet.normal) draw.push(bullet.spd);
	
	return draw;
}

Change.send.init.actor = function(enemy){	//For Init
	var draw = {};
	draw.id = enemy.publicId;
	draw.xya = [Math.round(enemy.x),Math.round(enemy.y),Math.round(enemy.angle)];
	draw.sprite = {'name':enemy.sprite.name,'anim':enemy.sprite.initAnim || 'walk','sizeMod':enemy.sprite.sizeMod || 1};
	draw.hp = Math.round(enemy.hp);
	draw.resource = {'hp':{'max':Math.round(enemy.resource.hp.max)}};
	draw.maxSpd = Math.round(enemy.maxSpd);
	draw.type = enemy.type;
	draw.combat = enemy.combat;
	if(enemy.minimapIcon){ draw.minimapIcon = enemy.minimapIcon; }
	return draw;
}

Change.send.init.drop = function(drop){
	var draw = {};
	draw.x = Math.round(drop.x);
	draw.y = Math.round(drop.y);
	draw.id = drop.publicId;
	draw.type = drop.type;
	draw.item = Db.item[drop.item].icon;
	
	return draw;
}

Change.send.init.anim = function(anim){
	if(anim.sizeMod === 1) delete anim.sizeMod;
	delete anim.id;
	delete anim.target.map;
	delete anim.target.viewedIf;
	anim.target.x = Math.round(anim.target.x);
	anim.target.y = Math.round(anim.target.y);
	return anim;
};

//########################################

Change.send.convert = {};

Change.send.convert.optionList = function(option){
	var draw = {};
	draw.x = option.x;
	draw.y = option.y;
	draw.name = option.name;
	
	draw.option = [];
	for(var i = 0; i < option.option.length ; i++){
		draw.option.push({'name':option.option[i].name});
	}
	return draw;
}

Change.send.convert.itemlist = function(inv){
	var draw = [];
	for(var i in inv.data){
		draw[i] = '';
		if(inv.data[i][0]){
			draw[i] = [];
			draw[i][0] = Db.item[inv.data[i][0]].icon;
			draw[i][1] = inv.data[i][1];
			draw[i][2] = Db.item[inv.data[i][0]].name;
		}
	}
	return draw;
}

Change.send.convert.status = function(info){
	var str = '';
	for(var i in Cst.status.list){
		str += info[Cst.status.list[i]].active.time > 0 ? '1' : '0';
	}
	return str;
}

Change.send.convert.windowList = function(data){
	if(data.trade)	data.trade = Change.send.convert.windowList.trade(deepClone(data.trade));
	return data;
}

Change.send.convert.windowList.trade = function(data){
	var draw = deepClone(data);
	draw.tradeList = Change.send.convert.itemlist(draw.tradeList);
	draw.trader = List.all[draw.trader].publicId;
	return draw;
}

Change.send.convert.ability = function(list){
	var tmp = [];
	for(var i in list){
		tmp[i] = list[i] ? list[i].id : 0;		
	}
	return tmp;
}


Change.send.convert.abilityChangeClient = function(info){
	var tmp = '';
	for(var i in info){
		tmp += info[i] === 1 ? 'R' : Math.round(info[i]*35).toString(36).slice(0,1);
	}
	return tmp;	
}

Change.send.convert.map = function(name){
	//used for instanced. client doesnt need to know its instanced
	return List.map[name].model;
}


Change.send.convert.equipPiece = function(w){ 
	if(!w) return '';
	return {'icon':w.icon,id:w.id} 
}
				
Change.send.convert.equipWeapon	= function(w){ 
	if(!w) return '';
	return {'type':w.type,'piece':w.piece,'icon':w.icon,id:w.id} 
}






