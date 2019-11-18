/*globals Phaser*/
import * as ChangeScene from './ChangeScene.js';
import Mummy from "./mummy.js";
import EnemyArch from './enemyArch.js';
import EnemySoldier from './enemySoldier.js';
//import EnemyGunner from '';
import Tank from "./tank.js";

export default class levelScene extends Phaser.Scene {
  constructor () {
    super('levelScene');
  }

  init (data) {
    /*
    TO CALL THIS SCENE FROM LevelPicker:
      this.scene.start('levelScene', {
        level: this.levelNum
      });
    */
    this.levelNum = data.level;
  }

  preload() {
    console.log('\n[LEVEL' + this.levelNum.toString() + ']');
    console.log('[preload]')

    //backend data for sprite coordinates
    this.load.json("levelSetting","./src/data/levelSetting.json");

    //background images
    this.load.image('levelBackground', './assets/images/egyptianbackground.jpg');
    this.load.image('bossBackground', './assets/images/bossbackground.jpg');

    //tutorial images
    this.load.image('bubble', './assets/images/opaquebubble.png');
    this.load.image('awdbtn', './assets/images/awdbuttons.png');
    this.load.image('spacebtn', './assets/images/spacebutton.png');
    this.load.image('mbtn', './assets/images/mbutton.png');
}

