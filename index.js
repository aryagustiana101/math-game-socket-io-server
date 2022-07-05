import cors from "cors";
import express from "express";
import { Server } from "socket.io";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get("/", (req, res) => {
  res.send(200, "Hello World!");
});

const io = new Server(
  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  }),
  {
    cors: {
      origin: "*",
    },
  }
);

let players = [];
let question = createQuestion();

io.on("connection", (socket) => {
  socket.on("userJoined", (name) => {
    const player = {
      id: socket.id,
      name,
      score: 0,
    };
    players.push(player);
    io.emit("player", player);
    updateGame();
  });

  socket.on("answer", (data) => {
    if (+data.answer === question.answer) {
      question = createQuestion();
      increasePoints(data.player.id);
      updateGame();
    }
  });

  socket.on("disconnect", () => {
    players = players.filter((player) => player.id !== socket.id);
  });
});

function updateGame() {
  const leaderBoard = players.sort((a, b) => b.points - a.points).slice(0, 10);
  io.emit("question", question.expression);
  io.emit("leaderBoard", leaderBoard);
}

function increasePoints(id) {
  players = players.map((player) => {
    if (player.id === id) {
      return {
        ...player,
        score: player.score + 1,
      };
    } else {
      return player;
    }
  });
}

function createQuestion() {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const op = "*";
  const expression = `${num1} ${op} ${num2}`;
  return {
    expression: expression,
    answer: eval(expression),
  };
}
