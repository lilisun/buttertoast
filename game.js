/*
todo:
-radial spawning w/o wonkiness (??) --> deemed ok if this game is really hard.
-i mean how many pieces of toast can you eat anyway
-

sound http://freesound.org/people/FawfulGrox/sounds/103336/

notes from 9/13
    -rule of thumb for webgames is keep it under ~10 megabytes
    -make them not spawn right in the middle
    +spawn them radially
    -check butter collision? seems inconsistant. either the tip or the whole thing ?__?
        -make rounder toast.
    -different condiments????
        -NEW LEVELS !! two circles at once! hahaha haahahahaha
    -you can game the system by rubbing the keyboard
        -punish spam typers by making toast diappear w/o points if it's too early
    -if you save for web it'll be like 4x smaller memory-wise than if you just save as

*/

//  PHASER MODDING GAME
//  Original by Bennett Foddy, NYU Game Center, 2016
//  Based on Orisinal's 'Winterbells'
//  Modified by tim.

var game = new Phaser.Game(800,800, Phaser.AUTO, '', 
    { preload: preload, create: create, update: update, render: render });

var mode = 'start'; //'start','end', or 'game'
var menu; //the background, to fade stuff out
var startMenu; //the actual text that goes on the menus
var endMenu;

var DEBUG = false; //if you change this to true, it will show the collision boxes in the scene
var platforms; //the group we'll hold all the platforms in
var smiley; //the player sprite
var hat; //the player's hat sprite
var score; //this will just be an integer (whole number)
var scoreText;
var scoreDisplay; //the text object thingie
var cursors; //a container for accessing the cursor keys on the keyboard
var jumpAudio; //the sound when the player jumps
var numPlatforms=26;

//use this to randomize the order the letters are placed
var toastFrames = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
//after toasts are placed, use it to keep track of score.

var growingSpeed = 0.00075;
var radius; //current butter radius;

var latestLetterHit; //keeps track of the last letter hit by the growing smiley
 
var keys=[];

function preload() {

    //  Center the screen HORIZONTALLY and VERTICALLY on the web page
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    //  Refresh the game so it will apply the positioning indicated above (ie, scaled larger and centered)
    game.scale.refresh();

    //This forces the camera to always be at whole-pixel coordinates, which looks nicer
    game.renderer.renderSession.roundPixels = true; 

    //name, location, width, height
    game.load.spritesheet('playerSprite', 'assets/butter.png', 1024, 1024);
    game.load.spritesheet('hatSprite', 'assets/hat.png', 50, 50);
    game.load.spritesheet('platformSprite', 'assets/breads.png', 40, 42);
    game.load.audio('jumpSound', 'assets/bloop.wav');
    game.load.image('menubackground','assets/menub.png');
    game.load.image('menuStart','assets/menus.png');
    game.load.image('menuEnd','assets/menue.png');

    game.stage.backgroundColor = 0xf5bfc8; 
}

