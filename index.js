$(document).ready(()=> {

    let points = 0;

    const tilesize = 64;
    const tilesVert = 16;
    const tilesHoriz = 16;

    let playerPosition = {x: 1, y: 1};

    var bootState = {
        preload: function() {

        },

        create: function() {
            var startLabel = game.add.text(80, game.world.height - 80, "press ENTER to start", {font: '25px Arial', fill: '#ffffff'});
            var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            enterKey.onDown.addOnce(this.start, this);
        },

        start: function() {
            game.state.start('play');
        }
    };

    var StateMain = {

        playerPushesBox: function(player, box) {
            if(player.body.velocity.x  > 0)
                player.animations.play('push_right');
            else
                player.animations.play('push_left');

            if(player.body.velocity.y > 0)
                player.animations.play('push_down');
            else
                player.animations.play('push_up');
        },

        bounceBall: function(ball, box) {
            console.log(ball);
            console.log(box);
            box.destroy();
            // game.map.removeTile(box.x, box.y).destroy();
            // wall.destroy();
            console.log("wall");
            console.log("bounce ball");
            // console.log(ball.body.velocity);
            // ball.body.velocity.x = Math.random()*128 - 64;
            // ball.body.velocity.y = Math.random()*128 - 64;
        },

        pickCoin: function(player, coin) {
            console.log("player collects coin");
            game.coins.remove(coin.sprite);
            coin.destroy();
            coin = null;
            points += 1;
        },

        pickTreasure: function(player, treasure) {
            game.treasures.remove(treasure.sprite);
            treasure.destroy();
            treasure = null;
            points += 5;
        },
        
        increaseSpeed: function() {
            // game.balls.body.velocity.x *= 2;
            // game.balls.body.velocity.y *=2;
        },

        gameover: function(ball, player) {
            game.state.start('lose');
        },

        win: function(sprite) {
            game.state.start('win');
        },

        playerHitsWall: function(player, wall) {
            console.log(player.body.velocity);
        },

        preload: function() {
            game.stage.backgroundColor = "#0022FF";
            game.load.tilemap('map', 'assets/mapa.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('core_layer', 'assets/tiles/core_layer.png');
            game.load.image('box', 'assets/tiles/container.png');
            game.load.image('treasure', 'assets/sprites/treasure.png');
            game.load.spritesheet('ball', 'assets/sprites/ball.png', 64, 64);
            game.load.spritesheet('herosheet', 'assets/sprites/hero.png', 64, 64);
            game.load.spritesheet('coin', 'assets/sprites/coin.png', 64, 64);
        },
        create: function() {

            let points = 0;

            game.map = game.add.tilemap('map');
            game.map.addTilesetImage('core_layer', 'core_layer');

            game.physics.startSystem(Phaser.Physics.P2JS);

            game.layer = game.map.createLayer('core_layer');
            game.layer.resizeWorld();

            game.physics.p2.restitution = 1;
            game.physics.p2.setBoundsToWorld(true, true, true, true, false);
            game.physics.p2.setImpactEvents(true);


            game.playerCollisionGroup = game.physics.p2.createCollisionGroup();
            game.layerCollisionGroup = game.physics.p2.createCollisionGroup();
            game.boxesCollisionGroup = game.physics.p2.createCollisionGroup();
            game.coinsCollisionGroup = game.physics.p2.createCollisionGroup();
            game.treasuresCollisionGroup = game.physics.p2.createCollisionGroup();
            game.ballsCollisionGroup = game.physics.p2.createCollisionGroup();

            // game.physics.p2.updateBoundsCollisionGroup();

            let emptyTiles = [];

            console.log("Printing tiles");
            
            game.balls = game.add.group();
            game.boxes = game.add.group();
            game.coins = game.add.group();
            game.treasures = game.add.group();
            game.player = game.add.sprite(64, 64, 'herosheet');

            game.balls.enableBody = true;
            game.boxes.enableBody = true
            game.coins.enableBody = true;
            game.player.enableBody = true;
            game.treasures.enableBody = true;


            game.player.physicsBodyType = Phaser.Physics.P2JS;
            game.balls.physicsBodyType = Phaser.Physics.P2JS;
            game.coins.physicsBodyType = Phaser.Physics.P2JS;
            game.treasures.physicsBodyType = Phaser.Physics.P2JS;

            game.physics.p2.enable(game.player);

            game.map.setCollisionBetween(1, 1, true, game.layer);

            game.map.forEach((tile) => {
                console.log(tile);
                if(tile.index === 2 && (tile.x !== playerPosition.x || tile.y !== playerPosition.y)) {
                    emptyTiles.push({"x": tile.x, "y": tile.y});
                }
                if(tile.index === 1) {
                    console.log(tile);
                    // game.physics.p2.enable(tile);
                    // tile.body.setCollisionGroup(layerCollisionGroup);
                    // tile.body.collides([ballsCollisionGroup, playerCollisionGroup]);
                }
            });

            wallsConverted = game.physics.p2.convertTilemap(game.map, game.layer);
            for(let i=0; i!==wallsConverted.length; i++) {
                let wallsLayerBody = wallsConverted[i];
                // game.physics.p2.enable(wallsLayerBody);
                console.log(wallsLayerBody);
                // console.log(wallsLayerBody.x);
                console.log("("+wallsLayerBody.x.toString()+ "," + wallsLayerBody.y.toString() +")");
                wallsLayerBody.setCollisionGroup(game.layerCollisionGroup);
                wallsLayerBody.collides([game.playerCollisionGroup, game.ballsCollisionGroup]);
                // wallsLayerBody.collides(ballsCollisionGroup);
            }

            game.physics.p2.updateBoundsCollisionGroup();

            console.log(emptyTiles);

            leftUpTiles = emptyTiles.filter((tile)=>tile.x < tilesHoriz/2 && tile.y < tilesVert/2);
            rightUpTiles = emptyTiles.filter((tile)=>tile.x >= tilesHoriz/2 && tile.y < tilesVert/2);
            leftDownTiles = emptyTiles.filter((tile)=>tile.x < tilesHoriz/2 && tile.y >= tilesVert/2);
            rightDownTiles = emptyTiles.filter((tile)=>tile.x >= tilesHoriz/2 && tile.y >= tilesVert/2);

            console.log(leftUpTiles);
            console.log(rightUpTiles);
            console.log(leftDownTiles);
            console.log(rightDownTiles);

            console.log(game.world);

            game.player.body.setRectangle(28,56,0,0);
            // game.player.body.collides(layerCollisionGroup);
            // game.player.body.collides([game.ballsCollisionGroup]);

            game.physics.p2.updateBoundsCollisionGroup();

            console.log(game.treasures);

            // game.physics.p2.enable(game.boxes);
            // game.physics.p2.enable(game.coins);
            // game.physics.p2.enable(game.treasures);
            // game.physics.p2.enable(game.balls);


            console.log(game.player.body);




            game.cursors = game.input.keyboard.createCursorKeys();

            game.player.animations.add('left', [14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15]); // klatki 6-7 dla wyświetlania gdy gracz porusza się w lewo
            game.player.animations.add('right', [10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('up', [8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9]); // klatki 6-7 dla wyświetlania gdy gracz porusza się w lewo
            game.player.animations.add('down', [12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('push_up', [4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('push_down', [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('push_left', [6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('push_right', [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            
            // game.player.body.setRectangle(28, 56, 18, 4);

            game.player.body.fixedRotation = true;

            console.log("Ball generation");
            leftUpTiles.forEach((tile)=> {
                if(Math.random() < 0.03 && game.balls.length < 3) {
                    let ball = game.balls.create(tile.x*tilesize, tile.y*tilesize, 'ball');
                    ball.body.damping = 0;
                    ball.body.restitution = 1;
                }
                if(Math.random() < 0.01) {
                    let coin = game.coins.create(tile.x*tilesize + tilesize/2, tile.y*tilesize + tilesize/2, 'coin');
                }
                if(Math.random() < 0.005) {
                    let treasure = game.treasures.create(tile.x*tilesize + tilesize/2, tile.y*tilesize + tilesize/2, 'treasure');
                }
            });

            rightUpTiles.forEach((tile)=> {
                if(Math.random() < 0.05 && game.balls.length < 5) {
                    let ball = game.balls.create(tile.x*tilesize, tile.y*tilesize, 'ball');
                    ball.body.damping = 0;
                    ball.body.restitution = 1;
                }
                if(Math.random() < 0.02) {
                    let coin = game.coins.create(tile.x*tilesize + tilesize/2, tile.y*tilesize + tilesize/2, 'coin');
                }
                if(Math.random() < 0.01) {
                    let treasure = game.treasures.create(tile.x*tilesize + tilesize/2, tile.y*tilesize + tilesize/2, 'treasure');
                }
            });

            leftDownTiles.forEach((tile)=> {
                if(Math.random() < 0.05 && game.balls.length < 5) {
                    let ball = game.balls.create(tile.x*tilesize, tile.y*tilesize, 'ball');
                    ball.body.damping = 0;
                    ball.body.restitution = 1;
                }
                if(Math.random() < 0.02) {
                    let coin = game.coins.create(tile.x*tilesize + tilesize/2, tile.y*tilesize + tilesize/2, 'coin');
                }
                if(Math.random() < 0.01) {
                    let treasure = game.treasures.create(tile.x*tilesize + tilesize/2, tile.y*tilesize + tilesize/2, 'treasure');
                }
            });

            rightDownTiles.forEach((tile)=> {
                if(Math.random() < 0.08 && game.balls.length < 8) {
                    let ball = game.balls.create(tile.x*tilesize, tile.y*tilesize, 'ball');
                    ball.body.damping = 0;
                    ball.body.restitution = 1;
                }
                if(Math.random() < 0.05) {
                    let coin = game.coins.create(tile.x*tilesize + tilesize/2, tile.y*tilesize + tilesize/2, 'coin');
                }
                if(Math.random() < 0.02) {
                    let treasure = game.treasures.create(tile.x*tilesize + tilesize/2, tile.y*tilesize + tilesize/2, 'treasure');
                }
            });
            game.physics.p2.updateBoundsCollisionGroup();

            game.player.body.setCollisionGroup(game.playerCollisionGroup);


            game.balls.forEach(elem=>elem.body.setCircle(32));
            game.coins.forEach(elem=>elem.body.setCircle(7, 0, 0));

            game.balls.forEach(elem=>{
                elem.body.setCollisionGroup(game.ballsCollisionGroup);
                elem.body.velocity.x = Math.random()*128 - 64;
                elem.body.velocity.y = Math.random()*128 - 64;
                elem.body.collides([game.ballsCollisionGroup, game.playerCollisionGroup, game.layerCollisionGroup]);
                // elem.body.collides([game.ballsCollisionGroup, game.playerCollisionGroup]);
            });

            game.coins.forEach(elem=>{
                elem.body.setCollisionGroup(game.coinsCollisionGroup);
                elem.body.collides([game.playerCollisionGroup]);
            });

            game.treasures.forEach(elem=>{
                elem.body.setCollisionGroup(game.treasuresCollisionGroup);
                elem.body.collides([game.playerCollisionGroup]);
            });

            game.player.body.collides([game.layerCollisionGroup, game.ballsCollisionGroup, game.coinsCollisionGroup, game.treasuresCollisionGroup]);

            game.player.body.createGroupCallback(game.coinsCollisionGroup, this.pickCoin);
            // game.player.body.collides(game.coinsCollisionGroup, pickCoin, this);
            game.player.body.createGroupCallback(game.treasuresCollisionGroup, this.pickTreasure);

            game.balls.forEach(elem=>elem.animations.add('horizontal', [0, 1]));
            game.balls.forEach(elem=>elem.animations.add('vertical', [0, 2]));


            // game.wallTiles.forEach(elem=>{
            //     elem.body.setCollisionGroup(layerCollisionGroup);
            //     elem.body.collides([playerCollisionGroup, ballsCollisionGroup]);
            // });


            // game.boxes.body.bounce.set(0.2);

            game.player.checkWorldBounds = true;

            game.camera.follow(game.player);
            // game.player.body.collideWorldBounds = true;

            console.log(game.world.bounds.width);
            console.log(game.world.bounds.height);

            game.player.events.onOutOfBounds.add(this.win);

        },
        mouseDown: function() {
            this.timer = game.time.events.loop(Phaser.Timer.SECOND / 1000, this.increasePower, this);
        },
        mouseUp: function() {
            game.time.events.remove(this.timer);
        },
        increasePower: function() {
            // this.power++;
            // this.powerBar.width = this.power;
            // if (this.power > 50) {
            //     this.power = 50;
            // }
        },
        update: function() {
            // game.player.body.collides([game.ballsCollisionGroup]);

            game.debug.text("Points: " + points, 32, 32);

            // if(game.player.x > game.world.width - tilesize/2 || game.player.x < tilesize/2 || game.player.y > game.world.height - tilesize/2 || game.player.y < tilesize/2) {
            //     this.win();
            // }

            // console.log(game.ball.body.velocity);

            // game.physics.arcade.collide(game.player, game.layer);
            // game.physics.arcade.collide(game.balls, game.layer);
            // game.physics.arcade.collide(game.boxes, game.layer);
            // game.physics.arcade.collide(game.balls, this.gameover);
            // game.physics.arcade.collide(game.player, game.boxes);
            // game.physics.arcade.collide(game.balls, game.boxes, this.bounceBall);
            // game.physics.arcade.collide(game.balls, game.player, this.gameover);
            // game.physics.arcade.collide(game.player, game.coins, this.pickCoin);
            // game.physics.arcade.collide(game.player, game.treasures, this.pickTreasure);
            // game.physics.arcade.overlap(game.ball, game.boxes, this.bounceBall);

            if(game.cursors.left.isDown) {
                // if(game.player.collides(game.boxes))
                //     game.player.animations.play('push_left');
                // else
                game.player.animations.play('left');
                // game.balls.animations.play('vertical');
                // game.ball.body.velocity.x = 0;
                // game.ball.body.velocity.y = -64;
                game.player.body.velocity.x = -64;
                game.player.body.velocity.y = 0; // korzystanie z animacji
                // game.player.body.velocity.y = 0;
            } else {
                if(game.cursors.right.isDown) {
                    game.player.animations.play('right');
                    // game.ball.animations.play('vertical');
                    // game.ball.body.velocity.x = 0;
                    // game.ball.body.velocity.y = 64;
                    game.player.body.velocity.x = 64;
                    game.player.body.velocity.y = 0;
                }
                else {
                    if(game.cursors.up.isDown) {
                        game.player.animations.play('up');
                        // game.ball.animations.play('horizontal');
                        // game.ball.body.velocity.x = 64;
                        // game.ball.body.velocity.y = 0;
                        game.player.body.velocity.y = -64;
                        game.player.body.velocity.x = 0;
                    }
                    else {
                        if(game.cursors.down.isDown) {
                            game.player.animations.play('down');
                            game.player.body.velocity.y = 64;
                            game.player.body.velocity.x = 0;
                        }
                        else {
                            game.player.frame = 8;
                            game.player.body.velocity.x = 0;
                            game.player.body.velocity.y = 0;
                        }
                    }
                }
            }

            // if(playerBody.touching.down) // sprawdza czy stoimy na czymś
        }
    }

    var loseState = {
        preload: function() {
            game.stage.backgroundColor = '#AA0000';
        },

        create: function() {
            var gameOver = game.add.text(80, 80, "GAME OVER!", {font: '25px Arial', fill: '#ffffff'});
            var restartLabel = game.add.text(80, 432, "press ENTER to restart", {font: '20px Arial', fill: '#ffffff'});
            var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            enterKey.onDown.addOnce(this.start, this);
        },

        start: function() {
            game.state.start('play');
        }
    };


    var winState = {
        preload: function() {
            game.stage.backgroundColor = '#33AAAA';
        },

        create: function() {
            var gameCompleted = game.add.text(80, 80, "COMPLETED! You collected "+points+" pts", {font: '25px Arial', fill: '#ffffff'});
            var restartLabel = game.add.text(80, 432, "press ENTER to restart", {font: '25px Arial', fill: '#ffffff'});
            var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            enterKey.onDown.addOnce(this.start, this);
        },

        start: function() {
            game.state.start('play');
        }
    };

    var game = new Phaser.Game(512, 512, Phaser.AUTO, 'game');

    game.state.add('boot', bootState);
    game.state.add('play', StateMain);
    game.state.add('win', winState);
    game.state.add('lose', loseState);

    game.state.start('boot');
});