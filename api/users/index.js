import dbConnect from '../utils/dbConnect'; // Import your database connection utility
import User from '../models/User'; // Import the User model

export default async function handler(req, res) {
  // Connect to the database
  await dbConnect();

  // Get the request method
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Fetch all users from the database
        const users = await User.find({});
        res.status(200).json({ success: true, data: users });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        // Create a new user in the database
        const user = await User.create(req.body);
        res.status(201).json({ success: true, data: user });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