//  The create() function is called once, before anything else happens in the game.
//  It's mostly used for creating game objects and setting all the numbers to their starting values.
function create() {

    //  we use this function to enable input from the keys. 
    //  one for each keyboard key!
    cursors = game.input.keyboard.createCursorKeys();
    keys[0] = game.input.keyboard.addKey(Phaser.Keyboard.A);
    keys[1] = game.input.keyboard.addKey(Phaser.Keyboard.B);
    keys[2] = game.input.keyboard.addKey(Phaser.Keyboard.C);
    keys[3] = game.input.keyboard.addKey(Phaser.Keyboard.D);
    keys[4] = game.input.keyboard.addKey(Phaser.Keyboard.E);
    keys[5] = game.input.keyboard.addKey(Phaser.Keyboard.F);
    keys[6] = game.input.keyboard.addKey(Phaser.Keyboard.G);
    keys[7] = game.input.keyboard.addKey(Phaser.Keyboard.H);
    keys[8] = game.input.keyboard.addKey(Phaser.Keyboard.I);
    keys[9] = game.input.keyboard.addKey(Phaser.Keyboard.J);
    keys[10]= game.input.keyboard.addKey(Phaser.Keyboard.K);
    keys[11]= game.input.keyboard.addKey(Phaser.Keyboard.L);
    keys[12]= game.input.keyboard.addKey(Phaser.Keyboard.M);
    keys[13]= game.input.keyboard.addKey(Phaser.Keyboard.N);
    keys[14]= game.input.keyboard.addKey(Phaser.Keyboard.O);
    keys[15]= game.input.keyboard.addKey(Phaser.Keyboard.P);
    keys[16]= game.input.keyboard.addKey(Phaser.Keyboard.Q);
    keys[17]= game.input.keyboard.addKey(Phaser.Keyboard.R);
    keys[18]= game.input.keyboard.addKey(Phaser.Keyboard.S);
    keys[19]= game.input.keyboard.addKey(Phaser.Keyboard.T);
    keys[20]= game.input.keyboard.addKey(Phaser.Keyboard.U);
    keys[21]= game.input.keyboard.addKey(Phaser.Keyboard.V);
    keys[22]= game.input.keyboard.addKey(Phaser.Keyboard.W);
    keys[23]= game.input.keyboard.addKey(Phaser.Keyboard.X);
    keys[24]= game.input.keyboard.addKey(Phaser.Keyboard.Y);
    keys[25]= game.input.keyboard.addKey(Phaser.Keyboard.Z);

    //  we start up the simple Arcade physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);  

    //  add the player, which is a Sprite object. We give it a position, 
    //  and the name of the image to look up from the cache (which was set in preload)
    smiley = game.add.sprite(game.width*0.5, game.height*0.5, 'playerSprite');
    //center it
    smiley.anchor.setTo(0.5,0.5);

    //  switch on physics for the player. This adds an object of type 'Body' to the sprite
    // game.physics.arcade.enable(smiley);

    //make circle collider. parameters: radius, offsetx, offsety
    // smiley.body.immovable = true;

    Phaser.ArrayUtils.shuffle(toastFrames);

    //  we'll create an empty group to hold all the platforms.
    //  this will make it easy to do things to all the platforms at once
    platforms = game.add.group();

    //  This will enable arcade physics for any object that is created in this group, 
    //  so we can run collisions on the whole group at once.
    platforms.enableBody = true; 

    //  Now we're ready to make the platforms, using a loop where i will go from 0 to numPlatforms
    for (var i=0;i<numPlatforms; i++){

        //  create a new platform, storing it in a temporary local variable 'newPlatform' 
        var newPlatform = platforms.create(0,0,'platformSprite');

        //  by default, the position of a sprite is its top-left corner, 
        //  but in this case I want to center the platform
        //  around its x-position, so I move its 'anchor' to the middle of the sprite
        newPlatform.anchor.setTo(0.5,0.5);

        //if we don't set the platform's body to 'immovable' the player will push it when she touches it
        newPlatform.body.immovable = true; 

        //make circle collider. parameters: radius, offsetx, offsety
        //these are arbitrary numbers that depend on the size of the sprite right now
        newPlatform.body.setCircle(18,2,4);

        newPlatform.frame = toastFrames[i]; //these are already randomized, called shuffle earlier

        newPlatform.body.checkCollision.down = true;
        newPlatform.body.checkCollision.up = true; 
        newPlatform.body.checkCollision.left = true;
        newPlatform.body.checkCollision.right = true;

        newPlatform.alreadyBouncedOn = false;

    }

    menu = game.add.tileSprite(0, 0, 1024, 1024, 'menubackground');
    menu.alpha=0.8;
    startMenu = game.add.tileSprite(game.width*0.5-512/2, game.height*0.50-512/2, 512, 512, 'menuStart');
    startMenu.alpha=1;
    endMenu = game.add.tileSprite(game.width*0.5-512/2, game.height*0.50-512/2, 512,512,'menuEnd');
    endMenu.alpha=0;
    
    var style = {font: 'bold 20pt monospace',
                 fill: '#8D703D',
                 align: 'center'};
    scoreDisplay = game.add.text(game.width/2,20, "", style);
    scoreDisplay.anchor.setTo(0.5,0.5);

    //  initialize the variable for the jump sound - we'll use this object to play the sound
    jumpAudio = game.add.audio('jumpSound');

    initialize();
}

function initialize(){
    //  set the player's score to zero
    score = 0;
    scoreText = "";
    latestLetterHit = -1;
    radius=0;
    scoreDisplay.y=20;

    smiley.scale = new Phaser.Point(0.1,0.1);
    // smiley.body.setCircle(smiley.width/2,-smiley.width/2,-smiley.height/2);
    //these are arbitrary #s that just work.
    // smiley.body.setCircle(smiley.width/2);//,smiley.width*4+60,smiley.height*4+60);

    platforms.enableBody = true; 
    Phaser.ArrayUtils.shuffle(toastFrames);
    placeToasts();
}

function placeToasts(){
    var i=0;
    platforms.forEach(function(p){
        i = i+1;
     //////this stuff is for placing the toasts grid-wise...
        //each platform at a random place, between 10% and 90% of the screen width
        // var horizontal_location =  Math.random()*(game.width*0.85)+game.width*0.05; 
        // var vertical_location = Math.random()*(game.height*0.85)+game.height*0.05;
        // horizontal_location = i*25 + 75;
        // //140 comes from, 26 sprites * 25 per column = 650, game width is 800 so empty space is 150
        // var offset=42; //sprite height
        // if (i%2==0){
        //     offset=0;
        // }
        // vertical_location = Math.floor(Math.random()*6)*84 + offset + 42;
        // console.log((vertical_location-offset-42)/84,vertical_location);
        //84 is 2xsprite height

    //////lets try angles.
        //this alternates the side that the toast lands on, in an attempt to minimize overlaps
        var angle = (180/numPlatforms) * i + 180*(i%2);//Math.floor(Math.random()*numPlatforms) + 180*(i%2);
        var distance = (575/numPlatforms/2) * Math.floor(Math.random()*numPlatforms) + 100;//

        vertical_location = distance * Math.sin(angle * Math.PI/180) + game.height/2-10;
        horizontal_location = distance * Math.cos(angle * Math.PI/180) + game.width/2;
        // console.log(angle,distance,vertical_location,horizontal_location);  
        p.position = new Phaser.Point(horizontal_location,vertical_location);

        p.tint=0xffffff;
        p.alreadyBouncedOn = false;
        p.revive();
    });
}


