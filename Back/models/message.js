'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Message.belongsTo(models.User, {
        foreignKey: {
          allowNull: false
        }
      }),
      models.Message.hasMany(models.Comment, {
        onDelete: "cascade",
      });
    }
  }
  Message.init({
    
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    gifsAttached: DataTypes.STRING, // faut-il que cela ait le meme nom que le name dans le front ?
    likes: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};