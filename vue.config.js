module.exports = {
  lintOnSave: process.env.NODE_ENV !== "production",
  publicPath:
    process.env.NODE_ENV === "production" ? "/albion-loot-logger-helper" : "/",
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Loot Logger Helper - Albion Online'
    }
  }
}
