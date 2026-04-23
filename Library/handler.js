
const fs = require("fs");
const path = require("path");

const loadPlugins = async () => {
  const direktori = path.join(__dirname, "../Plugins-CJS");
  const plugins = [];

  if (!fs.existsSync(direktori)) {
    return plugins;
  }

  const files = fs.readdirSync(direktori);
  for (const file of files) {
    const filePath = path.join(direktori, file);
    if (filePath.endsWith(".js")) {
      try {
        const resolvedPath = require.resolve(filePath);
        if (require.cache[resolvedPath]) {
          delete require.cache[resolvedPath];
        }

        const plugin = require(filePath);

        if (typeof plugin === "function") {

          if (plugin.command && Array.isArray(plugin.command)) {
            plugins.push(plugin);
          } else {
            console.warn(`Plugin '${file}' tidak memiliki command array`);
          }
        }
      } catch (err) {
        console.error(`Gagal memuat plugin di ${filePath}:`, err);
      }
    }
  }

  return plugins;
};

const handleMessage = async (m, commandText, Obj, isFinal = false) => {
  const plugins = await loadPlugins();
  let executed = false;

  for (const plugin of plugins) {

    const commandMatch = plugin.command.some(c => 
      c.toLowerCase() === commandText.toLowerCase()
    );
    
    if (!commandMatch) continue;

    try {
      console.log(`🔧 Running CJS plugin: ${commandText}`);
      await plugin(m, Obj);
      executed = true;
    } catch (err) {
      console.error(`Error di plugin '${commandText}':`, err);
    }
    break;
  }
  
  return executed;
};

module.exports = handleMessage;