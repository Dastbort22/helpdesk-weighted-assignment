const UserModel = require('../models/user.model');
const bcrypt = require('bcryptjs');

const AuthController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
      const user = await UserModel.findByEmail(email);
      if (!user) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
      res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role || 'requester' } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
module.exports = AuthController;