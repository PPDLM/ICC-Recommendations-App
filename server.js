const { app, setup } = require("./app");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
  
  console.log("⏳ Initializing database setup...");
  setup()
    .then(() => {
      console.log("✅ Database initialized successfully");
    })
    .catch((err) => {
      console.error("❌ Failed to initialize database:", err);
    });
});