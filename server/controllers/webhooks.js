import { Webhook } from 'svix'
import User from '../models/User.js'

// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET?.trim())

        const payload = req.body.toString()

        await whook.verify(payload, {
            'svix-id': req.headers['svix-id'],
            'svix-timestamp': req.headers['svix-timestamp'],
            'svix-signature': req.headers['svix-signature'],
        })

        const { data, type } = JSON.parse(payload)

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
                    image: data.image_url,
                    resume: '',
                }
                await User.create(userData)
                res.json({ success: true })
                break
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
                    image: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData)
                res.json({ success: true })
                break
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id)
                res.json({ success: true })
                break
            }

            default:
                res.json({ success: true })
                break
        }
    } catch (error) {
        console.log('Webhooks Error:', error.message)
        res.status(400).json({ success: false, message: 'Webhooks Error' })
    }
}
