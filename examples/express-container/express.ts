import express from "express";
import routes from "./routes";

const port = process.env['PORT'] ?? 3000;
const app = express();

app.use(express.json());
app.use(routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port.toString()}`);
});