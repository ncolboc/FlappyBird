/**
 * Created by macfly on 11/04/2015.
 */

var showSpriteScore = false;
var enableSound = false;
var enableGameOver = false;
var bestScore = 0;
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

        this.game.load.image('pipe', prefixPathSrc+'assets/img/pipe.png');
        this.game.load.image('pipeEndTop', prefixPathSrc+'assets/img/pipe-end-top.png');
        this.game.load.image('pipeEndBottom', prefixPathSrc+'assets/img/pipe-end-bottom.png');

        this.game.load.atlasJSONHash('numbers',  prefixPathSrc+'assets/img/numbers.png', prefixPathSrc+'assets/data/numbers.json');

        this.game.load.image('gameOver', prefixPathSrc+'assets/img/game-over.png');
        this.game.load.image('panelScore', prefixPathSrc+'assets/img/panel-score.png');
        this.game.load.image('btnPlay', prefixPathSrc+'assets/img/button-play.png');

        /**** AUDIO *****/

            // Quand l'oiseau touche le sol ou un tuyau
        this.game.load.audio('hit', [prefixPathSrc+'assets/snd/sfx_hit.ogg']);

        // Quand l'oiseau tombe après touché un tuyau
        this.game.load.audio('fall', [prefixPathSrc+'assets/snd/sfx_die.ogg']);

        // Quand l'oiseau vole
        this.game.load.audio('flap', [prefixPathSrc+'assets/snd/sfx_wing.ogg']);

        // Quand l'oiseau dépasse un tuyau
        this.game.load.audio('point', [prefixPathSrc+'assets/snd/sfx_point.ogg']);

        // Quand on clique sur le bouton play
        this.game.load.audio('btn', [prefixPathSrc+'assets/snd/sfx_swooshing.ogg']);

        this.game.sound.mute = true;
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

        this.pipes = game.add.group();
        this.pipes.createMultiple(40, 'pipe');
        this.pipesEndTop = game.add.group();
        this.pipesEndTop.createMultiple(4, 'pipeEndTop');
        this.pipesEndBottom = game.add.group();
        this.pipesEndBottom.createMultiple(4, 'pipeEndBottom');

        this.bird = this.game.add.sprite(200,0,'bird');
        this.bird.width = this.bird.width / 6.5;
        this.bird.height = this.bird.height / 6.5;
        this.bird.y = (this.game.height - this.bird.height)/2;
        this.bird.anchor.setTo(0.5, 0.5);
        this.bird.animations.add('fly');
        this.bird.animations.play('fly', 8, true);

        this.tweenFlap = this.game.add.tween(this.bird);
        this.tweenFlap.to({ y: this.bird.y + 20}, 400, Phaser.Easing.Quadratic.InOut, true, 0, 10000000000, true);

        this.panelScore = this.game.add.sprite(this.game.width / 2, 100, 'panelScore');
        this.panelScore.x = (this.game.width - this.panelScore.width)/2;
        this.panelScore.y = this.game.height;

        this.btnPlay = this.game.add.sprite(this.game.width / 2, 550, 'btnPlay');
        this.btnPlay.x -= this.btnPlay.width / 2;
        this.btnPlay.alpha = 0;
        this.btnPlay.inputEnabled = true;

        this.gameOver = this.game.add.sprite(this.game.width / 2, 150, 'gameOver');
        this.gameOver.x -= this.gameOver.width / 2;
        this.gameOver.alpha = 0;

        // Au click, on appelle la fonction "start()"
        this.game.input.onTap.add(this.start, this);

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

        this.pipesToCheckForScore = new Array();

        //scoring
        this.score = 0;

        /*
        this.spritesScore = new Array();
        var spriteScore = this.game.add.sprite(this.game.width / 2, 100, 'numbers');
        this.spritesScore.push(spriteScore);
        this.spritesScore[0].animations.add('number');
        //this.spritesScore[0].play('number', 8, true);
        this.spritesScore[0].animations.frame = 0;
        this.spritesScore[0].scale.x =
        this.spritesScore[0].x -= this.spritesScore[0].width / 2;
        */

        //this.spritesScore[0].visible = false;

        //sound
        this.soundHit = game.add.audio('hit', 1);
        this.soundFall = game.add.audio('fall', 1);
        this.soundPoint = game.add.audio('point', 1);
        this.soundFlap = game.add.audio('flap', 1);
        this.soundBtn = game.add.audio('btn', 1);

        this.birdHitPipe = false;
        this.birdHitGround = false;

        this.arrayPipes = new Array();

    },
    update:function(){
        if(this.ground.x + this.ground.width / 2 <= 0) {
            this.ground.x = 0;
        }



        // Si l'oiseau touche le sol
        this.game.physics.overlap(this.bird, this.ground, this.hitGround, null, this);
        this.game.physics.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        this.game.physics.overlap(this.bird, this.pipesEndTop, this.hitPipe, null, this);
        this.game.physics.overlap(this.bird, this.pipesEndBottom, this.hitPipe, null, this);

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

        this.bird.body.translate(-this.bird.width / 2, -this.bird.height / 2);
        this.bird.body.polygon.rotate(this.bird.rotation - this.birdRotatePolygon);
        this.birdRotatePolygon += this.bird.rotation - this.birdRotatePolygon;
        this.bird.body.translate(this.bird.width / 2, this.bird.height / 2);

        //update scoring
        if(this.pipesToCheckForScore.length != 0 && this.pipesToCheckForScore[0].x + this.pipesToCheckForScore[0].width / 2 < this.bird.center.x) {
            this.pipesToCheckForScore.splice(0, 1);
            this.score++;

            this.soundPoint.play();

            for(var j = 0; j < this.spritesScore.length; j++)
                this.spritesScore[j].kill();
            this.spritesScore = new Array();


            this.spritesScore = this.writeScore(this.spritesScore,this.score,this.game.width / 2,100,1);

        }

        var index = -1;


        for(var i = 0; i < this.arrayPipes.length; i++) {
            // si les bouts de tuyau du tuyau i se trouvent en dehors de la fenêtre (à gauche)
            if(this.arrayPipes[i] != null && this.arrayPipes[i][0].x + this.arrayPipes[i][0].width < 0) {
                console.log('remove pipe',i);
                index = i;
                // on les supprime
                for(var j = 0; j < this.arrayPipes[i].length; j++) {
                    this.arrayPipes[i][j].kill();
                }

                //this.arrayPipes[i] = null;
            }
        }


        if (index !== -1){
            console.log('splice',index);
            this.arrayPipes.splice(index,1);
        }

    },
    writeScore: function (spritesScore,score,x,y,scale,alpha) {

        if (spritesScore){
            for(var j = 0; j < spritesScore.length; j++)
                spritesScore[j].kill();
        }

        spritesScore = new Array();

        var digits = score.toString().split('');
        var widthNumbers = 0;

        for(var i = 0; i < digits.length; i++) {
            var spriteScore = this.game.add.sprite(widthNumbers, y, 'numbers');
            spriteScore.anchor.setTo(0.5, 0.5);
            spriteScore.scale.x = scale;
            spriteScore.scale.y = scale;

            if (alpha !== undefined)
                spriteScore.alpha = alpha;

            spriteScore.animations.add('number');
            spriteScore.animations.frame = +digits[i];
            spritesScore.push(spriteScore);
            widthNumbers += spriteScore.width;
        }

        for(var i = 0; i < spritesScore.length; i++) {
            spritesScore[i].x += x - widthNumbers / 2 + (spriteScore.width/2);
            spritesScore[i].visible = showSpriteScore;
        }

        return spritesScore;
    },
    start:function(){

        this.game.input.onTap.removeAll();
        this.game.input.onDown.add(this.jump, this);
        this.pipeGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.7, this.generatePipes, this);

        this.spritesScore = this.writeScore(this.spritesScore,this.score,this.game.width / 2,100,1,1);

        this.title.visible = false;
        this.title_ready.visible = false;

        if (showSpriteScore)
            this.spritesScore[0].visible = true;

        // Gravité de l'oiseau
        this.bird.body.gravity.y = 2000;
        // Premier saut
        this.soundFlap.play();
        this.bird.body.velocity.y = -600;
        this.bird.rotation = -Math.PI / 8;
        this.tweenFlap.stop();
        this.bird.animations.stop('fly');
        // Pour la rendre plus rapide
        this.bird.animations.play('fly', 15, true);

        this.bird.body.translate(-this.bird.width/2, -this.bird.height/2);
        this.bird.body.polygon.rotate(-Math.PI / 8);
        this.birdRotatePolygon = -Math.PI / 8;
        this.bird.body.translate(this.bird.width/2, this.bird.height/2);

    },
    render:function(){
    },
    jump: function () {

        if (!game.input.activePointer.withinGame)
            return;

        if(this.bird.y >= 0){

            this.soundFlap.play();
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

        var pipe = this.pipes.getFirstDead();
        pipe.reset(x, y);
        pipe.body.velocity.x = -200;
        pipe.body.immovable = true;
        //pipe.outOfBoundsKill = true;

        if (i == 0){

            this.pipesToCheckForScore.push(pipe);
            this.arrayPipes.push(new Array());
            console.log('create pipe ',this.arrayPipes.length);
            this.arrayPipes[this.arrayPipes.length - 1].push(pipe);

        }
        else
            this.arrayPipes[this.arrayPipes.length - 1].push(pipe);

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
            //pipeEnd.outOfBoundsKill = true;

            console.log(this.arrayPipes.length);
            this.arrayPipes[this.arrayPipes.length - 1].push(pipeEnd);
        }
    },
    hitGround: function () {
        if (!this.birdHitGround){

            this.bird.body.gravity.y = 0;
            this.bird.body.velocity.y = 0;

            if(!this.birdHitPipe)
                this.soundHit.play();

            //remove score
            for(var j = 0; j < this.spritesScore.length; j++)
                this.spritesScore[j].kill();
            this.spritesScore = new Array();

            //add gameover title
            if (enableGameOver){

                this.game.add.tween(this.gameOver).to( { alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 0, 0, true);
                this.game.add.tween(this.btnPlay).to( { alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 0, 0, true);
                this.game.add.tween(this.panelScore).to( { y: 300 }, 300, Phaser.Easing.Linear.None, true, 0, 0, true);

                var self = this;

                this.btnPlay.events.onInputDown.add(function() {
                    self.btnPlay.y += 10;
                });
                this.btnPlay.events.onInputUp.add(function() {
                    self.btnPlay.y -= 10;
                    self.soundBtn.play();
                    self.restartGame();
                });



                this.spritesScore = this.writeScore(this.spritesScore,this.score,this.game.width-150,390,0.5,0);
                for (var i=0;i<this.spritesScore.length;i++)
                    this.game.add.tween(this.spritesScore[i]).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);

                if (this.score>bestScore)
                    bestScore = this.score;

                this.spritesBestScore = this.writeScore(this.spritesBestScore,bestScore,this.game.width-150,475,0.5,0);
                for (var i=0;i<this.spritesBestScore.length;i++)
                    this.game.add.tween(this.spritesBestScore[i]).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);
            }

            this.birdHitGround = true;
            this.gameFinish();
        }
    },
    hitPipe: function () {
        if(!this.birdHitPipe) {
            this.soundHit.play();
            var self = this;
            setTimeout(function(){self.soundFall.play();}, 300);
            this.birdHitPipe = true;
            this.gameFinish();
        }

    },
    gameFinish:function(){

        this.ground.body.velocity.x = 0;
        for(var i = 0; i < this.arrayPipes.length; i++)
            for(var j = 0; j < this.arrayPipes[i].length; j++)
                this.arrayPipes[i][j].body.velocity.x = 0;

        if (this.pipeGenerator)
            this.game.time.events.remove(this.pipeGenerator);
        this.game.input.onDown.removeAll();

    },
    restartGame: function () {
        if (this.pipeGenerator)
            this.game.time.events.remove(this.pipeGenerator);
        game.state.start(game.state.current);
    },
    pauseGame: function () {
        this.game.paused = true;
    },
    toggleScore: function () {
        showSpriteScore = !showSpriteScore;
        this.restartGame();
    },
    enableSound : function () {
        enableSound = !enableSound;
        game.sound.mute = !enableSound;
        this.restartGame();
    },
    enableGameOverScreen: function () {
        enableGameOver = !enableGameOver;
        this.restartGame();
    }

};

game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
game.state.start('load');