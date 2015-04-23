/**
 * Created by macfly on 11/04/2015.
 */
var flagGeneratePipes = false;
var flagCollidePolygon = false;
var flagShowCollideBox = false;
var game = new Phaser.Game(640, 960,Phaser.CANVAS,'canvas');
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

        this.game.load.image('pipe', prefixPathSrc+'assets/img/pipe.png');
        this.game.load.image('pipeEndTop', prefixPathSrc+'assets/img/pipe-end-top.png');
        this.game.load.image('pipeEndBottom', prefixPathSrc+'assets/img/pipe-end-bottom.png');

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

        this.pipes = game.add.group();
        this.pipes.createMultiple(40, 'pipe');
        this.pipesEndTop = game.add.group();
        this.pipesEndTop.createMultiple(4, 'pipeEndTop');
        this.pipesEndBottom = game.add.group();
        this.pipesEndBottom.createMultiple(4, 'pipeEndBottom');

        // Au click, on appelle la fonction "start()"
        if (flagGeneratePipes)
            this.game.input.onTap.add(this.start, this);

        if (flagCollidePolygon){
            this.bird.body.setPolygon(	/* x = */ 39,/* y = */ 129,
                127,42,
                188,0,
                365,0,
                425,105,
                436,176,
                463,182,
                495,219,
                430,315,
                285,345,
                152,341,
                6,228 );
            // Rotation du polygone de l'oiseau
            this.birdRotatePolygon = 0;
        }


    },
    update:function(){
        if(this.ground.x + this.ground.width / 2 <= 0) {
            this.ground.x = 0;
        }



        // Si l'oiseau touche le sol
        this.game.physics.overlap(this.bird, this.ground, this.pauseGame, null, this);
        if (flagShowCollideBox){

            this.game.physics.overlap(this.bird, this.pipes, this.pauseGame, null, this);
            this.game.physics.overlap(this.bird, this.pipesEndTop, this.pauseGame, null, this);
            this.game.physics.overlap(this.bird, this.pipesEndBottom, this.pauseGame, null, this);
        }

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

        if (flagCollidePolygon) {
            this.bird.body.translate(-this.bird.width / 2, -this.bird.height / 2);
            this.bird.body.polygon.rotate(this.bird.rotation - this.birdRotatePolygon);
            this.birdRotatePolygon += this.bird.rotation - this.birdRotatePolygon;
            this.bird.body.translate(this.bird.width / 2, this.bird.height / 2);
        }
    },
    start:function(){

        this.game.input.onTap.removeAll();
        this.game.input.onDown.add(this.jump, this);
        this.pipeGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.7, this.generatePipes, this);

        this.title.visible = false;
        this.title_ready.visible = false;
        // Gravité de l'oiseau
        this.bird.body.gravity.y = 2000;
        // Premier saut
        this.bird.body.velocity.y = -600;
        this.bird.rotation = -Math.PI / 8;
        this.tweenFlap.stop();
        this.bird.animations.stop('fly');
        // Pour la rendre plus rapide
        this.bird.animations.play('fly', 15, true);

        if (flagCollidePolygon) {
            this.bird.body.translate(-this.bird.width/2, -this.bird.height/2);
            this.bird.body.polygon.rotate(-Math.PI / 8);
            this.birdRotatePolygon = -Math.PI / 8;
            this.bird.body.translate(this.bird.width/2, this.bird.height/2);
        }

    },
    render:function(){
        if (flagShowCollideBox)
            this.game.debug.renderPhysicsBody(this.bird.body);
    },
    jump: function () {

        if (!game.input.activePointer.withinGame)
            return;

        if(this.bird.y >= 0){
            this.bird.body.velocity.y = -600;

            if(this.tweenFall != null)
                this.tweenFall.stop();

            this.tweenJump = game.add.tween(this.bird);
            this.tweenJump.to({rotation: -Math.PI / 8}, 70, Phaser.Easing.Quadratic.In, true, 0, 0, true);
            this.birdInJump = true;
            this.bird.animations.play('fly');
            this.bird.animations.frame = 0;
        }
    },
    generatePipes: function () {
        var hole = Math.round(Math.random() * 4) + 2;

        for (var i = 0; i <= 10; i++){
            if (i > hole + 1 || i < hole - 1)
                this.addPieceOfPipe(this.game.world.width, this.game.world.height - (this.ground.height+85) - (i * 85), i, hole);
        }
    },
    addPieceOfPipe: function (x, y, i, hole) {

        if (i == hole + 2 || i == hole - 2){

            var yDiff = 15;
            var pipeEnd;

            if(i == hole + 2){
                pipeEnd = this.pipesEndTop.getFirstDead();
                pipeEnd.reset(x-4, y+yDiff);
            }
            else if ( i == hole - 2) {
                pipeEnd = this.pipesEndBottom.getFirstDead();
                pipeEnd.reset(x-4,y-yDiff);
            }

            pipeEnd.body.velocity.x = -200;
            pipeEnd.body.immovable = true;
            pipeEnd.outOfBoundsKill = true;
        }

        var pipe = this.pipes.getFirstDead();
        pipe.reset(x, y);
        pipe.body.velocity.x = -200;
        pipe.body.immovable = true;
        pipe.outOfBoundsKill = true;
    },
    restartGame: function () {
        if (this.pipeGenerator)
            this.game.time.events.remove(this.pipeGenerator);
        game.state.start(game.state.current);
        game.state.start(game.state.current);
    },
    pauseGame: function () {
        this.game.paused = true;
    },
    addPipe:function(){
        this.pipe = this.game.add.sprite(0, 0, 'pipe');
        this.pipe.y = 100;
        this.pipe.inputEnabled = true;
        this.pipe.input.enableDrag(true);
    },
    addTopPipe: function () {
        this.pipeEndTop = this.game.add.sprite(0, 0, 'pipeEndTop');
        this.pipeEndTop.y = 200;
        this.pipeEndTop.inputEnabled = true;
        this.pipeEndTop.input.enableDrag(true);
    },
    addBottomPipe: function () {
        this.pipeEndBottom = this.game.add.sprite(0, 0, 'pipeEndBottom');
        this.pipeEndBottom.y = 300;
        this.pipeEndBottom.inputEnabled = true;
        this.pipeEndBottom.input.enableDrag(true);
    },
    togglePipeGeneration: function () {
        flagGeneratePipes = !flagGeneratePipes;
        this.restartGame();
    },
    toggleCollideBox: function () {
        flagShowCollideBox = !flagShowCollideBox;
    },
    toggleCollidePolygon: function () {
        flagCollidePolygon = !flagCollidePolygon;
        this.restartGame();
    }
};

game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
game.state.start('load');