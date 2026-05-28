import "dotenv/config";
import app from "./app.js";
const port = process.env.PORT ?? 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
app.get("/", (req, res) => {
    res.send("Hello Guys welcome to CodeArena🔥");
});
//# sourceMappingURL=index.js.map