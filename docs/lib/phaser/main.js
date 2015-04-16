/**
 * Created by macfly on 11/04/2015.
 */
var game = new Phaser.Game(640, 960,Phaser.AUTO,'canvas');
game.transparent = true;

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
        this.game.load.image('background','assets/img/background.png');
        this.game.load.image('title','assets/img/flappy.png');
        this.game.load.image('title_get_ready','assets/img/ready.png');
        this.game.load.image('ground','assets/img/ground2.png');
        this.game.load.atlasJSONHash('bird','assets/img/bird.png','assets/data/bird.json');
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

        this.ground = this.game.add.tileSprite(0, 0,200,100,'ground');
        this.ground.x = 0;
        this.ground.y = this.game.height-this.ground.height;
        //this.ground.body.velocity.x = -250;
        //this.ground.body.immovable = true;

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
        this.game.input.onTap.add(this.start, this);

    },
    update:function(){
        //if(this.ground.x + this.ground.width / 2 <= 0) {
        //    this.ground.x = 0;
        //}
        this.ground.tilePosition.x -= 2;
    },
    start:function(){

    },
    toggleBackground: function () {
        this.background.visible = !this.background.visible;
    }
};

game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
game.state.start('load');