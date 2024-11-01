"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRoutes = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const services_1 = require("../services");
const middlewares_1 = require("../middlewares");
const guards_1 = require("../guards");
const middlewares_2 = require("../middlewares");
const cart_1 = require("../validations/cart");
function cartRoutes() {
    const cartService = services_1.CartService.getInstance();
    const subscriptionPackageService = services_1.SubscriptionPackageService.getInstance();
    const couponUsageService = services_1.CouponUsageService.getInstance();
    const cartController = controllers_1.CartController.getInstance(cartService, subscriptionPackageService, couponUsageService);
    const router = express_1.default.Router();
    router.use(middlewares_1.currentUser, middlewares_1.requireAuth, guards_1.isCustomer);
    /**
     * @swagger
     * /inmidi-cart/cart:
     *   post:
     *     tags:
     *       - Inmidi Carts
     *     summary: Add an item to the cart
     *     description: Adds a specified item to the user's cart.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               packageGroupId:
     *                 type: string
     *               durationType:
     *                 type: integer
     *               numberOfSeats:
     *                 type: integer
     *     responses:
     *       200:
     *         description: Item added to the cart successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 customerId:
     *                   type: integer
     *                   example: 21704
     *                 items:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       packageGroupId:
     *                         type: string
     *                         example: "65959fa528f6c0e9a8cbc4a8"
     *                       unitPrice:
     *                         type: number
     *                         example: 149
     *                       durationType:
     *                         type: integer
     *                         example: 1
     *                       price:
     *                         type: number
     *                         example: 149
     *                       _id:
     *                         type: string
     *                         example: "672137ffdebbebe7626fd695"
     *                 _id:
     *                   type: string
     *                   example: "672137ffdebbebe7626fd694"
     *                 createdAt:
     *                   type: string
     *                   example: "2024-10-29T19:31:11.359Z"
     *                 updatedAt:
     *                   type: string
     *                   example: "2024-10-29T19:31:11.359Z"
     *       400:
     *         description: Bad request
     *       500:
     *         description: Internal server error
     */
    router.post("/cart", (0, middlewares_2.validate)(cart_1.addToCartValidation), cartController.addToCart.bind(cartController));
    /**
     * @swagger
     * /inmidi-cart/cart:
     *   get:
     *     tags:
     *       - Inmidi Carts
     *     summary: Get the user's cart
     *     description: Retrieves the current state of the user's shopping cart.
     *     responses:
     *       200:
     *         description: Successful response with cart details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                   example: "672137ffdebbebe7626fd694"
     *                 totalPrice:
     *                   type: number
     *                   example: 149
     *                 items:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                         example: "65959fa528f6c0e9a8cbc4a8"
     *                       title:
     *                         type: string
     *                         example: "Inmidi Abonelik Paketi"
     *                       icon:
     *                         type: string
     *                         example: "company"
     *                       type:
     *                         type: string
     *                         example: "INMIDI_SUBS"
     *                       isSeatable:
     *                         type: boolean
     *                         example: false
     *                       price:
     *                         type: object
     *                         properties:
     *                           price:
     *                             type: number
     *                             example: 149
     *                           totalPrice:
     *                             type: number
     *                             example: 149
     *                           currency:
     *                             type: string
     *                             example: "EUR"
     *                           currencyPrefix:
     *                             type: string
     *                             example: "€"
     *                           durationType:
     *                             type: integer
     *                             example: 1
     *                 cartDiscountedPrice:
     *                   type: number
     *                   example: 149
     *       404:
     *         description: Cart not found
     *       500:
     *         description: Internal server error
     */
    router.get("/cart", cartController.getCart.bind(cartController));
    /**
     * @swagger
     * /inmidi-cart/cart:
     *   delete:
     *     tags:
     *       - Inmidi Carts
     *     summary: Delete the user's shopping cart
     *     description: Removes all items from the user's shopping cart.
     *     responses:
     *       200:
     *         description: Successful response indicating the cart was deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Alışveriş sepeti silindi"
     *       404:
     *         description: Cart not found
     *       500:
     *         description: Internal server error
     */
    router.delete("/cart", cartController.deleteCart.bind(cartController));
    /**
     * @swagger
     * /inmidi-cart/cart/{packageGroupId}:
     *   patch:
     *     tags:
     *       - Inmidi Carts
     *     summary: Update an item in the user's shopping cart
     *     description: Updates the number of seats for a specified item in the user's shopping cart.
     *     parameters:
     *       - in: path
     *         name: packageGroupId
     *         required: true
     *         description: The ID of the package group to update.
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               numberOfSeats:
     *                 type: integer
     *                 example: 2
     *     responses:
     *       200:
     *         description: Successful response indicating the cart item was updated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Sepet öğesi güncellendi"
     *       404:
     *         description: Item not found in the cart
     *       500:
     *         description: Internal server error
     */
    router.patch("/cart/:packageGroupId", (0, middlewares_2.validate)(cart_1.updateCartValidation), cartController.updateCartItem.bind(cartController));
    /**
     * @swagger
     * /inmidi-cart/cart/{packageGroupId}:
     *   delete:
     *     tags:
     *       - Inmidi Carts
     *     summary: Delete an item from the user's shopping cart
     *     description: Removes a specified item from the user's shopping cart.
     *     parameters:
     *       - in: path
     *         name: packageGroupId
     *         required: true
     *         description: The ID of the package group to delete.
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Successful response indicating the cart item was deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Sepet öğesi silindi"
     *       404:
     *         description: Item not found in the cart
     *       500:
     *         description: Internal server error
     */
    router.delete("/cart/:packageGroupId", cartController.deleteCartItem.bind(cartController));
    /**
     * @swagger
     * /inmidi-cart/cart-items-number:
     *   get:
     *     tags:
     *       - Inmidi Carts
     *     summary: Get the number of items in the user's shopping cart
     *     description: Retrieves the total number of items currently in the user's shopping cart.
     *     responses:
     *       200:
     *         description: Successful response with the number of cart items
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: integer
     *                   example: 1
     *       404:
     *         description: Cart not found
     *       500:
     *         description: Internal server error
     */
    router.get("/cart-items-number", cartController.getCartItemsNumber.bind(cartController));
    return router;
}
exports.cartRoutes = cartRoutes;