  create() {
    console.log('[create]');

    //Add change scene event listeners
    ChangeScene.addSceneEventListeners(this);


    //SPRITE GROUPS
    //gems (diamonds)
    this.collectItems = this.add.group();
    this.collectItems.enableBody = true;

    //scrolls
    this.scroll = this.add.group();
    this.scroll.enableBody = true;

    //chests
    this.chests = this.physics.add.group({
      defaultKey: "chest"
    });

    //enemy archaeologists
    this.enemiesA = this.add.group();
    this.enemiesA.enableBody = true;

    //enemy soldiers
    this.enemiesS = this.add.group();
    this.enemiesS.enableBody = true;

    //arrow traps
    this.arrows = this.physics.add.group({
      defaultKey: "arrow"
    });
    this.arrowTimer = 0;

    console.log('sprite groups created');


    //RENDER LEVEL MAP (layers below sprites only)
    //background image
    if (this.levelNum == 0) {
      //final boss level
      this.add.image(2240,384,'bossBackground');
    } else {
      //all other levels
      this.add.image(2240,384,'levelBackground');
    }

    //declare map and tilesets
      //addTilesetImage parameters: name of tileset in Tiled, key for tileset in bootscene
      //createStaticLayer parameters: layer name (or index) from Tiled, tileset, x, y
    const map = this.make.tilemap({ key: "level" + this.levelNum.toString() + "map" });
    const below2Tileset = map.addTilesetImage("inca_back2", "incaBack2Tiles");
    const worldTileset = map.addTilesetImage("inca_front", "incaFrontTiles");

    //render lower map layers
    const bgLayer = map.createStaticLayer("Below Player", below2Tileset, 0, 0);
    const invisLayer = map.createStaticLayer("Invisible", worldTileset, 0, 0);
    this.worldLayer = map.createStaticLayer("World", worldTileset, 0, 0);
    this.worldLayer.setCollisionByProperty({ collides: true });
    invisLayer.setCollisionByProperty({ collides: true });
    this.worldLayer.setTileIndexCallback﻿﻿([30,28], this.hitExit, this);
    invisLayer.setAlpha(0);

    console.log('created level map layers below sprites');

    //SPAWN SPRITES
    //tutorial images
    if (this.levelNum == 1) {
      //for controls
      this.add.image(180,530, 'bubble').setScale(.4,.4);
      this.add.image(180,530, 'awdbtn').setScale(.3,.3);
      this.add.text(125,570, "Left   Right");
      this.add.text(162, 475, "Jump");
      //for gumba jump
      this.add.image(685, 510, 'bubble').setScale(.4, .4);
      this.add.text(625, 475, "Jump on top\n\nof enemies\n\nto kill them.");
    }
    if (this.levelNum == 3) {
      //for melee
      this.add.image(180,330, 'bubble').setScale(.4,.4);
      this.add.image(180,330, 'spacebtn').setScale(.3,.3);
      this.add.text(155, 280, "Melee");
    } else if (this.levelNum == 6) {
      //for shooting beam
      this.add.image(180,530, 'bubble').setScale(.4,.4);
      this.add.image(180,530, 'mbtn').setScale(.3,.3);
      this.add.text(155, 480, "Shoot");
    }

    //parse level sprite data from json, read coordinates into array of [x,y];
    //(need to format levelN callback somehow to avoid repetitive if statements)
    if (this.levelNum == 0) {
      this.levelSettingInfo = this.cache.json.get('levelSetting');
      this.enemyACor = this.levelSettingInfo.level0.enemyA;
      this.enemySCor = this.levelSettingInfo.level0.enemyS;
      this.gemCor = this.levelSettingInfo.level0.gem;
      this.chestCor = this.levelSettingInfo.level0.chest;
      this.tankCor = this.levelSettingInfo.level0.tank;
    } else if (this.levelNum == 1) {
      this.levelSettingInfo = this.cache.json.get('levelSetting');
      this.enemyACor = this.levelSettingInfo.level1.enemyA;
      this.enemySCor = this.levelSettingInfo.level1.enemyS;
      this.gemCor = this.levelSettingInfo.level1.gem;
      this.chestCor = this.levelSettingInfo.level1.chest;
      this.arrowCor = this.levelSettingInfo.level1.arrow;
      this.tankCor = this.levelSettingInfo.level1.tank;
    } else if (this.levelNum == 2) {
      this.levelSettingInfo = this.cache.json.get('levelSetting');
      this.enemyACor = this.levelSettingInfo.level2.enemyA;
      this.enemySCor = this.levelSettingInfo.level2.enemyS;
      this.gemCor = this.levelSettingInfo.level2.gem;
      this.chestCor = this.levelSettingInfo.level2.chest;
      this.arrowCor = this.levelSettingInfo.level2.arrow;
      this.tankCor = this.levelSettingInfo.level2.tank;
    } else if (this.levelNum == 3) {
      this.levelSettingInfo = this.cache.json.get('levelSetting');
      this.enemyACor = this.levelSettingInfo.level3.enemyA;
      this.enemySCor = this.levelSettingInfo.level3.enemyS;
      this.gemCor = this.levelSettingInfo.level3.gem;
      this.chestCor = this.levelSettingInfo.level3.chest;
      this.arrowCor = this.levelSettingInfo.level3.arrow;
      this.tankCor = this.levelSettingInfo.level3.tank;
    } else if (this.levelNum == 4) {
      this.levelSettingInfo = this.cache.json.get('levelSetting');
      this.enemyACor = this.levelSettingInfo.level4.enemyA;
      this.enemySCor = this.levelSettingInfo.level4.enemyS;
      this.gemCor = this.levelSettingInfo.level4.gem;
      this.chestCor = this.levelSettingInfo.level4.chest;
      this.arrowCor = this.levelSettingInfo.level4.arrow;
      this.tankCor = this.levelSettingInfo.level4.tank;
    } else if (this.levelNum == 5) {
      this.levelSettingInfo = this.cache.json.get('levelSetting');
      this.enemyACor = this.levelSettingInfo.level5.enemyA;
      this.enemySCor = this.levelSettingInfo.level5.enemyS;
      this.gemCor = this.levelSettingInfo.level5.gem;
      this.chestCor = this.levelSettingInfo.level5.chest;
      this.arrowCor = this.levelSettingInfo.level5.arrow;
      this.tankCor = this.levelSettingInfo.level5.tank;
    } else if (this.levelNum == 6) {
      this.levelSettingInfo = this.cache.json.get('levelSetting');
      this.enemyACor = this.levelSettingInfo.level6.enemyA;
      this.enemySCor = this.levelSettingInfo.level6.enemyS;
      this.gemCor = this.levelSettingInfo.level6.gem;
      this.chestCor = this.levelSettingInfo.level6.chest;
      this.arrowCor = this.levelSettingInfo.level6.arrow;
      this.tankCor = this.levelSettingInfo.level6.tank;
    } else if (this.levelNum == 7) {
      this.levelSettingInfo = this.cache.json.get('levelSetting');
      this.enemyACor = this.levelSettingInfo.level7.enemyA;
      this.enemySCor = this.levelSettingInfo.level7.enemyS;
      this.gemCor = this.levelSettingInfo.level7.gem;
      this.chestCor = this.levelSettingInfo.level7.chest;
      this.arrowCor = this.levelSettingInfo.level7.arrow;
      this.tankCor = this.levelSettingInfo.level7.tank;
    }
    //console.log("populating enemyA at " + this.enemyACor + ". There are " + Object.keys(this.enemyACor).length);
    //console.log("populating enemyS at " + this.enemySCor);
    //console.log("populating gem at " + this.gemCor);
    //console.log("populating chest at " + this.chestCor);

    //archaeologists
    for (var count in this.enemyACor) {
      var x = this.enemyACor[count][0];
      var y = this.enemyACor[count][1];
      var enemy = new EnemyArch({
        scene: this,
        key: "archeologist",
        x: x,
        y: y
      });
      enemy.play("archeologistAnim");
      enemy.body.setCollideWorldBounds(true);
      enemy.setInteractive();
      this.enemiesA.add(enemy);
    }

    //soldiers
    for (var count in this.enemySCor) {
      var x = this.enemySCor[count][0];
      var y = this.enemySCor[count][1];
      var enemy = new EnemySoldier({
        scene: this,
        key: "soldier",
        x: x,
        y: y,
      });
      enemy.play("soldierAnim");
      enemy.body.setCollideWorldBounds(true);
      enemy.setInteractive();
      this.enemiesS.add(enemy);
    }

    //tank
    this.tank;
    for (var count in this.tankCor) {
      this.tank = new Tank({
        scene: this,
        key: "tankBase",
        x: this.tankCor[count][0],
        y: this.tankCor[count][1]
      });
      //tank physics
      this.tank.body.setCollideWorldBounds(true);
      this.tank.setInteractive();
    }

    //diamonds (gems)
    for (var count in this.gemCor) {
      var x = this.gemCor[count][0];
      var y = this.gemCor[count][1];
      this.collectItems.add(this.physics.add.sprite(x,y,'gem'));
    }

    //chests
    for (var count in this.chestCor) {
      var x = this.chestCor[count][0];
      var y = this.chestCor[count][1];

      var chest = this.chests.get();
      chest
        .enableBody(true, x, y, true, true);
    }

    //player
    this.spawnPoints = [
      [25, 450],     //final boss
      [180, 550], //level1
      [286, 500], //level2
      [58, 400],  //level3
      [94, 630],  //level4
      [173, 375], //level5
      [75, 550],  //level6
      [94, 250],  //level7
      [50, 100]   //level8
    ];
    this.player = new Mummy({
      scene: this,
      key: "mummyWalk",
      x: this.spawnPoints[this.levelNum][0],
      y: this.spawnPoints[this.levelNum][1]
    });

    console.log('created sprites');


    //RENDER LEVEL MAP (layers above sprites only)
    const aboveLayer = map.createStaticLayer("Above Player", worldTileset, 0, 0);
    this.hiddenCaveLayer = map.createStaticLayer("Above Player Change", worldTileset, 0, 0);
    this.hiddenCaveLayer.setCollisionByProperty({ collides: true });

    console.log('created level map layers above sprites');

    //LEVEL MECHANICS
    //world/camera bounds
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    //player physics and input
    this.player.body.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();

    //sprite collisions
    this.boundaryBox = map.heightInPixels - (this.player.body.height/2) - 2;

    this.physics.add.collider(this.player, this.worldLayer);
    this.physics.add.collider(this.enemiesA, this.worldLayer);
    this.physics.add.collider(this.enemiesS, this.worldLayer);
    this.physics.add.collider(this.collectItems, this.worldLayer);
    this.physics.add.collider(this.collectItems, this.collectItems);
    this.physics.add.collider(this.scroll, this.scroll);
    this.physics.add.collider(this.scroll, this.worldLayer);
    this.physics.add.collider(this.chests, this.worldLayer);
    this.physics.add.collider(this.enemiesA, invisLayer);
    this.physics.add.collider(this.enemiesS, invisLayer);

    if (this.levelNum == 0) {
      this.physics.add.collider(this.tank, this.worldLayer);
    }

    //sprite overlaps:
    //between player and hidden caves
    this.physics.add.overlap(
      this.player,
      this.hiddenCaveLayer,
      this.uncoverHiddenCave,
      null,
      this
    );
    //between player and enemy archaeologists
    this.physics.add.overlap(
      this.player,
      this.enemiesA,
      this.playerRanIntoEnemy,
      null,
      this
    );
    //between player and soldiers
    this.physics.add.overlap(
      this.player,
      this.enemiesS,
      this.playerRanIntoEnemy,
      null,
      this
    );
    //between player and gems (diamonds)
    this.physics.add.overlap(
      this.player,
      this.collectItems,
      this.pickup,
      null,
      this
    );
    //between player and scrolls
    this.physics.add.overlap(
      this.player,
      this.scroll,
      this.pickUpScroll,
      null,
      this
    );
    //between player and chests
    this.physics.add.overlap(
      this.player,
      this.chests,
      this.pickupChests,
      null,
      this
    );
    //between player beams and worldLayer
    this.physics.add.overlap(
      this.player.beams,
      this.worldLayer,
      this.player.beamHitWall,
      null,
      this
    );
    //between enemy bullets and player
    this.enemiesS.children.each(function(enemyS) {
      this.physics.add.overlap(
        enemyS.bullets,
        this.worldLayer,
        enemyS.bulletHitWall,
        null,
        this
      );
    }, this);

    if (this.levelNum == 0) {
      //final boss overlaps
      this.physics.add.overlap(
        this.player,
        this.tank,
        this.playerRanIntoTank,
        null,
        this
      );

      //for tank projectiles
      this.physics.add.overlap(
        this.tank.shells,
        this.worldLayer,
        this.tank.shellHitWall,
        null,
        this
      );
      this.physics.add.overlap(
        this.tank.bombs,
        this.worldLayer,
        this.tank.shellHitWall,
        null,
        this
      );
    }

    console.log('configured physics and sprite interactions');


    //USER INTERFACE
    //timer
    this.startTime = new Date();
    this.endTime = new Date();
    this.duration = this.endTime-this.startTime

    //score
    this.score = 0;

    this.add.image(-5,-5,"scroll_BG").setOrigin(0,0).setScale(.27).setScrollFactor(0,0);

    //text
    this.UserLevel = this.add.text(20,30, this.registry.get("userName")+" at Level "+ this.levelNum, {
      color: '#fcba03',
      stroke: '#000000',
      strokeThickness: 7
       }).setScrollFactor(0,0);
    this.LifeDisplay = this.add.text(14,55, "LIFE(s): " + this.player.lives, {
         color: '#3C3431',
         stroke: '#000000',
         strokeThickness: 1
       }).setScrollFactor(0,0);
    this.HealthDisplay = this.add.text(14,75, "HP: " + this.player.health, {
         color: '#3C3431',
         stroke: '#000000',
         strokeThickness: 1
       }).setScrollFactor(0,0);
    this.MPDisplay = this.add.text(14,95, "MP: " + this.player.MP, {
         color: '#3C3431',
         stroke: '#000000',
         strokeThickness: 1
       }).setScrollFactor(0,0);
    this.timerDisplay = this.add.text(14,115, "TIMER: "+ this.duration, {
         color: '#3C3431',
         stroke: '#000000',
         strokeThickness: 1
       }).setScrollFactor(0,0);
    this.ScoreDisplay = this.add.text(14,135, "SCORE: "+ this.score, {
         color: '#3C3431',
         stroke: '#000000',
         strokeThickness: 1
       }).setScrollFactor(0,0);
    this.location = this.add.text(14,155, "Location: "+ this.player.x + "," + this.player.y, {
         color: '#3C3431',
         stroke: '#000000',
         strokeThickness: 1
       }).setScrollFactor(0,0);

    //life & hearts
    var h;
    this.hearts = this.add.group();
    for (h = 0; h < this.player.lives; h++) {
      var xLocation = 130 + h*20 ;
      this.hearts.add(this.add.image(xLocation,63, "heart").setScrollFactor(0,0).setScale(0.03));
    }
    this.healthBar = this.add.image(90,75,"healthBarFrame").setOrigin(0,0).setScale(0.08).setScrollFactor(0,0);
    this.healthBarFill = this.add.image(90,75,"healthBarFill").setOrigin(0,0).setScale(0.08).setScrollFactor(0,0);
    this.manaBar = this.add.image(90,95,"manaFrame").setOrigin(0,0).setScale(0.08).setScrollFactor(0,0);
    this.manaBarFill = this.add.image(90,95,"manaFill").setOrigin(0,0).setScale(0.08).setScrollFactor(0,0);
    this.healthBarOrgWidth = this.healthBarFill.width;
    this.healthBarOrgHeight = this.healthBarFill.width;

    //final boss health bar
    if (this.levelNum == 0) {
      this.enemyHealth = this.add.container(400, 450);
      this.EhealthBar = this.add.sprite(0,0,"healthBarFrame").setOrigin(0,0).setScale(0.1);
      this.EhealthBarFill = this.add.sprite(0,0,"healthBarFill").setOrigin(0,0).setScale(0.1);
      this.EhealthBarOrgWidth = this.EhealthBarFill.width;
      this.EhealthBarOrgHeight = this.EhealthBarFill.width;
      this.enemyHealth.add(this.EhealthBar);
      this.enemyHealth.add(this.EhealthBarFill);
    }

    console.log("configured on-screen display");

    // provide player an initial MP at level 6 when introduce the shooting
    if (this.levelNum == 6) {
      this.player.MP = 5;
    }
    //AUDIO
    this.backgroundMusic = this.sound.add("bg");
    this.backgroundMusic.play({loop:true});

    this.bomb = this.sound.add("bomb");
    this.shootBeam = this.sound.add("beam");
    this.meleeSound = this.sound.add("meleeAttack");
    this.yell = this.sound.add("diedYell");
    this.cry = this.sound.add("diedCry");
    this.pickupSound = this.sound.add("pickupSound");
    console.log('configured audio');
    // call once to reset the mana to 0;
    console.log('completed create function');
  }

