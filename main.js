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

        this.bird = this.game.add.sprite(200,0,'bird');
        this.bird.width = this.bird.width / 6.5;
        this.bird.height = this.bird.height / 6.5;
        this.bird.y = (this.game.height - this.bird.height)/2;
        this.bird.anchor.setTo(0.5, 0.5);
        this.bird.animations.add('fly');
        this.bird.animations.play('fly', 8, true);

        this.tweenFlap = this.game.add.tween(this.bird);
        this.tweenFlap.to({ y: this.bird.y + 20}, 400, Phaser.Easing.Quadratic.InOut, true, 0, 10000000000, true);
    },
    update:function(){

    }
};

game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
game.state.start('load');