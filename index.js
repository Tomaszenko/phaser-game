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
            coin.destroy();
            points += 1;
        },

        pickTreasure: function(player, treasure) {
            treasure.destroy();
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

            points = 0;

            setTimeout(this.increaseSpeed, 15000);

            game.map = game.add.tilemap('map');
            game.map.addTilesetImage('core_layer', 'core_layer');

            game.layer = game.map.createLayer('core_layer');
            game.layer.resizeWorld();

            emptyTiles = [];
            console.log("Prinitng tiles");
            game.map.forEach((tile) => {
                if(tile.index === 2 && (tile.x !== playerPosition.x || tile.y !== playerPosition.y)) {
                    emptyTiles.push({"x": tile.x, "y": tile.y});
                }
            });

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

            game.balls = game.add.group();
            game.boxes = game.add.group();
            game.coins = game.add.group();
            game.treasures = game.add.group();

            // game.boxes.create(64,128, 'box');
            // game.coins.create(64,192, 'coin');
            // game.treasures.create(64, 256, 'treasure');

            game.physics.startSystem(Phaser.Physics.P2JS);

            game.physics.p2.restitution = 0.8;
            game.physics.p2.convertTilemap(game.map, game.layer);
            game.physics.p2.setBoundsToWorld(true, true, true, true, false);

            var playerCollisionGroup = game.physics.p2.createCollisionGroup();
            var layerCollisionGroup = game.physics.p2.createCollisionGroup();
            var boxesCollisionGroup = game.physics.p2.createCollisionGroup();
            var coinsCollisionGroup = game.physics.p2.createCollisionGroup();
            var treasuresCollisionGroup = game.physics.p2.createCollisionGroup();
            var ballsCollisionGroup = game.physics.p2.createCollisionGroup();

            game.physics.p2.updateBoundsCollisionGroup();
            game.balls.physicsBodyType = Phaser.Physics.P2JS;

            // game.physics.setBoundsToWorld();

            game.map.setCollisionBetween(1, 1, true, game.layer);

            game.player = game.add.sprite(64, 64, 'herosheet');

            game.layer.enableBody = true;
            game.balls.enableBody = true;
            game.boxes.enableBody = true
            game.coins.enableBody = true;
            game.player.enableBody = true;
            game.treasures.enableBody = true;

            game.physics.p2.enable(game.player);
            // game.physics.p2.enable(game.layer);
            game.physics.p2.enable(game.boxes);
            game.physics.p2.enable(game.coins);
            game.physics.p2.enable(game.treasures);
            game.physics.p2.enable(game.balls);            
            // game.physics.arcade.enable(game.player);
            // game.physics.arcade.enable(game.layer);
            // game.physics.arcade.enable(game.boxes);
            // game.physics.arcade.enable(game.coins);
            // game.physics.arcade.enable(game.treasures);
            // game.physics.arcade.enable(game.balls);

            game.cursors = game.input.keyboard.createCursorKeys();

            game.player.animations.add('left', [14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15]); // klatki 6-7 dla wyświetlania gdy gracz porusza się w lewo
            game.player.animations.add('right', [10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('up', [8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9]); // klatki 6-7 dla wyświetlania gdy gracz porusza się w lewo
            game.player.animations.add('down', [12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('push_up', [4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('push_down', [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('push_left', [6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            game.player.animations.add('push_right', [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
            
            game.player.body.setRectangle(28, 56, 18, 4);

            game.player.body.fixedRotation = true;

            console.log("Ball generation");
            leftUpTiles.forEach((tile)=> {
                if(Math.random() < 0.03 && game.balls.length < 3) {
                    game.balls.create(tile.x*tilesize, tile.y*tilesize, 'ball');
                }
                if(Math.random() < 0.01) {
                    game.coins.create(tile.x*tilesize, tile.y*tilesize, 'coin');
                }
                if(Math.random() < 0.005) {
                    game.treasures.create(tile.x*tilesize, tile.y*tilesize, 'treasure');
                }
            });

            rightUpTiles.forEach((tile)=> {
                if(Math.random() < 0.05 && game.balls.length < 5) {
                    game.balls.create(tile.x*tilesize, tile.y*tilesize, 'ball');
                }
                if(Math.random() < 0.02) {
                    game.coins.create(tile.x*tilesize, tile.y*tilesize, 'coin');
                }
                if(Math.random() < 0.01) {
                    game.treasures.create(tile.x*tilesize, tile.y*tilesize, 'treasure');
                }
            });

            leftDownTiles.forEach((tile)=> {
                if(Math.random() < 0.05 && game.balls.length < 5) {
                    game.balls.create(tile.x*tilesize, tile.y*tilesize, 'ball');
                }
                if(Math.random() < 0.02) {
                    game.coins.create(tile.x*tilesize, tile.y*tilesize, 'coin');
                }
                if(Math.random() < 0.01) {
                    game.treasures.create(tile.x*tilesize, tile.y*tilesize, 'treasure');
                }
            });

            rightDownTiles.forEach((tile)=> {
                if(Math.random() < 0.08 && game.balls.length < 8) {
                    game.balls.create(tile.x*tilesize, tile.y*tilesize, 'ball');
                }
                if(Math.random() < 0.05) {
                    game.coins.create(tile.x*tilesize, tile.y*tilesize, 'coin');
                }
                if(Math.random() < 0.02) {
                    game.treasures.create(tile.x*tilesize, tile.y*tilesize, 'treasure');
                }
            });

            game.balls.forEach(elem=>{
                elem.body.velocity.x = Math.random()*128 - 64;
                elem.body.velocity.y = Math.random()*128 - 64;
            });

            game.balls.forEach(elem=>elem.animations.add('horizontal', [0, 1]));
            game.balls.forEach(elem=>elem.animations.add('vertical', [0, 2]));

            game.balls.forEach(elem=>elem.body.setCircle(32));
            game.coins.forEach(elem=>elem.body.setCircle(7, 25, 25));

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