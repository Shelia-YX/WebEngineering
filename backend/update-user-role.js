const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/activity_platform')
  .then(async () => {
    try {
      const db = mongoose.connection.db;
      const result = await db.collection('users').updateOne(
        { email: 'test@example.com' },
        { $set: { role: 'admin' } }
      );
      console.log('Update result:', result);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('Connection error:', err);
    mongoose.disconnect();
  });