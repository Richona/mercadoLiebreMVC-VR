const db = require('../database/models')

const {loadProducts,storeProducts} = require('../data/dbModule');

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	index: (req, res) => {
		// Do the magic
		let products = db.Product.findAll({
			include : ['images','category']
		})

		let categories = db.Category.findAll()
		Promise.all([products, categories])
			.then(([products, categories]) => res.render('products', {
				products,
				categories,
				toThousand
			}))
			.catch(error => console.log(error))
	
	},
	getProductsByCategory : (req,res) => {
		let category = db.Category.findByPk(req.params.id,{
			include : [
				{
					association : 'products',
					include : ['images']
				}
			]
		});

		let categories = db.Category.findAll()
		Promise.all([category, categories])
			.then(([category, categories]) => {
				res.render('products', {
				products : category.products,
				categories,
				toThousand
			})
		})
			.catch(error => console.log(error))
	},

	// Detail - Detail from one product
	detail: (req, res) => {
		// Do the magic
		db.Product.findByPk(req.params.id,{
			include : [{all : true}]
		})
			.then(product => {
				return res.render('detail', {
			product,
			toThousand
			})
			})
			.catch(error => console.log(error))
		
	},

	// Create - Form to create
	create: (req, res) => {
		// Do the magic
		db.Category.findAll({
			order : ['name']
		})
			.then(categories => {
				return res.render('product-create-form', {
					categories
				})
			})
			.catch(error => console.log(error))
	},
	
	// Create -  Method to store
	store: (req, res) => {
		// Do the magic
		const {name, price,discount, description, category} = req.body;

		db.Product.create({
			name : name.trim(),
			price,
			discount,
			description,
			categoryId : category
		})
			.then(product => {
				return res.redirect('/products/detail/' + product.id)
			})
			.catch(error => console.log(error))
		
	},

	// Update - Form to edit
	edit: (req, res) => {
		// Do the magic
		let productToEdit = loadProducts().find(product => product.id === +req.params.id);

		return res.render('product-edit-form',{
			productToEdit
		})

	},
	// Update - Method to update
	update: (req, res) => {
		// Do the magic
		const {name, price,discount, description, category} = req.body;
		let productsModify = loadProducts().map(product => {
			if(product.id === +req.params.id){
				return {
					id : product.id,
					name : name.trim(),
					price : +price,
					description : description.trim(),
					discount : +discount,
					category,
					image : product.image
				}
			}
			return product
		});

		storeProducts(productsModify);
		return res.redirect('/products/detail/' + req.params.id)
	},

	// Delete - Delete one product from DB
	destroy : (req, res) => {
		// Do the magic
		let productsModify = loadProducts().filter(product => product.id !== +req.params.id);
		
		storeProducts(productsModify);
		return res.redirect('/products')

	}
};

module.exports = controller;