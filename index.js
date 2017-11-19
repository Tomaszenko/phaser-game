// $(document).ready (() => {
//     Crafty.init(600, 300, document.getElementById('game'));
//     Crafty.background('rgb(127,127,127)');

//     //Paddles
//     Crafty.e("Paddle, 2D, DOM, Color, Multiway")
//         .color('rgb(255,0,0)')
//         .attr({ x: 20, y: 100, w: 10, h: 100 })
//         .multiway(200, { 
//             W: -90, S: 90,
//             A: 180, D: 0 
//         });
        
//     Crafty.e("Paddle, 2D, DOM, Color, Multiway")
//         .color('rgb(0,255,0)')
//         .attr({ x: 580, y: 100, w: 10, h: 100 })
//         .multiway(200, { 
//             UP_ARROW: -90, DOWN_ARROW: 90,
//             RIGHT_ARROW: 0, LEFT_ARROW: 180 
//         });

//     //Ball
//     Crafty.e("2D, DOM, Color, Collision")
//         .color('rgb(0,0,255)')
//         .attr({ x: 300, y: 150, w: 10, h: 10,
//                 dX: Crafty.math.randomInt(2, 5),
//                 dY: Crafty.math.randomInt(2, 5) })
//         .bind('EnterFrame', function () {
//             //hit floor or roof
//             if (this.y <= 0 || this.y >= 290)
//                 this.dY *= -1;

//             // hit left or right boundary
//             if (this.x > 600) {
//                 this.x = 300;
//                 Crafty("LeftPoints").each(function () {
//                     this.text(++this.points + " Points") });
//             }
//             if (this.x < 10) {
//                 this.x = 300;
//                 Crafty("RightPoints").each(function () {
//                     this.text(++this.points + " Points") });
//             }

//             this.x += this.dX;
//             this.y += this.dY;
//         })
//         .onHit('Paddle', function () {
//             this.dX *= -1;
//         });

//     //Score boards
//     Crafty.e("LeftPoints, DOM, 2D, Text")
//         .attr({ x: 20, y: 20, w: 100, h: 20, points: 0 })
//         .text("0 Points");
//     Crafty.e("RightPoints, DOM, 2D, Text")
//         .attr({ x: 515, y: 20, w: 100, h: 20, points: 0 })
//         .text("0 Points");
// });


var StateMain = {


    preload: function() {
        game.stage.backgroundColor = "#0022FF";
        game.load.tilemap('map', 'assets/mapa.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image("ground", "images/ground.png");
        game.load.image("hero", "assets/tiles/hero.png");
        // game.load.image("hero", "images/hero.png");
        // game.load.image("bar", "images/powerbar.png");
        // game.load.image("block", "images/block.png");
        // game.load.audio("coś tam coś tam");
        game.load.spritesheet('herosheet', 'assets/sprites/hero.png', 64, 64);
    },
    create: function() {

        this.map = this.add.tilemap('tiles');
        this.map.addTilesetImage('hero', 'hero');

        this.layer = this.map.createLayer('Tile Layer 1');

        this.cursors = game.input.keyboard.createCursorKeys();

        game.time.desiredFps = 20;

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = -100;

        this.player = game.add.sprite(64, 64, 'herosheet');

        this.player.animations.add('left', [6, 7]); // klatki 6-7 dla wyświetlania gdy gracz porusza się w lewo
        this.player.animations.add('right', [2, 3]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo
        this.player.animations.add('up', [0, 1]); // klatki 6-7 dla wyświetlania gdy gracz porusza się w lewo
        this.player.animations.add('down', [4, 5]); // klatki 2-3 dla wyświetlania gdy gracz porusza się w prawo

        game.physics.arcade.enable(this.player);

        this.player.body.collideWorldBounds = true;
        this.player.body.gravity = game.physics.arcade.gravity;
        this.player.body.bounceY = 10;


        // licznik.fixedToCamera = true; // gdy będziemy mieli jakiś licznik to powinien on przesuwać się z kamerą

        // game.world.setBounds() // ustawiamy rozmiar świata gry

        game.camera.follow(this.player);

        platforms = game.add.group();

        //  We will enable physics for any object that is created in this group
        platforms.enableBody = true;

        // Here we create the ground.
        var ground = platforms.create(0, game.world.height - 64, 'ground');

        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        ground.scale.setTo(2, 2);

        //  This stops it from falling away when you jump on it
        ground.body.immovable = true;

        //  Now let's create two ledges
        var ledge = platforms.create(400, 400, 'ground');

        ledge.body.immovable = true;

        ledge = platforms.create(-150, 250, 'ground');

        ledge.body.immovable = true;

        // var footballers = game.add.group();

        //  And add 10 sprites to it
        // for (var i = 0; i < 10; i++) {
        //     //  Create a new sprite at a random world location
        //     console.log("tworzymy");
        //     footballers.create(game.world.randomX, game.world.randomY, 'hero');
        // }

        // footballers.enableBody = true;


        // Here we create the ground.
        // var ground = platforms.create(0, game.world.height - 64, game.world.width, 'ground');
        //add the ground
        // var ground = game.add.tileSprite(0, game.height * .9, game.width, 100, "ground");
        // ground.body.immovable = true;
        //add the hero in 
        // this.hero = game.add.sprite(game.width * .2, ground.y - 64, "hero");
        //add the power bar just above the head of the hero
        // this.powerBar = game.add.sprite(this.hero.x + 25, this.hero.y - 25, "bar");
        // this.powerBar.width = 0;
        //set listeners
        game.input.onUp.add(this.mouseUp, this);
        game.input.onDown.add(this.mouseDown, this);
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

        if(this.cursors.left.isDown) {
            this.player.animations.play('left'); // korzystanie z animacji
        } else {
            if(this.cursors.right.isDown)
                this.player.animations.play('right');
            else {
                if(this.cursors.up.isDown)
                    this.player.animations.play('up');
                else {
                    if(this.cursors.down.isDown)
                        this.player.animations.play('down');
                    else
                        this.player.frame = 8;
                }
            }
        }

        // if(playerBody.touching.down) // sprawdza czy stoimy na czymś
    }
}


var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', StateMain);
