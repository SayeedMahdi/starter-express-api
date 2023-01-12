import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import ability from "../config/roles/ability.js"

const authenticate = (Model) =>
	asyncHandler(async (req, res, next) => {
		let token, decoded
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			try {
				const userType = req.originalUrl.split("/")[3] === "admin"

				if (userType) {
					token = req.headers.authorization.split(" ")[1]
					decoded = jwt.verify(token, process.env.JWT_SECRET)
				} else {
					token = req.headers.authorization.split(" ")[1]
					decoded = jwt.verify(token, process.env.JWT_CLIENT_SECRET)
				}

				const user = await Model.findById(decoded.id)
				if (!user) throw new Error("Not authorized, token failed")

				req.user = user

				next()
			} catch (error) {
				res.status(403)
				return next(new Error("Not authorized, token failed"))
			}
		}

		if (!token) {
			res.status(401)
			return next(new Error("Not authorized, no token"))
		}
	})

const authorize = ({ user }, res, next) => {
	if (user?.isSuperAdmin) {
		user.ability = ability("manage", "all")
	} else if (user?.role === "media") {
		user.ability = ability("manage", "Blog")
	} else if (user?.role === "sales") {
		user.ability = ability("manage", "")
	} else if (user?.role === "technical") {
		user.ability = ability("manage", "")
	} else {
		res.status(401)
		throw new Error("unauthorized access")
	}
	next()
}

const isUserVerified = (req, res, next) => {
	if (!req.user.verifiedAt) {
		throw new Error("Not authorized, account is not verified")
	}
	next()
}
export { authenticate, authorize, isUserVerified }
