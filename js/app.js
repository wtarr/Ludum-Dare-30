/**
 * Created by William on 23/08/2014.
 */
(function () {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'content');

    var ConnectedWorlds = {};

    // Boot
    ConnectedWorlds.boot = function() { };
    ConnectedWorlds.boot.prototype = {

        preload : function() {
            game.time.advancedTiming = true;
            game.load.image('loadingImg', './assets/loading.png');
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
    ConnectedWorlds.preloader = function() { };
    ConnectedWorlds.preloader.prototype = {

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
            game.load.image('rocket', 'assets/rocket.png');

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
    ConnectedWorlds.mainmenu = function() { };
    ConnectedWorlds.mainmenu.prototype = {

        cursors: null,
        text : null,

        preload : function() {

        },
        create : function() {
            this.text = game.add.text(32, 32, 'Super awesome space Game\n\nConnected Worlds\n\nPress any key to start', { fill: '#ffffff'});
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
    ConnectedWorlds.level1 = function(){};
    ConnectedWorlds.level1.prototype = {

        player: null,
        cursors: null,
        fuel: 100,
        fuelText: null,
        backdrop : null,
        planets : null,
        enemies : null,
        enemieRockets : null,
        playerRockets: null,
        movespeed: 100,
        worldWidth: 2000,
        collected: [],
        playerFireTimer: 0,
        spaceKey: null,

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

            this.playerRockets = game.add.group();
            this.playerRockets.enableBody = true;
            this.playerRockets.physicsBodyType = Phaser.Physics.ARCADE;
            this.playerRockets.createMultiple(20, 'rocket');
            this.playerRockets.setAll('anchor.x', 0.5);
            this.playerRockets.setAll('anchor.y', 0.5);
            this.playerRockets.setAll('scale.x', -1); // reverse them
            this.playerRockets.setAll('outOfBoundsKill', true);
            this.playerRockets.setAll('checkWorldBounds', true);

            this.enemieRockets = game.add.group();
            this.enemieRockets.enableBody = true;
            this.enemieRockets.physicsBodyType = Phaser.Physics.ARCADE;
            this.enemieRockets.createMultiple(20, 'rocket');
            this.enemieRockets.setAll('anchor.x', 0.5);
            //this.enemieRockets.setAll('scale.x', -1); // reverse them
            this.enemieRockets.setAll('anchor.y', 0.5);
            this.enemieRockets.setAll('outOfBoundsKill', true);
            this.enemieRockets.setAll('checkWorldBounds', true);

            this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

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
                this.fuel -= 0.1;
            } else if (this.cursors.down.isDown)
            {
                //game.camera.y += 4;
                this.player.body.velocity.y += this.movespeed;
                this.fuel -= 0.1;
            }

            if (this.cursors.right.isDown)
            {
                //game.camera.x += 4;
                this.backdrop.autoScroll(-5, 0);
                this.player.body.velocity.x += this.movespeed;
                this.fuel -= 0.2;
            }else {
                this.backdrop.stopScroll();
            }

            if (this.spaceKey.isDown)
            {
                this.fireRocket();
            }
            //console.log(this.backdrop.position.x);

//            game.physics.arcade.collide(this.player, this.platforms);
            game.physics.arcade.overlap(this.enemies, this.player, this.enemyHitsPlayer, null, this);
            game.physics.arcade.overlap(this.planets, this.player, this.planetEncounter, null, this);
            game.physics.arcade.overlap(this.playerRockets, this.enemies, this.hitanememy, null, this);


            this.fuelText.setText('Fuel: ' + this.fuel.toFixed(0)  + '%');

            if (this.fuel <= 0)
            {
                // reset
                this.fuel = 100;
                this.collected = [];
                game.state.start('gameover', true, false); // game over screen
            }
        },
        render : function () {
            game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
            //game.debug.body(this.player);
        },
        enemyHitsPlayer: function () {
               console.log("Hit");
        },

        planetEncounter : function(player, planet) {
            if (!isInArray(this.collected, planet.name)) {
                var t = game.add.text(planet.position.x, planet.position.y, '+ 10', { fill: '#ffffff'});

                var tw = game.add.tween(t).to( { y: -1 }, 1000, Phaser.Easing.Cubic.Out, true, 0, false);
                tw.onComplete.add(function() {
                    this.fuel += 10;
                    game.world.remove(t)
                }, this);

                this.collected.push(planet.name);
            }

        },

        fireRocket : function() {
            if (game.time.now > this.playerFireTimer) {
                var rocket = this.playerRockets.getFirstExists(false);

                if (rocket)
                {
                    rocket.reset(this.player.x + 4, this.player.y);
                    rocket.body.velocity.x = 200;
                    this.playerFireTimer = game.time.now + 200;
                }
            }
        },

        hitanememy : function(rocket, enemy) {
            rocket.kill();
            enemy.kill();
            this.fuel += 20; // steal their fuel too :-D
            // play explosion
        },

        playerhitbyenemyorrocket : function(other, player)
        {

        },

        enemyLaunch : function() {
            // if within sight only
            // and player x is not greater than enemy x i.e gone past

        }

    };

    // Game Over
    ConnectedWorlds.gameover = function(){};
    ConnectedWorlds.gameover.prototype = {

        space: null,

        create : function() {
            this.text = game.add.text(32, 32, 'Game over\n\nPress spacebar to begin at Level 1', { fill: '#ffffff'});
            this.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        },
        update : function() {
            if (this.space.isDown)
            {
                game.state.start('level1', true, false);
            }
        }
    };

    function isInArray(array, search)
    {
        return array.indexOf(search) >= 0;
    }

    game.state.add('boot', ConnectedWorlds.boot);
    game.state.add('preloader', ConnectedWorlds.preloader);
    game.state.add('mainmenu', ConnectedWorlds.mainmenu);
    game.state.add('level1', ConnectedWorlds.level1);
    game.state.add('gameover', ConnectedWorlds.gameover);
    game.state.start('boot');

}());