  update() {

    //CHECK/HANDLE END OF LEVEL
    //detect if tank died on final level
    if ((this.levelNum == 0) && (this.tank.health <= 0)) {
      this.player.levelCompleted = true;
    }
    if (this.player.gameOver || this.player.levelCompleted) {
      console.log('end of level triggered');
      console.log('[LEVEL ENDING]');

      if (this.player.levelCompleted) {
        var newLevelCompletion = this.registry.pop("levelCompletion");
        newLevelCompletion[this.levelNum - 1] = 1;
        this.registry.set({levelCompletion:newLevelCompletion});
        console.log(this.registry);
      }

      this.backgroundMusic.stop();
      this.scene.start('gameOverScene', {
        level: this.levelNum,
        diamond: this.player.diamondsCollected,
        killed: this.player.enemiesKilled,
        done: this.player.levelCompleted
      });
      return;
    }

    // Arrow timer
    this.arrowTimer ++;
    if (this.arrowTimer > 100){
      this.arrowTimer = 0;
      this.spawnArrow();
    }

    //USER INTERFACE
    //duration and score
    this.endTime = new Date();
    this.duration = (this.endTime.getTime() - this.startTime.getTime())/1000;
    this.score = 50*this.player.enemiesKilled + 10*this.player.diamondsCollected;

    //display
    this.timerDisplay.setText("TIMER: "+ this.duration);
    this.ScoreDisplay.setText("SCORE: "+ this.score);
    this.HealthDisplay.setText("HP: " + this.player.health);
    this.MPDisplay.setText("MP: "+this.player.MP);
    this.LifeDisplay.setText("LIFE(s): " + this.player.lives);
    this.location.setText("LOCATION: "+ this.player.x + "," + this.player.y);

    this.updateHealthBar();
    this.updateMPBar();
    if (this.levelNum == 0) {
      this.updateEHealthBar();
      this.enemyHealth.x = this.tank.x - 60;
    }

    // player heart update - if hearts isn't equal to the player lifes, delete one heart
    if (this.player.lives != this.hearts.countActive()) {
      this.hearts.killAndHide(this.hearts.getFirstAlive());
    }


    //SPRITE MOVEMENT
    //player motion
    this.player.move();
    //check if player on map
    this.playerFellOffMap(this.player);

    //enemy movement
    this.enemiesA.children.each(function(enemyA) {
      enemyA.move();
    }, this);
    this.enemiesS.children.each(function(enemyS) {
      enemyS.move();
    }, this);

    if (this.levelNum == 0) {
      this.tank.move();
    }

    //SPRITE INTERACTIONS
    //configure overlaps for active player attacks
    //canes
    this.player.canes.children.each(
      function (c) {
        if (c.active) {
          //between canes and enemy archaeologists
          this.physics.add.overlap(
            c,
            this.enemiesA,
            this.player.caneHitEnemy,
            null,
            this
          );
          //between canes and enemy soldiers
          this.physics.add.overlap(
            c,
            this.enemiesS,
            this.player.caneHitEnemy,
            null,
            this
          );
          //between canes and worldLayer
          this.physics.add.overlap(
            c,
            this.worldLayer,
            this.player.caneHitWall,
            null,
            this
          );

          //have cane follow player
          if (c.x != this.player.x) {
            c.x = this.player.x;
          }
          if (c.y != this.player.y) {
            c.y = this.player.y;
          }
        }
      }.bind(this)  //binds the function to each of the children. scope of function
    );

    //beams
    this.player.beams.children.each(
      function (b) {
        if (b.active) {
          //between beams and enemy archaeologists
          this.physics.add.overlap(
            b,
            this.enemiesA,
            this.player.beamHitEnemy,
            null,
            this
          );
          //between beams and enemy soldiers
          this.physics.add.overlap(
            b,
            this.enemiesS,
            this.player.beamHitEnemy,
            null,
            this
          );
          //between beams and worldLayer
          this.physics.add.overlap(
            b,
            this.worldLayer,
            this.player.beamHitWall,
            null,
            this
          );

          //deactivate beams once they leave the screen
          if (b.y < 0) {
            b.setActive(false);
          } else if (b.y > this.cameras.main.height) {
            b.setActive(false);
          } else if (b.x < 0) {
            b.setActive(false);
          } else if (b.x > this.cameras.main.width) {
            b.setActive(false);
          }

          //deactivate beams at a set distance from player
          if (Math.abs(b.x - this.player.x) > 100) {
            b.setActive(false);
          }
        }
      }.bind(this)
    );

    //configure overlaps for active enemy bullets
    this.enemiesS.children.each(function(enemyS) {
          enemyS.bullets.children.each(
            function (b) {
              if (b.active) {
                //between bullets and player
                this.physics.add.overlap(
                  b,
                  this.player,
                  enemyS.bulletHitPlayer,
                  null,
                  this
                );

                //deactivate bullets once they leave the screen
                if (b.y < 0) {
                  b.setActive(false)
                } else if (b.y > this.cameras.main.height) {
                  b.setActive(false)
                } else if (b.x < 0) {
                  b.setActive(false)
                } else if (b.x > this.cameras.main.width) {
                  b.setActive(false)
                }

                //deactivate bullets at a set distance from enemy
                if (Math.abs(b.x - enemyS.x) > 100) {
                  b.setActive(false);
                }
              }
            }.bind(this)
          )
        }, this);

      if (this.levelNum == 0) {
        //configure overlaps for active player beams
        this.player.beams.children.each(
          function (b) {
            if (b.active) {
              this.physics.add.overlap(
                b,
                this.tank,
                this.player.beamHitTank,
                null,
                this
              );

              //deactivate beams once they leave the screen
              if (b.y < 0) {
                b.setActive(false)
              } else if (b.y > this.cameras.main.height) {
                b.setActive(false)
              } else if (b.x < 0) {
                b.setActive(false)
              } else if (b.x > this.cameras.main.width) {
                b.setActive(false)
              }
            }
          }.bind(this)  //binds the function to each of the children. scope of function
        );

        //configure overlaps for active tank shells
        this.tank.shells.children.each(
          function (s) {
            if (s.active) {
              this.physics.add.overlap(
                s,
                this.player,
                this.tank.shellHitPlayer,
                null,
                this
              );

              //deactivate shells once they leave the screen
              if (s.y < 0) {
                s.setActive(false)
              } else if (s.y > this.cameras.main.height) {
                s.setActive(false)
              } else if (s.x < 0) {
                s.setActive(false)
              } else if (s.x > this.cameras.main.width) {
                s.setActive(false)
              }
            }
          }.bind(this)  //binds the function to each of the children. scope of function
        );

        //configure overlaps for active tank bombs
        this.tank.bombs.children.each(
          function (b) {
            if (b.active) {
              this.physics.add.overlap(
                b,
                this.player,
                this.tank.shellHitPlayer,
                null,
                this
              );

              //deactivate shells once they leave the screen
              if (b.y < 0) {
                b.setActive(false)
              } else if (b.y > this.cameras.main.height) {
                b.setActive(false)
              } else if (b.x < 0) {
                b.setActive(false)
              } else if (b.x > this.cameras.main.width) {
                b.setActive(false)
              }
            }
          }.bind(this)  //binds the function to each of the children. scope of function
        );

      }

      //configure overlaps for active arrow traps
      //between arrows and worldLayer
      this.arrows.children.each(function(arrow) {
        this.physics.add.overlap(
          arrow,
          this.worldLayer,
          this.arrowHitWall,
          null,
          this
        );
      }, this);

      //between arrows and player
      this.arrows.children.each(function(arrow) {
        this.physics.add.overlap(
          arrow,
          this.player,
          this.arrowHitPlayer,
          null,
          this
        );
      }, this);
  }


