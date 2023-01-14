import Router from "express-group-router"
/** Controllers **/
import AdminController from "../controllers/admin/admin.js"
import authController from "../controllers/admin/auth.js"
import BlogController from "../controllers/admin/blog.js"
import PackageController from "../controllers/admin/package.js"
import commentController from "../controllers/admin/comment.js"
import categoryController from "../controllers/admin/category.js"
import serviceController from "../controllers/admin/service.js"
import FAQController from "../controllers/admin/faq.js"
import ContactUsController from "../controllers/admin/contactUs.js"
// import RoleController from "../controllers/admin/role.js"
import MediaController from "../controllers/admin/media.js"
import TicketController from "../controllers/admin/ticket.js"
import JobRequestController from "../controllers/admin/jobRequest.js"
import ServiceRequestController from "../controllers/admin/serviceRequest.js"
/** Models **/
import Admin from "../models/Admin.js"
/** Middlewares **/
import advancedResults from "../middleware/advancedResults.js"
import { authenticate, authorize } from "../middleware/authMiddleware.js"
import imageResizer from "../utils/imageResizer.js"
import limiter from "../utils/rateLimiting.js"
import imgUploader from "../utils/imgUploader.js"
/** Validators **/
import adminValidation from "../middleware/validators/admin/admin.js"
import authValidation from "../middleware/validators/admin/auth.js"
import blogValidation from "../middleware/validators/blogs/blog.js"
import commentValidation from "../middleware/validators/comments/comment.js"
import categoryValidation from "../middleware/validators/categories/categories.js"
import packageValidation from "../middleware/validators/packages/package.js"
import serviceValidation from "../middleware/validators/services/service.js"
import FAQValidation from "../middleware/validators/faq/faq.js"
import contactUsValidation from "../middleware/validators/support/contactUs.js"
// import roleValidation from "../middleware/validators/roles/role.js"
import mediaValidation from "../middleware/validators/media/media.js"
import ticketValidation from "../middleware/validators/ticket/ticket.js"
import jobRequestValidation from "../middleware/validators/requests/jobRequest.js"
import serviceRequestValidation from "../middleware/validators/requests/serviceRequest.js"
import uploadToCloudinary from "../utils/uploadCloudinary.js"
import authChecker from "../middleware/authorization.js"

const router = new Router()

// Auth Routes
router.group("/auth", [limiter], (router) => {
	router.post("/login", authValidation.login, authController.login)
	router.get("/refresh", authController.refreshToken)
	router.post(
		"/forgot-password",
		authValidation.forgotPassword,
		authController.forgotPassword
	)
	router.put(
		"/reset-password/:token",
		authValidation.resetPassword,
		authController.resetPassword
	)
	router.post("/logout", authenticate(Admin), authController.logout)
})

