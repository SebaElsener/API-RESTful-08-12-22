
const express = require('express')
const Container = require('./contenedor')

const app = express()

const PORT = 8080

const server = app.listen(PORT, () =>{
    console.log(`Servidor HTTP escuchando en puerto ${server.address().port}`)
})
server.on('error', error => console.log(`Error en servidor, ${error}`))

const routeProducts = express.Router()

app.use('/api/productos', routeProducts)
app.use(express.static('/public'))
routeProducts.use(express.urlencoded({ extended: true }))
routeProducts.use(express.json())

const products = new Container('products.txt')

// mostrar index.html ruta principal
routeProducts.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

// devuelve todos los productos
routeProducts.get('/listProducts', async (req, res) => {
    const productsList = await products.getAll()
    res.json(productsList)
})

// devuelve un producto según su id
routeProducts.get('/:id', async (req, res) =>{
    const productById = await products.getById(parseInt(req.params.id))
    productById === null ? res.json({ Error:  'Producto no encontrado' }) : res.json(productById)
})

// recibe y agrega un producto, y lo devuelve con su id asignado
routeProducts.post('/addProduct', async (req, res) =>{
    const savedProduct = await products.save(req.body)
    res.json(savedProduct)
})

// recibe y actualiza un producto según su id
routeProducts.put('/:id', async (req, res) =>{
    const updateInfo = req.body
    const productsList = await products.getAll()
    regToUpdate = productsList.findIndex(product => product.id === parseInt(req.params.id))
    if (regToUpdate === -1) {
        return res.send({ Error:  'Producto no encontrado' })
    }
    productsList[regToUpdate] = { ...updateInfo, id: parseInt(req.params.id) }
    await products.saveData(productsList)
    res.json({ ...updateInfo, id: parseInt(req.params.id) })
})

// elimina un producto según su id
routeProducts.delete('/:id', async (req, res) =>{
    // almaceno el resultado de buscar el id para mostrar éxito o fallo al buscar ID para eliminar
    const deletedId = await products.getById(parseInt(req.params.id))
    await products.deleteById(parseInt(req.params.id))
    deletedId === null
        ? res.json( {'Producto con ID': `${parseInt(req.params.id)} no encontrado`} )
        : res.json( {'Producto eliminado': deletedId} )
})

