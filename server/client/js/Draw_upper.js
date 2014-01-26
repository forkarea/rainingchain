
//{State
Draw.state = function(){
	var s = Draw.state.constant();
	
	Draw.state.resource(s);
	s.h += 30;
	Draw.state.status(s);
	
	//Draw.state.ability(s);
}

Draw.state.constant = function(){
	return {
		x:0,
		y:0,
		w:200,
		h:200,	
	}
}

Draw.state.resource = function (s){ ctxrestore();
	ctx = List.ctx.stage;
		
	var array = [
		{'name':'hp','height':20,'width':s.w},
		{'name':'heal','height':10,'width':s.w},
		{'name':'mana','height':10,'width':s.w},
		{'name':'fury','height':10,'width':s.w},
	];
	
	for(var i in array){
		var res = array[i];
		Draw.state.resource.bar(s.x+5,s.y+5,res.width,res.height,res.name);
		
		Button.creation(0,{
				'rect':[s.x+5,s.x+5+res.width,s.y+5,s.y+5+res.height],
				'text':res.name.capitalize() + ': ' + player[res.name] + '/' + player.resource[res.name].max,
				});		
		s.y += res.height + 3;
						
	}	
}

Draw.state.resource.bar = function(numX,numY,w,h,name){	ctxrestore();
	ctx = List.ctx.stage;
	
	var ratio = Math.min(Math.max(player[name]/player.resource[name].max,0),1);
	
	ctx.fillStyle = Cst.resource.toColor[name];
	ctx.strokeStyle= "black";
	ctx.roundRect(numX,numY,w,h,false,1,4);	//empty
	ctx.roundRect(numX,numY,w*ratio,h,1,1,4);			//filled
		
	ctxrestore();
}

Draw.state.ability = function(s){ ctxrestore();
	ctx = List.ctx.stage;
	
	var size = 30;
	
	for(var i in player.ability){
		if(!player.ability[i]) continue;
		var numX = s.x + 5 + (+i * (size + 10));
		var numY = s.y;
		var charge = player.abilityChange.chargeClient[i];
		
		if(charge !== 1) ctx.globalAlpha = 0.5;
		Draw.icon(player.ability[i].icon,[numX,numY],size);
		ctx.globalAlpha = 1;
		
		if(charge !== 1){	//loading circle
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = 'red';

			ctx.beginPath();
			ctx.moveTo(numX+size/2,numY+size/2);
			ctx.arc(numX+size/2,numY+size/2,size/2,-Math.PI/2,-Math.PI/2 + charge*2*Math.PI);
			ctx.lineTo(numX+size/2,numY+size/2);
			ctx.closePath();
			ctx.fill();
			
			ctx.globalAlpha = 1;
		}
	}
}

Draw.state.status = function(s){ ctxrestore();
	ctx = List.ctx.stage;
	var numX = s.x+10;		
	for(var i in player.status){
		if(+player.status[i]){
			Draw.icon('status.' + Cst.status.list[i],[numX,s.y],24);
			numX += 30			
		}
	}
}
//}

//{Minimap
Draw.minimap = function (){ ctxrestore();
	ctx = List.ctx.minimap;
	var s = Draw.minimap.constant();
	Draw.minimap.box(s);
	Draw.minimap.map(s,'b');
	//Draw.minimap.map(s,'i');	//require swapping...
	Draw.minimap.icon(s);
	Draw.minimap.button(s);
}

Draw.minimap.constant = function(){
	return {
		x:Cst.WIDTH - Cst.WIDTH/main.pref.mapRatio,
		y:0,
		w:Cst.WIDTH/main.pref.mapRatio,
		h:Cst.HEIGHT/main.pref.mapRatio,
	}
}

Draw.minimap.map = function(s,layer){
	var map = Db.map[player.map];
	var mapX = Math.min(map.img[layer].length-1,Math.max(0,Math.floor((player.x-1024)/2048)));
	var mapY = Math.min(map.img[layer][mapX].length-1,Math.max(0,Math.floor((player.y-1024)/2048)));
	var mapXY = map.img[layer][mapX][mapY];
	var pX = player.x-mapX*2048;
	var pY = player.y-mapY*2048;
		
	var mapZoomFact = main.pref.mapZoom/100;
	var mapCst = main.pref.mapRatio*mapZoomFact;
	
	var numX = (pX - Cst.WIDTH/2 * mapZoomFact)/2;
	var numY = (pY - Cst.HEIGHT/2 * mapZoomFact)/2;
	var longueur = Cst.WIDTH* mapZoomFact/2;
	var hauteur = Cst.HEIGHT* mapZoomFact/2;
	var startX = Math.max(numX,0);
	var startY = Math.max(numY,0);
	var endX = Math.min(numX + longueur,mapXY.width)
	var endY = Math.min(numY + hauteur,mapXY.height)
	var tailleX = Math.min(endX-startX,mapXY.width);
	var tailleY = Math.min(endY-startY,mapXY.height);
	
	if(layer === 'i') ctx.globalAlpha = main.pref.mapIconAlpha/100;
	ctx.drawImage(mapXY, startX,startY,tailleX,tailleY,s.x+(startX-numX)/mapCst*2,s.y + (startY-numY)/mapCst*2,tailleX/mapCst*2,tailleY/mapCst*2);
	ctx.globalAlpha = 1;
	
}

Draw.minimap.box = function(s){
	ctx.fillStyle = "black";
	ctx.lineWidth = 4;
	ctx.fillRect(s.x,s.y,Cst.WIDTH/main.pref.mapRatio,Cst.HEIGHT/main.pref.mapRatio);
	ctx.strokeRect(s.x,s.y,Cst.WIDTH/main.pref.mapRatio,Cst.HEIGHT/main.pref.mapRatio);
	ctx.lineWidth = 1;
}

Draw.minimap.button = function(s){
	var disX = 50;
	var disY = 22;
	var numX = s.x+s.w-disX;
	var numY = s.y+s.h-disY;
	ctx.fillRect(numX,numY,disX,disY);
	ctx.fillStyle = "white";
	ctx.fillText(main.pref.mapZoom + '%',numX,numY);
	
	//client button
	Button.creation(0,{
		"rect":[numX,numX+disX,numY,numY+disY],
		"left":{"func":(function(){ Input.add('$pref,mapZoom,'); }),"param":[]},
		"text":'Change Map Zoom.'
		});	
}

Draw.minimap.icon = function(s){
	var zoom = main.pref.mapZoom/100;
	var ratio = main.pref.mapRatio;

	for(var i in List.actor){
		var m = List.actor[i];
		if(m.minimapIcon){
			var vx = m.x - player.x;
			var vy = m.y - player.y;
			
			var cx = s.x + Cst.WIDTH/ratio/2; //center
			var cy = s.y + Cst.HEIGHT/ratio/2;
			var size = 36/zoom;
			
			var numX = cx+vx/zoom/ratio-size/2;
			var numY = cy+vy/zoom/ratio-size/2;
		
			if(Collision.PtRect({x:numX+size/2,y:numY+size/2},[s.x,s.x+Cst.WIDTH/main.pref.mapRatio,s.y,s.y+Cst.HEIGHT/main.pref.mapRatio])){
				Draw.icon(m.minimapIcon,[numX,numY],size);
			}
		}
	}
	Draw.icon('system.square',[s.x + Cst.WIDTH/main.pref.mapRatio/2-2,s.y + Cst.HEIGHT/main.pref.mapRatio/2-2],4);
}
//}

