import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home', enum: ['Home', 'Work', 'Site', 'Other'] },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  pincode: { type: String, required: true },
  landmark: { type: String, default: '' },
  lat: Number,
  lng: Number,
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['user', 'supplier', 'admin'], default: 'user' },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    addresses: [addressSchema],
    avatar: { type: String, default: '' },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
