const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
} = require("../controllers/cart.controller");
const { verifyUser } = require("../middlewares/token");

router.use(verifyUser);

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/checkout", checkout);
router.put("/item/:itemId", updateCartItem);
router.delete("/item/:itemId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
