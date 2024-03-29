kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1]//cambia a color azul el fondo de la pantalla
});

/**************IDENTIFICADORES DE VELOCIDAD*************/
/*estas constantes estan en mayusculas
para diferenciar de las demas variables*/

const MOVE_SPEED = 120;
const JUMP_FORCE = 380;
const BIG_JUMP_FORCE = 500;
let CURRENT_JUMP_FORCE = JUMP_FORCE;
const FALL_DEATH = 400;
const ENEMY_SPEED = 20;
const MUSHROOM_SPEED = 30;

let isJumping = true;

/***********LOGICA DEL JUEGO****************/
/*imagenes con identificadores*/

//loadRoot('./assets/'); usando esta no funciona.
loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png');
loadSprite('evil-shroom', 'KPO3fR9.png');
loadSprite('brick', 'pogC9x5.png');
loadSprite('block', 'M6rwarW.png');
loadSprite('mario', 'Wb1qfhK.png');
loadSprite('mushroom', '0wMd92p.png');
loadSprite('surprise', 'gesQ1KP.png');
loadSprite('unboxed', 'bdrLpi6.png');
loadSprite('pipe-top-left', 'ReTPiWY.png');
loadSprite('pipe-top-right', 'hj2GK4n.png');
loadSprite('pipe-bottom-left', 'c1cYSbt.png');
loadSprite('pipe-bottom-right', 'nqQ79eI.png');
loadSprite('blue-block', 'fVscIbn.png');
loadSprite('blue-brick', '3e5YRQd.png');
loadSprite('blue-steel', 'gqVoI2b.png');
loadSprite('blue-evil-shroom', 'SvV4ueD.png');
loadSprite('blue-surprise', 'RMqCc1G.png');


/*CREACION DE NIVELES */

scene('game', ({level, score}) => {
    layers(['bg', 'obj', 'ui'], 'obj');

 //(MAPAS)

 const maps = [
    [
        '                                          ',
        '                                          ',
        '                                          ',
        '                                          ',
        '                                          ',
        '                                          ',
        '                                          ',
        '                                          ',
        '      %  =*=%=                                       ',
        '                    -+                    ',
        '               ^  ^ ()                    ',
        '========================  ================'
    ],
    [
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£                             x x       £',
        '£        @@@@@@             x x x       £',
        '£                         x x x x   x -+£',
        '£                 z  z  x x x x x  x  ()£',
        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
       ]
 ]
 
  const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('block'), solid()],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '^': [sprite('evil-shroom'), solid(), 'dangerous'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()],
    '!': [sprite('blue-block'), solid(), scale(0.5)],
    '£': [sprite('blue-brick'), solid(), scale(0.5)],
    'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
    '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
    'x': [sprite('blue-steel'), solid(), scale(0.5)], 

  }

  const gameLevel = addLevel(maps[level], levelCfg);

  const scoreLabel = add([
    text(score),
    pos(30,6),
    layer('ui'),
    {value: (score)}

  ])

  
  add([
    text('level' + parseInt(level+1)), pos (40, 6)
  ])

  const player = add([
    sprite('mario'),
    solid(),
    pos(30,0),
    origin('bot'),
    body(),
    big(),
  ])


  //Funcion que hace grande a Mario
  function big(){
      let timer = 0;
      let isBig = false;
      return{
          update(){
              if(isBig)
              {
                  CURRENT_JUMP_FORCE = BIG_JUMP_FORCE;
                  timer -= dt()//dt es como un cronometro que viene en la libreria de kaboom
                  if(timer <= 0)//cuando el tiempo llegue a cero, Mario vuelve a hacerse pequeño
                  {
                      this.smallify();
                  }
              }
          },

          isBig(){
              return isBig;
          },

          //Funcion que hace que se vuelva pequeño
          smallify(){
              this.scale = vec2(1);
              CURRENT_JUMP_FORCE = JUMP_FORCE;
              timer = 0;
              isBig = false;
            }, 

            biggify(time){
                this.scale = vec2(2);
                timer = time;
                isBig = true;
            }
      }
  }


    //Funcion para agarrar el honguito 
    player.collides('mushroom', (m) => {
        destroy(m); //con esto se hace de cuenta que el honguito ya es agarrado por Mario
        player.biggify(6);
    })


    //Aca agarra las monedas y suma el score
    player.collides('coin', (c) =>{
        destroy(c);
        scoreLabel.value++; //actualiza el score
        scoreLabel.text = scoreLabel.value;//actualiza lo que le mostramos al usuario

    })

    //Hongo que sale de la caja cuando Mario salta
    action('mushroom', m =>{
        m.move(MUSHROOM_SPEED,0)
    })

    
   //Aca hacemos que el hongo mate a Mario
    player.collides('dangerous',d=>{
        if(isJumping)
        {
            destroy(d)
        }else
        {
            go('lose', {score: scoreLabel.value})
        }
    })

      /*  player.action(() => {
        camPos(player.pos)
        if(player.pos.y >= FALL_DEATH)
        {
            go('lose', {score: scoreLabel.value});
        }
    })*/

    //Salen las monedas cuando Mario salta
    player.on('headbump', (obj) => {
    if(obj.is('coin-surprise')){
        gameLevel.spawn('$', obj.gridPos.sub(0,1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0,0))
    }
    if(obj.is('mushroom-surprise'))
    {
        gameLevel.spawn('#', obj.gridPos.sub(0,1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0,0))
    }

    })

     
    //Ejecucion del segundo mapa
    player.collides('pipe',()=>{
        keyPress('down', ()=>{
            go('game',{
                level:(level+1) % maps.length,
                score: scoreLabel.value
            })
        })
    })

    //Movimiento del honguito malo
    action('dangerous', (d) => {
      d.move(-ENEMY_SPEED,0)
    })

    //Movimiento de Mario
    keyDown('left', () =>{
        player.move(-MOVE_SPEED,0);
    }) 

    keyDown('right', () =>{
       player.move(MOVE_SPEED,0);
    })

    //Aca Mario salta sobre el honguito malo para matarlo
    player.action(() =>{
        if(player.grounded())
        {
            isJumping = false;
        }
    })

    //Tecla para saltar
    keyPress('space', () =>{
        if(player.grounded())
        {
            isJumping = true;
            player.jump(CURRENT_JUMP_FORCE);
        }
    })

}); //Aca termina la funcion scene

//Escena de la "muerte" de Mario
scene('lose', ({score}) =>{
    add([
        text(score, 32),
        origin('center'),
        pos(width() / 2, height() /2)
    ])
});

start('game', {level: 0, score: 0}) //funcion que arranca el juego, le pasa el nivel y el score.






