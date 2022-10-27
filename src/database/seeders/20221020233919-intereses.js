'use strict';
const intereses = ['Música','Juegos','Deportes'];

const interests = intereses.map(interes => {
  return {
    name : interes,
    createdAt : new Date()
  }
})

module.exports = {
  async up (queryInterface, Sequelize) {
   
     await queryInterface.bulkInsert('Interests', interests, {});
   
  },

  async down (queryInterface, Sequelize) {

     await queryInterface.bulkDelete('Interests', null, {});
    
  }
};
