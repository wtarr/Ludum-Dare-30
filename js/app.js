/**
 * Created by William on 23/08/2014.
 */
(function () {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'content');

    var phaserPractice = {};

    // Boot
    phaserPractice.boot = function() { };
    phaserPractice.boot.prototype = {

        preload : function() {
            game.time.advancedTiming = true;
            game.load.image('loadingImg', './assets/loading.png')
        },
        create : function() {
            game.input.maxPointers = 1;

            this.stage.disableVisibilityChange = true;

            if (game.device.desktop){
                game.scale.pageAlignHorizontally = true;
            }
            else
            {
                // mobile setup
            }

            game.state.start('preloader');
        },
        update : function() {

        }
    };

    // Preloader
    phaserPractice.preloader = function() { };
    phaserPractice.preloader.prototype = {

        preloadBar: null,
        continueTween : true,
        tween: null,
        text: null,

        preload : function() {
            this.preloadBar = game.add.sprite(400, 300, 'loadingImg');
            game.load.setPreloadSprite(this.preloadBar);

            game.load.onLoadStart.add(this.loadStart, this);
            game.load.onLoadComplete.add(this.loadComplete, this);

            //this.text = game.add.text(32, 32, 'Loading', { fill: '#ffffff'});

            this.loadThisStuff();
        },

        loadStart : function() {
            //this.text.setText("Loading ... ");
        },

        loadComplete : function(){
            //this.text.setText("Complete ... ");
            this.tween.repeat = false;
        },

        loadThisStuff : function() {

            game.load.image('starfield', 'assets/starField.jpg');
            game.load.image('planet', 'assets/planet.png');
            game.load.image('ship', 'assets/ship.png');
            game.load.image('enemy', 'assets/enemy.png');

            game.load.start();
        },

        create : function() {
            this.tween = this.add.tween(this.preloadBar).to({ alpha : 0}, 1000, Phaser.Easing.Elastic.InOut, true, 0, this.continueTween);
            this.tween.onComplete.add(this.startLevel, this);
        },
        update : function() {

        },
        startLevel: function() {
            game.state.start('mainmenu', true, false);
        }
    };

    // Main Menu
    phaserPractice.mainmenu = function() { };
    phaserPractice.mainmenu.prototype = {

        cursors: null,
        text : null,

        preload : function() {

        },
        create : function() {
            this.text = this.text = game.add.text(32, 32, 'Super awesome space Game\n\nConnected Worlds\n\nPress any key to start', { fill: '#ffffff'});
            game.input.keyboard.onDownCallback = this.moveon;
        },
        update : function() {

        },

        moveon : function() {
            game.input.keyboard.onDownCallback = null; // remove the callback
            game.state.start('level1', true, false); // start the game
        }
    };

    // Level1
    phaserPractice.level1 = function(){};
    phaserPractice.level1.prototype = {

        player: null,
        cursors: null,
        fuel: 100,
        fuelText: null,
        backdrop : null,
        planets : null,
        enemies : null,
        movespeed: 100,
        worldWidth: 2000,
        collected: [],

        preload: function() {

        },

        create: function() {

            game.physics.startSystem(Phaser.Physics.P2JS);

            game.world.setBounds(0,0,this.worldWidth, 600);

            //game.add.sprite(0, 0, 'starfield');
            this.backdrop = game.add.tileSprite(0, 0, 800, 600, 'starfield');
            this.backdrop.fixedToCamera = true;

            this.planets = game.add.group();
            this.planets.physicsBodyType = Phaser.Physics.arcade;
            this.planets.enableBody = true;

            var p1 = this.planets.create(100, 200, 'planet');
            p1.scale.setTo(0.25, 0.25);
            p1.name = "p1";

            var p1 = this.planets.create(700, 250, 'planet');
            p1.scale.setTo(0.25, 0.25);
            p1.name = "p2";

            this.player = game.add.sprite(150, 300, 'ship');
            this.player.anchor.setTo(0.5, 0.5);
            this.player.enableBody = true;
            game.physics.arcade.enable(this.player);

            game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

            this.enemies = game.add.group();
            this.enemies.enableBody = true;
            this.enemies.physicsBodyType = Phaser.Physics.arcade;
            this.enemies.create(600, 200, 'enemy');



            this.fuelText = game.add.text(10, 10, 'Fuel: ' + this.fuel + '%', {fill : '#ffffff'});
            this.fuelText.fixedToCamera = true;
            //game.add.tween(this.fuelText.cameraOffset).to({ y: 500 }, 2000, Phaser.Easing.Bounce.Out, true, 0, 1000, true);

            this.cursors = game.input.keyboard.createCursorKeys();
        },

        update: function() {

            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;


            if (this.cursors.up.isDown)
            {
                //game.camera.y -= 4;
                this.player.body.velocity.y -= this.movespeed;
            } else if (this.cursors.down.isDown)
            {
                //game.camera.y += 4;
                this.player.body.velocity.y += this.movespeed;
            }

            if (this.cursors.left.isDown)
            {
                this.backdrop.autoScroll(10, 0);
                //game.camera.x -= 4;
                //this.player.body.velocity.x -= 30;
                this.player.body.velocity.x -= this.movespeed;
            } else if (this.cursors.right.isDown)
            {
                //game.camera.x += 4;
                this.backdrop.autoScroll(10, 0);
                this.player.body.velocity.x += this.movespeed;
            }else {
                this.backdrop.stopScroll();
            }
            //console.log(this.backdrop.position.x);

//            game.physics.arcade.collide(this.player, this.platforms);
            game.physics.arcade.overlap(this.enemies, this.player, this.enemyHitsPlayer, null, this);
            game.physics.arcade.overlap(this.planets, this.player, this.planetEncounter, null, this);

        },
        render : function () {
            game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
            game.debug.body(this.player);
        },
        enemyHitsPlayer: function () {
               console.log("Hit");
        },

        planetEncounter : function(player, planet) {
            if (!isInArray(this.collected, planet.name)) {
                var t = game.add.text(planet.position.x, planet.position.y, '+ 10', { fill: '#ffffff'});

                var t = game.add.tween(t).to( { y: -50 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
                this.tween.onComplete.add(this.startLevel, this);

                this.collected.push(planet.name);
            }

        }

    };

    function isInArray(array, search)
    {
        return array.indexOf(search) >= 0;
    }

    game.state.add('boot', phaserPractice.boot);
    game.state.add('preloader', phaserPractice.preloader);
    game.state.add('mainmenu', phaserPractice.mainmenu);
    game.state.add('level1', phaserPractice.level1);
    game.state.start('boot');

}());