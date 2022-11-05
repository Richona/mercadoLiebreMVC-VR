const db = require('../database/models');
const {validationResult} = require('express-validator')
const { loadProducts, storeProducts } = require('../data/dbModule');
const { sendSequelizeError, createError } = require('../helpers');
const { literal, Op } = require('sequelize'); /* metodo para hacer una consulta LITERAL a la base de datos */
const path = require('path');

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	list: async (req, res) => {

		try {

			let {limit = 4, page = 1, order = 'ASC', sortBy = 'id', search = "", sale = 0} = req.query;
			
			/* paginación */
			limit = limit > 16 ? 16 : +limit; /* logica para no superar mas de 16 en limit */
			page = +page;
			let offset = +limit * (+page - 1); /* logica para cargar offset en base a lo que venga en limit y page, por ej: 6 * (1 - 1) = 0 ////; 6 * (2 - 1) = 6 ////; 6 * (3 - 1) = 12; */
			
			/* ordenamiento */
			order = ['ASC','DESC'].includes(order.toUpperCase()) ? order : 'ASC'; /* Comprobamos si order viene bien, sino le cargamos default ASC */
			sortBy =  ['name', 'price', 'discount', 'category', 'newest'].includes(sortBy.toLowerCase()) ? sortBy : 'id';  /* Comprobamos si sortBy viene bien, sino le cargamos default id */

			let orderQuery = sortBy === "category" ? ['category','name',order] : sortBy === "newest" ? ['createdAt', 'DESC'] : [sortBy, order]

			let options = {
				subQuery:false,
				limit,
				offset,
				order : [orderQuery],
				include: [
					{
						association: 'images',
						attributes: {
							exclude: ['createdAt', 'updatedAt', 'deletedAt', 'id', 'file', 'productId'],
							include: [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/image/',file)`), 'url']]
						},
					},
					{
						association: 'category',
						attributes : ['name','id'],

					}
				],
				attributes : {
					exclude : ['createdAt', 'updatedAt','deletedAt'],
					include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/',Product.id)`),'url']]
				},
				where : {
					[Op.or] : [
						{
							name : {
								[Op.substring] : search
							}
						},
						{
							description : {
								[Op.substring] : search
							}
						},
						{
							"$category.name$" : {
								[Op.substring] : search
							}
						}
					],
					[Op.and] : [
						{
							discount : {
								[Op.gte] : sale
							}
						}
					]
				}


			}

			const { count, rows: products } = await db.Product.findAndCountAll(options); /* findAndCountAll, ademas de traer todos los datos, los cuenta. */


			const queryKeys = {
				limit,
				order,
				sortBy,
				search,
				sale
			}

			let queryUrl = "";

			for (const key in queryKeys) {

				queryUrl += `&${key}=${queryKeys[key]}`

			}


			const existPrev = page > 1; /* si la page es 2 o mas, se carga con true, sino, si viene 1, false. */
			const existNext = offset + limit < count; /* logica para saber si aun quedan datos por mostrar, por ej: 4 + 4 < 16 = TRUE ////; 8 + 4 < 16 = TRUE ////;  8 + 12 < 16 = FALSE ////; */
			
			const prev =  existPrev ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}${queryUrl}` : null; /* Link con todos los datos para la consulta anterior */
			const next = existNext ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page + 1}${queryUrl}` : null; /* Link con todos los datos para la consulta siguiente */

			return res.status(200).json({
				ok: true,
				meta: {
					total: count,
					quantity : products.length,
					page,
					prev, 
					next
				},
				data: products
			})


		} catch (error) {
			let errors = sendSequelizeError(error);

			return res.status(error.status || 500).json({
				ok: false,
				errors,
			});
		}

	},

	// Detail - Detail from one product
	detail: async (req, res) => {

		try {

			const {id} = req.params;
			const options = {
				include : [
					{
						association : 'images',
						attributes : {
							exclude : ['createdAt','updatedAt', 'deletedAt', 'id', 'file', 'productId'],
							include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/image/',file)`),'url']]
						}
					},
					{
						association : 'category',
						attributes : ['name']
					}
				]
			}

			const product = await db.Product.findByPk(id, options);

			return res.status(200).json({
				ok : true,
				data : product
			})

		} catch (error) {
			let errors = sendSequelizeError(error);

            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
		}

	},
	
	// Create -  Method to store
	store: async (req, res) => {
		// Do the magic
		try {

			let errors = validationResult(req);

			if(!errors.isEmpty()){

				let errorMessages = {}

				for (const key in errors.mapped()) {
					errorMessages = {
						...errorMessages,
						[key] : errors.mapped()[key].msg
					}
				}

				let error = new Error()
				error.status = 400;
				error.message = errorMessages
				throw error
			}



			const {name, price, discount, description, category} = req.body;

			const product = await db.Product.create({
				name : name.trim(),
				price,
				discount,
				description : description.trim(),
				categoryId : category
			});


			if(req.files && req.files.length){
				let images = req.files.map(file => {
					return {
						file : file.filename,
						productId : product.id
					}
				});

				await db.Image.bulkCreate(images, {
					validate : true
				})
			}

			await product.reload({
				include : [
					{
						association : 'images',
						attributes : {
							exclude : ['createdAt','updatedAt', 'deletedAt', 'id', 'file', 'productId'],
							include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/image/',file)`),'url']]
						}
					},
					{
						association : 'category',
						attributes : ['name']
					}
				]
			})

			return res.status(201).json({
				ok : true,
				data : product
			})


		} catch (error) {
			console.log(error)
            return res.status(error.status || 500).json({
                ok: false,
                errors : error.message,
            });
		}

		
	},
	// Update - Method to update
	update: (req, res) => {
		// Do the magic
		const { name, price, discount, description, category } = req.body;
		let productsModify = loadProducts().map(product => {
			if (product.id === +req.params.id) {
				return {
					id: product.id,
					name: name.trim(),
					price: +price,
					description: description.trim(),
					discount: +discount,
					category,
					image: product.image
				}
			}
			return product
		});

		storeProducts(productsModify);
		return res.redirect('/products/detail/' + req.params.id)
	},

	// Delete - Delete one product from DB
	destroy: (req, res) => {
		// Do the magic
		let productsModify = loadProducts().filter(product => product.id !== +req.params.id);

		storeProducts(productsModify);
		return res.redirect('/products')

	},
	getImage : async (req,res) => {
		return res.sendFile(path.join(__dirname, '..','..','public','images','products', req.params.image ))

	}
};

module.exports = controller;