//  The update() function is called once per frame, before render()
//  Normally this is used for moving objects, updating scores, applying rules, 
//  and so on - everything that has to happen every frame
function update() {

    if (mode == 'start'){
        if (keys[1].isDown){
            mode = 'game';
            menu.alpha=0;
            startMenu.alpha=0;
        }
    }else if (mode == 'game'){

        scoreDisplay.setText(scoreText);
        //  check if the player hit a keyboard key, check if toasts got buttered
        for (var i=0;i<numPlatforms; i++){
            if (checkButtered(platforms.children[i])){
                //collided!!
                console.log("BUTTER'D!!!!");
                butterTheToast(platforms.children[i]);
            }

            if (keys[i].isDown){
                // console.log(i,keys[i]);
                platforms.forEach(function(p){if (p.frame==i) p.scale=new Phaser.Point(1.2,1.2);});
                if (latestLetterHit != -1 && i == latestLetterHit.frame){
                    console.log(i + " omg!!!!!!");
                    killSomething(latestLetterHit);
                }
            } else {
                platforms.forEach(function(p){if (p.frame==i) p.scale=new Phaser.Point(1,1);})
            }
        }
        
        //butter getting bigger until a certain point, then the game ends
        if (smiley.scale.x<0.8){
            smiley.scale=new Phaser.Point(smiley.scale.x+growingSpeed,smiley.scale.y+growingSpeed);
            radius = smiley.width/2;
        } else{ 
            mode = 'end';
            menu.alpha=0.8;
            endMenu.alpha=1;
            scoreText=score+" out of 26 toasts properly buttered.\n\n";
            for(var i=0; i<toastFrames.length; i++){
                if (toastFrames[i]<0)
                    scoreText+=String.fromCharCode(i+65);
            }
            scoreDisplay.setText(scoreText);
            scoreDisplay.y=game.height/2+45;
        }
    }else if (mode == 'end'){
        if (keys[1].isDown){
            mode = 'game';
            initialize();
            toastFrames = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
            menu.alpha=0;
            endMenu.alpha=0;
        }
    }
  
    

}

function checkButtered(toast){
    //for pythagorean
    var a,b,c;
    a = toast.x - game.width/2;
    b = toast.y - game.height/2;
    c = Math.sqrt(a*a + b*b);
    if (c < radius + 18){ //18 is the toast radius that i hardcoded into this like an idiot
        return true;
    }
}

//  This is a custom function to handle what should happen when the player lands on a platform
//  It gets called every time the collide function detects that the player is touching a platform
function butterTheToast(toast){
    //  we don't want to let the player bounce twice on a platform
    //  so we check to see if the 'alreadyBouncedOn' property is true
    if (toast.alreadyBouncedOn == false){ 

        latestLetterHit = toast;
        // console.log(latestLetterHit);

        //  play the jump sound
        jumpAudio.play();

        toast.body.enabled = false; 
        toast.tint = 0xFCE06F; //a nice, lightly buttered tint
        platforms.forEach(function(p){
            if (p.alreadyBouncedOn)
                p.tint=0xC7A82E; //uh oh too much butter
        });
        toast.alreadyBouncedOn = true;
    } 
}

//  This is a very simple function for killing a sprite
//  We put it in a function so that we can call it using the timer event
function killSomething(something){
    if (toastFrames[something.frame]>-1){
        toastFrames[something.frame] = -1;
        score = score+1;
        scoreText="";
        for (var i=0; i<toastFrames.length; i++){
            if (toastFrames[i]<0)
                scoreText += String.fromCharCode(i+65);
            else
                scoreText += " ";
        }
    }
    something.kill(); //calling kill() on a phaser object makes it invisible and inactive
}

//  Finally, the render() function is called after update(). 
//  It's normal to use it for functions that control how the game looks
//  A lot of games won't even have a render() function because they don't need to do anything unusual!
//  But in this case we're using it to draw the player' score, and the debug collision boxes.
function render(){
    
    //  this is a useful way to draw placeholder text in Phaser, but don't use it for a finished game! It's ugly.
    // game.debug.text(scoreText, 32, 32); //the numbers control where the text is drawn

    //  for debugging purposes, we might want to show the collision boxes for the bodies in the game
    //  this code will only run if the variable DEBUG (set at the top) is true
    if (DEBUG == true){ //show debug bodies
        game.debug.body(smiley); //this function draws the body's collision box

        //now let's do the same thing for every member of the platforms group that is currently alive
        platforms.forEachAlive(function(p){game.debug.body(p);},this);    
    }
}