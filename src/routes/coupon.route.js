"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponRoutes = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const services_1 = require("../services");
const middlewares_1 = require("../middlewares");
const guards_1 = require("../guards");
function couponRoutes() {
    const couponService = services_1.CouponService.getInstance();
    const couponUsageService = services_1.CouponUsageService.getInstance();
    const cartService = services_1.CartService.getInstance();
    const couponController = controllers_1.CouponController.getInstance(couponService, couponUsageService, cartService);
    const router = (0, express_1.Router)();
    router.use(middlewares_1.currentUser, middlewares_1.requireAuth);
    /**
     * @swagger
     * /inmidi-coupon/use-coupon:
     *   post:
     *     tags:
     *       - Inmidi Coupon Usage
     *     summary: Apply a coupon to the user's cart
     *     description: Applies a specified coupon code to the user's cart and returns the updated cart details.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               cartId:
     *                 type: string
     *                 example: "6721414de5ee8a0a1246535a"
     *               couponCode:
     *                 type: string
     *                 example: "assa"
     *     responses:
     *       200:
     *         description: Successful response with updated cart details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   properties:
     *                     _id:
     *                       type: string
     *                       example: "6721414de5ee8a0a1246535a"
     *                     customerId:
     *                       type: integer
     *                       example: 21704
     *                     items:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           packageGroupId:
     *                             type: object
     *                             properties:
     *                               _id:
     *                                 type: string
     *                                 example: "65959fa528f6c0e9a8cbc4a8"
     *                               type:
     *                                 type: string
     *                                 example: "INMIDI_SUBS"
     *                           unitPrice:
     *                             type: number
     *                             example: 149
     *                           durationType:
     *                             type: integer
     *                             example: 1
     *                           price:
     *                             type: number
     *                             example: 149
     *                           _id:
     *                             type: string
     *                             example: "6721414de5ee8a0a1246535b"
     *                     createdAt:
     *                       type: string
     *                       example: "2024-10-29T20:10:53.270Z"
     *                     updatedAt:
     *                       type: string
     *                       example: "2024-10-29T20:11:34.538Z"
     *                     discount:
     *                       type: number
     *                       example: 100
     *       400:
     *         description: Bad request, invalid coupon or cart ID
     *       404:
     *         description: Cart not found
     *       500:
     *         description: Internal server error
     */
    router.post("/use-coupon", couponController.useCoupon.bind(couponController));
    /**
     * @swagger
     * /inmidi-coupon/cancel-coupon:
     *   post:
     *     tags:
     *       - Inmidi Coupon Usage
     *     summary: Cancel the usage of a coupon in the user's cart
     *     description: Cancels the application of a specified coupon code in the user's cart and returns the updated cart details.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               cartId:
     *                 type: string
     *                 example: "6721414de5ee8a0a1246535a"
     *     responses:
     *       200:
     *         description: Successful response with updated cart details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   properties:
     *                     _id:
     *                       type: string
     *                       example: "6721414de5ee8a0a1246535a"
     *                     customerId:
     *                       type: integer
     *                       example: 21704
     *                     items:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           packageGroupId:
     *                             type: object
     *                             properties:
     *                               _id:
     *                                 type: string
     *                                 example: "65959fa528f6c0e9a8cbc4a8"
     *                               type:
     *                                 type: string
     *                                 example: "INMIDI_SUBS"
     *                           unitPrice:
     *                             type: number
     *                             example: 149
     *                           durationType:
     *                             type: integer
     *                             example: 1
     *                           price:
     *                             type: number
     *                             example: 149
     *                           _id:
     *                             type: string
     *                             example: "6721414de5ee8a0a1246535b"
     *                     createdAt:
     *                       type: string
     *                       example: "2024-10-29T20:10:53.270Z"
     *                     updatedAt:
     *                       type: string
     *                       example: "2024-10-29T20:13:39.697Z"
     *                     discount:
     *                       type: number
     *                       example: 0
     *       400:
     *         description: Bad request, invalid cart ID
     *       404:
     *         description: Cart not found
     *       500:
     *         description: Internal server error
     */
    router.post("/cancel-coupon", couponController.cancelCouponUsage.bind(couponController));
    /**
     * @swagger
     * /inmidi-coupon/coupon:
     *   post:
     *     tags:
     *       - Inmidi Coupon Usage
     *     summary: Retrieve the current coupon for the user's cart
     *     description: Gets the coupon details associated with the user's cart.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               cartId:
     *                 type: string
     *                 example: "6721414de5ee8a0a1246535a"
     *     responses:
     *       200:
     *         description: Successful response with coupon details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   properties:
     *                     couponId:
     *                       type: string
     *                       example: "66fd927c6a4125cf9e11e728"
     *                     code:
     *                       type: string
     *                       example: "assa"
     *       400:
     *         description: Bad request, invalid cart ID
     *       404:
     *         description: Coupon not found
     *       500:
     *         description: Internal server error
     */
    router.post("/coupon", couponController.getCurrentCartCoupon.bind(couponController));
    router.use(guards_1.isAdmin);
    /**
     * @swagger
     * /inmidi-coupon
     *   post:
     *     tags:
     *       - Inmidi Coupon Usage
     *     summary: Create a new coupon
     *     description: Creates a new coupon with the provided details.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               authorizationName:
     *                 type: string
     *                 example: "Test40"
     *               discount:
     *                 type: integer
     *                 example: 100
     *               expirationDate:
     *                 type: string
     *                 example: "2024-12-11T12:46:17.811Z"
     *               isSubs:
     *                 type: boolean
     *                 example: true
     *               trialDuration:
     *                 type: integer
     *                 example: 30
     *                 nullable: true
     *               isOnlyForOneCompany:
     *                 type: boolean
     *                 example: false
     *                 nullable: true
     *     responses:
     *       201:
     *         description: Coupon created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 code:
     *                   type: string
     *                   example: "Test40"
     *                 authorizationName:
     *                   type: string
     *                   example: "Test40"
     *                 discount:
     *                   type: integer
     *                   example: 100
     *                 expirationDate:
     *                   type: string
     *                   example: "2024-12-11T12:46:17.811Z"
     *                 isActive:
     *                   type: boolean
     *                   example: true
     *                 isSingleUse:
     *                   type: boolean
     *                   example: false
     *                 isSubs:
     *                   type: boolean
     *                   example: true
     *                 isOnlyForOneCompany:
     *                   type: boolean
     *                   example: false
     *                 _id:
     *                   type: string
     *                   example: "67214371df7064c497e0d313"
     *       400:
     *         description: Bad request, invalid coupon details
     *       500:
     *         description: Internal server error
     */
    router.post("/", couponController.createCoupon.bind(couponController));
    /**
     * @swagger
     * /inmidi-coupon/coupon-code-usage:
     *   post:
     *     tags:
     *       - Inmidi Coupon Usage
     *     summary: Get coupon code usage details
     *     description: Retrieves the usage details of a specified coupon code.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               couponCode:
     *                 type: string
     *                 example: "assa"
     *     responses:
     *       200:
     *         description: Successful response with coupon usage details
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   couponCode:
     *                     type: string
     *                     example: "assa"
     *                   authorizedName:
     *                     type: string
     *                     example: "assa"
     *                   usedCount:
     *                     type: integer
     *                     example: 1
     *       400:
     *         description: Bad request, invalid coupon code
     *       404:
     *         description: Coupon code not found
     *       500:
     *         description: Internal server error
     */
    router.post("/coupon-code-usage", couponController.couponCodeUsage.bind(couponController));
    /**
     * @swagger
     * /inmidi-coupon/all:
     *   post:
     *     tags:
     *       - Inmidi Coupon Usage
     *     summary: Get all coupons with pagination and filtering
     *     description: Retrieves a paginated list of all coupons based on search and sorting criteria.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               page:
     *                 type: integer
     *                 example: 1
     *               pageSize:
     *                 type: integer
     *                 example: 20
     *               search:
     *                 type: string
     *                 example: "Test"
     *               sort:
     *                 type: object
     *                 additionalProperties:
     *                   type: integer
     *                 example: { createdAt: -1 }
     *     responses:
     *       200:
     *         description: Successful response with list of coupons
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 row:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                         example: "67214371df7064c497e0d313"
     *                       code:
     *                         type: string
     *                         example: "Test40"
     *                       authorizationName:
     *                         type: string
     *                         example: "Test40"
     *                       discount:
     *                         type: integer
     *                         example: 100
     *                       expirationDate:
     *                         type: string
     *                         example: "2024-12-11T12:46:17.811Z"
     *                       isActive:
     *                         type: boolean
     *                         example: true
     *                       isSingleUse:
     *                         type: boolean
     *                         example: false
     *                       isSubs:
     *                         type: boolean
     *                         example: true
     *                       isOnlyForOneCompany:
     *                         type: boolean
     *                         example: false
     *                 totalCount:
     *                   type: integer
     *                   example: 119
     *                 page:
     *                   type: integer
     *                   example: 1
     *                 pageSize:
     *                   type: integer
     *                   example: 20
     *       400:
     *         description: Bad request due to invalid input
     *       500:
     *         description: Internal server error
     */
    router.post("/all", couponController.getAllCoupon.bind(couponController));
    /**
     * @swagger
     * /inmidi-coupon/{id}:
     *   get:
     *     tags:
     *       - Inmidi Coupon Usage
     *     summary: Get a coupon by ID
     *     description: Retrieves a coupon based on the specified ID.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: The ID of the coupon to retrieve.
     *         schema:
     *           type: string
     *           example: "66bcff1f8d3ce0c8f3398dd6"
     *     responses:
     *       200:
     *         description: Successful response with coupon details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                   example: "66bcff1f8d3ce0c8f3398dd6"
     *                 code:
     *                   type: string
     *                   example: "BIR-ŞİRKET-HIZMET-50"
     *                 authorizationName:
     *                   type: string
     *                   example: "BIR-ŞİRKET-HIZMET-50"
     *                 discount:
     *                   type: integer
     *                   example: 50
     *                 expirationDate:
     *                   type: string
     *                   example: "2024-11-20T21:00:00.000Z"
     *                 isActive:
     *                   type: boolean
     *                   example: true
     *                 isSingleUse:
     *                   type: boolean
     *                   example: true
     *                 isSubs:
     *                   type: boolean
     *                   example: false
     *                 isOnlyForOneCompany:
     *                   type: boolean
     *                   example: true
     *       404:
     *         description: Coupon not found
     *       500:
     *         description: Internal server error
     */
    router.get("/:id", couponController.getCouponById.bind(couponController));
    /**
     * @swagger
     * /inmidi-coupon/deactivate:
     *   post:
     *     tags:
     *       - Inmidi Coupon Usage
     *     summary: Deactivate a coupon
     *     description: Deactivates a coupon based on the provided coupon ID.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               couponId:
     *                 type: string
     *                 example: "66bcff1f8d3ce0c8f3398dd6"
     *     responses:
     *       200:
     *         description: Successful response indicating the coupon was deactivated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 couponId:
     *                   type: string
     *                   example: "66bcff1f8d3ce0c8f3398dd6"
     *       404:
     *         description: Coupon not found
     *       500:
     *         description: Internal server error
     */
    router.post("/deactivate", couponController.deactivateCoupon.bind(couponController));
    router.post("/coupon-price-insights", couponController.couponCodePriceInsights.bind(couponController));
    return router;
}
exports.couponRoutes = couponRoutes;
