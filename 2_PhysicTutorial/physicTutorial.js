/**
 * Created by macfly on 11/04/2015.
 */
var flagRotation = false;
var flagClickEvent = false;
var game = new Phaser.Game(640, 960,Phaser.AUTO,'canvas');
game.transparent = false;

var gameState = {

};

gameState.load = function(){};
gameState.load.prototype = {
    preload: function(){
        this.game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
        this.game.stage.scale.setShowAll();
        window.addEventListener('resize', function () {
            this.game.stage.scale.refresh();
        });
        this.game.stage.scale.refresh();

        //load sprites
        this.game.load.image('background',prefixPathSrc+'assets/img/background.png');
        this.game.load.image('title',prefixPathSrc+'assets/img/flappy.png');
        this.game.load.image('title_get_ready',prefixPathSrc+'assets/img/ready.png');
        this.game.load.image('ground',prefixPathSrc+'assets/img/ground.png');
        this.game.load.atlasJSONHash('bird',prefixPathSrc+'assets/img/bird.png',prefixPathSrc+'assets/data/bird.json');
    },
    create: function () {
        game.state.start('main');
    }
};

gameState.main = function(){};
gameState.main.prototype = {
    create:function(){

        this.background = this.game.add.sprite(0, 0, 'background');
        this.background.width = this.game.width;
        this.background.height = this.game.height;

        this.title = this.game.add.sprite(0, 0, 'title');
        this.title.x = (this.game.width - this.title.width)/2;
        this.title.y = 50;

        this.title_ready = this.game.add.sprite(0, 0, 'title_get_ready');
        this.title_ready.x = (this.game.width - this.title_ready.width)/2;
        this.title_ready.y = 250;

        this.ground = this.game.add.sprite(0, 0,'ground');
        this.ground.x = 0;
        this.ground.y = this.game.height-this.ground.height;
        this.ground.body.velocity.x = -200;
        this.ground.body.immovable = true;

        this.bird = this.game.add.sprite(200,0,'bird');
        this.bird.width = this.bird.width / 6.5;
        this.bird.height = this.bird.height / 6.5;
        this.bird.y = (this.game.height - this.bird.height)/2;
        this.bird.anchor.setTo(0.5, 0.5);
        this.bird.animations.add('fly');
        this.bird.animations.play('fly', 8, true);

        this.tweenFlap = this.game.add.tween(this.bird);
        this.tweenFlap.to({ y: this.bird.y + 20}, 400, Phaser.Easing.Quadratic.InOut, true, 0, 10000000000, true);

        // Au click, on appelle la fonction "start()"
        if (flagClickEvent)
            this.game.input.onTap.add(this.start, this);

    },
    update:function(){
        if(this.ground.x + this.ground.width / 2 <= 0) {
            this.ground.x = 0;
        }

        // Si l'oiseau touche le sol
        this.game.physics.overlap(this.bird, this.ground, this.colisionDetected, null, this);

        if(this.bird.body.velocity.y > 0 && this.birdInJump) {
            this.birdInJump = false;
            if(this.tweenJump != null)
                this.tweenJump.stop();

            this.tweenFall = this.game.add.tween(this.bird);
            this.tweenFall.to({rotation: Math.PI / 2}, 300, Phaser.Easing.Quadratic.In, true, 200, 0, true);

            var self = this;
            // Lorsque l'animation de rotation "tweenFall" commence
            this.tweenFall.onStart.add(function() {
                // On stop l'animation des battements d'ailes
                self.bird.animations.stop('fly');
                self.bird.animations.frame = 1;
            });
        }
    },
    colisionDetected: function () {
        this.bird.body.enable = false;
        this.bird.body.velocity.y = 0;
        this.bird.body.gravity.y = 0;
        //this.bird.y = this.ground.y - this.bird.height/2;
    },
    start:function(){
        this.game.input.onTap.removeAll();
        this.game.input.onDown.add(this.jump, this);

        this.title.visible = false;
        this.title_ready.visible = false;
        // Gravité de l'oiseau
        //this.bird.body.gravity.y = 2000;
        // Premier saut
        //this.bird.body.velocity.y = -600;
        this.tweenFlap.stop();
        //this.bird.animations.stop('fly');
        // Pour la rendre plus rapide
        //this.bird.animations.play('fly', 15, true);
    },
    render:function(){

    },
    jump: function () {

        if (!game.input.activePointer.withinGame)
            return;

        if(this.bird.y >= 0){
            this.bird.body.velocity.y = -600;

            if (flagRotation){
                if(this.tweenFall != null)
                    this.tweenFall.stop();

                this.tweenJump = game.add.tween(this.bird);
                this.tweenJump.to({rotation: -Math.PI / 8}, 70, Phaser.Easing.Quadratic.In, true, 0, 0, true);
                this.birdInJump = true;
                this.bird.animations.play('fly');
                this.bird.animations.frame = 0;
            }
        }
    },
    restartGame: function () {
        game.state.start(game.state.current);
    },
    toggleGravity: function (gravity) {

        if (gravity === undefined){
            gravity = 2000;
        }

        if (this.bird.body.gravity.y === 0){
            this.tweenFlap.stop();
            this.bird.body.gravity.y = gravity;
        }
        else{
            //this.tweenFlap.start();
            this.bird.body.gravity.y = 0;
        }
    },
    setVelocity: function (velocity) {

        if (velocity === undefined){
            velocity = -600;
        }

        this.bird.body.velocity.y = velocity;

    },
    toggleRotation: function () {
        if (!flagRotation){
            this.game.input.onDown.removeAll();
        }
        else{
            this.game.input.onDown.add(this.jump, this);
        }

        flagRotation = !flagRotation;
    },
    toggleCollision: function () {
        this.game.physics.overlap(this.bird, this.ground, this.colisionDetected, null, this);
    },
    toggleClickEvent: function () {
        flagClickEvent = !flagClickEvent;
        this.restartGame();
    }
};

game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
game.state.start('load');