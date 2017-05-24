// let player_id = 49697106;
// let match_id = 3132493264;
// let player_name = "Big Fancy Ben";
let player_id = "";
let match_id = "";
let player_name = "";
let player_slot = "";
let player_side = "";
let player_won = "";
let player_hero = "";
let data = "";
let player = "";
let allied_heroes = [];
let enemy_heroes = [];
let allied_players = [];
let enemy_players = [];

let queryString = (window.location.search).substring(1);
if (queryString){
  let queries = queryString.split("&");
  for(let i=0; i<queries.length; i++) {
    let param = queries[i].split('=');
    if (param[0] == "match_id") {
      match_id=String(param[1]);
      document.getElementById("match-id").value = match_id;
    }
    if (param[0] == "player_id"){
      player_id=String(param[1]);
      document.getElementById("steam-acc").value = player_id;
    }
    if (param[0] == "player_name"){
      player_name = decodeURI(String(param[1]));
      document.getElementById("steam-name").value = player_name;
      player_name = player_name.toLowerCase();
    }
  }
  makeTips();
}

document.getElementById("submit-button").onclick = function getCardInput () {
  match_id = document.getElementById("match-id").value;
  player_name = document.getElementById("steam-name").value;
  player_name = player_name.toLowerCase();
  player_id = document.getElementById("steam-acc").value;
  if (match_id == "") {
    console.log("No Match ID");
  } if (player_name == "" && player_id == "") {
    console.log("No player info");
  } else {
    let queryParamString = `match_id=${match_id}&player_id=${player_id}&player_name=${encodeURI(player_name)}`;
    history.pushState (null, null, "?" + queryParamString);
    makeTips();
  }
}

function makeTips () {
  let request = new XMLHttpRequest();
  console.log("Match ID: " + match_id);
  console.log("Steam ID: " + player_id);
  console.log("Player Name: " + player_name);
  request.open('GET', 'https://api.opendota.com/api/matches/'+ match_id, true);
  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      data = JSON.parse(this.response);
      if(player_name){
        for(let i=0; i<10; i++){
          if(data.players[i].personaname)  {
            if (data.players[i].personaname.toLowerCase() == player_name) {
              player_id = data.players[i].account_id;
              player_slot = i;
              setPlayerVars();
            }
          }
        }
      }
      else if (player_id) {
        for(let i=0; i<10; i++){
          if(data.players[i].account_id)  {
            if (data.players[i].account_id == player_id) {
              player_name = data.players[i].personaname.toLowerCase();
              player_slot = i;
              setPlayerVars();
            }
          }
        }
      }
      matchOverview();
    } else {
      console.log("opendota api error");
    }
  };
  request.send();
}

function setPlayerVars() {
  player = data.players[player_slot];
  console.log("Just the player's data");
  console.log(player);
  player_won = !!player.win;
  player_side = player.isRadiant;
  matchHeroes();
  console.log(player_hero);
}

function matchHeroes () {
  for(let i=0; i<10; i++){
    let cur_hero = data.players[i].hero_id;
    for(let j=0; j<heroes.length;j++){
    if(heroes[j].id == cur_hero){
        if(i == player_slot){
          allied_heroes.push(heroes[j]);
          player_hero = heroes[j];
        } else if (data.players[i].isRadiant == player_side){
          allied_heroes.push(heroes[j]);
          allied_players.push(data.players[i]);
        } else {
          enemy_heroes.push(heroes[j]);
          enemy_players.push(data.players[i]);
        }
      }
    }
  }
}

function ifExists (maybeExists){
  if(maybeExists){
    return maybeExists;
  }else{
    return 0;
  }
}

function matchOverview () {
  let img = new Image();
  let div = document.getElementById('summary');

  let heroImg = `<img src="http://cdn.dota2.com/apps/dota2/images/heroes/${player_hero.name.substr(14)}_sb.png"></img>`;

  let summary = `You ${strSwitcher(player_won, "won", "lost")} a game as
   ${player_hero.localized_name}${courierCheck()}. Throughout the game you bought
   ${ifExists(player.purchase_ward_observer)} observer ward${pluralTester(player.purchase_ward_observer)} and
   ${ifExists(player.purchase_ward_sentry)} sentry ward${pluralTester(player.purchase_ward_sentry)}. You stacked
   ${player.camps_stacked} camp${pluralTester(player.camps_stacked)}. You bought
   ${ifExists(player.purchase.smoke_of_deceit)} smoke${pluralTester(player.purchase.smoke_of_deceit)}.`;

  div.innerHTML = heroImg+"<br>"+summary;
}

function courierCheck() {
  if(player.purchase.courier){
    if(player.purchase.flying_courier){
      return " you bought and upgraded the courier";
    }
      return " you bought the courier";
  }
  else if(player.purchase.flying_courier){
    return " you upgraded the courier";
  } else {
    return "";
  }
}

function strSwitcher(testerFunc, valTrue, valFalse){
  if (testerFunc){
    return valTrue;
  } else {
    return valFalse;
  }
}

function pluralTester(value){
  if(value == 1){
    return "";
  } else {
    return "s";
  }
}