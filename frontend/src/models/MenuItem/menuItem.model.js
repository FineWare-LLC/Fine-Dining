import mongoose from 'mongoose';
import menuItemSchema from './menuItem.schema.js';

const MenuItemModel = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

export default MenuItemModel;
