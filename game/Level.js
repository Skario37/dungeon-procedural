class Level {
    constructor(x, y, tileSize, pattern){
        this.pattern = pattern || "standard";
        this.world = {
            size_x: x,
            size_y: y,
            tileSize: tileSize,
            roomTries: 20,
        };
        this.options = {
            standard: {
                MAX_WIDTH: 46, 
                MAX_HEIGHT: 46,
                MIN_WIDTH: 9,
                MIN_HEIGHT: 9
            }
        };

        this.colourGenerator = {
            count: 0,
            colours: [
                "brown",  // rock
                "gray", // passage
                "red",
                "blue",
                "green",
                "yellow",
                "magenta"
            ],
            next: function () {
                this.count++;
                return ((this.count % (this.colours.length - 2)) + 2);
            }
        };

        this.stage = [];
        this.rooms = [];
        this.passages = [];
    }

    initStage() {
        let sizeY = this.world.size_y / this.world.tileSize;
        let sizeX = this.world.size_x / this.world.tileSize;

        if (this.pattern === "standard") {
            sizeX = sizeX / 2;
        } else if (this.pattern === "standardthird") {
            sizeX = Math.floor(sizeX * 3/4);
        }

        this.stage = new Array(sizeY);
        for(var i = 0; i < sizeY; i++) {
            this.stage[i] = [];
            for(var j = 0; j < sizeX; j++) {
                this.stage[i].push(0);
            }
        }
    }

    placeRooms(options) {
        if (!options) {
            options = this.options.standard;
        }
        this.rooms = [];
        for (let i = 0; i < this.world.roomTries; i++) {
            const room = this.randomRoom(options);
            if (this.checkRoomCollisions(room) === false) {
                room.colour = this.colourGenerator.next();
                this.digRoom(room);
                this.rooms.push(room);
            }
        }
    }

    randomRoom(options) {
        const h = this.evenize(this.getRandomIntInclusive(options.MIN_HEIGHT, options.MAX_HEIGHT));
        const w = this.evenize(this.getRandomIntInclusive(options.MIN_WIDTH, options.MAX_WIDTH));
        const x = this.oddRng(1, this.stage[0].length - w - 1);
        const y = this.oddRng(1, this.stage.length - h - 1);
        const room = { h: h, w: w, x: x, y: y };
        if (x + w >= this.stage[0].length || y + h >= this.stage.length) {
            throw new Error("Hey c'trop grand là.", room);
        }
        return room;
    };

    checkRoomCollisions(room) {
        for(let y = room.y; y <= room.y + room.h; y++) {
            for(let x = room.x; x <= room.x + room.w; x++) {
                if(x >= this.stage[0].length || y >= this.stage.length) {
                    throw new Error('Hey bah non ça sort des limites là.', x, y);
                }
                if (this.stage[y][x] !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    digRoom(room) {
        for(let y = room.y; y <= room.y + room.h; y++) {
            for(let x = room.x; x <= room.x + room.w; x++) {
                this.stage[y][x] = room.colour;
            }
        }
    };

    passageCarver(x0, y0) {
        const stack = [];
        stack.push({x: x0, y: y0});
        const colour = 1;
      
        const pushRight = (x, y) => {
            if (this.canDig(x + 1, y)) {
                stack.push({x: x + 1, y: y});
            }
        }
      
        const pushLeft = (x, y) => {
            if (this.canDig(x - 1, y)) {
                stack.push({x: x - 1, y: y});
            }
        }
       
        const pushUp = (x, y) => {
            if (this.canDig(x, y - 1)) {
                stack.push({x: x, y: y - 1});
            }
        }
      
        const pushDown = (x, y) => {
            if (this.canDig(x, y + 1)) {
                stack.push({x: x, y: y + 1});
            }
        }

        while (stack.length > 0) {
            const tile = stack.pop();
            if (this.canDig(tile.x, tile.y) === false) {
                continue;
            }
            this.stage[tile.y][tile.x] = colour;

            const tileDirections = [pushRight, pushLeft, pushUp, pushDown];
            this.shuffleArray(tileDirections);
            for(const direction of tileDirections) {
                direction(tile.x, tile.y)
            }
        }
    }

    carvePassages() {
        this.passages = [];
        this.carveFn();
    }

    carveFn() {
        const tile = this.findStartingTile();
        if (tile) {
            this.passageCarver(tile.x, tile.y);
            tile.colour = this.stage[tile.y][tile.x];
            this.passages.push(tile);
            this.carveFn();
        }
    }

    findStartingTile() {
        for (let y = 0; y < this.world.size_y; y++) {
            for (let x = 0; x < this.world.size_x; x++) {
                let valid = true;
                const tiles = this.calculateAdjacentTiles(x, y);
                for (const tile of tiles) {
                    if (this.getTile(tile.x, tile.y) !== 0) {
                        valid = false;
                    }
                }
                if (valid === true) {
                    return {x: x, y: y};
                }
            }
        }
    }

    calculateAdjacentTiles(x0, y0) {
        const tiles = [];
        for (let x = x0 - 1; x <= x0 + 1; x++) {
            for (let y = y0 - 1; y <= y0 + 1; y++) {
                tiles.push({x: x, y: y});
            }
        }
        return tiles;
    }

    getTile = function (x, y) {
        if (this.stage[y] === undefined || this.stage[y][x] === undefined) {
            return false;
        } else {
            return this.stage[y][x];
        }
    }

    canDig(x, y) {
        if (this.stage[y] === undefined || this.stage[y][x] === undefined) {
            return false;
        }
        let adjacentStructures = 0;
        let adjacentTiles = this.calculateAdjacentTiles(x, y);

        for (const adjTile of adjacentTiles) {
            if (this.getTile(adjTile.x, adjTile.y) > 0) {
                adjacentStructures = adjacentStructures + 1;
            }
        }

        return adjacentStructures <= 2;
    }

    calculateAdjacentTiles(x0, y0) {
        const tiles = [];
        for (var x = x0 - 1; x <= x0 + 1; x++) {
            for (var y = y0 - 1; y <= y0 + 1; y++) {
                tiles.push({x: x, y: y});
            }
        }
        return tiles;
    }

    connectDungeon() {
        const connectors = this.findAllConnectors();
        for (const connector of connectors) {
            this.stage[connector.y][connector.x] = 1;
        }
        this.shuffleArray(connectors);
        let connector;
        const connectedRegions = this.floodFill(connectors[connectors.length - 1]);
        while(connectors.length > 0) {
            connector = connectors.pop();
            this.stage[connector.y][connector.x] = 0;
            if (this.floodFill({ x: this.rooms[0].x, y: this.rooms[0].y }) < connectedRegions) {
                this.stage[connector.y][connector.x] = 1;
            }
        }
    }

    findAllConnectors() {
        const connectors = [];
        for (let y = 0; y < this.world.size_y; y++) {
            for (let x = 0; x < this.world.size_x; x++) {
                if (this.getTile(x, y) === 0) {
                    const w = this.getTile(x - 1, y) || 0;
                    const e = this.getTile(x + 1, y) || 0;
                    if (w !== 0 && e !== 0 && w !== e) {
                        connectors.push({x: x, y: y});
                    }
                    const n = this.getTile(x, y - 1) || 0;
                    const s = this.getTile(x, y + 1) || 0;
                    if (n !== 0 && s !== 0 && n !== s) {
                        connectors.push({x: x, y: y});
                    }
                }
            }
        }
        return connectors;
    }

    floodFill(startingTile, options) {
        let nodesTraversed = [];
        const stack = [startingTile];
        const clone = JSON.parse(JSON.stringify(this.stage));
        while (stack.length > 0) {
            const tile = stack.pop();
            clone[tile.y][tile.x] = "visited";
            const directions = [
                {x: tile.x + 1, y: tile.y},
                {x: tile.x - 1, y: tile.y},
                {x: tile.x, y: tile.y + 1},
                {x: tile.x, y: tile.y - 1}
            ];
            for (const direction of directions) {
                if (clone[direction.y] 
                && clone[direction.y][direction.x] !== "visited" 
                && (clone[direction.y] 
                && clone[direction.y][direction.x] > 0 
                || clone[direction.y] 
                && clone[direction.y][direction.x] === 1)) {
                    if (this.getTile(direction.x, direction.y) !== 1) {
                        nodesTraversed = Array.from(
                            new Set([
                                ...nodesTraversed, 
                                this.getTile(direction.x, direction.y)
                            ])
                        );
                    }
                    stack.push(direction);
                }
            }
        }
        return nodesTraversed.length;
    }

    makeGraphSparse() {
        const deadEnds = [];
        for (var y = 0; y < this.world.size_y; y++) {
            for (var x = 0; x < this.world.size_x; x++) {
                if (this.getTile(x, y) > 0 
                && this.isDeadEnd({x: x, y: y})) {
                    deadEnds.push({x: x, y: y});
                }
            }
        }
        
        if (deadEnds.length > 0) {
            for (const tile of deadEnds) {
                this.stage[tile.y][tile.x] = 0;
            }
            this.makeGraphSparse();
        }
    }

    isDeadEnd(tile) {
        let adjacentStoneTiles = 0;
        const directions = [
            {x: tile.x + 1, y: tile.y},
            {x: tile.x - 1, y: tile.y},
            {x: tile.x, y: tile.y + 1},
            {x: tile.x, y: tile.y - 1}
        ];

        for(const direction of directions) {
            if (this.getTile(direction.x, direction.y) === 0 
            || this.getTile(direction.x, direction.y) === false) {
                adjacentStoneTiles++;
            }
        }
        return adjacentStoneTiles >= 3;
    }

    evenize(x) {
        if (x === 0) { return x; }
        return Math.floor(x / 2) * 2;
    }

    oddRng(min, max) {
        let rn = this.getRandomIntInclusive(min, max);
        if (rn % 2 === 0) {
            if (rn === max) {
                rn = rn - 1;
            } else if (rn === min) {
                rn = rn + 1;
            } else {
                const adjustment = this.getRandomIntInclusive(1,2) === 2 ? 1 : -1;
                rn = rn + adjustment;
            }
        }
        return rn;
    }

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min +1)) + min;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    update() {
        const yLength = this.stage.length;
        const xLength = this.stage[0].length;
        let tile;
        for (let y = 0; y < this.world.size_y; y++) {
            if (y < yLength) {
                for (let x = 0; x < this.world.size_x; x++) {
                    if (x < xLength) {
                        tile = this.stage[y][x];
                    } else {
                        tile = undefined;
                    }
                    this.drawTile(x, y, tile);
                }
            }
        }
    }

    drawTile(x, y, colour) {
        if (colour > 0) {
            ctx.fillStyle = this.colourGenerator.colours[colour];
        } else {
            ctx.fillStyle = this.colourGenerator.colours[0];
        }
        ctx.fillRect(x * this.world.tileSize, y * this.world.tileSize, this.world.tileSize, this.world.tileSize);

        ctx.strokeStyle = "#000000";
        ctx.strokeRect(x * this.world.tileSize, y * this.world.tileSize, this.world.tileSize, this.world.tileSize);
    }

    show(){
		this.update();
	}
}