const express = require('express');
const path = require("path");
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.static("client"));
const clientRoutes = require("./routes/client.routes");
app.use("/clients", clientRoutes);
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 