  //SPRITE COLLISION HELPER FUNCTIONS
  hitExit() {
    /**
    function to update levelCompleted to true when player reaches the exit
    */
    console.log("[level.hitExit]");
    this.player.levelCompleted = true;
  }

  pickup(player,item) {
    /**
    function to handle player picking up diamonds in the level
    */
    item.destroy();
    this.player.diamondsCollected++;
    console.log("diamonds collected:" + this.player.diamondsCollected);
    this.pickupSound.play();
  }

  pickupChests(player,chest) {
    /**
    function to handle player picking up chests in the level
    */
    chest.play("chestOpen");
    this.scroll.add(this.physics.add.sprite(chest.x,chest.y-50,'scroll'));
    chest.setFrame(2);
    chest.disableBody(true,false);
    this.pickupSound.play();
  }

  pickUpScroll(player,item) {
    /**
    function to handle player picking up scrolls in the level
    */
    item.destroy();
    if (this.player.MP < 5){
      this.player.MP++;
    }
    console.log("scrolls Collected");
    this.pickupSound.play();
  }

  playerRanIntoTank(player, tank) {
    /*
    function to handle special case of player taking damage: running into tank.
    player loses one life and then respawns away from the tank so this function
    won't get called over and over.
    */
    console.log('[playerRanIntoTank]')

    //disable enemy, update player health
    this.tank.isActive = false;
    this.player.updateHealth(100); //i.e. player loses 1 life
    this.player.setTint(0xff0000);
    this.player.setVelocity = 0;

    //MOVE PLAYER SPRITE
    //variables to adjust x value
    var tankHalfWidth = tank.width / 2;
    var tankRightX = tank.x + tankHalfWidth;
    var tankLeftX = tank.x - tankHalfWidth;

    //variables to adjust y value
    var playerHalfHeight = this.player.height / 2;
    var tankHalfHeight = tank.height / 2;
    var tankBottomY = tank.y + tankHalfHeight;

    //adjust player x
    if (this.player.body.touching.right) {
      //collision on left side of enemy
      this.player.x = tankLeftX - this.player.width;
    } else if (this.player.body.touching.left) {
      //collision on right side of enemy
      this.player.x = tankRightX + this.player.width;
    } else {
      //collision on top or bottom of enemy
      this.player.x = tankLeftX - this.player.width;
    }

    //adjust player y
    this.player.y = tankBottomY - playerHalfHeight;

    console.log("adjusted player coordinates: (" + player.x + ", " + player.y + ")");

    //disabled tank set to respawn with a longer delay than player sprite
    this.time.addEvent({
      delay: 2500,
      callback: this.tank.reset,
      callbackScope: this,
      loop: false
    });
  }

