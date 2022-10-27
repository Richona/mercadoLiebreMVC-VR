'use strict';
const metodos = ['Efetivo','Débito','Crédito','Mercado Pago'];

const methods = metodos.map(payrole => {
  return {
    name : payrole,
    createdAt : new Date()
  }
})

module.exports = {
  async up (queryInterface, Sequelize) {
   
     await queryInterface.bulkInsert('Payroles', methods, {});
   
  },

  async down (queryInterface, Sequelize) {

     await queryInterface.bulkDelete('Payroles', null, {});
    
  }
};
