// app/models/astrologer.model.js

module.exports = (sequelize, Sequelize) => {
  const Astrologer = sequelize.define("astrologer", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profile_image: {
      type: Sequelize.STRING,
    },
    about: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    experience: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    rating: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    language_known: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    type: {
      type: Sequelize.STRING, // E.g., "Vedic", "Tarot", etc.
      allowNull: true,
    },
    total_time_spent_on_call: {
      type: Sequelize.INTEGER, // Time in minutes
      allowNull: true,
    },
    total_time_spent_on_message: {
      type: Sequelize.INTEGER, // Time in minutes
      allowNull: true,
    },
    expertise: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    charge: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
  });

  return Astrologer;
};