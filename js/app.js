/**
 * Created by William on 23/08/2014.
 */
(function () {

    var level = 1;
    var maxlevels = 3;

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

            // imagary
            game.load.image('starfield', 'assets/starField.jpg');
            game.load.spritesheet('pSpin','assets/planetspritesheet.png', 100, 100);
            game.load.image('ship', 'assets/ship.png');
            game.load.image('enemy', 'assets/enemy.png');
            game.load.image('rocket', 'assets/rocket.png');
            game.load.image('smoke', 'assets/smoke.png');
            game.load.image('explosion', 'assets/explosion.png');

            // level data
            game.load.text('level1', 'assets/level1.json');
            game.load.text('level2', 'assets/level2.json');
            game.load.text('level3', 'assets/level3.json');

            // audio
            game.load.audio('rocketlaunch', 'assets/rocketlaunch.wav');
            game.load.audio('collect', 'assets/collect.wav');
            game.load.audio('hit', 'assets/hit.wav');
            game.load.audio('mainlevel', 'assets/mainlevelmusic.mp3');
            game.load.audio('intro', 'assets/intro.mp3');


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

        enterkey: null,
        text : null,
        levelmusic: null,

        preload : function() {

        },
        create : function() {
            this.levelmusic = game.add.audio('intro', 0.5, true);
            this.levelmusic.play();
            this.text = game.add.text(32, 32, 'Super awesome space Game\n\nConnected Worlds\n\nPress ENTER to start', { fill: '#ffffff'});
            this.enterkey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        },
        update : function() {
            if (this.enterkey.isDown)
                this.moveon();

        },

        moveon : function() {
            this.levelmusic.stop();
            game.input.keyboard.onDownCallback = null; // remove the callback
            game.state.start('level', true, false); // start the game
        }
    };

    // Level1
    ConnectedWorlds.level = function(){};
    ConnectedWorlds.level.prototype = {

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
        worldHeight: 600,
        collected: [],
        playerFireTimer: 0,
        enemyFireTimer: 0,
        spaceKey: null,
        leveldata : null,
        playertrailemitter: null,
        rocketlaunchaudio: null,
        powerupaudio: null,
        hitaudio: null,
        levelmusic: null,


        preload: function() {

        },

        create: function() {


            if (level == 1) {
                this.leveldata = JSON.parse(game.cache.getText('level1'));
            }

            game.physics.startSystem(Phaser.Physics.ARCADE);

            this.rocketlaunchaudio = game.add.audio('rocketlaunch');
            this.powerupaudio = game.add.audio('collect');
            this.hitaudio = game.add.audio('hit');
            this.levelmusic = game.add.audio('mainlevel', 0.5, true);
            this.levelmusic.play();


            game.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

            //game.add.sprite(0, 0, 'starfield');
            this.backdrop = game.add.tileSprite(0, 0, 800, 600, 'starfield');
            this.backdrop.fixedToCamera = true;

            this.loadplanets();

            this.player = game.add.sprite(150, 300, 'ship');
            this.player.anchor.setTo(0.5, 0.5);
            this.player.enableBody = true;
            game.physics.arcade.enable(this.player);

            game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

            this.loadenemys();

            this.playerRockets = game.add.group();
            this.playerRockets.enableBody = true;
            this.playerRockets.physicsBodyType = Phaser.Physics.ARCADE;
            this.playerRockets.createMultiple(20, 'rocket');
            this.playerRockets.setAll('anchor.x', 0.5);
            this.playerRockets.setAll('anchor.y', 0.5);
            this.playerRockets.setAll('outOfBoundsKill', true);
            this.playerRockets.setAll('checkWorldBounds', true);

            this.enemieRockets = game.add.group();
            this.enemieRockets.enableBody = true;
            this.enemieRockets.physicsBodyType = Phaser.Physics.ARCADE;
            this.enemieRockets.createMultiple(20, 'rocket');
            this.enemieRockets.setAll('anchor.x', 0.5);
            this.enemieRockets.setAll('scale.x', -1); // reverse them
            this.enemieRockets.setAll('anchor.y', 0.5);
            this.enemieRockets.setAll('outOfBoundsKill', true);
            this.enemieRockets.setAll('checkWorldBounds', true);

            this.playertrailemitter = game.add.emitter
            (this.player.body.x,
            this.player.body.y, 5000);
            this.playertrailemitter.makeParticles('smoke');
            this.playertrailemitter.bringToTop = true;
            this.playertrailemitter.setRotation(20, 40);
            this.playertrailemitter.setAlpha(0.1, 0.3, 400, Phaser.Easing.Quintic.Out);
            this.playertrailemitter.setScale(0.1, 0.7, 0.1, 0.7, 5000, Phaser.Easing.Quintic.Out);
            this.playertrailemitter.setXSpeed(-100, -300);
            this.playertrailemitter.gravity = -100;

            this.playertrailemitter.start(false, 500, 30);

            this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

            this.fuelText = game.add.text(10, 10, 'Fuel: ' + this.fuel + '', {fill : '#ffffff'});
            this.fuelText.fixedToCamera = true;
            //game.add.tween(this.fuelText.cameraOffset).to({ y: 500 }, 2000, Phaser.Easing.Bounce.Out, true, 0, 1000, true);

            this.cursors = game.input.keyboard.createCursorKeys();
        },
        update: function() {

            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;

            this.playertrailemitter.on = false;
            this.playertrailemitter.x = this.player.body.center.x - 20;
            this.playertrailemitter.y = this.player.body.center.y ;

            if (this.cursors.up.isDown)
            {
                //game.camera.y -= 4;
                this.player.body.velocity.y -= this.movespeed;
                this.fuel -= 0.1;
                this.playertrailemitter.on = true;
            } else if (this.cursors.down.isDown)
            {
                //game.camera.y += 4;
                this.player.body.velocity.y += this.movespeed;
                this.playertrailemitter.on = true;
                this.fuel -= 0.1;
            }

            if (this.cursors.right.isDown)
            {
                //game.camera.x += 4;
                this.backdrop.autoScroll(-5, 0);
                this.player.body.velocity.x += this.movespeed;
                this.playertrailemitter.on = true;
                this.fuel -= 0.2;
            }else {
                this.backdrop.stopScroll();
            }

            if (this.spaceKey.isDown)
            {
                this.fireRocket();
            }

            // Enemy launch
            if (game.time.now > this.enemyFireTimer)
            {
                this.enemyLaunch();
            }

            if (this.player.body.y < 0 || this.player.body.y > 600)
                this.fuel -= 10;

            game.physics.arcade.overlap(this.enemies, this.player, this.enemyHitsPlayer, null, this);
            game.physics.arcade.overlap(this.planets, this.player, this.planetEncounter, null, this);
            game.physics.arcade.overlap(this.playerRockets, this.enemies, this.hitanememy, null, this);
            game.physics.arcade.overlap(this.enemieRockets, this.player, this.playerhitbyenemyorrocket, null, this);

            if (this.fuel >= 0)
                this.fuelText.setText('Fuel: ' + this.fuel.toFixed(0)  + '');
            else
                this.fuelText.setText('Fuel: 0');

            if (this.fuel <= 0)
            {
                // reset
                this.fuel = 100;
                this.collected = [];
                this.levelmusic.stop();
                game.state.start('gameover', true, false); // game over screen
            }

            if (this.player.body.x > this.worldWidth)
            {
                this.nextlevel();
            }


        },

        loadenemys : function() {
            if (this.enemies)
                this.enemies.removeAll(true, true);
            this.enemies = game.add.group();
            this.enemies.enableBody = true;
            this.enemies.physicsBodyType = Phaser.Physics.arcade;

            for (var x = 0; x < this.leveldata.enemys.length; x++)
            {
                var e = this.enemies.create(this.leveldata.enemys[x].x,
                    this.leveldata.enemys[x].y, 'enemy');
                e.anchor.setTo(0.5, 0.5);
                // give them random movement
                game.add.tween(e).to({ y: Math.floor(Math.random() * 500) + 1 }, 5000 + Math.random()*3000, Phaser.Easing.Linear.None, true, 0, 1000, true);
            }
        },

        loadplanets : function() {
            if (this.planets)
                this.planets.removeAll(true, true); // empty the group

            this.collected = [];

            this.planets = game.add.group();
            this.planets.physicsBodyType = Phaser.Physics.ARCADE;
            this.planets.enableBody = true;

            var planetsarray = this.leveldata.planetsMAP;

            for (var i = 0; i < planetsarray.length; i++) {
                var p = this.planets.create(planetsarray[i].x, planetsarray[i].y, 'pSpin');
                //p.scale.setTo(0.25, 0.25);
                p.name = planetsarray[i].name;
                p.animations.add('spin');
                p.animations.play('spin', Math.floor(Math.random() * 10) + 1, true);
                //game.add.tween(p).to( { alpha: 0.8 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
            };
        },

        nextlevel: function () {
           // keep everything just reset
          this.levelmusic.stop();
          level ++;
          if (level == 2) {
              this.leveldata = JSON.parse(game.cache.getText('level2'));// level 2
              game.state.start('level', true, false);
          }
          else if (level == 3) {
              this.leveldata = JSON.parse(game.cache.getText('level3'));// level 2
              game.state.start('level', true, false);
          }
          else if (level > 3) {
              game.state.start('thanksforplaying', true, false); // todo change to thanks for playing
          }
        },
        render : function () {
            //game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
            //game.debug.body(this.player);
        },
        enemyHitsPlayer: function (player, enemy) {
            enemy.destroy();
            this.hitaudio.play();

            var t = game.add.text(player.position.x, player.position.y, '- ' + this.leveldata.enemyclash, { fill: '#C48923'});

            var tw = game.add.tween(t).to( { y: -1 }, 1000, Phaser.Easing.Cubic.Out, true, 0, false);
            tw.onComplete.add(function() {
                this.fuel -= this.leveldata.enemyclash;
                game.world.remove(t)
            }, this);


        },

        planetEncounter : function(player, planet) {
            if (!isInArray(this.collected, planet.name)) {
                this.powerupaudio.play();
                var t = game.add.text(planet.position.x, planet.position.y, '+ ' + this.leveldata.planet, { fill: '#ffffff'});

                var tw = game.add.tween(t).to( { y: -1 }, 1000, Phaser.Easing.Cubic.Out, true, 0, false);
                tw.onComplete.add(function() {
                    this.fuel += this.leveldata.planet;
                    game.world.remove(t);
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
                    this.playerFireTimer = game.time.now + 1000;
                    this.rocketlaunchaudio.play();
                    rocket.lifespan = 3000;
                }
            }
        },

        hitanememy : function(rocket, enemy) {
            rocket.kill();
            enemy.destroy();
            this.hitaudio.play();
            // todo play explosion
            var emitter = game.add.emitter(enemy.position.x, enemy.position.y, 100);
            emitter.makeParticles('explosion');
            emitter.killOnComplete = true;
            emitter.start(true, 2000, null, 10);

            var t = game.add.text(enemy.position.x, enemy.position.y, '+ ' + this.leveldata.enemyhit, { fill: '#ffffff'});

            var tw = game.add.tween(t).to( { y: -1 }, 1000, Phaser.Easing.Cubic.Out, true, 0, false);
            tw.onComplete.add(function() {
                this.fuel += this.leveldata.enemyhit;
                game.world.remove(t)
            }, this);
        },

        playerhitbyenemyorrocket : function(player, rocket)
        {
            rocket.kill();
            this.hitaudio.play();
            var emitter = game.add.emitter(player.position.x, player.position.y, 50);
            emitter.makeParticles('explosion');
            emitter.killOnComplete = true;
            emitter.start(true, 2000, null, 10);

            var t = game.add.text(player.position.x, player.position.y, '+ ' + this.leveldata.playerhit, { fill: '#C48923'});

            var tw = game.add.tween(t).to( { y: -1 }, 1000, Phaser.Easing.Cubic.Out, true, 0, false);
            tw.onComplete.add(function() {
                this.fuel -= this.leveldata.playerhit;
                game.world.remove(t)
            }, this);

        },

        enemyLaunch : function() {
            // if within sight only
            // and player x is not greater than enemy x i.e gone past


            this.enemies.forEach(function (en){
                if ((this.player.body.position.x > en.position.x) === false)
                {
                    var dis = Math.abs(this.player.position.x - en.position.x);
                    if (dis < 300)
                    {
                        var rk = this.enemieRockets.getFirstExists(false);

                        if (rk)
                        {
                            rk.reset(en.position.x - 40, en.position.y);
                            rk.body.velocity.x = -200;
                            this.enemyFireTimer = game.time.now + 5000;
                        }
                    }
                }
            }, this)
        }

    };

    // Game Over
    ConnectedWorlds.gameover = function(){};
    ConnectedWorlds.gameover.prototype = {

        enter: null,

        create : function() {
            this.text = game.add.text(32, 32, 'You ran out of fuel its Game over\n\nPress ENTER to begin again at Level 1', { fill: '#ffffff'});
            this.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        },
        update : function() {
            if (this.enter.isDown)
            {
                level = 1;
                game.state.start('level', true, false);
            }
        }
    };

    // Game Over
    ConnectedWorlds.thanksforplaying = function(){};
    ConnectedWorlds.thanksforplaying.prototype = {

        enter: null,

        create : function() {
            this.text = game.add.text(32, 32, 'Connected Worlds - Ludum Dare 30 \n\nThat is it!\n\nThanks for playing\n\nPlease vote and comment\n\nyou can play again by hitting ENTER', { fill: '#ffffff'});
            this.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        },
        update : function() {
            if (this.enter.isDown)
            {
                level = 1;
                game.state.start('level', true, false);
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
    game.state.add('level', ConnectedWorlds.level);
    game.state.add('gameover', ConnectedWorlds.gameover);
    game.state.add('thanksforplaying', ConnectedWorlds.thanksforplaying);
    game.state.start('boot');

}());