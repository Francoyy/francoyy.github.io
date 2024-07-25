// Define the state class
class State {
  constructor(score_player_1, score_player_2) {
    this.score = [score_player_1, score_player_2];
  }
}

// Define the set class
class Set {
  constructor() {
    this.states = [];
  }

  addState(state) {
    this.states.push(state);
  }

  //get current score
  getCS() {
    return this.states[this.states.length-1].score;
  }

  isFinished() {
    let cs = this.getCS();
    return (cs[0] >= 11 && (cs[0] - cs[1]) >= 2) || 
      (cs[1] >= 11 && (cs[1] - cs[0]) >= 2)
  }
}

// Define the match class
class Match {
  constructor(matchName, player1Name, player2Name) {
    this.match_name = matchName;
    this.player_1_name = player1Name;
    this.player_2_name = player2Name;
    this.sets = [];
  }

  addSet(set) {
    this.sets.push(set);
  }
}

// Array to hold all matches
const matches = [];
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('visual.js loaded and executed');

  const newMatchButton = document.createElement('button');
  newMatchButton.textContent = 'New Match';
  document.body.appendChild(newMatchButton);

  const viewAllMatchesButton = document.createElement('button');
  viewAllMatchesButton.textContent = 'View All Matches';
  document.body.appendChild(viewAllMatchesButton);

  function createNewMatchUI() {
    let newMatchDiv = document.getElementById('newmatch');
    let viewMatchDiv = document.getElementById('viewmatch');
    if (newMatchDiv) {
      newMatchDiv.remove();
    }
    if (viewMatchDiv) {
      viewMatchDiv.remove();
    }
    newMatchDiv = document.createElement('div');
    newMatchDiv.id = 'newmatch';
    document.body.appendChild(newMatchDiv);
    
    newMatchDiv.innerHTML = '';

    // Create input fields for match name, player 1 name, and player 2 name
    const matchNameInput = document.createElement('input');
    matchNameInput.placeholder = 'Match Name';
    newMatchDiv.appendChild(matchNameInput);

    const player1NameInput = document.createElement('input');
    player1NameInput.placeholder = 'Player 1 Name';
    newMatchDiv.appendChild(player1NameInput);

    const player2NameInput = document.createElement('input');
    player2NameInput.placeholder = 'Player 2 Name';
    newMatchDiv.appendChild(player2NameInput);

    // Create and append go button
    const goButton = document.createElement('button');
    goButton.textContent = 'Go';
    newMatchDiv.appendChild(goButton);

    // Add event listener to go button
    goButton.addEventListener('click', () => {
      const matchName = matchNameInput.value;
      const player1Name = player1NameInput.value;
      const player2Name = player2NameInput.value;

      // Create a new match instance
      const newMatch = new Match(matchName, player1Name, player2Name);

      // Create a new set with initial state [0, 0]
      const newSet = new Set();
      newSet.addState(new State(0, 0));
      newMatch.addSet(newSet);

      matches.push(newMatch);

      // Log the new match instance
      console.log('New match created:', newMatch);

      // Create a div for viewing the new match
      let viewMatchDiv = document.getElementById('viewmatch');
      if (!viewMatchDiv) {
        viewMatchDiv = document.createElement('div');
        viewMatchDiv.id = 'viewmatch';
        document.body.appendChild(viewMatchDiv);
      }

      // Display match details and score
      updateViewMatch(newMatch, newSet);
    });
  }

  // Function to update the view match display
  function updateViewMatch(match, set) {
    const cs = set.getCS();

    const viewMatchDiv = document.getElementById('viewmatch');
    if (viewMatchDiv) {
      // If the elements already exist, just update the score
      let player1ScoreElem = document.getElementById('player1Score');
      let player2ScoreElem = document.getElementById('player2Score');
      let newSetBtn = document.getElementById('newSetBtn');

      if (!player1ScoreElem) {
        player1ScoreElem = document.createElement('p');
        player1ScoreElem.id = 'player1Score';
        viewMatchDiv.appendChild(player1ScoreElem);
      }

      if (!player2ScoreElem) {
        player2ScoreElem = document.createElement('p');
        player2ScoreElem.id = 'player2Score';
        viewMatchDiv.appendChild(player2ScoreElem);
      }

      if (!newSetBtn) {
        newSetBtn = document.createElement('button');
        newSetBtn.id = 'newSetBtn';
        newSetBtn.innerHTML = "New set";
        newSetBtn.setAttribute("disabled", true);
        newSetBtn.addEventListener('click', () => {
          newSetBtn.setAttribute("disabled", true);
          const newSet = new Set();
          newSet.addState(new State(0, 0));
          match.addSet(newSet);
          updateViewMatch(match, newSet);
        });
        viewMatchDiv.appendChild(newSetBtn);
      }

      

      let buttonState = "";
      if (set.isFinished()) {
        buttonState = "disabled";
        newSetBtn.removeAttribute("disabled");
      }

      player1ScoreElem.innerHTML = `
        <button id="player1Plus1" ${buttonState}>+1</button>
        Player 1: ${match.player_1_name} - Score: ${cs[0]}
      `;

      player2ScoreElem.innerHTML = `
        <button id="player2Plus1" ${buttonState}>+1</button>
        Player 2: ${match.player_2_name} - Score: ${cs[1]}
      `;

      // Add event listeners for the +1 buttons
      document.getElementById('player1Plus1').addEventListener('click', () => {
        const newState = new State(cs[0] + 1, cs[1]);
        set.addState(newState);
        updateViewMatch(match, set);
      });

      document.getElementById('player2Plus1').addEventListener('click', () => {
        const newState = new State(cs[0], cs[1] + 1);
        set.addState(newState);
        updateViewMatch(match, set);
      });

      // Only create the canvas and chart if it doesn't already exist
      if (!document.getElementById('myChart')) {
        chartInstance = null;
        const canvas = document.createElement('canvas');
        canvas.id = 'myChart';
        canvas.width = 800;
        canvas.height = 500;
        viewMatchDiv.appendChild(canvas);
      }

      // Update the chart
      updateChart(set);
    }
  }

  // Function to update the chart. Note that this is using Chart.js v2.9.4
  function updateChart(set) {
    const xyValues = set.states.map(state => {
      return {
        x: state.score[0] + state.score[1],
        y: state.score[0] - state.score[1]
      };
    });

    // Create data for the additional lines
    const lineData = [];
    for (let i = 0; i <= 11; i++) {
      lineData.push({ x: i, y: i }); // Line x=y from 0 to 11
    }
    let idx = 0;
    for (let i = 11; i <= 20; i++) {
      lineData.push({ x: i, y: 11 - idx }); // Line x=11-y from 11 to 22
      idx += 1;
    }

    // Create data for the additional lines
    const lineDataNeg = [];
    for (let i = 0; i <= 11; i++) {
      lineDataNeg.push({ x: i, y: -i }); // Line x=-y from 0 to 11
    }
    idx = 0;
    for (let i = 11; i <= 20; i++) {
      lineDataNeg.push({ x: i, y: -11 + idx }); // Line x=-11+y from 11 to 22
      idx += 1;
    }

    let cs = set.getCS();
    var maxX = cs[0] + cs[1] > 22 ? cs[0] + cs[1] : 22;

    // Create data for the additional lines
    const lineDataMoreUp = [];
    for (let i = 20; i <= maxX; i++) {
      lineDataMoreUp.push({ x: i, y: 2 }); // Line x=-y from 0 to 11
    }
    const lineDataMoreDown = [];
    for (let i = 20; i <= maxX; i++) {
      lineDataMoreDown.push({ x: i, y: -2 }); // Line x=-11+y from 11 to 22
    }


    if (chartInstance) {
      chartInstance.data.datasets[0].data = xyValues;
      chartInstance.data.datasets[3].data = lineDataMoreUp;
      chartInstance.data.datasets[4].data = lineDataMoreDown;
      chartInstance.options.scales.xAxes[0].ticks.max = maxX;
      chartInstance.update();
    } else {
      // Create the chart
      chartInstance = new Chart("myChart", {
        type: "scatter",
        data: {
          datasets: [{
            label: 'Score',
            pointRadius: 4,
            pointBackgroundColor: "rgba(0,0,255,1)",
            data: xyValues
          }, {
            label: '-',
            type: 'line',
            pointRadius: 0,
            borderColor: 'rgba(255,0,0,0.5)',
            borderWidth: 1,
            fill: false,
            data: lineData
          },
          {
            label: '-',
            type: 'line',
            pointRadius: 0,
            borderColor: 'rgba(255,0,0,0.5)',
            borderWidth: 1,
            fill: false,
            data: lineDataNeg
          },
          {
            label: '-',
            type: 'line',
            pointRadius: 0,
            borderColor: 'rgba(255,0,0,0.5)',
            borderWidth: 1,
            fill: false,
            data: lineDataMoreUp
          },
          {
            label: '-',
            type: 'line',
            pointRadius: 0,
            borderColor: 'rgba(255,0,0,0.5)',
            borderWidth: 1,
            fill: false,
            data: lineDataMoreDown
          }]
        },
        options: {
          responsive: false,
          scales: {
            xAxes: [{
              type: 'linear',
              position: 'bottom',
              ticks: {
                min: 0,
                max: maxX,
                stepSize: 1
              }
            }],
            yAxes: [{
              ticks: {
                min: -11,
                max: 11,
                stepSize: 1
              }
            }]
          }
        }
      });
    }
  }

  // Function to show the main UI with buttons
  function showMainUI() {
    // Reattach event listeners
    newMatchButton.addEventListener('click', createNewMatchUI);
  }

  // Initial UI setup
  showMainUI();
});
