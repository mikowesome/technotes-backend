require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const connectDB = require('./config/connectDB')
const corsOptions = require('./config/corsOptions')
const UserRoutes = require('./routes/UserRoutes')
const NoteRoutes = require('./routes/NoteRoutes')

const app = express()
const PORT = process.env.PORT || 3500

// Connect to Database
connectDB()

// Middlewares
app.use(cors(corsOptions))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/users', UserRoutes)
app.use('/notes', NoteRoutes)


mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`))
})

mongoose.connection.on('error', error => {
    console.log(error)
})
