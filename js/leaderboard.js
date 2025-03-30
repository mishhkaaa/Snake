import { formatTime } from './utilities.js';


const LEADERBOARD_KEY = 'snakeLeaderboard';

export function updateLeaderboard({ playerName, score, time, difficulty }) {
    const leaderboard = getLeaderboard();
    leaderboard.push({ playerName, score, time, difficulty, date: new Date().toLocaleDateString() });
    leaderboard.sort((a, b) => b.score - a.score || a.time - b.time);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard.slice(0, 10)));
    displayLeaderboard(getLeaderboard());
}

export function displayLeaderboard(scores) {
    console.log("Leaderboard data received in displayLeaderboard:", scores);

    if (!scores || !Array.isArray(scores)) {
        console.error("Leaderboard data is invalid:", scores);
        scores = [];
    }

    const leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) {
        console.error("Leaderboard UI element not found!");
        return;
    }

    console.log("Updating leaderboard UI...");

    leaderboardList.innerHTML = scores.length 
        ? scores.map((entry, index) => `
            <li>
                <strong>${index + 1}.</strong> ${entry.playerName || "Unknown"} - 
                Score: ${entry.score} - 
                Time: ${formatTime(entry.time)}
            </li>
        `).join('') 
        : '<li>No scores yet!</li>';
}



export function getLeaderboard() {
    const data = localStorage.getItem('snakeLeaderboard');

    if (!data) {
        console.warn("No leaderboard data found. Returning an empty array.");
        return [];
    }

    try {
        const parsedData = JSON.parse(data);
        if (!Array.isArray(parsedData)) {
            console.warn("Invalid leaderboard format. Resetting.");
            return [];
        }
        console.log("Leaderboard data successfully retrieved:", parsedData);
        return parsedData;
    } catch (error) {
        console.error("Error parsing leaderboard data:", error);
        return [];
    }
}


window.displayLeaderboard = displayLeaderboard;
window.getLeaderboard = getLeaderboard;