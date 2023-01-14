const authChecker = (subject, roll) => {
	return (req, res, next) => {
		if (
			req.user.role.subject === subject &&
			req.user.role.ability.includes(roll)
		) {
			next()
		} else {
			res.status(401)
			throw new Error("unauthorized access")
		}
	}
}
export default authChecker
