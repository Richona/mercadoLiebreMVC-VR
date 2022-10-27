'use strict';
const generos = ['Hombre','Mujer','Otro'];

const genders = generos.map(genero => {
  return {
    name : genero,
    createdAt : new Date()
  }
})

module.exports = {
  async up (queryInterface, Sequelize) {
   
     await queryInterface.bulkInsert('Genders', genders, {});
   
  },

  async down (queryInterface, Sequelize) {

     await queryInterface.bulkDelete('Genders', null, {});
    
  }
};
