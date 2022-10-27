'use strict';
const productos = require('../../data/products.json')
const products = productos.map(({name,price,discount,categoryId,description}) => {
  return {
    name,
    price,
    discount,
    description,
    categoryId,
    createdAt : new Date()
  }
})

module.exports = {
  async up (queryInterface, Sequelize) {
   
     await queryInterface.bulkInsert('Products', products, {});
   
  },

  async down (queryInterface, Sequelize) {

     await queryInterface.bulkDelete('Products', null, {});
    
  }
};
