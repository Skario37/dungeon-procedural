let dt,
    lastUpdate,
    currentLevel,
	animationId;
const tilesSize = 24; // pixels
const minTiles = 5;
const w = tilesSize * 50;
const h = tilesSize * 25;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d',{alpha: false});
const algoSelectElem = document.getElementById("algo-select");

canvas.width = w;
canvas.height = h;

if (window.devicePixelRatio > 1) {
	ctx.canvas.width = ctx.canvas.width * window.devicePixelRatio;
	ctx.canvas.height = ctx.canvas.height * window.devicePixelRatio;
	ctx.canvas.style.width = w+'px';
	ctx.canvas.style.height = h+'px';
	ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function init(){
	if (animationId) destroyAnimation();
	dt = 0;
	lastUpdate = Date.now();
	canvas.style.border = "solid";
	document.body.appendChild(canvas);

    currentLevel = new Level(
        w,  
        h, 
        tilesSize,
        algoSelectElem.value
    );
	currentLevel.initStage();
    currentLevel.placeRooms({
		MAX_WIDTH: 11, 
		MAX_HEIGHT: 10,
		MIN_WIDTH: 5,
		MIN_HEIGHT: 4
	});
	currentLevel.carvePassages();
	currentLevel.connectDungeon();
	currentLevel.makeGraphSparse();

	update();
}

function nextRoom() {
	if (animationId) destroyAnimation();

	dt = 0;
	lastUpdate = Date.now();
	currentLevel.initStage();
	currentLevel.placeRooms({
		MAX_WIDTH: 11, 
		MAX_HEIGHT: 10,
		MIN_WIDTH: 5,
		MIN_HEIGHT: 4
	});
	currentLevel.carvePassages();
	currentLevel.connectDungeon();
	currentLevel.makeGraphSparse();

	update();
}

function deltaTime(){
	let now = Date.now();
	dt = now - lastUpdate;
	lastUpdate = now;
}

function update(){
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,w,h);

    currentLevel.show();

	deltaTime();
	animationId = requestAnimationFrame(update);
}

function destroyAnimation(){
	window.cancelAnimationFrame(animationId);
    animationId = undefined;
}

function addEvents(){
	document.addEventListener("keydown",function(e){
		switch(e.code){
			case 	   "Enter" :
			case "NumpadEnter" :
					init();
				break;
			case "Space" :
					player.shoot();
				break;
			case "ArrowLeft" :
			case      "KeyA" :
			case   "Numpad4" :
					player.isMovingLeft = true;
				break;
			case "ArrowRight" :
			case       "KeyD" :
			case    "Numpad6" :
					player.isMovingRight = true;
				break;
		}
	});

	document.addEventListener("keyup",function(e){
		switch(e.code){
			case "ArrowLeft" :
			case      "KeyA" :
			case   "Numpad4" :
					player.isMovingLeft = false;
				break;
			case "ArrowRight" :
			case       "KeyD" :
			case    "Numpad6" :
					player.isMovingRight = false;
				break;
		}
	});

	window.addEventListener("focus",function(){
		lastUpdate = Date.now();
	});

	// window.addEventListener('load', function(e) {
	// 	window.applicationCache.addEventListener('updateready', function(e) {
	// 	  if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
	// 			window.applicationCache.swapCache();
	// 			window.location.reload();
	// 	  }
	// 	}, false);
	// }, false);


	let deferredPrompt;
	const addBtn = document.createElement('button');

	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt = e;
		addBtn.addEventListener('click', (e) => {
		  addBtn.style.display = 'none';
		  deferredPrompt.prompt();
		  deferredPrompt.userChoice.then((choiceResult) => {
		      deferredPrompt = null;
		    });
		});
	});
	
}

addEvents();
// init();