  playerRanIntoEnemy(player, enemy) {
    /*
    function to handle the case of player colliding with an enemy when not
    attacking. Top collision kills enemy, and side collisions disable enemies
    and knocks the player back.
    */
    console.log('[level.playerRanIntoEnemy]');

    //variables to adjust player x away from enemy
    var enemyHalfWidth = enemy.width / 2;
    var enemyRightX = enemy.x + enemyHalfWidth;
    var enemyLeftX = enemy.x - enemyHalfWidth;

    //variables to adjust player y away from enemy
    var playerHalfHeight = this.player.height / 2;
    var playerHalfWidth = this.player.width / 2;
    var enemyHalfHeight = enemy.height / 2;
    var enemyBottomY = enemy.y + enemyHalfHeight;

    if (this.player.body.touching.down) {
      //collision on top or bottom of enemy
      console.log('gumba jump: enemy died');

      //generate random number of diamonds to burst from dead enemy
      var randAmount = Math.floor(Math.random() * Math.floor(10));
      var x;
      for (x = 0; x < randAmount; x++) {
        //within 75 pixels left or right from the enemy
        var randomShiftX = Math.floor(Math.random() * Math.floor(150)) - 75;

        //up to 75 pixels above the enemy
        var randomShiftY = Math.floor(Math.random() * Math.floor(75));

        //spawn diamond
        var diamondX = enemy.x + randomShiftX;
        var diamondY = enemy.y - randomShiftY;
        this.spawnDiamond(diamondX, diamondY);
      }
      if (this.levelNum >= 6 || this.levelNum == 0){
        var scrollRandAmount = Math.floor(Math.random() * Math.floor(10)+1);
        if (scrollRandAmount > 6.5){
          for (x = 0; x < randAmount; x++) {
            //within 75 pixels left or right from the enemy
            var randomShiftX = Math.floor(Math.random() * Math.floor(150)) - 75;

            //up to 75 pixels above the enemy
            var randomShiftY = Math.floor(Math.random() * Math.floor(75));

            //spawn diamond
            var diamondX = enemy.x + randomShiftX;
            var diamondY = enemy.y - randomShiftY;
            this.spawnScroll(diamondX, diamondY);
          }
        }
      }
      //"kill" enemy
      enemy.updateHealth(1000); //soldier health is 25, arch health is 10, really really make sure they die with 1000 damage
      enemy.isActive = false;
      this.cry.play();

      //update player
      this.player.body.setVelocityY(-330);
      player.enemiesKilled++;

    } else if (this.player.body.touching.right) {
      //collision on left side of enemy
      this.player.x = enemyLeftX - playerHalfWidth;
      this.player.y = enemyBottomY - playerHalfHeight;
      console.log("adjusted player coordinates: (" + player.x + ", " + player.y + ")");

      //enemy briefly disabled
      enemy.stun();

      //player takes damage
      player.updateHealth(5);  //5 ARBITRARILY CHOSEN

    }  else if (this.player.body.touching.left) {
      //collision on right side of enemy
      this.player.x = enemyRightX + playerHalfWidth;
      this.player.y = enemyBottomY - playerHalfHeight;
      console.log("adjusted player coordinates: (" + player.x + ", " + player.y + ")");

      //enemy briefly disabled
      enemy.stun();

      //player takes damage
      player.updateHealth(5);  //5 ARBITRARILY CHOSEN
    }

  }

