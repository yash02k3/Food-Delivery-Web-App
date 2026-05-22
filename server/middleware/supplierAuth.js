import Supplier from '../models/Supplier.js';

export const getSupplierForUser = async (user) => {
  if (user.supplierId) {
    return Supplier.findById(user.supplierId);
  }
  return Supplier.findOne({ ownerId: user._id });
};

export const requireApprovedSupplier = async (req, res, next) => {
  const supplier = await getSupplierForUser(req.user);
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier profile not found. Contact admin.' });
  }
  if (supplier.status !== 'approved' && req.user.role !== 'admin') {
    return res.status(403).json({
      message: `Supplier account is ${supplier.status}. Awaiting admin approval.`,
      status: supplier.status,
    });
  }
  req.supplier = supplier;
  next();
};
