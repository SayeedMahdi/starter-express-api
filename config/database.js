import mongoose from "mongoose"

const connectDB = async () => {
	try {
		const conn =
			await mongoose.connect(`mongodb+srv://raha-api:rahanet-123@raha-api.cehvfhk.mongodb.net/?retryWrites=true&w=majority
		`)

		console.log(`MongoDB Connected: ${conn.connection.host}`)
	} catch (error) {
		console.error(`Error: ${error.message}`)
		process.exit(1)
	}
}

export default connectDB
