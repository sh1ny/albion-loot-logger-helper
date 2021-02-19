module.exports = {
  lintOnSave: process.env.NODE_ENV !== "production",
  publicPath:
    process.env.NODE_ENV === "production" ? "/albion-loot-logger-helper" : "/"
}