  spawnDiamond(diamondX, diamondY){
    /**
    function to spawn a diamond sprite at a set coordinate
    */
    this.collectItems.add(this.physics.add.sprite(diamondX,diamondY,"gem"));
  }
  spawnScroll(diamondX, diamondY){
    this.scroll.add(this.physics.add.sprite(diamondX,diamondY,"scroll"));
  }
  playerFellOffMap(player) {
    /*
    function to handle player colliding with bottom world bound
    */

    if (player.y > this.boundaryBox) {
      console.log('[level.playerFellOffMap]')
      this.player.updateHealth(100);
      this.yell.play({volume: 5});
    }
  }

  arrowHitWall(arrow, worldLayer) {
    /*
    function to check each worldLayer tile the soldier bullet overlaps with for
    its collides property. destroys the bullet if it encounters a tile with
    collides = true (i.e. the bullet hit a wall tile)
    */
    if (worldLayer.collides) {
      console.log('[arrowHitWall]');
      arrow.destroy();
    }
  }

  arrowHitPlayer(arrow, player) {
    /*
    function to handle overlap between player and tank shell
    (i.e. tank shell hit player)
    */
    console.log('[arrowHitPlayer]');
    //disable shell
    arrow.destroy();

    //update player stats
    this.player.updateHealth(10);
  }

