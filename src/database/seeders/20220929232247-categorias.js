'use strict';
const categorias = ['Audio y video','Hogar','Informática','Tiempo Libre','Celulares','Heramientas'];

const categories = categorias.map(category => {
  return {
    name : category,
    createdAt : new Date()
  }
})

module.exports = {
  async up (queryInterface, Sequelize) {
   
     await queryInterface.bulkInsert('Categories', categories, {});
   
  },

  async down (queryInterface, Sequelize) {

     await queryInterface.bulkDelete('Categories', null, {});
    
  }
};
