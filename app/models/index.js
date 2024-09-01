const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// models initialization
db.user = require("./user.model.js")(sequelize, Sequelize);
db.user_login_token = require("./user_login_token.model.js")(sequelize, Sequelize);
db.user_otps = require("./user_otps.model.js")(sequelize, Sequelize);
db.user_profile = require("./user_profile.model.js")(sequelize, Sequelize);


// Defining relationships
db.user.hasOne(db.user_profile, { foreignKey: 'user_id' });
db.user_profile.belongsTo(db.user, { foreignKey: 'user_id' });

// models export
module.exports = db;
