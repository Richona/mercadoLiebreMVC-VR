'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InterestUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  InterestUser.init({
    userId: DataTypes.INTEGER,
    interestId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'InterestUser',
  });
  return InterestUser;
};