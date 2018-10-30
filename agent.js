// Fungsi AI berjalan di file ini

var AGENT;

;(function () {
  "use strict";
  window.addEventListener('load', function (event) {


    // PACMAN.start(); // Memulai
    AGENT = {
      status: {
        currentPosition: BOARD[11][8],
        goingTo: BOARD[11][7],
        // eaten: PACMAN.getUserState().eaten,
        ghosts: PACMAN.getGhosts(),
        lives: PACMAN.getUserState().lives,
        score: PACMAN.getUserState().score
      },
      justWent: 'left',
      beenTo: [
        "11,8",
        "9,0",
        "9,1",
        "9,2",
        "9,14",
        "9,15",
        "9,16"
      ],
      snapshots: [
        [0,0,2,2,'left']
      ],
      move: function (status, options) {

        // Check apakah kamu sudah berada disini sebelumnya. Jika belum, maka akan diambil
        if (AGENT.beenTo.indexOf(status.currentPosition.id) === -1) {
          AGENT.beenTo.push(status.currentPosition.id);
        }

        // Cari tahu apakah kamu di kelilingi ghost
        var position = status.currentPosition.id.split(',');
        position[0] = parseInt(position[0], 10);
        position[1] = parseInt(position[1], 10);
        var directions = {
          up: [ (position[0] - 1), position[1] ],
          down: [ (position[0] + 1), position[1] ],
          left: [ position[0], (position[1] - 1) ],
          right: [ position[0], (position[1] + 1) ]
        };

        var ways = ['up', 'down', 'left', 'right'];
        ways = shuffle(ways);

        var state = [
          whatsOverHere(status, directions[ways[0]]),
          whatsOverHere(status, directions[ways[1]]),
          whatsOverHere(status, directions[ways[2]]),
          whatsOverHere(status, directions[ways[3]])
        ];

        // Jika tidak ada pill terdekat, atau ghost, maka maju menuju pill terdekat
        if (state.indexOf('ghost') === -1 && state.indexOf('pill') === -1) {

          var goes = [];
          state.forEach(function (dir, index, array) {
            if (dir !== 0) {
              var way = index;
              goes.push([BOARD[directions[ways[way]][0]][directions[ways[way]][1]].x, BOARD[directions[ways[way]][0]][directions[ways[way]][1]].y, ways[way]]);
            }
          });

          // Perhitungan untuk mencari pill tedekat
          var board = BOARD.map(function (row) {
            var array = row.map(function (element) {
              if (element !== null) {
                return element.id; // (1) Ambil seluruh id dari semua spot pada board pacman yang bisa di lalui
              }
            });
            return array.filter(function (element) {
              return element !== undefined;
            })
          });

          var notBeenTo = []; // (2) Memeriksa apakah id tersebut telah dilalui oleh para pacman yang pernah hidup lalu mati.
          var match = false;
          board.forEach(function (row, index, array) {
            row.forEach(function (spot, index, array) {
              if (AGENT.beenTo.indexOf(spot) === -1) {
                var split = spot.split(',');
                notBeenTo.push([BOARD[split[0]][split[1]].x, BOARD[split[0]][split[1]].y]); // (3) Mencari spot yang belum pernah di lalui.
              }
            });
          });

          var pac = [status.currentPosition.x, status.currentPosition.y];
          var nearest = 283;
          var goForThisOne;
          notBeenTo.forEach(function (pill, index, pills) { // (4) Menghitung jarak pill terdekat yang dapat dia lalui
            var distance = calcDistance(pill, pac);
            if (distance < nearest) {
              nearest = distance;
              goForThisOne = pill;
            }
          });

          var closest = 283;           
          var goThisWay = 0;

          goes.forEach(function (here, index, array) {             
          var distance =calcDistance(here, goForThisOne);             
          if (distance < closest) {
              closest = distance;               
              goThisWay = index;             
            }
          });           
            var bestChoice = goes[goThisWay][2];        
          }

        // Memutuskan jalan mana yang akan di ambil berdasarkan dengan potensi dikelilingi oleh ghost dan prioritas (mengarah ke pill dan menjauh dari ghost).
        var direction;
        if (state.indexOf('pill') !== -1) {
          direction = ways[state.indexOf('pill')];
        } else if (state.indexOf('free parking') !== -1) {
          direction = bestChoice || ways[state.indexOf('free parking')];
          if (direction === getOpposite(AGENT.justWent)) { 
            // 
            var index = state.indexOf('free parking');
            if (state.indexOf('free parking', index + 1) !== -1) { 
            // Memilih jalur lain yang memiliki kemungkinan. Jika ada ghost, maka akan berputar balik
              direction = ways[state.indexOf('free parking', index + 1)];
            }
          }
        } else if (state.indexOf('ghost') !== -1) {
          direction = ways[state.indexOf('ghost')];
        } else {
          console.log('What just happened?');
        }

        AGENT.direct(direction);
        AGENT.justWent = direction;
        // Membuat catatan terhadap jalur yang telah diambil sehingga game dapat update fungsi dan berjalan dengan semestinya.
        AGENT.status.goingTo = BOARD[directions[direction][0]][directions[direction][1]]; 
      },
      direct: function (direction) { 
        // Menggerakkan pacman kemana pun arah yang user mau.
        if (direction === 'up') { PACMAN.up() }
        if (direction === 'down') { PACMAN.down() }
        if (direction === 'right') { PACMAN.right() }
        if (direction === 'left') { PACMAN.left() }
      },
      update: function (user, ghosts) { 

        // Lari menuju ghost yang terkena efek dari pill sekaligus memeriksa apakah posisi board tersebut telah di lalui. 
        // (Comment untuk matikan AI)

        // if (user.lives !== AGENT.status.lives) {
        //   AGENT.status.goingTo = BOARD[11][7];
        //   AGENT.status.lives -= 1;
        // }
        // if (user.position.x === AGENT.status.goingTo.x && user.position.y === AGENT.status.goingTo.y) {
        //   var userState = PACMAN.getUserState();
        //   AGENT.status.currentPosition = AGENT.status.goingTo;
        //   // AGENT.status.eaten = userState.eaten;
        //   AGENT.status.lives = userState.lives;
        //   AGENT.status.score = userState.score;
        //   AGENT.status.ghosts = PACMAN.getGhosts();

        //   AGENT.move(AGENT.status, AGENT.status.goingTo.go);
        // }
        
      }
    };

    /*
     * Some Helper Functions:
     */

    // Memberitahu apakah isi dari setiap box dalam satu grid.
    function whatsOverHere (status, place) {
      // Mencatat koordinat tempat.
      if ( BOARD[place[0]] && BOARD[place[0]][place[1]] ) {
        var x = BOARD[place[0]][place[1]].x;
        var y = BOARD[place[0]][place[1]].y;
      }
      // (1) Memeriksa dinding pada game.
      if ( BOARD[place[0]] === undefined || !BOARD[place[0]][place[1]] ) {
        return 0; // console.log('Ooo, wall.');
      }
      // (2) Lalu memeriksa apakah ada ghost.
      var ahhGhost = false;
      status.ghosts.forEach(function (ghost) {
        if ( (Math.abs(ghost.position.x - x) <= 10 && Math.abs(ghost.position.y - y) <= 10) || (Math.abs(ghost.position.y - y) <= 20 && Math.abs(ghost.position.x - x) === 0) || (Math.abs(ghost.position.x - x) <= 20 && Math.abs(ghost.position.y - y) === 0) ) {
          // console.log(ghost.eatable);
          ghost.eatable !== null ? ahhGhost = false : ahhGhost = true;
        }
      });
      if (ahhGhost) { 
        return 'ghost'; // console.log('Ghost!');
      }
      // (3) Jika tidak ada ghost, maka mungkin pacman telah melalui jalur ini.
      if (AGENT.beenTo.indexOf(place.toString()) !== -1) {
        return 'free parking'; // console.log('been here');
      } else {
        return 'pill'; // console.log('must be a pellet');
      }
    }

    // Suffle arrray
    function shuffle(array) {
      var currentIndex = array.length;
      var temporaryValue;
      var randomIndex;
      while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      return array;
    }

    // Mengambil arah berlawanan
    function getOpposite (direction) {
      if (direction === 'up') return 'down';
      if (direction === 'down') return 'up';
      if (direction === 'left') return 'right';
      if (direction === 'right') return 'left';
    }

    // Menghitung jarak antara X,Y koordinat dengan koordinat lain
    function calcDistance (pair1, pair2) {
      var a = Math.abs(pair1[0] - pair2[0]);
      var b = Math.abs(pair1[1] - pair2[1]);
      var aSquared = a * a;
      var bSquared = b * b;
      var cSquared = a + b;
      return Math.sqrt(cSquared);
    }

    // Memberikan log pada game dengan menggunakan SPASI
    document.addEventListener('keydown', function (event) {
      if (event.keyCode === 32) {
        console.log("Logging game status: ", AGENT);
      }
    }, false);

  }, false);
}());
