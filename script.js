const playerContainer = document.getElementById("all-players-container");
const newPlayerFormContainer = document.getElementById("new-player-form");

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = "2302-acc-pt-web-pt-b";
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players/`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(APIURL);
    const data = await response.json();
    const players = data.data.players; // Access the 'players' array from the 'data' object
    console.log(players);
    return players;
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};

// const fetchSinglePlayer = async (playerId) => {
//   try {
//     const response = await fetch(`${APIURL}${playerId}`);
//     const player = await response.json();
//     console.log(player);
//     return player;
//   } catch (err) {
//     console.error(`Oh no, trouble fetching player #${playerId}!`, err);
//   }
// };

async function fetchSinglePlayer(cohortName, playerId) {
  const url = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players/${playerId}`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      console.log(result.data.player);
      return result.data.player; // Return the player details
    } else {
      console.error("Error fetching player:", result.error);
      return null;
    }
  } catch (err) {
    console.error("Network error:", err);
    return null;
  }
}

// Using fetchSinglePlayer to test
fetchSinglePlayer("2109-UNF-HY-WEB-PT", 1);

const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(APIURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerObj),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

const removePlayer = async (playerId) => {
  try {
    const response = await fetch(`${APIURL}${playerId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      return true;
    } else {
      throw new Error("Failed to delete player");
    }
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
  }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players.
 *
 * Then it takes that larger string of HTML and adds it to the DOM.
 *
 * It also adds event listeners to the buttons in each player card.
 *
 * The event listeners are for the "See details" and "Remove from roster" buttons.
 *
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player.
 *
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster.
 *
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = async (playersList) => {
  try {
    if (!Array.isArray(playersList)) {
      console.error("playerList should be an array:", playersList);
      return;
    }

    const playerHTML = playersList
      .map((player) => {
        return `
          <div class="players" data-player-id="${player.id}">
            <h2>${player.name}</h2>
            <p>Breed: ${player.breed}</p>
            <p>Status : ${player.status}</p>
            <img src="${player.imageUrl}" alt="${player.breed}">
            <button class="delete-player">Remove from Roster</button>
          </div>
        `;
      })
      .join("");
    playerContainer.innerHTML = playerHTML;

    // Add event listeners to each player card
    document.querySelectorAll(".players").forEach((card) => {
      card.addEventListener("click", async (e) => {
        const playerId = card.getAttribute("data-player-id"); // Use 'card' instead of 'e.currentTarget'
        console.log("Clicked player ID:", playerId); // Debugging line

        if (playerId) {
          // Ensure playerId is not null or undefined
          const playerDetails = await fetchSinglePlayer(cohortName, playerId);
          console.log("Player details before displaying modal:", playerDetails); // Debugging line
          displayModal(playerDetails);
        } else {
          console.error("Player ID is not defined!");
        }
      });
    });

    document.querySelectorAll(".delete-player").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation(); // Prevent triggering the card's click event
        const playerId = e.currentTarget
          .closest(".players")
          .getAttribute("data-player-id");
        const isDeleted = await removePlayer(playerId);
        if (isDeleted) {
          // Refresh the players list after deleting a player
          displayPlayers();
        }
      });
    });
  } catch (err) {
    console.error("Uh oh, trouble rendering players!", err);
  }
};

// Function to display the modal with player details
const displayModal = (player) => {
  // Ensure that the player object has the expected properties
  console.log(player);
  const modalHTML = `
      <div class="modal" id="playerModal">
          <div class="modal-content">
              <h2>${player.name}</h2>
              <p>Breed: ${player.breed}</p>
              <p>Status: ${player.status}</p>
              <img src="${player.imageUrl}" alt="${player.breed}" class="modal-image">
              <button onclick="closeModal()">Close</button>
          </div>
      </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  document.getElementById("playerModal").style.display = "block";
};

// Function to close the modal
const closeModal = () => {
  const modal = document.getElementById("playerModal");
  if (modal) {
    modal.remove();
  }
};

const displayPlayers = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);
};

displayPlayers();

const playerForm = document.getElementById("addPlayerForm");

document.addEventListener("DOMContentLoaded", () => {
  const playerForm = document.getElementById("addPlayerForm");

  playerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPlayer = {
      name: document.getElementById("playerName").value,
      breed: document.getElementById("playerBreed").value,
      status: document.getElementById("playerStatus").value,
      imageUrl: document.getElementById("playerImageUrl").value,
    };

    const addedPlayer = await addNewPlayer(newPlayer);
    if (addedPlayer) {
      // Refresh the players list after adding a new player
      displayPlayers();
    }
  });
});

/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
  try {
  } catch (err) {
    console.error("Uh oh, trouble rendering the new player form!", err);
  }
};

const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);

  renderNewPlayerForm();
};

init();
