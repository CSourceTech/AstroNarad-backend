// models/chat/message.model.js

module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("message", {
        message_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reciever_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        from_user_type: {
            type: DataTypes.ENUM('user', 'astro'),
            allowNull: false,
        },
        is_edited: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        indexes: [
            { fields: ['user_id', 'astro_id'] },  // Optimizes searches for a specific user-astro chat thread
            { fields: ['createdAt'] }            // Helps with pagination based on message timestamps
        ],
        timestamps: false
    });

    return Message;
};
