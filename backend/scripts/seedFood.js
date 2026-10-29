import 'dotenv/config'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import foodModel from '../models/foodModel.js'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '../..')
const assetDirectory = path.join(projectDirectory, 'frontend', 'src', 'assets')
const uploadDirectory = path.join(projectDirectory, 'backend', 'uploads')
const description = 'Food provides essential nutrients for overall health and well-being'

const foods = [
    ['1', 'Greek salad', 320, 'Salad'],
    ['2', 'Veg salad', 280, 'Salad'],
    ['3', 'Clover Salad', 350, 'Salad'],
    ['4', 'Chicken Salad', 420, 'Salad'],
    ['5', 'Lasagna Rolls', 300, 'Rolls'],
    ['6', 'Peri Peri Rolls', 250, 'Rolls'],
    ['7', 'Chicken Rolls', 380, 'Rolls'],
    ['8', 'Veg Rolls', 270, 'Rolls'],
    ['9', 'Ripple Ice Cream', 220, 'Desserts'],
    ['10', 'Fruit Ice Cream', 240, 'Desserts'],
    ['11', 'Jar Ice Cream', 210, 'Desserts'],
    ['12', 'Vanilla Ice Cream', 230, 'Desserts'],
    ['13', 'Chicken Sandwich', 400, 'Sandwich'],
    ['14', 'Vegan Sandwich', 330, 'Sandwich'],
    ['15', 'Grilled Sandwich', 360, 'Sandwich'],
    ['16', 'Bread Sandwich', 310, 'Sandwich'],
    ['17', 'Cup Cake', 260, 'Cake'],
    ['18', 'Vegan Cake', 290, 'Cake'],
    ['19', 'Butterscotch Cake', 450, 'Cake'],
    ['20', 'Sliced Cake', 320, 'Cake'],
    ['21', 'Garlic Mushroom', 340, 'Pure Veg'],
    ['22', 'Fried Cauliflower', 370, 'Pure Veg'],
    ['23', 'Mix Veg Pulao', 200, 'Pure Veg'],
    ['24', 'Rice Zucchini', 280, 'Pure Veg'],
    ['25', 'Cheese Pasta', 390, 'Pasta'],
    ['26', 'Tomato Pasta', 410, 'Pasta'],
    ['27', 'Creamy Pasta', 300, 'Pasta'],
    ['28', 'Chicken Pasta', 480, 'Pasta'],
    ['29', 'Butter Noodles', 250, 'Noodles'],
    ['30', 'Veg Noodles', 220, 'Noodles'],
    ['31', 'Somen Noodles', 430, 'Noodles'],
    ['32', 'Cooked Noodles', 350, 'Noodles'],
].map(([id, name, price, category]) => ({
    _id: id,
    name,
    description,
    price,
    image: `food_${id}.png`,
    category,
}))

const seedFood = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured.')
    }

    await mongoose.connect(process.env.MONGODB_URI)
    await mkdir(uploadDirectory, { recursive: true })

    for (const food of foods) {
        await copyFile(
            path.join(assetDirectory, food.image),
            path.join(uploadDirectory, food.image)
        )
    }

    const result = await foodModel.bulkWrite(
        foods.map((food) => ({
            updateOne: {
                filter: { _id: food._id },
                update: { $setOnInsert: food },
                upsert: true,
            },
        }))
    )

    console.log(`Food catalog ready: ${foods.length} items; inserted ${result.upsertedCount}.`)
}

try {
    await seedFood()
} finally {
    await mongoose.disconnect()
}
