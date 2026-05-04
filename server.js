const { app, setup } = require("./app");

const PORT = process.env.PORT || 8080;

setup()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  });