router.group([authenticate(Admin)], (router) => {
	// Admin User Routes
	router.group("/admin-users", (router) => {
		router.get("/", AdminController.getAdmins)
		router.put(
			"/:id/change-password",
			adminValidation.changePassword,
			AdminController.changePassword
		)
		router.get("/:id", AdminController.getAdmin)
		router.put(
			"/:id",
			imgUploader("image"),
			uploadToCloudinary,
			adminValidation.update,
			AdminController.updateAdmin
		)
		router.post(
			"/",
			imgUploader("image"),
			uploadToCloudinary,
			adminValidation.create,
			AdminController.createAdmin
		)
		router.delete("/:id", AdminController.deleteAdmin)
	})

	// Blog Routes
	router.group("/blog", (router) => {
		router.get("/", authChecker("Blog", "read"), BlogController.getBlogs)
		router.post(
			"/",
			imgUploader("image"),
			uploadToCloudinary,
			blogValidation.create,
			authChecker("Blog", "create"),
			BlogController.createBlog
		)
		// router.get("/categories", BlogController.getCategories)
		router.get("/:id", BlogController.getBlog)
		router.put("/:id/update-local", BlogController.updateLocal)
		router.put(
			"/:id",
			imgUploader("image"),
			uploadToCloudinary,
			blogValidation.update,
			BlogController.updateBlog
		)
		router.delete("/:id", BlogController.deleteBlog)

		// Comments
		router.group("/:id/comment", (router) => {
			router.put(
				"/:commentId",
				commentValidation.createAndUpdate,
				commentController.updateComment
			)
			router.delete("/:commentId", commentController.deleteComment)
			// Reply
			router.post(
				"/:commentId/reply",
				commentValidation.createAndUpdate,
				commentController.replyComment
			)
		})
	})

	// Package Routes
	router.group("/packages", (router) => {
		router.get("/", PackageController.getPackages, advancedResults)
		router.get("/:id", PackageController.getPackage)
		router.get(
			"/categories-provinces",
			PackageController.getCategoriesAndProvinces
		)
		router.post("/", packageValidation.create, PackageController.createPackage)
		router.put(
			"/:id",
			packageValidation.update,
			PackageController.updatePackage
		)
		router.put("/:id/update-locals", PackageController.updateLocals)
		router.delete("/:id", PackageController.deletePackage)
	})

	// Category Routes
	router.group("/categories", (router) => {
		router.get("/", categoryController.getCategories, advancedResults)
		router.put(
			"/:id/update-locals",
			categoryValidation.updateLocal,
			categoryController.updateLocals
		)
		router.get("/:id", categoryController.getCategory)
		router.post(
			"/",
			categoryValidation.create,
			categoryController.createCategory
		)
		router.put(
			"/:id",
			categoryValidation.update,
			categoryController.updateCategory
		)
		router.delete(
			"/:id",
			categoryValidation.delete,
			categoryController.deleteCategory
		)
	})

	// Services Routes
	router.group("/services", (router) => {
		router.get("/", serviceController.getServices, advancedResults)
		router.get("/icon-options", serviceController.getIconOptions)
		router.get("/:id", serviceController.getService)
		router.put("/:id/update-locals", serviceController.updateLocals)
		router.post("/", serviceValidation.create, serviceController.createService)
		router.put(
			"/:id",
			serviceValidation.update,
			serviceController.updateService
		)
		router.delete("/:id", serviceController.deleteService)
	})

	//FAQ Routes
	router.group("/faq", (router) => {
		router.get("/", FAQController.getFAQs)
		router.get("/categories", FAQController.getCategories)
		router.get("/:id", FAQController.getFaq)
		router.put(
			"/:id/update-locals",
			FAQValidation.updateLocal,
			FAQController.updateLocals
		)
		router.post("/", FAQValidation.create, FAQController.createFAQ)
		router.put("/:id", FAQValidation.update, FAQController.updateFAQ)
		router.delete("/:id", FAQController.deleteFAQ)
	})

	//Contact Routes
	router.group("/contact-us", (router) => {
		router.get("/", ContactUsController.getContacts, advancedResults)
		router.put(
			"/:id/change-status",
			contactUsValidation.changeStatus,
			ContactUsController.changeStatus
		)

		// router.get("/:id", ContactUsController.getContact);
		// router.put("/:id", contactUsValidation.create, ContactUsController.updateContact);
		// router.delete("/:id", ContactUsController.deleteContact);
	})

	//Role Routes
	// router.group("/roles", (router) => {
	// 	router.get("/", RoleController.getRoles, advancedResults)
	// 	router.get("/:id", RoleController.getRole)
	// 	router.post("/", roleValidation.create, RoleController.createRole)
	// 	router.put("/:id", roleValidation.update, RoleController.updateRole)
	// 	router.delete("/:id", RoleController.deleteRole)
	// })

	// Ticket Routes
	router.group("/ticket", (router) => {
		router.get("/:id", TicketController.getMessages)
		router.get("/", TicketController.getChats, advancedResults)
		router.post(
			"/:id",
			imgUploader("image"),
			ticketValidation.createMessage,
			TicketController.createMessage
		)
		router.put("/:id/close-chat", TicketController.closeChat)
	})

	// Requests
	router.group("/request", (router) => {
		router.get("/job", JobRequestController.getRequests, advancedResults)
		router.get("/job/:id", JobRequestController.getRequest)
		router.put(
			"/job/:id",
			jobRequestValidation.changeState,
			JobRequestController.changeState
		)

		router.get(
			"/service",
			ServiceRequestController.getRequests,
			advancedResults
		)
		router.get("/service/:id", ServiceRequestController.getRequest)
		router.put(
			"/service/:id",
			serviceRequestValidation.changeState,
			ServiceRequestController.changeState
		)
	})
})

export default router.init()
