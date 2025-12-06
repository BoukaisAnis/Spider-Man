const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { verifyUser, verifyAdmin } = require('../middlewares/token');


router.get('/', getProducts);
router.get('/:id', getProduct);


router.post('/', verifyUser, verifyAdmin, createProduct);
router.put('/:id', verifyUser, verifyAdmin, updateProduct);
router.delete('/:id', verifyUser, verifyAdmin, deleteProduct);

module.exports = router;