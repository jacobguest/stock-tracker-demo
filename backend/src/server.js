const { createPool, initDb } = require("./db");
const { createApp } = require("./app");

const PORT = process.env.PORT || 3000 
const pool = createPool();

initDb(pool)
    .then(() => {
		const app = createApp(pool);
		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(console.error);