  shellHitPlayer(shell, player) {
    /*
    function to handle overlap between player and tank shell
    (i.e. tank shell hit player)
    */
    console.log('[level.shellHitPlayer]');


    //disable shell
    shell.disableBody(true, true);

    //update player stats
    player.updateHealth(20);
  }


  //USER INTERFACE HELPER FUNCTIONS
  updateHealthBar() {
    /**
    function to display changes to player health in a visual UI bar
    */
    this.healthBarFill.setCrop(0,0,this.healthBarOrgWidth*this.player.health /100,this.healthBarOrgHeight);
  }

  updateMPBar() {
    /**
    function to display changes to player MP in a visual UI bar
    */
    this.manaBarFill.setCrop(0,0,this.healthBarOrgWidth*this.player.MP/5,this.healthBarOrgHeight);
  }

  updateEHealthBar(){
    this.EhealthBarFill.setCrop(0,0,this.EhealthBarOrgWidth*this.tank.health /100,this.EhealthBarOrgHeight);
    //console.log("Update player health bar fill");
  }

  uncoverHiddenCave(player,hiddenCaveLayer){
    /**
    function to handle player colliding with special cave tiles, which
    will then disappear and uncover hidden parts of the level map
    */
    if (hiddenCaveLayer.collides) {
      this.hiddenCaveLayer.setAlpha(0);
    } else {
      this.hiddenCaveLayer.setAlpha(1);
    }
  }

  spawnArrow(){
    /**
    function defining spawning behavior of arrow traps in the levels
    */
    for (var count in this.arrowCor) {
      var x = this.arrowCor[count][0];
      var y = this.arrowCor[count][1];
      for (var i = 0; i < 3; i++) {
        var num = Math.floor(Math.random()*19) + 1;
        num *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases
        var arrow = this.arrows.get();
        arrow
          .enableBody(true, x+num, y, true, true);
        arrow.body.setAllowGravity(false);
        arrow.body.setVelocityY(-1000);
      }
    }
  }
}